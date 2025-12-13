import { OIDCContext } from "@/graphql/graphql-context";
import IdentityDao from "../dao/identity-dao";
import { Fido2KeyRegistrationInput, Tenant, TenantPasswordConfig, TotpResponse, User, UserCreateInput, UserCredential, Fido2KeyAuthenticationInput, TenantRestrictedAuthenticationDomainRel, PreAuthenticationState, AuthorizationReturnUri, UserRegistrationStateResponse, UserRegistrationState, RegistrationState, UserTermsAndConditionsAccepted, TenantLegacyUserMigrationConfig, SystemSettings, FederatedOidcProvider, AuthorizationDeviceCodeData, DeviceCodeAuthorizationStatus, UserRecoveryEmail, ProfileEmailChangeResponse, ProfileEmailChangeState, EmailChangeState, ErrorDetail, CaptchaConfig, TenantLookAndFeel } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from "crypto";
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, STATUS_COMPLETE, STATUS_INCOMPLETE, PRINCIPAL_TYPE_IAM_PORTAL_USER, DEFAULT_CAPTCHA_V3_MINIMUM_SCORE, NAME_ORDER_WESTERN, DEFAULT_TENANT_LOOK_AND_FEEL, USER_CREATE_SCOPE, PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN } from "@/utils/consts";
import {  generateRandomToken, generateUserCredential, getDomainFromEmail } from "@/utils/dao-utils";
import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import AuthDao from "../dao/auth-dao";
import JwtServiceUtils from "./jwt-service-utils";
import IdentityService from "./identity-service";
import OIDCServiceUtils from "./oidc-service-utils";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { ERROR_CODES } from "../models/error";
import { logWithDetails } from "../logging/logger";
import Kms from "../kms/kms";
import { RecaptchaResponse } from "../models/recaptcha";
import SearchDao from "../dao/search-dao";
import OpenSearchDao from "../dao/impl/search/open-search-dao";
import { containsScope } from "@/utils/authz-utils";


const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient: OpenSearchClient = getOpenSearchClient();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const federatedOIDCProvderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const searchDao: SearchDao = new OpenSearchDao();

class RegisterUserService extends IdentityService {

    constructor(oidcContext: OIDCContext) {
        super(oidcContext);
    }

    // ##########################################################################
    // 
    //                    USER CREATE METHODS
    //
    // ##########################################################################

    public async createUser(userCreateInput: UserCreateInput, tenantId: string): Promise<User> {

        // Always lower-case the email and format the phone number if it exists
        userCreateInput.email = this.formatEmail(userCreateInput.email);
        if(userCreateInput.phoneNumber){
            userCreateInput.phoneNumber = this.formatPhoneNumber(userCreateInput.phoneNumber)
        }

        // Who is allowed to create a user and how? 
        // 1.   A service client with a scope of user.create
        // 2.   If the service client does not belong to the root tenant, then it must 
        //      belong to the same tenant in the method argument
        // 3.   The tenant MUST have restricted authentication domains, and the domain 
        //      of the user must match one of those domains.
        if(!this.oidcContext.portalUserProfile){
            throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
        }
        if(this.oidcContext.portalUserProfile.principalType !== PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN){
            throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
        }
        if(!containsScope(USER_CREATE_SCOPE, this.oidcContext.portalUserProfile.scope)){
            throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
        }
        if(this.oidcContext.portalUserProfile.tenantId !== this.oidcContext.rootTenant.tenantId){
            if(this.oidcContext.portalUserProfile.tenantId !== tenantId){
                throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
            }
        }

        const tenantRestrictedDomanRels: Array<TenantRestrictedAuthenticationDomainRel> = await tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
        if(tenantRestrictedDomanRels.length === 0){
            throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
        }
        const domain = getDomainFromEmail(userCreateInput.email);
        const rel: TenantRestrictedAuthenticationDomainRel | undefined = tenantRestrictedDomanRels.find(
            (r: TenantRestrictedAuthenticationDomainRel) => r.domain === domain
        );
        if(rel === undefined){
            throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
        }

        const { user } = await this._createUser(userCreateInput, tenantId, false);
        return user;
    }

