import { OIDCContext } from "@/graphql/graphql-context";
import IdentityDao from "../dao/identity-dao";
import { Fido2KeyRegistrationInput, Tenant, TenantPasswordConfig, TotpResponse, User, UserCreateInput, UserCredential, Fido2KeyAuthenticationInput, TenantRestrictedAuthenticationDomainRel, PreAuthenticationState, AuthorizationReturnUri, UserRegistrationStateResponse, UserRegistrationState, RegistrationState, UserTermsAndConditionsAccepted, TenantLegacyUserMigrationConfig, SystemSettings, FederatedOidcProvider, AuthorizationDeviceCodeData, DeviceCodeAuthorizationStatus } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from "crypto";
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, STATUS_COMPLETE, STATUS_INCOMPLETE, TOKEN_TYPE_IAM_PORTAL_USER, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import {  generateRandomToken, getDomainFromEmail } from "@/utils/dao-utils";
import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import AuthDao from "../dao/auth-dao";
import JwtServiceUtils from "./jwt-service-utils";
import IdentityService from "./identity-service";
import OIDCServiceUtils from "./oidc-service-utils";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";


const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient: OpenSearchClient = getOpenSearchClient();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const federatedOIDCProvderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();


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
    public async registerUser(userCreateInput: UserCreateInput, tenantId: string, preAuthToken: string | null, deviceCodeId: string | null): Promise<UserRegistrationStateResponse>{
            
        // Need to check to see if there is an active registration session happening with the
        // user, based on their email. If so, then return error if the session has not expired.
        // Otherwise, delete the old registration session, any user and relationships that were
        // created, and continue.
        const existingRegistrationStates = await identityDao.getUserRegistrationStatesByEmail(userCreateInput.email);
        if(existingRegistrationStates.length > 0){
            if(existingRegistrationStates[0].expiresAtMs > Date.now()){
                throw new GraphQLError("ERROR_REGISTRATION_FOR_USER_ALREADY_IN_PROGRESS");
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
        const {user, tenant, tenantPasswordConfig} = await this._createUser(userCreateInput, tenantId, true);

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
        if(systemSettings.allowBackupEmail){
            stateOrder.push(RegistrationState.AddBackupEmailOptional);
            if(tenant.verifyEmailOnSelfRegistration === true){
                stateOrder.push(RegistrationState.ValidateBackupEmail);
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            }
        }
        return Promise.resolve(response);
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
    protected async _createUser(userCreateInput: UserCreateInput, tenantId: string, isRegistration: boolean): Promise<{ user: User, tenant: Tenant, tenantPasswordConfig: TenantPasswordConfig }> {

        // Always need to make sure that we lower-case the email for consistency purposes.
        userCreateInput.email = userCreateInput.email.toLowerCase();

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if (!tenant) {
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        if (tenant.enabled === false || tenant.markForDelete === true) {
            throw new GraphQLError("ERROR_TENANT_IS_NOT_ENABLED");
        }
        if (isRegistration && tenant.allowUserSelfRegistration === false) {
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_ALLOW_USER_SELF_REGISTRATION");
        }
        if(isRegistration){
            if(tenant.registrationRequireTermsAndConditions && !userCreateInput.termsAndConditionsAccepted){
                throw new GraphQLError("ERROR_TERMS_AND_CONDITIONS_NOT_ACCEPTED");
            }
        }

        const existingUser: User | null = await identityDao.getUserBy("email", userCreateInput.email);
        if (existingUser) {
            throw new GraphQLError("ERROR_USER_WITH_EMAIL_ALREADY_EXISTS");
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
                    throw new GraphQLError("ERROR_USER_ALREADY_EXISTS");
                }
            }
        }

        const tenantPasswordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;
        const isValidPassword: boolean = await this.checkPassword(userCreateInput.password, tenantPasswordConfig);
        if (!isValidPassword) {
            throw new GraphQLError("INVALID_PASSWORD_EITHER_PROHIBITED_OR_INVALID_FORMAT");
        }

        const domain: string = getDomainFromEmail(userCreateInput.email);
        if(domain.length === 0){
            throw new GraphQLError("ERROR_INVALID_EMAIL_DOMAIN");
        }
        // Cannot create users who are tied to an existing external oidc provider. These types of user can ONLY be created
        // by going through SSO with their provider.
        const federatedOIDCProvider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderByDomain(domain);
        if(federatedOIDCProvider){
            throw new GraphQLError("ERROR_DOMAIN_IS_MANAGED_BY_EXTERNAL_OIDC_PROVIDER");
        }

        const arrRestrictedDomainRel: Array<TenantRestrictedAuthenticationDomainRel> = await tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
        if (arrRestrictedDomainRel.length > 0) {
            const restrictedDomainRel: TenantRestrictedAuthenticationDomainRel | undefined = arrRestrictedDomainRel.find(
                (rel: TenantRestrictedAuthenticationDomainRel) => rel.domain === domain
            );
            if (restrictedDomainRel === undefined) {
                throw new GraphQLError("ERROR_TENANT_HAS_RESTRICTED_EMAIL_DOMAINS")
            }
        }


        let userEnabled = true;
        let emailVerified = true;
        if (isRegistration && tenant.verifyEmailOnSelfRegistration) {
            userEnabled = false;
            emailVerified = false;
        }

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
            markForDelete: false
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
        const userCredential: UserCredential = this.generateUserCredential(user.userId, userCreateInput.password, tenantPasswordConfig.passwordHashingAlgorithm);
        await identityDao.addUserCredential(userCredential);

        if (isRegistration && tenant.verifyEmailOnSelfRegistration) {
            const token: string = generateRandomToken(8, "hex").toUpperCase();
            await identityDao.saveEmailConfirmationToken(user.userId, token);
            // TODO
            // Send email to the user with the token value.
        }
        await this.updateObjectSearchIndex(tenant, user, "PRIMARY");
        await this.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, user, USER_TENANT_REL_TYPE_PRIMARY);

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
            response.registrationError.errorCode = "ERROR_NO_VALID_REGISTRATION_STATE_FOUND";
            return stepIndex;
        }

        // If expired before registration has been completed, then delete everything,
        // including the email token, the user that was previous created, and any other relationships.
        if(expectedRegistrationState.expiresAtMs < Date.now()){
            response.userRegistrationState.registrationState = RegistrationState.Expired;
            response.registrationError.errorCode = "ERROR_REGISTRATION_HAS_EXPIRED";
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
                    response.registrationError.errorCode = "ERROR_INCOMPLETE_REGISTRATION_STATE_FOUND";
                    stepIndex = -1;
                    break;
                }
            }            
        }

        return stepIndex;
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            },
            accessToken: null,
            totpSecret: null,
            uri: null
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index: number = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateEmail);
        if(index < 0){
            return Promise.resolve(response);
        }        

        const user: User | null = await identityDao.getUserByEmailConfirmationToken(token);
        if(user === null){
            await identityDao.deleteEmailConfirmationToken(token);
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError.errorCode = "ERROR_NO_USER_FOUND_FOR_TOKEN"
            return Promise.resolve(response);
        }
               
        if(user.userId !== userId){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError.errorCode = "ERROR_INVALID_USER_FOUND_FOR_TOKEN"
            return Promise.resolve(response);
        }

        // For the one-time token, need to delete it in success case and
        // update the user profile and this registration state to a status
        // of complete and set the next state as the return value.
        await identityDao.deleteEmailConfirmationToken(token);
        user.emailVerified = true;
        await identityDao.updateUser(user);
        await this.updateSearchIndexUserDocument(user);
        arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[0]);
        const nextRegistrationState = arrUserRegistrationState[index + 1];
        response.userRegistrationState = nextRegistrationState;
        return Promise.resolve(response);        
    }

    public async registerVerifyBackupEmail(userId: string, token: string, registrationSessionToken: string, preAuthToken: string | null): Promise<UserRegistrationStateResponse>{
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            },
            accessToken: null,
            totpSecret: null,
            uri: null
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index: number = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateBackupEmail);
        if(index < 0){
            return Promise.resolve(response);
        }        

        const user: User | null = await identityDao.getUserByEmailConfirmationToken(token);
        if(user === null){
            await identityDao.deleteEmailConfirmationToken(token);
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError.errorCode = "ERROR_NO_USER_FOUND_FOR_TOKEN";
            return Promise.resolve(response);
        }
               
        if(user.userId !== userId){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError.errorCode = "ERROR_INVALID_USER_FOUND_FOR_TOKEN"
            return Promise.resolve(response);
        }

        // For the one-time token, need to delete it in success case and        
        await identityDao.deleteEmailConfirmationToken(token);
        const email: string | null = await identityDao.getUserBackupEmail(userId);
        if(!email){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError.errorCode = "ERROR_NO_BACKUP_EMAIL_FOUND";
            return Promise.resolve(response);
        }
        
        await identityDao.updateBackupEmail(userId, email, true);
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            },
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
            if(password === null){
                response.registrationError.errorCode = "ERROR_NO_DURESS_PASSWORD_SUPPLIED";
                return response;
            }
            const arrExistingCredentials = await identityDao.getUserCredentials(arrUserRegistrationState[index].userId);
            // There should only be one at this point!!!
            if(arrExistingCredentials.length !== 1){
                response.registrationError.errorCode = "ERROR_PASSWORD_COUNT_INCORRECT";
                return response;
            }
            // Check to see if the user is re-using their just-entered password and if so we should return an error
            const b: boolean = this.validateUserCredentials(arrExistingCredentials[0], password);            
            if(b){
                response.registrationError.errorCode = "ERROR_PASSWORD_HAS_BEEN_USED_DURING_REGISTRATION";
                return response;
            }
            const tenantPasswordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(arrUserRegistrationState[index].tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;
            const isValidPassword: boolean = await this.checkPassword(password, tenantPasswordConfig);
            if(!isValidPassword){
                response.registrationError.errorCode = "ERROR_PASSWORD_DOES_NOT_MEET_REQUIRED_FORMAT";
                return response;
            }
            const userDuressCredential: UserCredential = this.generateUserCredential(arrUserRegistrationState[index].userId, password, tenantPasswordConfig.passwordHashingAlgorithm);
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

    public async registerAddBackupEmail(userId: string, backupEmail: string | null, registrationSessionToken: string, preAuthToken: string | null, skip: boolean): Promise<UserRegistrationStateResponse>{
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            },
            accessToken: null,
            totpSecret: null,
            uri: null
        };
        
        const index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.AddBackupEmailOptional);
        if(index < 0){
            return response;
        }
                
        if(skip === true){
            // We can mark this as complete. We need to check to see if the next step is 
            // to validate the backup email. If so, then we can mark it as complete too. 
            arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
            
            let nextRegistrationState: UserRegistrationState = arrUserRegistrationState[index + 1];
            if(nextRegistrationState.registrationState === RegistrationState.ValidateBackupEmail){
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
            if(backupEmail === null){
                response.registrationError.errorCode = "ERROR_NO_BACKUP_EMAIL_SUPPLIED";
                return response;
            }
            const userByEmail: User | null = await identityDao.getUserBy("email", backupEmail);
            if(userByEmail){
                response.registrationError.errorCode = "ERROR_EMAIL_ALREADY_IN_USE";
                return response;
            }
            const domain: string = getDomainFromEmail(backupEmail);
            if(domain.length === 0){
                response.registrationError.errorCode = "ERROR_INVALID_EMAIL_ADDRESS";
                return response;
            }
            // Cannot create users who are tied to an existing external oidc provider. These types of user can ONLY be created
            // by going through SSO with their provider.
            const federatedOIDCProvider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderByDomain(domain);
            if(federatedOIDCProvider){
                response.registrationError.errorCode = "ERROR_DOMAIN_IS_MANAGED_BY_EXTERNAL_OIDC_PROVIDER";
                return response;
            }

            await identityDao.addBackupEmail(arrUserRegistrationState[index].userId, backupEmail, false);
            arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);

            const nextRegistrationState: UserRegistrationState = arrUserRegistrationState[index + 1];
            if(nextRegistrationState.registrationState === RegistrationState.ValidateBackupEmail){
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            },
            accessToken: null,
            totpSecret: null,
            uri: null
        };
        
        const index = skip ? 
                        await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureTotpOptional) :
                        await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureTotpRequired);
        
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
            catch(err){
                response.userRegistrationState.registrationState = RegistrationState.Error;
                response.registrationError.errorCode = "ERROR_CREATING_TOTP"
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            }
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
            response.registrationError.errorCode = "ERROR_INVALID_TOTP_TOKEN_VALUE";
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            }
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index = skip ? 
                        await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyOptional) :
                        await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyRequired);

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
                response.registrationError.errorCode = "ERROR_INVALID_SECURITY_KEY_REGISTRATION_INPUT";
                response.userRegistrationState.registrationState = RegistrationState.Error;
            }
            else{
                try{
                    await this.registerFIDO2Key(userId, fido2KeyRegistrationInput);
                    arrUserRegistrationState[index].registrationStateStatus = STATUS_COMPLETE;
                    await identityDao.updateUserRegistrationState(arrUserRegistrationState[index]);
                    response.userRegistrationState = arrUserRegistrationState[index + 1];
                }
                catch(err: any){
                    response.registrationError.errorCode = "ERROR_VALIDATING_SECURITY_KEY_REGISTRATION_INPUT";
                    response.userRegistrationState.registrationState = RegistrationState.Error;
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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            }
        };

        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        const index = await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ValidateSecurityKey);
        if(index < 0){
            return Promise.resolve(response);
        }
        try{
            const isValid: boolean = await this.authenticateFIDO2Key(userId, fido2KeyAuthenticationInput);
            if(!isValid){
                response.registrationError.errorCode = "ERROR_VALIDATING_SECURITY_KEY_VALIDATION_INPUT";
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
        catch(err){
            response.registrationError.errorCode = "ERROR_VALIDATING_SECURITY_KEY_VALIDATION_INPUT";
            response.userRegistrationState.registrationState = RegistrationState.Error;
        }

        return Promise.resolve(response);
    }


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
            registrationError: {
                errorCode: "",
                errorMessage: ""
            }
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
     * @param userRegistrationState 
     * @param response 
     */
    protected async handleRegistrationCompletion(userRegistrationState: UserRegistrationState, arrUserRegistrationState: Array<UserRegistrationState>, response: UserRegistrationStateResponse): Promise<void> {
        
        const user: User | null = await identityDao.getUserBy("id", userRegistrationState.userId);
        if(!user){
            response.registrationError.errorCode = "ERROR_NO_USER_FOUND_FOR_REGISTRATION_COMPLETION";
            response.userRegistrationState.registrationState = RegistrationState.Error;
            return;
        }
        
        user.enabled = true;
        const tenant: Tenant | null = await tenantDao.getTenantById(userRegistrationState.tenantId);
        if(tenant === null){
            response.registrationError.errorCode = "ERROR_INVALID_TENANT_FOR_REGISTRATION_COMPLETION";
            response.userRegistrationState.registrationState = RegistrationState.Error;
            return;                
        }
        await identityDao.updateUser(user);
        await this.updateObjectSearchIndex(tenant, user, USER_TENANT_REL_TYPE_PRIMARY);
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
            catch(err: any){
                response.registrationError.errorCode = err.message;
                response.userRegistrationState.registrationState = RegistrationState.Error;
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
                    const jwtSigningResponse = await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, this.getPortalAuthenTokenTTLSeconds(), TOKEN_TYPE_IAM_PORTAL_USER);
                    if(!jwtSigningResponse || jwtSigningResponse.accessToken === null){
                        response.registrationError.errorCode = "ERROR_GENERATING_ACCESS_TOKEN_REGISTRATION_COMPLETION";
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
            catch(err: any){
                response.registrationError.errorCode = err.message;
                response.userRegistrationState.registrationState = RegistrationState.Error;
            }
        }
        // If no errors, then delete all the of the registration states.
        if(response.userRegistrationState.registrationState !== RegistrationState.Error){            
            for(let i = 0; i < arrUserRegistrationState.length; i++){
                await identityDao.deleteUserRegistrationState(arrUserRegistrationState[i]);
            }
        }
        
    }

    protected async deleteRegisteredUser(tenantId: string, userId: string): Promise<void> {
        await identityDao.deleteFIDO2Challenge(userId);
        await identityDao.deleteFido2Count(userId);
        await identityDao.deleteFIDOKey(userId);
        await identityDao.deleteTOTP(userId);
        await identityDao.removeUserFromTenant(tenantId, userId);
        await identityDao.deleteUserCredential(userId);
        await identityDao.deleteBackupEmail(userId);
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

