import { OIDCContext } from "@/graphql/graphql-context";
import * as OTPAuth from "otpauth";
import IdentityDao from "../dao/identity-dao";
import { Client, Fido2AuthenticationChallengeResponse, Fido2Challenge, Fido2RegistrationChallengeResponse, Fido2KeyRegistrationInput, ObjectSearchResultItem, RefreshData, RelSearchResultItem, SearchResultType, Tenant, TenantPasswordConfig, TotpResponse, User, UserCreateInput, UserCredential, UserMfaRel, UserSession, UserTenantRel, UserTenantRelView, Fido2KeyAuthenticationInput, TenantRestrictedAuthenticationDomainRel, TenantManagementDomainRel, FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcAuthorizationRel, FederatedOidcAuthorizationRelType, AuthorizationCodeData, PreAuthenticationState, AuthorizationReturnUri, UserRegistrationStateResponse, UserRegistrationState, RegistrationState, UserAuthenticationStateResponse, AuthenticationState, AuthenticationErrorTypes } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from "crypto";
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, NAME_ORDER_WESTERN, PASSWORD_HASH_ITERATION_128K, PASSWORD_HASH_ITERATION_256K, PASSWORD_HASH_ITERATION_32K, PASSWORD_HASH_ITERATION_64K, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, STATUS_COMPLETE, STATUS_INCOMPLETE, STATUS_OMITTED, TENANT_TYPE_ROOT_TENANT, TOKEN_TYPE_END_USER, TOKEN_TYPE_PROVISIONAL_USER, TOTP_HASH_ALGORITHM_SHA1, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import { sha256HashPassword, pbkdf2HashPassword, bcryptHashPassword, generateSalt, scryptHashPassword, generateRandomToken, generateCodeVerifierAndChallenge } from "@/utils/dao-utils";
import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import { Get_Response } from "@opensearch-project/opensearch/api/index.js";
import Kms from "../kms/kms";
import AuthDao from "../dao/auth-dao";
import ClientDao from "../dao/client-dao";
import { VerifiedRegistrationResponse, verifyRegistrationResponse, verifyAuthenticationResponse, VerifiedAuthenticationResponse } from '@simplewebauthn/server';
import { validatePassword } from "@/utils/password-utils";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import OIDCServiceUtils from "./oidc-service-utils";
import { WellknownConfig } from "../models/wellknown-config";
import JwtServiceUtils from "./jwt-service-utils";



const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient: OpenSearchClient = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();

const {
    MFA_ISSUER,
    MFA_ORIGIN,
    MFA_ID,
    AUTH_DOMAIN
} = process.env;