    /**
         * 
         * @param userCreateInput 
         * @param tenantId 
         * @param preAuthToken 
         * @returns 
         */    
    public async registerUser(userCreateInput: UserCreateInput, tenantId: string, preAuthToken: string | null, deviceCodeId: string | null, recaptchaToken: string | null): Promise<UserRegistrationStateResponse>{
        
        // Always lower-case the email and format the phone number if it exists
        // Always lower-case the email and format the phone number if it exists
        userCreateInput.email = this.formatEmail(userCreateInput.email);
        if(userCreateInput.phoneNumber){
            userCreateInput.phoneNumber = this.formatPhoneNumber(userCreateInput.phoneNumber)
        }

        // Need to check to see if there is an active registration session happening with the
        // user, based on their email. If so, then return error if the session has not expired.
        // Otherwise, delete the old registration session, any user and relationships that were
        // created, and continue.
        const existingRegistrationStates = await identityDao.getUserRegistrationStatesByEmail(userCreateInput.email);
        if(existingRegistrationStates.length > 0){
            if(existingRegistrationStates[0].expiresAtMs > Date.now()){
                throw new GraphQLError(ERROR_CODES.EC00133.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00133}});
            }
            else{
                for(let i = 0; i < existingRegistrationStates.length; i++){
                    await identityDao.deleteUserRegistrationState(existingRegistrationStates[i]);
                }
                await this.deleteRegisteredUser(existingRegistrationStates[0].tenantId, existingRegistrationStates[0].userId);
            }
        }
        
        // TODO
        // Refactor the _createUser to return a RegistrationState value or null, and an isCreated and an errorMessage
        // rather than throw exceptions.
        const {user, tenant, tenantPasswordConfig} = await this._createUser(userCreateInput, tenantId, true, recaptchaToken || undefined);

        const registrationSessionToken: string = generateRandomToken(20, "hex");

        // registration completion will expire after 12 hours. 
        const expiresAt: number = Date.now() + (60 * 60 * 12 * 1000);
        const arrState: Array<UserRegistrationState> = [];        
        const stateOrder: Array<RegistrationState> = [];
        if(tenant.verifyEmailOnSelfRegistration === true){            
            // Note that the _createUser function will generate an email token and
            // send it to the user. No need to do that here.
            stateOrder.push(RegistrationState.ValidateEmail);
        }

        
        if(tenantPasswordConfig.requireMfa === true){
            const mfas = tenantPasswordConfig.mfaTypesRequired?.split(",") || [];            
            if(mfas.includes(MFA_AUTH_TYPE_TIME_BASED_OTP) && mfas.includes(MFA_AUTH_TYPE_FIDO2)){
                stateOrder.push(RegistrationState.ConfigureTotpRequired);
                stateOrder.push(RegistrationState.ValidateTotp);
                stateOrder.push(RegistrationState.ConfigureSecurityKeyRequired);
                stateOrder.push(RegistrationState.ValidateSecurityKey);
            }
            else if(mfas.includes(MFA_AUTH_TYPE_TIME_BASED_OTP) && !mfas.includes(MFA_AUTH_TYPE_FIDO2)){
                stateOrder.push(RegistrationState.ConfigureTotpRequired);
                stateOrder.push(RegistrationState.ValidateTotp);
                stateOrder.push(RegistrationState.ConfigureSecurityKeyOptional);
                stateOrder.push(RegistrationState.ValidateSecurityKey);
            }
            else if(!mfas.includes(MFA_AUTH_TYPE_TIME_BASED_OTP) && mfas.includes(MFA_AUTH_TYPE_FIDO2)){                
                stateOrder.push(RegistrationState.ConfigureSecurityKeyRequired);
                stateOrder.push(RegistrationState.ValidateSecurityKey);
                stateOrder.push(RegistrationState.ConfigureTotpOptional);
                stateOrder.push(RegistrationState.ValidateTotp);
            }
        }
        else {
            stateOrder.push(RegistrationState.ConfigureTotpOptional);
            stateOrder.push(RegistrationState.ValidateTotp);
            stateOrder.push(RegistrationState.ConfigureSecurityKeyOptional);
            stateOrder.push(RegistrationState.ValidateSecurityKey);
        }

        const systemSettings: SystemSettings = await tenantDao.getSystemSettings();
        if(systemSettings.allowRecoveryEmail){
            stateOrder.push(RegistrationState.AddRecoveryEmailOptional);
            if(tenant.verifyEmailOnSelfRegistration === true){
                stateOrder.push(RegistrationState.ValidateRecoveryEmail);
            }
        }
        if(systemSettings.allowDuressPassword){
            stateOrder.push(RegistrationState.AddDuressPasswordOptional);
        }

        // Is the user coming from a 3rd party client and needs to be redirected
        // with an authorization code
        if(preAuthToken){
            stateOrder.push(RegistrationState.RedirectBackToApplication)
        }
        else{
            stateOrder.push(RegistrationState.RedirectToIamPortal);
        }
        for(let i = 0; i < stateOrder.length; i++){
            arrState.push({
                email: user.email,
                tenantId: tenant.tenantId,
                expiresAtMs: expiresAt,
                registrationSessionToken: registrationSessionToken,
                registrationState: stateOrder[i],
                registrationStateOrder: i + 1,
                registrationStateStatus: STATUS_INCOMPLETE,
                userId: user.userId,
                preAuthToken: preAuthToken,
                deviceCodeId: deviceCodeId
            });
        }

        await identityDao.createUserRegistrationStates(arrState);
        
        const response: UserRegistrationStateResponse = {
            userRegistrationState: arrState[0],
            accessToken: "",
            uri: "",
            registrationError: ERROR_CODES.DEFAULT,
        }
        return Promise.resolve(response);
    }    



    public async registerVerifyEmailAddress(userId: string, token: string, registrationSessionToken: string, preAuthToken: string | null | undefined): Promise<UserRegistrationStateResponse>{
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: "",
                registrationState: RegistrationState.ValidateEmail,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
            accessToken: null,
            totpSecret: null,
            uri: null
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index: number = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateEmail);
        if(index < 0){
            return Promise.resolve(response);
        }        

        const validationError: ErrorDetail | null = await this.validateEmailToken(userId, token);
        if(validationError){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError = validationError;
            return Promise.resolve(response);
        }
        
        arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[0]);
        const nextRegistrationState = arrUserRegistrationState[index + 1];
        response.userRegistrationState = nextRegistrationState;
        return Promise.resolve(response);        
    }

    public async registerVerifyRecoveryEmail(userId: string, token: string, registrationSessionToken: string, preAuthToken: string | null): Promise<UserRegistrationStateResponse>{
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: "",
                registrationState: RegistrationState.Error,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
            accessToken: null,
            totpSecret: null,
            uri: null
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index: number = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateRecoveryEmail);
        if(index < 0){
            return Promise.resolve(response);
        }        

        const user: User | null = await identityDao.getUserByEmailConfirmationToken(token);
        if(user === null){
            await identityDao.deleteEmailConfirmationToken(token);
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError = ERROR_CODES.EC00134;
            return Promise.resolve(response);
        }
               
        if(user.userId !== userId){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError = ERROR_CODES.EC00135;
            return Promise.resolve(response);
        }

        // For the one-time token, need to delete it in success case and        
        await identityDao.deleteEmailConfirmationToken(token);
        const userRecoveryEmail: UserRecoveryEmail | null = await identityDao.getUserRecoveryEmail(userId);
        if(!userRecoveryEmail){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError = ERROR_CODES.EC00136;
            return Promise.resolve(response);
        }
        
        await identityDao.updateRecoveryEmail({userId, email: userRecoveryEmail.email, emailVerified: true});
        arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
        const nextRegistrationState = arrUserRegistrationState[index + 1];
        response.userRegistrationState = nextRegistrationState;

        if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
            await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
        }

        return Promise.resolve(response);  
    }

    public async registerAddDuressPassword(userId: string, password: string | null, skip: boolean, registrationSessionToken: string, preAuthToken: string | null): Promise<UserRegistrationStateResponse> {
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: "",
                registrationState: RegistrationState.Error,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: undefined,
            accessToken: null,
            totpSecret: null,
            uri: null
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index: number = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.AddDuressPasswordOptional);
        if(index < 0){
            return Promise.resolve(response);
        }
        if(skip === false){
            if(password === null || password === ""){
                response.registrationError = ERROR_CODES.EC00137;
                return response;
            }
            const arrExistingCredentials = await identityDao.getUserCredentials(arrUserRegistrationState[index].userId);
            // There should only be one at this point!!!
            if(arrExistingCredentials.length !== 1){
                response.registrationError = ERROR_CODES.EC00138;
                return response;
            }
            // Check to see if the user is re-using their just-entered password and if so we should return an error
            const b: boolean = this.validateUserCredentials(arrExistingCredentials[0], password);            
            if(b){
                response.registrationError = ERROR_CODES.EC00139;
                return response;
            }
            const tenantPasswordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(arrUserRegistrationState[index].tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;
            const isValidPassword: boolean = await this.checkPassword(password, tenantPasswordConfig);
            if(!isValidPassword){
                response.registrationError = ERROR_CODES.EC00125;
                return response;
            }
            const userDuressCredential: UserCredential = generateUserCredential(arrUserRegistrationState[index].userId, password, tenantPasswordConfig.passwordHashingAlgorithm);
            await identityDao.addUserDuressCredential(userDuressCredential);
        }

        arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[0]);
        const nextRegistrationState = arrUserRegistrationState[index + 1];
        response.userRegistrationState = nextRegistrationState;

        if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
            await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
        }
        return response;

    }

    public async registerAddRecoveryEmail(userId: string, email: string | null, registrationSessionToken: string, preAuthToken: string | null, skip: boolean): Promise<UserRegistrationStateResponse>{
        
        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: "",
                registrationState: RegistrationState.Error,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
            accessToken: null,
            totpSecret: null,
            uri: null
        };
        
        const index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.AddRecoveryEmailOptional);
        if(index < 0){
            return response;
        }
                
        if(skip === true){
            // We can mark this as complete. We need to check to see if the next step is 
            // to validate the recovery email. If so, then we can mark it as complete too. 
            arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
            
            let nextRegistrationState: UserRegistrationState = arrUserRegistrationState[index + 1];
            if(nextRegistrationState.registrationState === RegistrationState.ValidateRecoveryEmail){
                nextRegistrationState.registrationStateStatus = STATUS_COMPLETE;
                await identityDao.updateUserRegistrationState(nextRegistrationState);
                nextRegistrationState = arrUserRegistrationState[index + 2];
            }            
            response.userRegistrationState = nextRegistrationState;
                        
            if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
            }
        }
        else{
            const user: User | null = await identityDao.getUserBy("id", userId);
            const tenant: Tenant | null = await tenantDao.getTenantById(arrUserRegistrationState[index].tenantId);
            if(user === null || tenant === null){
                return response;
            }
            
            if(email === null || email === ""){
                response.registrationError = ERROR_CODES.EC00140;
                return response;
            }
            
            const recoveryEmail = this.formatEmail(email);
            const recoveryEmailValidationResult = await this.validateRecoveryEmail(userId, recoveryEmail);
            if(recoveryEmailValidationResult.isValid === false){
                response.registrationError = recoveryEmailValidationResult.errorDetail;
                return response;
            }

            await identityDao.addRecoveryEmail({userId: arrUserRegistrationState[index].userId, email: recoveryEmail, emailVerified: false});
            if(tenant.verifyEmailOnSelfRegistration === true){
                this.sentEmailValidationToken(user, recoveryEmail);
            }

            arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);

            const nextRegistrationState: UserRegistrationState = arrUserRegistrationState[index + 1];
            if(nextRegistrationState.registrationState === RegistrationState.ValidateRecoveryEmail){
                const token: string = generateRandomToken(8, "hex").toUpperCase();
                await identityDao.saveEmailConfirmationToken(userId, token);
            }
            response.userRegistrationState = nextRegistrationState;
                    
            if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
            }            
        }
        return Promise.resolve(response);
    }

    public async registerConfigureTOTP(userId: string, registrationSessionToken: string, preAuthToken: string | null | undefined, skip: boolean): Promise<UserRegistrationStateResponse> {
        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: "",
                registrationState: skip ? RegistrationState.ConfigureSecurityKeyOptional : RegistrationState.ConfigureSecurityKeyRequired,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
            accessToken: null,
            totpSecret: null,
            uri: null
        };
        
        let index: number = -1;
        // If the user has elected to skip this step, then it must be an optional step and should be validated as such
        if(skip === true){
            index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureTotpOptional);            
        }
        // Otherwise this could either be a required step or an optional step that the user is selecting.
        // If either one is >= 0 then use it as the index.
        else {        
            const idxOptional = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureTotpOptional);
            const idxRequired = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureTotpRequired);
            if(idxOptional >= 0){
                index = idxOptional;
            }
            else if(idxRequired >= 0){
                index = idxRequired;
            }
        }
        if(index < 0){
            return response;
        }        
        
        if(skip === true){
            // Then we can mark this as complete, as well as the validation step, which we do not need,
            // and go to the step after. Since configuration and validation could be the last steps
            // in the registration process, we may have to either generate an access token for the
            // user or generate a redirect URI
            arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
            arrUserRegistrationState[index + 1].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index + 1]);
            const nextRegistrationState: UserRegistrationState = arrUserRegistrationState[index + 2];
            response.userRegistrationState = nextRegistrationState;
                        
            if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
            }
        }
        else {
            // This will be the generation of the totp token for validation in the next step.
            try{
                const totpResponse: TotpResponse = await this.createTOTP(userId);
                response.userRegistrationState = arrUserRegistrationState[index + 1];
                response.totpSecret = totpResponse.userMFARel.totpSecret;
                response.uri = totpResponse.uri;
                
                arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
                await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(err: any){
                logWithDetails("error", `Error creating TOTP. ${err.message}`, {...err});
                response.userRegistrationState.registrationState = RegistrationState.Error;
                response.registrationError = ERROR_CODES.EC00127;
            }            
        }
        return Promise.resolve(response);
    }

    public async registerValidateTOTP(userId: string, registrationSessionToken: string, totpTokenValue: string, preAuthToken: string | undefined | null): Promise<UserRegistrationStateResponse> {
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: "",
                registrationState: RegistrationState.ValidateTotp,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
        }

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateTotp);
        if(index < 0){
            return Promise.resolve(response);
        }
        
        // Validate the token itself, which should have been registered previously
        const validToken: boolean = await this.validateTOTP(userId, totpTokenValue);
        if(!validToken){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError = ERROR_CODES.EC00120;
            return response;
        }

        arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
        const nextRegistrationState = arrUserRegistrationState[index + 1];
        response.userRegistrationState = nextRegistrationState;

        if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
            await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
        }

        return Promise.resolve(response);
    }

    public async registerConfigureSecurityKey(userId: string, registrationSessionToken: string, fido2KeyRegistrationInput: Fido2KeyRegistrationInput | null, preAuthToken: string | null, skip: boolean): Promise<UserRegistrationStateResponse> {
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: registrationSessionToken,
                registrationState: skip ? RegistrationState.ConfigureSecurityKeyOptional : RegistrationState.ConfigureSecurityKeyRequired,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);

        let index: number = -1;
        // If the user has elected to skip this step, then it must be an optional step and should be validated as such
        if(skip === true){
            index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyOptional);
        }
        // Otherwise this could either be a required step or an optional step that the user is selecting.
        // If either one is >= 0 then use it as the index.
        else{
            const idxOptional = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyOptional);
            const idxRequired = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyRequired);
            if(idxOptional >= 0){
                index = idxOptional;
            }
            else if(idxRequired >= 0){
                index = idxRequired;
            }
        }
        if(index < 0){            
            return Promise.resolve(response);
        }

        if(skip === true){
            // Then we can mark this as complete, as well as the validation step, which we do not need,
            // and go to the step after. Since configuration and validation could be the last steps
            // in the registration process, we may have to either generate an access token for the
            // user or generate a redirect URI
            arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
            arrUserRegistrationState[index + 1].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index + 1]);
            const nextRegistrationState: UserRegistrationState = arrUserRegistrationState[index + 2];
            response.userRegistrationState = nextRegistrationState;

            if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
            }
        }
        else{
            if(fido2KeyRegistrationInput === null){
                response.registrationError = ERROR_CODES.EC00128;
                response.userRegistrationState.registrationState = RegistrationState.Error;
            }
            else{
                try{
                    await this.registerFIDO2Key(userId, fido2KeyRegistrationInput);
                    arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
                    await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
                    response.userRegistrationState = arrUserRegistrationState[index + 1];
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                catch(err: any){
                    throw new GraphQLError(err.message);
                }
            }
        }
        return Promise.resolve(response);
    }

    public async registerValidateSecurityKey(userId: string, registrationSessionToken: string, fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput, preAuthToken: string | null | undefined): Promise<UserRegistrationStateResponse> {
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: registrationSessionToken,
                registrationState: RegistrationState.ValidateSecurityKey,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_INCOMPLETE,
                tenantId: "",
                userId: userId
            },
            registrationError: ERROR_CODES.DEFAULT,
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateSecurityKey);
        if(index < 0){
            return Promise.resolve(response);
        }
        try{
            const isValid: boolean = await this.authenticateFIDO2Key(userId, fido2KeyAuthenticationInput);
            if(!isValid){
                response.registrationError = ERROR_CODES.EC00121;
                response.userRegistrationState.registrationState = RegistrationState.Error;
            }
            else{
                arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
                await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
                const nextRegistrationState = arrUserRegistrationState[index + 1];
                response.userRegistrationState = nextRegistrationState;

                if(nextRegistrationState.registrationState === RegistrationState.RedirectBackToApplication || nextRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                    await this.handleRegistrationCompletion(nextRegistrationState, arrUserRegistrationState, response);
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            throw new GraphQLError(err.message);
        }

        return Promise.resolve(response);
    }

    public async profileHandleEmailChange(newEmail: string): Promise<ProfileEmailChangeResponse> {
        
        const response: ProfileEmailChangeResponse = {
            profileEmailChangeState: {
                changeEmailSessionToken: "",
                emailChangeState: EmailChangeState.Error,
                changeOrder: 0,
                changeStateStatus: STATUS_INCOMPLETE,
                email: "",
                expiresAtMs: 0,
                isPrimaryEmail: false,
                userId: ""
            },
            profileEmailChangeError: ERROR_CODES.DEFAULT,
        }
        
        if(!this.oidcContext.portalUserProfile?.userId){
            response.profileEmailChangeError = ERROR_CODES.EC00145;
            return response;            
        }
        const domain: string = getDomainFromEmail(newEmail);
        if(domain.length === 0){
            response.profileEmailChangeError = ERROR_CODES.EC00017;
            return response;           
        }

        const user: User | null = await identityDao.getUserBy("id", this.oidcContext.portalUserProfile.userId);
        if(user === null){
            response.profileEmailChangeError = ERROR_CODES.EC00013;
            return response;            
        }
        if(user.locked === true || user.enabled === false){
            response.profileEmailChangeError = ERROR_CODES.EC00146;
            return response; 
        }
        if(user.federatedOIDCProviderSubjectId && user.federatedOIDCProviderSubjectId !== ""){
            response.profileEmailChangeError = ERROR_CODES.EC00147;
            return response;
        }
        const userByEmail: User | null = await identityDao.getUserBy("email", newEmail);
        if(userByEmail !== null){
            response.profileEmailChangeError = ERROR_CODES.EC00142;
            return response;            
        }
        
        // Cannot update to an email domain which is tied to an existing external oidc provider. These types of user can ONLY be created
        // by going through SSO with their provider.
        const federatedOIDCProvider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderByDomain(domain);
        if(federatedOIDCProvider){
            response.profileEmailChangeError = ERROR_CODES.EC00144;
            return response;
        }
        const sessionToken: string = generateRandomToken(20, "hex");
        const arrStates: Array<ProfileEmailChangeState> = [];
        arrStates.push({
            email: newEmail,
            expiresAtMs: Date.now() + (60 * 60 * 1000),
            changeEmailSessionToken: sessionToken,
            emailChangeState: EmailChangeState.ValidateEmail,
            changeOrder: 0,
            changeStateStatus: STATUS_INCOMPLETE,
            userId: user.userId,
            isPrimaryEmail: true,
        });

        arrStates.push({
            email: newEmail,
            expiresAtMs: Date.now() + (60 * 60 * 1000),
            changeEmailSessionToken: sessionToken,
            emailChangeState: EmailChangeState.Completed,
            changeOrder: 1,
            changeStateStatus: STATUS_INCOMPLETE,
            userId: user.userId,
            isPrimaryEmail: true
        });

        await identityDao.createProfileEmailChangeStates(arrStates);
        // Do not change the email yet. Only do that when the user has validated
        // their email in the next step.
        const emailConfirmationToken = generateRandomToken(8, "hex").toUpperCase();
        await identityDao.saveEmailConfirmationToken(user.userId, emailConfirmationToken);

        response.profileEmailChangeState = arrStates[0];
        return response;

    }

    public async profileAddRecoveryEmail(email: string): Promise<ProfileEmailChangeResponse> {   

        const recoveryEmail = this.formatEmail(email);
        const response: ProfileEmailChangeResponse = {
            profileEmailChangeState: {
                changeEmailSessionToken: "",
                emailChangeState: EmailChangeState.Error,
                changeOrder: 0,
                changeStateStatus: STATUS_INCOMPLETE,
                email: "",
                expiresAtMs: 0,
                isPrimaryEmail: false,
                userId: ""
            },
            profileEmailChangeError: ERROR_CODES.DEFAULT,
        }

        if(!this.oidcContext.portalUserProfile?.userId){
            response.profileEmailChangeError = ERROR_CODES.EC00145;
            return response;            
        }
        const user: User | null = await identityDao.getUserBy("id", this.oidcContext.portalUserProfile.userId);
        if(user === null){
            response.profileEmailChangeError = ERROR_CODES.EC00013;
            return response;            
        }
        if(user.locked === true || user.enabled === false){
            response.profileEmailChangeError = ERROR_CODES.EC00146;
            return response; 
        }
        if(user.federatedOIDCProviderSubjectId && user.federatedOIDCProviderSubjectId !== ""){
            response.profileEmailChangeError = ERROR_CODES.EC00147;
            return response;
        }

        const recoveryEmailValidationResult = await this.validateRecoveryEmail(user.userId, recoveryEmail);
        if(recoveryEmailValidationResult.isValid === false){
            response.profileEmailChangeError = recoveryEmailValidationResult.errorDetail;
            return response;
        }
        
        const sessionToken: string = generateRandomToken(20, "hex");
        const arrStates: Array<ProfileEmailChangeState> = [];
        arrStates.push({
            email: recoveryEmail,
            expiresAtMs: Date.now() + (60 * 60 * 1000),
            changeEmailSessionToken: sessionToken,
            emailChangeState: EmailChangeState.ValidateEmail,
            changeOrder: 0,
            changeStateStatus: STATUS_INCOMPLETE,
            userId: user.userId,
            isPrimaryEmail: false,
        });

        arrStates.push({
            email: recoveryEmail,
            expiresAtMs: Date.now() + (60 * 60 * 1000),
            changeEmailSessionToken: sessionToken,
            emailChangeState: EmailChangeState.Completed,
            changeOrder: 1,
            changeStateStatus: STATUS_INCOMPLETE,
            userId: user.userId,
            isPrimaryEmail: false
        });

        await identityDao.createProfileEmailChangeStates(arrStates);
        // Do not add the recovery email to the table yet. Only do that when the user has validated
        // their email in the next step.
        const emailConfirmationToken = generateRandomToken(8, "hex").toUpperCase();
        await identityDao.saveEmailConfirmationToken(user.userId, emailConfirmationToken);
        
        // Send an email to the user with the token value.        
        let fromEmailAddr: string = "";
        const systemSettings = await tenantDao.getSystemSettings();
        if(systemSettings && systemSettings.noReplyEmail){
            fromEmailAddr = systemSettings.noReplyEmail;
        }
        else{
            fromEmailAddr = this.oidcContext.rootTenant.tenantName.toLowerCase().replaceAll(" ", "") + ".com";
        }
        const name = user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`;
        const tenantLookAndFeel: TenantLookAndFeel = await tenantDao.getTenantLookAndFeel(this.oidcContext.rootTenant.tenantId) || DEFAULT_TENANT_LOOK_AND_FEEL;
        oidcServiceUtils.sendEmailVerificationEmail(fromEmailAddr, user.email, name, emailConfirmationToken, tenantLookAndFeel, user.preferredLanguageCode || "en", systemSettings.contactEmail || undefined);

        response.profileEmailChangeState = arrStates[0];
        return response;
    }

    public async profileValidateEmail(token: string, changeEmailSessionToken: string): Promise<ProfileEmailChangeResponse> {
        const response: ProfileEmailChangeResponse = {
            profileEmailChangeState: {
                changeEmailSessionToken: "",
                emailChangeState: EmailChangeState.Error,
                changeOrder: 0,
                changeStateStatus: STATUS_INCOMPLETE,
                email: "",
                expiresAtMs: 0,
                isPrimaryEmail: false,
                userId: ""
            },
            profileEmailChangeError: ERROR_CODES.DEFAULT,
        }

        if(!this.oidcContext.portalUserProfile?.userId){
            response.profileEmailChangeError = ERROR_CODES.EC00145;
            return response;            
        }

        const arrChangeStates: Array<ProfileEmailChangeState> = await this.getSortedEmailChangeStates(changeEmailSessionToken);
        const index: number = await this.validateEmailChangeStep(arrChangeStates, response, EmailChangeState.ValidateEmail);
        if(index < 0){
            return response;
        }

        const currentState: ProfileEmailChangeState = arrChangeStates[index];
        if(currentState.userId !== this.oidcContext.portalUserProfile.userId){
            response.profileEmailChangeError = ERROR_CODES.EC00148;
            return response;    
        }

        const user: User | null = await identityDao.getUserBy("id", this.oidcContext.portalUserProfile.userId);
        if(user === null){
            response.profileEmailChangeError = ERROR_CODES.EC00013;
            return response;            
        }

        const userByConfirmationToken: User | null = await identityDao.getUserByEmailConfirmationToken(token);
        if(userByConfirmationToken === null){
            response.profileEmailChangeError = ERROR_CODES.EC00134;
            return response;  
        }
        if(userByConfirmationToken.userId !== user.userId){
            response.profileEmailChangeError = ERROR_CODES.EC00135;
            return response;  
        }

        // If we made it here, then we can update the email or add a new recovery email
        if(currentState.isPrimaryEmail){
            user.email = currentState.email;
            user.emailVerified = true;
            await identityDao.updateUser(user);
        }
        else{
            const userRecoveryEmail: UserRecoveryEmail = {
                email: currentState.email,
                emailVerified: true,
                userId: currentState.userId
            }
            await identityDao.addRecoveryEmail(userRecoveryEmail);
        }
        await identityDao.deleteEmailConfirmationToken(token);

        currentState.changeStateStatus = STATUS_COMPLETE;
        await identityDao.updateProfileEmailChangeState(currentState);
        
        // There should always be a final state, so update it as well...
        const nextState: ProfileEmailChangeState = arrChangeStates[index + 1];
        nextState.changeStateStatus = STATUS_COMPLETE;
        response.profileEmailChangeState = nextState;
        
        // Since there are no more states, delete all of the records
        for(let i = 0; i < arrChangeStates.length; i++){
            await identityDao.deleteProfileEmailChangeState(arrChangeStates[i]);
        }
        return response;

    }

    public async profileCancelEmailChange(changeEmailSessionToken: string): Promise<ProfileEmailChangeResponse> {
        const arrChangeStates: Array<ProfileEmailChangeState> = await this.getSortedEmailChangeStates(changeEmailSessionToken);
        for(let i = 0; i < arrChangeStates.length; i++){
            await identityDao.deleteProfileEmailChangeState(arrChangeStates[i]);
        }
        const response: ProfileEmailChangeResponse = {
            profileEmailChangeState: {
                changeEmailSessionToken: "",
                emailChangeState: EmailChangeState.Completed,
                changeOrder: 0,
                changeStateStatus: STATUS_COMPLETE,
                email: "",
                expiresAtMs: 0,
                isPrimaryEmail: false,
                userId: ""
            },
            profileEmailChangeError: ERROR_CODES.DEFAULT
        }
        return response;
    }

    /**
     * 
     * @param userId 
     * @param registrationSessionToken 
     * @param preAuthToken 
     * @param deviceCodeId 
     * @returns 
     */
    public async cancelRegistration(userId: string, registrationSessionToken: string, preAuthToken: string | null, deviceCodeId: string | null): Promise<UserRegistrationStateResponse> {
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                registrationSessionToken: registrationSessionToken,
                registrationState: RegistrationState.Cancelled,
                registrationStateOrder: 0,
                registrationStateStatus: STATUS_COMPLETE,
                tenantId: "",
                userId: userId,
                deviceCodeId: ""
            },
            registrationError: ERROR_CODES.DEFAULT
        };
        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        let tenantId: string | null = null;
        let uId: string | null = null;
        if(arrUserRegistrationState.length > 0){
            tenantId = arrUserRegistrationState[0].tenantId;
            uId = arrUserRegistrationState[0].userId
        }

        for(let i = 0; i < arrUserRegistrationState.length; i++){
            await identityDao.deleteUserRegistrationState(arrUserRegistrationState[i]);
        }
        if(tenantId && uId){
            await this.deleteRegisteredUser(tenantId, uId);
        }
        response.userRegistrationState.registrationStateStatus = STATUS_COMPLETE;

        // If this is a device registration, need to set it to the cancelled state;
        if(deviceCodeId){
            const deviceCodeData: AuthorizationDeviceCodeData | null = await authDao.getAuthorizationDeviceCodeData(deviceCodeId, "devicecodeid");
            if(deviceCodeData){
                deviceCodeData.authorizationStatus = DeviceCodeAuthorizationStatus.Cancelled;
                await authDao.updateAuthorizationDeviceCodeData(deviceCodeData);
            }
        }
        if(preAuthToken){            
            const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);
            if(preAuthenticationState){
                const redirectUri = `${preAuthenticationState.redirectUri}?error=${OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED}&error_description=ERROR_USER_CANCELLED_REGISTRATION`;
                response.userRegistrationState.registrationState = RegistrationState.RedirectBackToApplication;
                response.uri = redirectUri;
                await authDao.deletePreAuthenticationState(preAuthToken);
            }            
        }
        else {
            response.userRegistrationState.registrationState = RegistrationState.RedirectToIamPortal;
            if(deviceCodeId){
                response.uri = `/access-error?access_error_code=00075`;
            }
            else{
                response.uri = `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`;
            }
        }
        return Promise.resolve(response);
    }    

    /**
     * 
     * @param changeEmailSessionToken 
     * @returns 
     */
    protected async getSortedEmailChangeStates(changeEmailSessionToken: string): Promise<Array<ProfileEmailChangeState>> {
        const arrChangeStates: Array<ProfileEmailChangeState> = await identityDao.getProfileEmailChangeStates(changeEmailSessionToken);
        arrChangeStates.sort(
            (a: ProfileEmailChangeState, b: ProfileEmailChangeState) => a.changeOrder - b.changeOrder
        );
        return arrChangeStates;
    }

    protected async validateEmailChangeStep(arrEmailChangeStates: Array<ProfileEmailChangeState>, response: ProfileEmailChangeResponse, expectedState: EmailChangeState): Promise<number> {
        let stepIndex: number = -1;
        let expectedChangeState: ProfileEmailChangeState | null = null;
        for(let i = 0; i < arrEmailChangeStates.length; i++){
            if(arrEmailChangeStates[i].emailChangeState === expectedState){
                stepIndex = i;
                expectedChangeState = arrEmailChangeStates[i];
                break;
            }
        }
        if(expectedChangeState === null){
            response.profileEmailChangeState.emailChangeState = EmailChangeState.Error;
            response.profileEmailChangeError = ERROR_CODES.EC00149;
            return stepIndex;
        }
        if(expectedChangeState.expiresAtMs < Date.now()){
            response.profileEmailChangeState.emailChangeState = EmailChangeState.Error;
            response.profileEmailChangeError = ERROR_CODES.EC00149;
            for(let i = 0; i < arrEmailChangeStates.length; i++){
                await identityDao.deleteProfileEmailChangeState(arrEmailChangeStates[i]);
            }
            return -1;
        }
        if(stepIndex > 0){
            for(let i = 0; i < stepIndex; i++){
                const previousState: ProfileEmailChangeState = arrEmailChangeStates[i];
                if(previousState.changeStateStatus !== STATUS_COMPLETE){
                    response.profileEmailChangeState.emailChangeState = EmailChangeState.Error;
                    response.profileEmailChangeError = ERROR_CODES.EC00149;
                    stepIndex = -1;
                    break;
                }
            }
        }
        return stepIndex;
    }

        /**
     * Checks
     * 1.   Does the tenant exist
     * 2.   Is the tenant enabled
     * 3.   Does the tenant allow user self registration if this is a registration flow?
     * 4.   Does a user with the given email already exist?
     * 5.   Is the password valid
     * 6.   Is the domain allowed by the tenant or are there resitricted domains for this tenant?
     * 7.   Do the rest of the required data values exist are are they the correct length, format, etc.?
     * @param userCreateInput 
     * @param tenantId 
     * @param isRegistration 
     * @returns 
     */
    protected async _createUser(userCreateInput: UserCreateInput, tenantId: string, isRegistration: boolean, recaptchaToken?: string): Promise<{ user: User, tenant: Tenant, tenantPasswordConfig: TenantPasswordConfig }> {

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if (!tenant) {
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        if (tenant.enabled === false || tenant.markForDelete === true) {
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00009}});
        }
        if (isRegistration && tenant.allowUserSelfRegistration === false) {
            throw new GraphQLError(ERROR_CODES.EC00156.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00156}});
        }
        if(isRegistration){
            if(tenant.registrationRequireTermsAndConditions && !userCreateInput.termsAndConditionsAccepted){
                throw new GraphQLError(ERROR_CODES.EC00100.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00100}});
            }
        }

        const existingUser: User | null = await identityDao.getUserBy("email", userCreateInput.email);
        if (existingUser) {
            throw new GraphQLError(ERROR_CODES.EC00142.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00142}});
        }
        if(userCreateInput.phoneNumber){
            const userByPhone: User | null = await identityDao.getUserBy("phone", userCreateInput.phoneNumber);
            if(userByPhone){
                throw new GraphQLError(ERROR_CODES.EC00224.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00224}});
            }
        }

        // Check the recaptcha configuration and validate the recaptcha token
        if(isRegistration === true && tenant.registrationRequireCaptcha === true){
            const captchaConfig: CaptchaConfig | null = await tenantDao.getCaptchaConfig();
            if(!captchaConfig){
                throw new GraphQLError(ERROR_CODES.EC00190.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00190}});
            }
            const decryptedApiKey: string | null = await kms.decrypt(captchaConfig.apiKey);
            const recaptchaResponse: RecaptchaResponse = await oidcServiceUtils.validateRecaptchaV3(decryptedApiKey || "", recaptchaToken || "");
            if(!recaptchaResponse.success){
                throw new GraphQLError(ERROR_CODES.EC00192.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00192}});
            }
            if(captchaConfig.useCaptchaV3 === true){
                const minScore = captchaConfig.minScoreThreshold || DEFAULT_CAPTCHA_V3_MINIMUM_SCORE;
                if(recaptchaResponse.score < minScore){
                    throw new GraphQLError(ERROR_CODES.EC00193.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00193}});
                }
            }
        }

        // Need to check to see if the tenant allows for migration of users from another
        // system. If so, then if we do not find the user's email in the local data store
        // we need to look to the legacy system as well. Of course, the admin of the
        // IAM tool may not have configured any URLs for migration, so we need to be careful
        // here too. If allow-migration is true, but there is no legacy config, or the URLs are
        // null, then proceed as normal.
        let tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig | null = null;
        if(tenant.migrateLegacyUsers === true){
            tenantLegacyUserMigrationConfig = await tenantDao.getLegacyUserMigrationConfiguration(tenant.tenantId);
            if(tenantLegacyUserMigrationConfig && tenantLegacyUserMigrationConfig.usernameCheckUri && tenantLegacyUserMigrationConfig.authenticationUri && tenantLegacyUserMigrationConfig.userProfileUri){
                const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                const userExistsInLegacySystem: boolean = await oidcServiceUtils.legacyUsernameCheck(tenantLegacyUserMigrationConfig.usernameCheckUri, userCreateInput.email.toLowerCase(), authToken || "");
                if(userExistsInLegacySystem){
                    throw new GraphQLError(ERROR_CODES.EC00142.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00142}});
                }
            }
        }

        const tenantPasswordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;
        const isValidPassword: boolean = await this.checkPassword(userCreateInput.password, tenantPasswordConfig);
        if (!isValidPassword) {
            throw new GraphQLError(ERROR_CODES.EC00157.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00157}});
        }

        const domain: string = getDomainFromEmail(userCreateInput.email);
        if(domain.length < 5 || domain.indexOf(".") < 0){
            throw new GraphQLError(ERROR_CODES.EC00158.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00158}});
        }
        // Cannot create users who are tied to an existing external oidc provider. These types of user can ONLY be created
        // by going through SSO with their provider.
        const federatedOIDCProvider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderByDomain(domain);
        if(federatedOIDCProvider){
            throw new GraphQLError(ERROR_CODES.EC00159.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00159}});
        }

        const arrRestrictedDomainRel: Array<TenantRestrictedAuthenticationDomainRel> = await tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
        if (arrRestrictedDomainRel.length > 0) {
            const restrictedDomainRel: TenantRestrictedAuthenticationDomainRel | undefined = arrRestrictedDomainRel.find(
                (rel: TenantRestrictedAuthenticationDomainRel) => rel.domain === domain
            );
            if (restrictedDomainRel === undefined) {
                throw new GraphQLError(ERROR_CODES.EC00160.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00160}});
            }
        }

        const userEnabled = isRegistration ? false : true;
        const emailVerified = false;
        
        const user: User = {
            domain: domain,
            email: userCreateInput.email,
            emailVerified: emailVerified,
            enabled: userEnabled,
            firstName: userCreateInput.firstName,
            lastName: userCreateInput.lastName,
            locked: false,
            nameOrder: userCreateInput.nameOrder,
            userId: randomUUID().toString(),
            address: userCreateInput.address,
            addressLine1: userCreateInput.addressLine1,
            city: userCreateInput.city,
            postalCode: userCreateInput.postalCode,
            stateRegionProvince: userCreateInput.stateRegionProvince,
            countryCode: userCreateInput.countryCode,
            middleName: userCreateInput.middleName,
            phoneNumber: userCreateInput.phoneNumber,
            preferredLanguageCode: userCreateInput.preferredLanguageCode,
            federatedOIDCProviderSubjectId: userCreateInput.federatedOIDCProviderSubjectId,
            markForDelete: false,
            forcePasswordResetAfterAuthentication: isRegistration ? false : true
        }

        await identityDao.createUser(user);
        await identityDao.assignUserToTenant(tenant.tenantId, user.userId, "PRIMARY");
        if(isRegistration && userCreateInput.termsAndConditionsAccepted){
            const userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted = {
                acceptedAtMs: Date.now(),
                tenantId: tenant.tenantId,
                userId: user.userId
            };
            await identityDao.addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted);
        }
        const userCredential: UserCredential = generateUserCredential(user.userId, userCreateInput.password, tenantPasswordConfig.passwordHashingAlgorithm);
        await identityDao.addUserCredential(userCredential);

        if (isRegistration && tenant.verifyEmailOnSelfRegistration) {
            this.sentEmailValidationToken(user, user.email);            
        }
        await searchDao.updateObjectSearchIndex(tenant, user);
        await searchDao.updateUserTenantRelSearchIndex(tenant.tenantId, user);

        return Promise.resolve({ user: user, tenant: tenant, tenantPasswordConfig: tenantPasswordConfig });
    }
       
    /**
     * returns the index of the 
     * @param arrUserRegistrationState 
     * @param response 
     * @param expectedState 
     * @returns 
     */
    protected async validateRegistrationStep(arrUserRegistrationState: Array<UserRegistrationState>, response: UserRegistrationStateResponse, expectedState: RegistrationState): Promise<number> {
        
        let stepIndex: number = -1;
        let expectedRegistrationState: UserRegistrationState | null = null;
        for(let i = 0; i < arrUserRegistrationState.length; i++){
            if(arrUserRegistrationState[i].registrationState === expectedState){
                stepIndex = i;
                expectedRegistrationState = arrUserRegistrationState[i];
                break;
            }
        }

        if(expectedRegistrationState === null){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError = ERROR_CODES.EC00150;
            return stepIndex;
        }

        // If expired before registration has been completed, then delete everything,
        // including the email token, the user that was previously created, and any other relationships.
        if(expectedRegistrationState.expiresAtMs < Date.now()){
            response.userRegistrationState.registrationState = RegistrationState.Expired;
            response.registrationError = ERROR_CODES.EC00150;
            for(let i = 0; i < arrUserRegistrationState.length; i++){
                await identityDao.deleteUserRegistrationState(arrUserRegistrationState[i]);
            }
            await this.deleteRegisteredUser(expectedRegistrationState.tenantId, expectedRegistrationState.userId);
            return -1;
        }
        
        // Are there previous steps and have the previous steps been completed?
        if(stepIndex > 0){
            for(let i = 0; i < stepIndex; i++){
                const previousState: UserRegistrationState = arrUserRegistrationState[i];
                if(previousState.registrationStateStatus !== STATUS_COMPLETE){
                    response.userRegistrationState.registrationState = RegistrationState.Error;
                    response.registrationError = ERROR_CODES.EC00150;
                    stepIndex = -1;
                    break;
                }
            }            
        }

        return stepIndex;
    }

    /**
     * 
     * @param recoveryEmail 
     * @returns 
     */
    protected async validateRecoveryEmail(userId: string, recoveryEmail: string): Promise<{isValid: boolean, errorDetail: ErrorDetail}>{

        const existingRecoveryAccount: UserRecoveryEmail | null = await identityDao.getUserRecoveryEmail(userId);
        if(existingRecoveryAccount !== null){
            return {isValid: false, errorDetail: ERROR_CODES.EC00141};
        }

        const userByEmail: User | null = await identityDao.getUserBy("email", recoveryEmail);
        if(userByEmail){
            return {isValid: false, errorDetail: ERROR_CODES.EC00142};
            
        }
        const domain: string = getDomainFromEmail(recoveryEmail);
        if(domain.length === 0){
            return {isValid: false, errorDetail: ERROR_CODES.EC00143}
        }
        // Cannot create users who are tied to an existing external oidc provider. These types of user can ONLY be created
        // by going through SSO with their provider.
        const federatedOIDCProvider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderByDomain(domain);
        if(federatedOIDCProvider){
            return {isValid: false, errorDetail: ERROR_CODES.EC00144};            
        }
        return {isValid: true, errorDetail: ERROR_CODES.NULL_ERROR}
    }

    /**
     * 
     * @param userRegistrationState 
     * @param response 
     */
    protected async handleRegistrationCompletion(userRegistrationState: UserRegistrationState, arrUserRegistrationState: Array<UserRegistrationState>, response: UserRegistrationStateResponse): Promise<void> {
        
        const user: User | null = await identityDao.getUserBy("id", userRegistrationState.userId);
        if(!user){
            response.registrationError = ERROR_CODES.EC00151;
            response.userRegistrationState.registrationState = RegistrationState.Error;
            return;
        }
        
        user.enabled = true;
        const tenant: Tenant | null = await tenantDao.getTenantById(userRegistrationState.tenantId);
        if(tenant === null){
            response.registrationError = ERROR_CODES.EC00152;
            response.userRegistrationState.registrationState = RegistrationState.Error;
            return;                
        }
        await identityDao.updateUser(user);
        await searchDao.updateObjectSearchIndex(tenant, user);
        if(userRegistrationState.deviceCodeId){
            const deviceCodeData: AuthorizationDeviceCodeData | null = await authDao.getAuthorizationDeviceCodeData(userRegistrationState.deviceCodeId, "devicecodeid");
            if(deviceCodeData){
                deviceCodeData.authorizationStatus = DeviceCodeAuthorizationStatus.Approved;
                deviceCodeData.userId = user.userId;
                await authDao.updateAuthorizationDeviceCodeData(deviceCodeData);
            }
        }
        
        if(userRegistrationState.registrationState === RegistrationState.RedirectBackToApplication){
            try{
                const authorizationCode: AuthorizationReturnUri = await this.generateAuthorizationCode(userRegistrationState.userId, userRegistrationState.preAuthToken || "");
                response.userRegistrationState = userRegistrationState;
                response.uri = authorizationCode.uri;
                userRegistrationState.registrationStateStatus = STATUS_COMPLETE;        
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(err: any){
                throw new GraphQLError(err.message);                
            }
        }
        else if(userRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
            try{
                if(userRegistrationState.deviceCodeId){
                    userRegistrationState.registrationStateStatus = STATUS_COMPLETE;
                    response.userRegistrationState = userRegistrationState;
                    response.uri = "/device/registered";
                    const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                    oidcServiceUtils.fireSecurityEvent("device_registered", this.oidcContext, user, null, authToken);
                }
                else{
                    const jwtSigningResponse = await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, this.getPortalAuthenTokenTTLSeconds(), PRINCIPAL_TYPE_IAM_PORTAL_USER);
                    if(!jwtSigningResponse || jwtSigningResponse.accessToken === null){
                        response.registrationError = ERROR_CODES.EC00153;
                        response.userRegistrationState.registrationState = RegistrationState.Error;
                    }
                    else{
                        response.userRegistrationState = userRegistrationState;
                        response.uri = `/${userRegistrationState.tenantId}`;
                        response.accessToken = jwtSigningResponse.accessToken;
                        response.tokenExpiresAtMs = Date.now() + (this.getPortalAuthenTokenTTLSeconds() * 1000);
                        userRegistrationState.registrationStateStatus = STATUS_COMPLETE;

                        const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                        oidcServiceUtils.fireSecurityEvent("user_registered", this.oidcContext, user, jwtSigningResponse.principal.jti || null, authToken);                        
                    }
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(err: any){
                throw new GraphQLError(err.message);                
            }
        }
        // If no errors, then delete all the of the registration states.
        if(response.userRegistrationState.registrationState !== RegistrationState.Error){            
            for(let i = 0; i < arrUserRegistrationState.length; i++){
                await identityDao.deleteUserRegistrationState(arrUserRegistrationState[i]);
            }
        }
        identityDao.addUserAuthenticationHistory(user.userId, Date.now());
        
    }

    protected async deleteRegisteredUser(tenantId: string, userId: string): Promise<void> {
        await identityDao.deleteFIDO2Challenge(userId);
        await identityDao.deleteFido2Count(userId);
        await identityDao.deleteFIDOKey(userId);
        await identityDao.deleteTOTP(userId);
        await identityDao.removeUserFromTenant(tenantId, userId);
        await identityDao.deleteUserCredential(userId);
        await identityDao.deleteRecoveryEmail(userId);
        await identityDao.deleteUserDuressCredential(userId);
        await identityDao.deleteUserTermsAndConditionsAccepted(userId, tenantId);
        await searchClient.delete({
            id: `${tenantId}::${userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
        });
        await identityDao.deleteUser(userId);
        await searchClient.delete({
            id: userId,
            index: SEARCH_INDEX_OBJECT_SEARCH
        });
    }      


}

export default RegisterUserService;