class IdentityService {
    
    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async registerUser(userCreateInput: UserCreateInput, tenantId: string, preAuthToken: string | null | undefined): Promise<UserRegistrationStateResponse>{
        
        // TODO
        // Need to check to see if there is an active registration session happening with the
        // user, based on their email. If so, then return error if the session has not expired.
        // Otherwise, delete the old registration session, any user and relationships that were
        // created, and continue.
        
        const {user, tenant, tenantPasswordConfig} = await this._createUser(userCreateInput, tenantId, true);

        const registrationSessionToken: string = generateRandomToken(20, "hex");

        // registration completion will expire after 12 hours. 
        const expiresAt: number = Date.now() + (60 * 60 * 12);
        const arrState: Array<UserRegistrationState> = [];
        let order: number = 1;
        if(tenant.verifyEmailOnSelfRegistration === true){
            // Note that the _createUser function will generate an email token and
            // send it to the user. No need to do that here.
            arrState.push({
                email: user.email,
                tenantId: tenant.tenantId,
                expiresAtMs: expiresAt,
                registrationSessionToken: registrationSessionToken,
                registrationState: RegistrationState.ValidateEmail,
                registrationStateOrder: order,
                registrationStateStatus: STATUS_INCOMPLETE,
                userId: user.userId,
                preAuthToken: preAuthToken
            });
            order++;
        }
        if(tenantPasswordConfig.requireMfa === true){
            const mfas = tenantPasswordConfig.mfaTypesRequired?.split(",") || [];
            // TODO. If only one is required, then we need to include the optional
            // other MFA type. But we always need to show the REQUIRED MFA type first,
            // followed by the optional MFA type in cases where there is only 1 required
            // MFA type.
            if(mfas.includes(MFA_AUTH_TYPE_TIME_BASED_OTP)){
                arrState.push({
                    email: user.email,
                    tenantId: tenant.tenantId,
                    expiresAtMs: expiresAt,
                    registrationSessionToken: registrationSessionToken,
                    registrationState: RegistrationState.ConfigureTotpRequired,
                    registrationStateOrder: order,
                    registrationStateStatus: STATUS_INCOMPLETE,
                    userId: user.userId,
                    preAuthToken: preAuthToken
                });
                order++;
                arrState.push({
                    email: user.email,
                    tenantId: tenant.tenantId,
                    expiresAtMs: expiresAt,
                    registrationSessionToken: registrationSessionToken,
                    registrationState: RegistrationState.ValidateTotp,
                    registrationStateOrder: order,
                    registrationStateStatus: STATUS_INCOMPLETE,
                    userId: user.userId,
                    preAuthToken: preAuthToken
                });
                order++;
            }
            if(mfas.includes(MFA_AUTH_TYPE_FIDO2)){
                arrState.push({
                    email: user.email,
                    tenantId: tenant.tenantId,
                    expiresAtMs: expiresAt,
                    registrationSessionToken: registrationSessionToken,
                    registrationState: RegistrationState.ConfigureSecurityKeyRequired,
                    registrationStateOrder: order,
                    registrationStateStatus: STATUS_INCOMPLETE,
                    userId: user.userId,
                    preAuthToken: preAuthToken
                });
                order++;
                arrState.push({
                    email: user.email,
                    tenantId: tenant.tenantId,
                    expiresAtMs: expiresAt,
                    registrationSessionToken: registrationSessionToken,
                    registrationState: RegistrationState.ValidateSecurityKey,
                    registrationStateOrder: order,
                    registrationStateStatus: STATUS_INCOMPLETE,
                    userId: user.userId,
                    preAuthToken: preAuthToken
                });
                order++;
            }
            
        }
        else{
            arrState.push({
                email: user.email,
                tenantId: tenant.tenantId,
                expiresAtMs: expiresAt,
                registrationSessionToken: registrationSessionToken,
                registrationState: RegistrationState.ConfigureTotpOptional,
                registrationStateOrder: order,
                registrationStateStatus: STATUS_INCOMPLETE,
                userId: user.userId,
                preAuthToken: preAuthToken
            });

            arrState.push({
                email: user.email,
                tenantId: tenant.tenantId,
                expiresAtMs: expiresAt,
                registrationSessionToken: registrationSessionToken,
                registrationState: RegistrationState.ConfigureSecurityKeyOptional,
                registrationStateOrder: order,
                registrationStateStatus: STATUS_INCOMPLETE,
                userId: user.userId,
                preAuthToken: preAuthToken
            });
        }
        arrState.push({
            email: user.email,
            tenantId: tenant.tenantId,
            expiresAtMs: expiresAt,
            registrationSessionToken: registrationSessionToken,
            registrationState: preAuthToken ? RegistrationState.RedirectBackToApplication : RegistrationState.Completed,
            registrationStateOrder: order,
            registrationStateStatus: STATUS_INCOMPLETE,
            userId: user.userId,
            preAuthToken: preAuthToken
        });
        order++;

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
     * 
     * @param registrationSessionToken 
     * @returns 
     */
    protected async getSortedRegistartionStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>>{

        let arrUserRegistrationState: Array<UserRegistrationState> = await identityDao.getUserRegistrationStates(registrationSessionToken);
        arrUserRegistrationState.sort(
            (a: UserRegistrationState, b: UserRegistrationState) => a.registrationStateOrder - b.registrationStateOrder
        );
        return Promise.resolve(arrUserRegistrationState);
    }

    /**
     * returns the index of the 
     * @param arrUserRegistrationState 
     * @param response 
     * @param expectedState 
     * @returns 
     */
    protected async validateStep(arrUserRegistrationState: Array<UserRegistrationState>, response: UserRegistrationStateResponse, expectedState: RegistrationState): Promise<number> {
        
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
        
        // Is there a previous step and has the previous step incomplete?
        if(stepIndex > 0){
            const previousState: UserRegistrationState = arrUserRegistrationState[stepIndex - 1];
            if(previousState.registrationStateStatus === STATUS_INCOMPLETE){
                response.userRegistrationState.registrationState = RegistrationState.Error;
                response.registrationError.errorCode = "ERROR_PREVIOUS_REGISTRATION_STEP_IS_INCOMPLETE";
                return -1;
            }
        }

        return stepIndex;
    }


    public async registerVerifyEmailAddress(userId: string, token: string, registrationSessionToken: string, preAuthToken: string): Promise<UserRegistrationStateResponse>{
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: undefined,
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
            }
        }
        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        await this.validateStep(arrUserRegistrationState, response, RegistrationState.ValidateEmail);
        if(response.userRegistrationState.registrationState === RegistrationState.Error){
            return Promise.resolve(response);
        }
        if(response.userRegistrationState.registrationState === RegistrationState.Expired){
            await identityDao.deleteEmailConfirmationToken(token);
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
        arrUserRegistrationState[0].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[0]);
        const nextRegistrationState = arrUserRegistrationState[1];
        response.userRegistrationState = nextRegistrationState;
        return Promise.resolve(response);        
    }



    public async getUserById(userId: string): Promise<User | null> {
        return identityDao.getUserBy("id", userId);
    }

    

    public async createUser(userCreateInput: UserCreateInput, tenantId: string): Promise<User>{
        const { user } = await this._createUser(userCreateInput, tenantId, false);
        return user;
    }

    protected async checkPassword(password: string, passwordConfig: TenantPasswordConfig): Promise<boolean> {
        

        // Need to check to see if the password is diallowed because is has been
        // previously found to be easily cracked, as in the top 100K or top 1M cracked passwords.
        const passwordProhibited: boolean = await identityDao.passwordProhibited(password);
        if(passwordProhibited){
            return Promise.resolve(false);
        }
        const passwordFormatIsValid: boolean = validatePassword(password, passwordConfig).result;
        return Promise.resolve(passwordFormatIsValid);
    }

    public async updateUser(user: User): Promise<User> {

        const existingUser: User | null = await identityDao.getUserBy("id", user.userId);
        if (existingUser !== null) {
            if (existingUser.locked === true && user.locked !== true) {
                user.locked = true;
            }
            user.federatedOIDCProviderSubjectId = existingUser.federatedOIDCProviderSubjectId;
            user.domain = existingUser.domain;

            // Did the email change and if so, what parts of the email have changed?
            // 1    domains 
            // 2    just the name
            // 3    both
            // In case of change.
            // 1    verify the email does not already exist
            // 2    unset the verified email flag
            if (user.email !== existingUser.email) {
                const userByEmail: User | null = await identityDao.getUserBy("email", user.email);
                if (userByEmail) {
                    throw new GraphQLError("ERROR_ATTEMPTING_TO_CHANGE_EMAIL_FAILED");
                }
                else {
                    const domain: string = user.email.substring(
                        user.email.indexOf("@") + 1
                    )
                    user.domain = domain;
                    user.emailVerified = false;
                }
            }

            await identityDao.updateUser(user);

            // Only update the search index if anything has changed
            if (
                user.email !== existingUser.email ||
                user.firstName !== existingUser.firstName ||
                user.lastName !== existingUser.lastName ||
                user.enabled !== existingUser.enabled
            ) {
                await this.updateSearchIndexUserDocument(user);                
            }
            return user;
        }
        else {
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
    }

    public async createTOTP(userId: string): Promise<TotpResponse> {
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_NOT_FOUND");
        }
        let userMfaRel: UserMfaRel | null = await identityDao.getTOTP(userId);

        let totp: OTPAuth.TOTP | null = null;
        // TODO remove this if block.
        if(userMfaRel && userMfaRel.totpSecret){
            const decryptedSecret: string | null = await kms.decrypt(userMfaRel.totpSecret);
            if(!decryptedSecret){
                throw new GraphQLError("ERROR_DECRYPTING_SECRET");
            }
            else{
                userMfaRel.totpSecret = decryptedSecret;
                // Microsoft authentication only support SHA1 as a hashing algorithm (at the momemt)
                totp = new OTPAuth.TOTP({
                    issuer: MFA_ISSUER || "Open Trust",
                    label: user.email,
                    algorithm: TOTP_HASH_ALGORITHM_SHA1, 
                    digits: 6,
                    period: 30,
                    secret: decryptedSecret
                });
            }
        }
        else{
            const newSecret = new OTPAuth.Secret({size: 20});            
            const encryptedSecret = await kms.encrypt(newSecret.base32);
            if(!encryptedSecret){
                throw new GraphQLError("ERROR_UNABLE_TO_GENERATE_TOPT_SECRET");
            }

            // Save the data using the encrypted value, but
            // return the plain text value to the user to scan
            // or enter into their device.
            userMfaRel = {
                mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP,
                userId: userId,
                primaryMfa: true,
                fido2PublicKeyAlgorithm: null,
                fido2CredentialId: null,
                fido2KeySupportsCounters: null,
                fido2PublicKey: null,
                fido2Transports: null,
                totpHashAlgorithm: TOTP_HASH_ALGORITHM_SHA1,
                totpSecret: encryptedSecret
            }

            await identityDao.saveTOTP(userMfaRel);
            userMfaRel.totpSecret = newSecret.base32;

            // Microsoft authentication only support SHA1 as a hashing algorithm (at the momemt)
            totp = new OTPAuth.TOTP({
                issuer: MFA_ISSUER || "Open Trust",
                label: user.email,
                algorithm: TOTP_HASH_ALGORITHM_SHA1, 
                digits: 6,
                period: 30,
                secret: newSecret
            });
            
        }
        
        const uri = totp.toString();
        const response: TotpResponse = {
            uri: uri,
            userMFARel: userMfaRel
        }
        return response;
    }

    public async registerValidateTOTP(userId: string, registrationSessionToken: string, totpTokenValue: string, preAuthToken: string): Promise<UserRegistrationStateResponse> {
        const response: UserRegistrationStateResponse = {
            userRegistrationState: {
                email: "",
                expiresAtMs: 0,
                preAuthToken: undefined,
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
        await this.validateStep(arrUserRegistrationState, response, RegistrationState.ValidateTotp);
        if(response.userRegistrationState.registrationState === RegistrationState.Error){
            return Promise.resolve(response);
        }
        if(response.userRegistrationState.registrationState === RegistrationState.Expired){            
            return Promise.resolve(response);
        }

        // Validate the token itself, which should have been registered previously
        const validToken: boolean = await this.validateTOTP(userId, totpTokenValue);
        if(!validToken){
            response.userRegistrationState.registrationState = RegistrationState.Error;
            response.registrationError.errorCode = "ERROR_INVALID_TOTP_TOKEN_VALUE";
            return response;
        }

        arrUserRegistrationState[0].registrationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserRegistrationState(arrUserRegistrationState[0]);
        const nextRegistrationState = arrUserRegistrationState[1];
        response.userRegistrationState = nextRegistrationState;
        return Promise.resolve(response);
    }


    
    public async validateTOTP(userId: string, totpValue: string): Promise<boolean> {
        const userMfaRel: UserMfaRel | null = await identityDao.getTOTP(userId);
        if(!userMfaRel || !userMfaRel.totpSecret){
            throw new GraphQLError("ERROR_NO_TOTP_ASSIGNED_TO_USER");
        }

        const secret = await kms.decrypt(userMfaRel.totpSecret);
        if(!secret){
            throw new GraphQLError("ERROR_UNABLE_TO_DETERMINE_TOPT_SECRET");
        }
        // Microsoft authentication only support SHA1 as a hashing algorithm (at the momemt)
        const totp = new OTPAuth.TOTP({
            issuer: MFA_ISSUER || "Open Trust",
            label: userId,
            algorithm: TOTP_HASH_ALGORITHM_SHA1, 
            digits: 6,
            period: 30,
            secret: secret
        });

        let delta = totp.validate({
            token: totpValue,
            window: 1
        });

        if(delta === null){
            return false;
        }
        return true;
    }

    public async getUserMFARels(userId: string): Promise<Array<UserMfaRel>> {
        const arr: Array<UserMfaRel> = await identityDao.getUserMFARels(userId);

        // clear out any sensitive information before returning to the client.
        arr.forEach(
            (rel: UserMfaRel) => {
                rel.totpSecret = "";
                rel.fido2PublicKeyAlgorithm = 0;
                rel.fido2CredentialId = "";
                rel.fido2PublicKey = "";
                rel.fido2Transports = "";
                rel.fido2KeySupportsCounters = false;
            }
        );
        return arr;       
    }

    public async deleteTOTP(userId: string): Promise<void> {
        return identityDao.deleteTOTP(userId);
    }

    public async deleteFIDOKey(userId: string): Promise<void> {
        await identityDao.deleteFido2Count(userId);
        return identityDao.deleteFIDOKey(userId);
    }

    public async registerFIDO2Key(userId: string, fido2KeyRegistrationInput: Fido2KeyRegistrationInput): Promise<UserMfaRel> {
        
        // Validate the input
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        
        const existingChallenge: Fido2Challenge | null = await identityDao.getFIDO2Challenge(userId);
        if(!existingChallenge){
            throw new GraphQLError("ERROR_NO_EXISTING_CHALLENGE_FOR_USER");
        }
        if(existingChallenge.expiresAtMs < Date.now()){
            // Delete it and throw an error
            await identityDao.deleteFIDO2Challenge(userId);
            throw new GraphQLError("ERROR_CHALLENGE_HAS_EXPIRED");
        }

        let verification: VerifiedRegistrationResponse;
        try{
            verification = await verifyRegistrationResponse({
                response: {
                    id: fido2KeyRegistrationInput.id,
                    rawId: fido2KeyRegistrationInput.rawId,
                    response: {
                        attestationObject: fido2KeyRegistrationInput.response.attestationObject,
                        clientDataJSON: fido2KeyRegistrationInput.response.clientDataJSON,
                        authenticatorData: fido2KeyRegistrationInput.response.authenticatorData,
                        publicKey: fido2KeyRegistrationInput.response.publicKey,
                        publicKeyAlgorithm: fido2KeyRegistrationInput.response.publicKeyAlgorithm,
                        transports: fido2KeyRegistrationInput.response.transports as Array<AuthenticatorTransport>
                    },
                    clientExtensionResults: {},
                    type: "public-key"
                },
                expectedChallenge: existingChallenge.challenge,
                expectedOrigin: MFA_ORIGIN || "",
                expectedRPID: MFA_ID
            });
        }
        catch(error){
            // TODO 
            // Log the error for real
            console.log(error);            
            await identityDao.deleteFIDO2Challenge(userId);
            throw new GraphQLError("ERROR_VALIDATING_FIDO2_REGISTRATION");
        }
        const { verified, registrationInfo } = verification;
        if(!registrationInfo){
            throw new GraphQLError("ERROR_UNABLE_OBTAIN_REGISTRATION_INFO_FOR_THE_KEY");
        }

        const count: number = registrationInfo.credential.counter;
        // why this goofiness? because the key from the response is not correctly encoded. blah..
        const publicKeyUint8Array: Uint8Array = registrationInfo.credential.publicKey;
        const buffer = Buffer.from(publicKeyUint8Array);        
        const publicKeyAsString = buffer.toString("base64url");

        if(!verified){
            throw new GraphQLError("ERROR_FIDO2_REGISTRATION_IS_INVALID");
        }
        // fido2PublicKey: fido2KeyRegistrationInput.response.publicKey,
        await identityDao.deleteFIDO2Challenge(userId);
        const userMfaRel: UserMfaRel = {
            mfaType: MFA_AUTH_TYPE_FIDO2,
            primaryMfa: false,
            userId: user.userId,
            fido2CredentialId: fido2KeyRegistrationInput.id,
            fido2KeySupportsCounters: true,
            fido2PublicKey: publicKeyAsString,
            fido2PublicKeyAlgorithm: fido2KeyRegistrationInput.response.publicKeyAlgorithm,
            fido2Transports: fido2KeyRegistrationInput.response.transports.join(",")
        }

        await identityDao.saveFIDOKey(userMfaRel);        
        await identityDao.initFidoCount(userId, count);
        return Promise.resolve(userMfaRel);

    }

    public async createFido2RegistrationChallenge(userId: string): Promise<Fido2RegistrationChallengeResponse> {

        // does the user exist and are they not locked, not enabled, or marked for delete?
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        if(user.locked === true || user.enabled === false || user.markForDelete === true){
            throw new GraphQLError("ERROR_USER_IS_NOT_ELIGIBLE_FOR_MODIFICATION");
        }

        // If there is an existing challenge, then delete it and create a new one
        const existingChallenge = await identityDao.getFIDO2Challenge(userId);
        if(existingChallenge){
            await identityDao.deleteFIDO2Challenge(userId);
        }

        const challenge: string = generateRandomToken(20, "base64url");

        // Allow up to 15 minutes for the process to complete
        const fido2Challenge: Fido2Challenge = {
            challenge: challenge,
            expiresAtMs: Date.now() + (15 * 60 * 1000),
            issuedAtMs: Date.now(),
            userId: user.userId
        }
        await identityDao.saveFIDO2Challenge(fido2Challenge);

        const fido2ChallengeResponse: Fido2RegistrationChallengeResponse = {
            email: user.email,
            fido2Challenge: fido2Challenge,
            rpId: MFA_ID || "opentrust",
            rpName: MFA_ISSUER || "Open Trust",
            userName: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`
        }

        return Promise.resolve(fido2ChallengeResponse);
    }

    public async createFido2AuthenticationChallenge(userId: string): Promise<Fido2AuthenticationChallengeResponse> {
        // does the user exist and are they not locked, not enabled, or marked for delete?
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        if(user.locked === true || user.enabled === false || user.markForDelete === true){
            throw new GraphQLError("ERROR_USER_IS_NOT_ELIGIBLE_FOR_MODIFICATION");
        }

        // Does the user have a security key configured?
        const userMfaRel: UserMfaRel | null = await identityDao.getFIDOKey(userId);
        if(!userMfaRel){
            throw new GraphQLError("ERROR_NO_SECURITY_KEY_CONFIGURED_FOR_USER");
        }

        // If there is an existing challenge, then delete it and create a new one
        const existingChallenge = await identityDao.getFIDO2Challenge(userId);
        if(existingChallenge){
            await identityDao.deleteFIDO2Challenge(userId);
        }

        const challenge: string = generateRandomToken(20, "base64url");
        // Allow up to 15 minutes for the process to complete
        const fido2Challenge: Fido2Challenge = {
            challenge: challenge,
            expiresAtMs: Date.now() + (15 * 60 * 1000),
            issuedAtMs: Date.now(),
            userId: user.userId
        };
        await identityDao.saveFIDO2Challenge(fido2Challenge);

        const authnResponse: Fido2AuthenticationChallengeResponse = {
            fido2AuthenticationChallengePasskeys: [{
                id: userMfaRel.fido2CredentialId || "",
                transports: userMfaRel.fido2Transports ? userMfaRel.fido2Transports.split(",") : []
            }],
            rpId: MFA_ID || "",
            fido2Challenge: fido2Challenge
        };

        return Promise.resolve(authnResponse);
    }

    public async authenticateFIDO2Key(userId: string, fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput): Promise<boolean> {

        const existingChallenge: Fido2Challenge | null = await identityDao.getFIDO2Challenge(userId);
        if(!existingChallenge){
            throw new GraphQLError("ERROR_NO_EXISTING_CHALLENGE_FOR_USER");
        }
        if(existingChallenge.expiresAtMs < Date.now()){
            // Delete it and throw an error
            await identityDao.deleteFIDO2Challenge(userId);
            throw new GraphQLError("ERROR_CHALLENGE_HAS_EXPIRED");
        }

        const userMfaRel: UserMfaRel | null = await identityDao.getFIDOKey(userId);
        if(!userMfaRel){
            throw new GraphQLError("ERROR_NO_KEY_CONFIGURED_FOR_USER");
        }
        if(!userMfaRel.fido2CredentialId){
            throw new GraphQLError("ERROR_INVALID_MFA_TYPE");
        }
        if(userMfaRel.fido2CredentialId !== fido2KeyAuthenticationInput.id){
            throw new GraphQLError("ERROR_INVALID_CREDENTIAL_ID");
        }

        const count: number | null = await identityDao.getFido2Count(userId);
        if(count === null){
            throw new GraphQLError("ERROR_CANNOT_OBTAIN_COUNTER_VALUE");
        }
       
        const publicKeyBuffer: Buffer = Buffer.from(userMfaRel.fido2PublicKey || "", "base64url");
        const publicKeyUint8Array = Uint8Array.from(publicKeyBuffer);
        
        let verification: VerifiedAuthenticationResponse;
        try{
            verification = await verifyAuthenticationResponse({
                response: {
                    clientExtensionResults: {},
                    id: fido2KeyAuthenticationInput.id,
                    rawId: fido2KeyAuthenticationInput.rawId,
                    type: "public-key",
                    authenticatorAttachment: fido2KeyAuthenticationInput.authenticationAttachment as AuthenticatorAttachment,
                    response: {
                        authenticatorData: fido2KeyAuthenticationInput.response.authenticatorData,
                        clientDataJSON: fido2KeyAuthenticationInput.response.clientDataJSON,
                        signature: fido2KeyAuthenticationInput.response.signature
                    },                

                },
                expectedChallenge: existingChallenge.challenge,
                expectedOrigin: MFA_ORIGIN || "",
                expectedRPID: MFA_ID || "",
                credential: {
                    counter: count,
                    id: userMfaRel.fido2CredentialId || "",
                    publicKey: publicKeyUint8Array,
                    transports: userMfaRel.fido2Transports?.split(",") as Array<AuthenticatorTransport>
                }
            });

            const { verified, authenticationInfo } = verification;
            if(!verified || !authenticationInfo){
                await identityDao.deleteFIDO2Challenge(userId);
                throw new GraphQLError("ERROR_UNABLE_TO_VERIFY_AUTHENTICATOR")
            }
            const newCount = authenticationInfo.newCounter;            
            await identityDao.deleteFIDO2Challenge(userId);
            await identityDao.updateFido2Count(userId, newCount);
            return true;

        }
        catch(error){
            // TODO
            // log error
            console.log(error);
            await identityDao.deleteFIDO2Challenge(userId);
            throw new GraphQLError("ERROR_CANNOT_VALIDATE_AUTHENTICATION_KEY");
        }

        
    }

    public async getUserSessions(userId: string): Promise<Array<UserSession>> {
        const arr: Array<RefreshData> = await authDao.getRefreshDataByUserId(userId);

        const retArr: Array<UserSession> = [];
        for(let i = 0; i < arr.length; i++){
            const r: RefreshData = arr[i];
            const tenant: Tenant | null = await tenantDao.getTenantById(r.tenantId);
            const client: Client | null = await clientDao.getClientById(r.clientId);
            const userSession: UserSession = {
                clientId: r.clientId,
                clientName: client ? client.clientName : "Unknown",
                tenantId: r.tenantId,
                tenantName: tenant ? tenant.tenantName : "Unknown",
                userId: userId
            }
            retArr.push(userSession);
        }
        return retArr;
    }

    public async deleteUserSession(userId: string, clientId: string, tenantId: string): Promise<void>{
        await authDao.deleteRefreshData(userId, tenantId, clientId);
        return Promise.resolve();
    }

    protected getDomainFromEmail(email: string): string {
        const domain: string = email.substring(
            email.indexOf("@") + 1
        );
        return domain;
    }

    /**
     * Checks
     * 1.   Does the tenant exist
     * 2.   Is the tenant enabled
     * 3.   Does the tenant allow user self registration if this is a registration flow?
     * 4.   Does a user with the given email already exist?
     * 5.   Is the password valid
     * 6.   Is the domain allowed by the tenant or are there resitricted domains for this tenant?
     * @param userCreateInput 
     * @param tenantId 
     * @param isRegistration 
     * @returns 
     */
    protected async _createUser(userCreateInput: UserCreateInput, tenantId: string, isRegistration: boolean): Promise<{user: User, tenant: Tenant, tenantPasswordConfig: TenantPasswordConfig}>  {

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError("ERROR_TENANT_IS_NOT_ENABLED");
        }
        if(isRegistration && tenant.allowUserSelfRegistration === false){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_ALLOW_USER_SELF_REGISTRATION");
        }

        const existingUser: User | null = await identityDao.getUserBy("email", userCreateInput.email);
        if(existingUser){
            throw new GraphQLError("ERROR_USER_WITH_EMAIL_ALREADY_EXISTS");
        }

        const tenantPasswordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;
        const isValidPassword: boolean = await this.checkPassword(userCreateInput.password, tenantPasswordConfig);
        if(!isValidPassword){
            throw new GraphQLError("INVALID_PASSWORD_EITHER_PROHIBITED_OR_INVALID_FORMAT");
        }

        const domain: string = this.getDomainFromEmail(userCreateInput.email); 

        const arrRestrictedDomainRel: Array<TenantRestrictedAuthenticationDomainRel> = await tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
        if(arrRestrictedDomainRel.length > 0){
            const restrictedDomainRel: TenantRestrictedAuthenticationDomainRel | undefined = arrRestrictedDomainRel.find(
                (rel: TenantRestrictedAuthenticationDomainRel) => rel.domain === domain
            );
            if(restrictedDomainRel === undefined){
                throw new GraphQLError("ERROR_TENANT_HAS_RESTRICTED_EMAIL_DOMAINS")
            }
        }       


        let userEnabled = true;
        let emailVerified = true;
        if(isRegistration && tenant.verifyEmailOnSelfRegistration){
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
        const userCredential: UserCredential = this.generateUserCredential(user.userId, userCreateInput.password, tenantPasswordConfig.passwordHashingAlgorithm);
        await identityDao.addUserCredential(userCredential);

        if(isRegistration && tenant.verifyEmailOnSelfRegistration){
            const token: string = generateRandomToken(8, "hex").toUpperCase();
            await identityDao.saveEmailConfirmationToken(user.userId, token);
            // TODO
            // Send email to the user with the token value.
        }
        await this.updateObjectSearchIndex(tenant, user, "PRIMARY");
        await this.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, user, USER_TENANT_REL_TYPE_PRIMARY);

        return Promise.resolve({user: user, tenant: tenant, tenantPasswordConfig: tenantPasswordConfig});
    }

    protected generateUserCredential(userId: string, password: string, hashAlgorithm: string): UserCredential {
        // For the Bcrypt hashing algorithm, the salt value is included in the final salted password
        // so we can just leave it as the empty string.
        let salt = "";
        let hashedPassword = "";

        if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS){
            hashedPassword = bcryptHashPassword(password, 10);
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS){
            hashedPassword = bcryptHashPassword(password, 11);
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS){
            hashedPassword = bcryptHashPassword(password, 12);
        }                   
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = sha256HashPassword(password, salt, PASSWORD_HASH_ITERATION_64K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = sha256HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_256K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_32K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_64K);  
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);
        }

        return {
            dateCreated: new Date().toISOString(),
            hashedPassword: hashedPassword,
            salt: salt,
            hashingAlgorithm: hashAlgorithm,
            userId: userId
        }
    }


    public async getUserTenantRels(userId: string): Promise<Array<UserTenantRelView>> {
        const rels: Array<UserTenantRel> = await identityDao.getUserTenantRelsByUserId(userId);
        const retVal: Array<UserTenantRelView> = [];
        for(let i = 0; i < rels.length; i++){
            const tenant: Tenant | null = await tenantDao.getTenantById(rels[i].tenantId);
            const tenantName = tenant ? tenant.tenantName : "";
            retVal.push({
                userId: userId,
                tenantId: rels[i].tenantId,
                relType: rels[i].relType,
                tenantName: tenantName
            });
        }
        return retVal;
    }

    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        let userTenantRel: UserTenantRel = {
            enabled: false,
            relType: relType,
            tenantId: tenantId,
            userId: userId
        };
        if(! ( relType === USER_TENANT_REL_TYPE_PRIMARY || relType === USER_TENANT_REL_TYPE_GUEST) ){
            throw new GraphQLError("ERROR_INVALID_USER_TENANT_RELATIONSHIP_TYPE");
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_TENANT");
        }
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_USER");
        }

        const rels: Array<UserTenantRel> = await identityDao.getUserTenantRelsByUserId(userId);
        // If there is not an existing relationship, then it MUST be a PRIMARY relationship.
        // If not, throw an error.
        if(rels.length === 0){
            if(relType !== USER_TENANT_REL_TYPE_PRIMARY){
                throw new GraphQLError("ERROR_MUST_BE_PRIMARY_TENANT");
            }
            else{
                userTenantRel = await identityDao.assignUserToTenant(tenantId, userId, relType);
                // Both the owning and parent tenant ids are the same in this case
                await this.updateRelSearchIndex(tenantId, tenantId, user, relType);
            }
        }
        // Otherwise, there already exists one or more relationships. 
        else {
            const primaryRel: UserTenantRel | undefined  = rels.find(
                (rel: UserTenantRel) => rel.relType === USER_TENANT_REL_TYPE_PRIMARY
            );
            // There should always be a primary rel            
            if(!primaryRel){
                throw new GraphQLError("ERROR_NO_PRIMARY_RELATIONSHIP_EXISTS_FOR_THE_USER_AND_TENANT");
            }

            // If there are no existing rels that match the incoming data, then create a 
            // new one, but ONLY if the relationship type is GUEST.
            const existingTenantRel: UserTenantRel | undefined = rels.find(
                (rel: UserTenantRel) => rel.tenantId === tenantId && rel.userId === userId
            )            
            if(!existingTenantRel){
                if(relType === USER_TENANT_REL_TYPE_PRIMARY){
                    throw new GraphQLError("ERROR_MUST_BE_GUEST_TENANT");
                }
                else{
                    userTenantRel = await identityDao.assignUserToTenant(tenantId, userId, relType);
                    // The primary rel remains as the owning tenant id, which the incoming tenant id 
                    // is the parent id
                    await this.updateRelSearchIndex(primaryRel.tenantId, tenantId, user, relType);
                }
            }
            
            // Otherwise, we may have to update more than one record if the incoming data
            // is set to a relationship type of PRIMARY. In this case we have to remove
            // the PRIMARY relationship from the existing data and set it to GUEST and we
            // have to update the incoming as PRIMARY
            else{
                if(existingTenantRel.relType === USER_TENANT_REL_TYPE_PRIMARY && relType === USER_TENANT_REL_TYPE_GUEST){
                    throw new GraphQLError("ERROR_CANNOT_ASSIGN_TO_A_GUEST_RELATIONSHIP");
                }
                else if(existingTenantRel.relType === USER_TENANT_REL_TYPE_GUEST && relType === USER_TENANT_REL_TYPE_PRIMARY){
                    // Assign the incoming as primary
                    userTenantRel = await identityDao.updateUserTenantRel(tenantId, userId, relType);
                    // The incoming tenant becomes the new owning tenant as well as the parent.
                    await this.updateRelSearchIndex(tenantId, tenantId, user, relType);
                    // Then update the existing primary as guest
                    await identityDao.updateUserTenantRel(primaryRel.tenantId, primaryRel.userId, USER_TENANT_REL_TYPE_GUEST);
                    // The incoming tenant is the owning tenant, which the existing primary becomes just the parent
                    await this.updateRelSearchIndex(tenantId, primaryRel.tenantId, user, relType);
                }
            }
        }
        return userTenantRel;        
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        // Cannot remove a primary relationship
        const rel: UserTenantRel | null = await identityDao.getUserTenantRel(tenantId, userId);
        if(rel){
            if(rel.relType === USER_TENANT_REL_TYPE_PRIMARY){
                throw new GraphQLError("ERROR_CANNOT_CANNOT_REMOVE_A_PRIMARY_RELATIONSHIP");
            }
            else {
                await identityDao.removeUserFromTenant(tenantId, userId);
            }
        }        
        return Promise.resolve();
    }

    /**
     * Error conditions:
     * 1.   No domains for management of a tenant
     * 2.   No user, no federated IdP, and no tenants that allow self-registration
     * 3.   No user, there IS a federated IdP, but the IdP is not attached to 
     *      any of the tenants that the domain can manage
     * 4.   User exists, there is NO IdP for the user, and none of the tenants allows
     *      username/password authentication
     * 5.   User exists, there is an IdP for the user, but the IdP is not attached
     *      to the tenant

     *      
     * 
     * @param email 
     * @param tenantId 
     * @returns 
     */

    public async authenticateUserNameInput(email: string, tenantId?: string, preAuthToken?: string): Promise<UserAuthenticationStateResponse> {
        const retVal: UserAuthenticationStateResponse = {
            userAuthenticationState: {
                authenticationSessionToken: "",
                authenticationState: AuthenticationState.Error,
                authenticationStateOrder: 0,
                authenticationStateStatus: "",
                expiresAtMs: 0,
                preAuthToken: undefined,
                tenantId: "",
                userId: ""                 
            },
            authenticationError: {
                errorCode: "",
                errorMessage: ""
            }
            
        }

        console.log("checkpoint 1");
        const domain: string = this.getDomainFromEmail(email);
        const managementDomains: Array<TenantManagementDomainRel> = await tenantDao.getDomainTenantManagementRels(tenantId, domain);
        
        // 1.   Error condition #1: No domains for management of a tenant
        if(!managementDomains || managementDomains.length === 0){
            retVal.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoManagementDomain;
            return retVal;
        }
        console.log("checkpoint 2");
        
        // Obtain the basic information for deciding on error conditions or the next steps
        const user: User | null = await identityDao.getUserBy("email", email);
        const provider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        let providerTenantRels: Array<FederatedOidcProviderTenantRel> = [];
        if(provider !== null){
            providerTenantRels = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(tenantId, provider.federatedOIDCProviderId);            
        }

        console.log("checkpoint 3");
        const tenants: Array<Tenant> = await tenantDao.getTenants(managementDomains.map( (d: TenantManagementDomainRel) => d.tenantId));
        const tenantsThatAllowSelfRegistration = tenants.filter(
            (t: Tenant) => t.allowUserSelfRegistration === true
        );
        const tenantsThatAllowPasswordLogin: Array<Tenant> = tenants.filter(
            (t: Tenant) => t.federatedAuthenticationConstraint !== FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE
        );

        console.log("checkpoint 4");
        // Find all of the providers attached to any of the tenants
        const tenantsThatAreAttachedToProviders = tenants.filter(
            (t: Tenant) => {
                const rel = providerTenantRels.find(
                    (f: FederatedOidcProviderTenantRel) => f.tenantId === t.tenantId
                )
                return rel !== undefined;
            }
        );

        // 2.   Error condition #2: No user, no federated IdP, and no tenants that allow self-registration        
        if(user === null && provider === null && tenantsThatAllowSelfRegistration.length === 0){
            retVal.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingUserAndNoTenantSelfRegistration;
            return retVal;
        }
        console.log("checkpoint 5");

        // 3.   Error condition #3: No user, there IS a federated IdP, but the IdP is not attached
        //      to any of the tenants that the domain can manage
        if(user === null && provider !== null && tenantsThatAreAttachedToProviders.length === 0){            
            retVal.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return retVal;
        }
        console.log("checkpoint 6");

        //  4.   Error condition # 3: User exists, there is NO IdP for the user, and none of the tenants allows
        //       username/password authentication
        if(user !== null && provider === null && tenantsThatAllowPasswordLogin.length === 0){
            retVal.authenticationError.errorCode = AuthenticationErrorTypes.ErrorExclusiveTenantAndNoFederatedOidcProvider;
            return retVal;
        }
        console.log("checkpoint 7");

        //  5.   Error condition #5: User exists, there is an IdP for the user, but the IdP is not attached
        //       to any tenant
        if(user !== null && provider !== null && tenantsThatAreAttachedToProviders.length === 0){            
            retVal.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return retVal;
        }
        
        console.log("checkpoint 8");
        // SUCCESS SCENARIOS 
        // 1.   The user can select the tenant and register. In this scenario, there is no
        //      need to create database entries for the user authentication state. Instead
        //      there will be entries created for the user registration state later.    
        if(user === null && provider === null && tenantsThatAllowSelfRegistration.length > 0){
            retVal.userAuthenticationState.authenticationState = tenantsThatAllowSelfRegistration.length === 1 ? AuthenticationState.Register : AuthenticationState.SelectTenant;            
            retVal.availableTenants = [];
            tenantsThatAllowSelfRegistration.forEach(
                (t: Tenant) => retVal.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                ));
            return retVal;
        }
        console.log("checkpoint 9");
                
        // 2.   The user can select the tenant by which they want to do SSO and thereby "autoregister"
        //      or just "autoregister" if there is exactly one tenant
        if(user === null && provider !== null && tenantsThatAreAttachedToProviders.length > 0){            
            // Otherwise, set the tenant information and then decide what the next steps are.
            console.log("checkpoint 9.1");
            retVal.availableTenants = [];
                tenantsThatAreAttachedToProviders.forEach(
                (t: Tenant) => retVal.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                ));
                console.log("checkpoint 9.2");
            if(tenantsThatAreAttachedToProviders.length === 1){
                retVal.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
                console.log("checkpoint 9.22");
                const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email, null, provider, tenantsThatAreAttachedToProviders[0].tenantId);
                console.log("checkpoint 9.23");
                if(hasError){
                    throw new GraphQLError(errorMessage);
                }
                console.log("checkpoint 9.24");            
                retVal.uri = authorizationEndpoint;
                return retVal;
            }
            console.log("checkpoint 9.3");
            if(tenantsThatAreAttachedToProviders.length > 1){
                retVal.userAuthenticationState.authenticationState = AuthenticationState.SelectTenant;                
            }
            console.log("checkpoint 9.4");
            return retVal;            
        }
        console.log("checkpoint 10");

        // 3.   The user can select which tenant to log into with username/password (plus
        //      one or more MFA types). In this case, if the tenant list contains exactly 1
        //      tenant, then we need to create the authentication state values in the database
        //      to track the authentication process.
        if(user !== null && provider === null && tenantsThatAllowPasswordLogin.length > 0){
            retVal.availableTenants = [];
            tenantsThatAllowPasswordLogin.forEach(
                (t: Tenant) => retVal.availableTenants?.push(
                    {
                        tenantId: t.tenantId, tenantName: t.tenantName
                    }
                )
            )
            retVal.userAuthenticationState.authenticationState = tenantsThatAllowPasswordLogin.length === 1 ? AuthenticationState.EnterPassword : AuthenticationState.SelectTenant;

            return retVal;
        }        

        console.log("checkpoint 11");
        // 4.   The user can select which tenant they want to do SSO with, if there is more than on,
        //      or just automatically be redirected to the federated oidc providers authentication endpoint.
        if(user !== null && provider !== null && tenantsThatAreAttachedToProviders.length > 0){            
            retVal.availableTenants = [];
                tenantsThatAreAttachedToProviders.forEach(
                (t: Tenant) => retVal.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                ));
            if(tenantsThatAreAttachedToProviders.length === 1){
                retVal.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
                const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(user.email, user.userId, provider, tenantsThatAreAttachedToProviders[0].tenantId);
                if(hasError){
                    throw new GraphQLError(errorMessage);
                }                              
                retVal.uri = authorizationEndpoint;
                return retVal;
            }
            if(tenantsThatAreAttachedToProviders.length > 1){
                retVal.userAuthenticationState.authenticationState = AuthenticationState.SelectTenant;                
            }
            return retVal;
        }
        
        retVal.authenticationError.errorCode = AuthenticationErrorTypes.ErrorConditionsForAuthenticationNotMet;
        return retVal;
        
    }

    protected async createFederatedOIDCRequestProperties(email: string, userId: string | null, provider: FederatedOidcProvider, tenantId: string): Promise<{hasError: boolean, errorMessage: string, authorizationEndpoint: string}> {

        const federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel = {
            federatedOIDCAuthorizationRelType: FederatedOidcAuthorizationRelType.AuthorizationRelTypePortalAuth,
            email: email,
            userId: userId,
            expiresAtMs: 0,
            federatedOIDCProviderId: "",
            initRedirectUri: "",
            initResponseMode: "",
            initClientId: null,
            initResponseType: "",
            initScope: "",
            initState: "",
            initTenantId: "",
            state: ""
        }
        const retVal = {errorMessage: "", hasError: false, authorizationEndpoint: ""};
        
        const wellKnownConfig: WellknownConfig | null = await oidcServiceUtils.getWellKnownConfig(
            provider.federatedOIDCProviderWellKnownUri
            // "https://api.sigmaaldrich.com/auth/.well-known/openid-configuration"
        );
        

        if(wellKnownConfig === null){
            retVal.errorMessage = "ERROR_UNABLE_TO_DETERMINE_AUTHORIZATION_PARAMETERS_FROM_FEDERATED_OIDC_PROVIDER";
            retVal.hasError = true;
            return retVal;
        }

        // If we are supposed to use PKCE, then we need to generate the code challenge and save it too.
        const {verifier, challenge} = provider.usePkce ? generateCodeVerifierAndChallenge() : {verifier: null, challenge: null}; 
        federatedOIDCAuthorizationRel.state = generateRandomToken(32, "hex");
        federatedOIDCAuthorizationRel.codeVerifier = verifier;
        federatedOIDCAuthorizationRel.expiresAtMs = Date.now() + 5 /* minutes */ * 60 /* seconds/min  */ * 1000 /* ms/sec */;
        federatedOIDCAuthorizationRel.federatedOIDCProviderId = provider.federatedOIDCProviderId;        
        federatedOIDCAuthorizationRel.initRedirectUri = "";
        federatedOIDCAuthorizationRel.initResponseMode = "";
        federatedOIDCAuthorizationRel.initScope = provider.scopes.join(" ");
        federatedOIDCAuthorizationRel.initState = federatedOIDCAuthorizationRel.state;
        federatedOIDCAuthorizationRel.initTenantId = tenantId;
        federatedOIDCAuthorizationRel.initCodeChallenge = "";
        federatedOIDCAuthorizationRel.initCodeChallengeMethod = "S256";
        federatedOIDCAuthorizationRel.initResponseType = "";
        federatedOIDCAuthorizationRel.returnUri = "";	
        
        await authDao.saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel);

        const scopeParameter = provider.scopes.join("%20");

        const codeChallengeQueryParams = provider.usePkce ? `&code_challenge=${challenge}&code_challenge_method=S256` : "";
        const authnUri = `${wellKnownConfig.authorization_endpoint}?client_id=${provider.federatedOIDCProviderClientId}&state=${federatedOIDCAuthorizationRel.state}&response_type=code&response_mode=query&redirect_uri=${AUTH_DOMAIN}/api/federated-auth/return&scope=${scopeParameter}${codeChallengeQueryParams}`;
        retVal.authorizationEndpoint = authnUri;

        return retVal;
    }

    protected async updateSearchIndexUserDocument(user: User): Promise<void> {
        const getResponse: Get_Response = await searchClient.get({
            id: user.userId,
            index: SEARCH_INDEX_OBJECT_SEARCH
        });
        
        if (getResponse.body) {
            const document: ObjectSearchResultItem = getResponse.body._source as ObjectSearchResultItem;
            document.name = user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            document.email = user.email;
            document.enabled = user.enabled;
            await searchClient.index({
                id: user.userId,
                index: SEARCH_INDEX_OBJECT_SEARCH,
                body: document
            })
        }
        // TODO: Update the rel_index as well, but do NOT wait on the results since
        // there could be 1000s of records to modify.
    }

    protected async updateObjectSearchIndex(tenant: Tenant, user: User, relType: string): Promise<void> {
        let owningTenantId: string = tenant.tenantId;
        const document: ObjectSearchResultItem = {
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            description: "",
            objectid: user.userId,
            objecttype: SearchResultType.User,
            owningtenantid: owningTenantId,
            email: user.email,
            enabled: user.enabled,
            owningclientid: "",
            subtype: "",
            subtypekey: ""
        }
        
        await searchClient.index({
            id: user.userId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });
    }

    protected async updateRelSearchIndex(owningTenantId: string, parentTenantId: string, user: User, relType: string): Promise<void> {
        
        const relDocument: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: owningTenantId,
            parentid: parentTenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${parentTenantId}::${user.userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relDocument
        })
    }

    public async generateAuthorizationCode(preAuthToken: string): Promise<AuthorizationReturnUri | null> {
        
        console.log("principal: " + this.oidcContext.oidcPrincipal);

        if(this.oidcContext.oidcPrincipal === null || this.oidcContext.oidcPrincipal.sub === ""){
            throw new GraphQLError("ERROR_INVALID_PRINCIPAL")
        }
        const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);
        if(preAuthenticationState === null){
            throw new GraphQLError("ERROR_INVALID_PRE_AUTHENTICATION_TOKEN")
        }
        await authDao.deletePreAuthenticationState(preAuthToken);
        if(preAuthenticationState.expiresAtMs < Date.now()){
            throw new GraphQLError("ERROR_PRE_AUTHENTICATION_TOKEN_IS_EXPIRED");
        }

        const authorizationCodeData: AuthorizationCodeData = {
            clientId: preAuthenticationState.clientId,
            code: generateRandomToken(32, "hex"),
            expiresAtMs: Date.now() + (30 * 60 * 1000),
            redirectUri: preAuthenticationState.redirectUri,
            scope: preAuthenticationState.scope,
            tenantId: preAuthenticationState.tenantId,
            userId: this.oidcContext.oidcPrincipal.sub,
            codeChallenge: preAuthenticationState.codeChallenge,
            codeChallengeMethod: preAuthenticationState.codeChallengeMethod            
        }
        await authDao.saveAuthorizationCodeData(authorizationCodeData);

        const uri = preAuthenticationState.state ?
            `${preAuthenticationState.redirectUri}?code=${authorizationCodeData.code}&state=${preAuthenticationState.state}` :
            `${preAuthenticationState.redirectUri}?code=${authorizationCodeData.code}`;

        const response: AuthorizationReturnUri = {
            uri: uri,
            code: authorizationCodeData.code,
            state: preAuthenticationState.state
        }
        return response;
    }

    protected async deleteRegisteredUser(tenantId: string, userId: string): Promise<void> {
        await identityDao.deleteFIDO2Challenge(userId);
        await identityDao.deleteFido2Count(userId);
        await identityDao.deleteFIDOKey(userId);
        await identityDao.deleteTOTP(userId);
        await identityDao.removeUserFromTenant(tenantId, userId);
        await identityDao.deleteUserCredential(userId);
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

export default IdentityService;