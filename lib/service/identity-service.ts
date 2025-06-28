import { OIDCContext } from "@/graphql/graphql-context";
import * as OTPAuth from "otpauth";
import IdentityDao from "../dao/identity-dao";
import { Client, Fido2AuthenticationChallengeResponse, Fido2Challenge, Fido2RegistrationChallengeResponse, Fido2KeyRegistrationInput, ObjectSearchResultItem, RefreshData, RelSearchResultItem, SearchResultType, Tenant, TenantPasswordConfig, TotpResponse, User, UserCredential, UserMfaRel, UserSession, UserTenantRel, UserTenantRelView, Fido2KeyAuthenticationInput, FederatedOidcProvider, FederatedOidcAuthorizationRel, FederatedOidcAuthorizationRelType, AuthorizationCodeData, PreAuthenticationState, AuthorizationReturnUri, UserRegistrationState, RegistrationState, AuthenticationState, UserAuthenticationState, PortalUserProfile, UserScopeRel, Scope, AuthorizationGroup } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { DEFAULT_PORTAL_AUTH_TOKEN_TTL_HOURS, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, NAME_ORDER_WESTERN, PASSWORD_HASH_ITERATION_128K, PASSWORD_HASH_ITERATION_256K, PASSWORD_HASH_ITERATION_32K, PASSWORD_HASH_ITERATION_64K, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, SESSION_TOKEN_TYPE_AUTHENTICATION, SESSION_TOKEN_TYPE_REGISTRATION, TOTP_HASH_ALGORITHM_SHA1, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import { sha256HashPassword, pbkdf2HashPassword, bcryptHashPassword, generateSalt, scryptHashPassword, generateRandomToken, generateCodeVerifierAndChallenge, bcryptValidatePassword } from "@/utils/dao-utils";
import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import { Get_Response } from "@opensearch-project/opensearch/api/index.js";
import Kms from "../kms/kms";
import AuthDao from "../dao/auth-dao";
import ClientDao from "../dao/client-dao";
import { VerifiedRegistrationResponse, verifyRegistrationResponse, verifyAuthenticationResponse, VerifiedAuthenticationResponse } from '@simplewebauthn/server';
import { validatePasswordFormat } from "@/utils/password-utils";
import OIDCServiceUtils from "./oidc-service-utils";
import { WellknownConfig } from "../models/wellknown-config";


const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient: OpenSearchClient = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

const {
    MFA_ISSUER,
    MFA_ORIGIN,
    MFA_ID,
    AUTH_DOMAIN,
    PORTAL_AUTH_TOKEN_TTL_HOURS
} = process.env;


const PORTAL_AUTH_TOKEN_TTL_SECONDS = PORTAL_AUTH_TOKEN_TTL_HOURS ? 
        parseInt(PORTAL_AUTH_TOKEN_TTL_HOURS) * 60 /* min/hr */ * 60 /* sec/min */ :
        DEFAULT_PORTAL_AUTH_TOKEN_TTL_HOURS * 60 * 60;

class IdentityService {

    
    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    

    // ##########################################################################
    // 
    //                IDENTITY MANAGEMENT METHODS
    //
    // ##########################################################################     

    public async getUserById(userId: string): Promise<User | null> {
        return identityDao.getUserBy("id", userId);
    }

    
    public async updateUser(user: User): Promise<User> {

        const existingUser: User | null = await identityDao.getUserBy("id", user.userId);
        if (existingUser !== null) {
            if(existingUser.markForDelete === true){
                throw new GraphQLError("ERROR_USER_IS_MARKED_FOR_DELETE_AND_CANNOT_BE_UPDATED");
            }

            // If this user has a domain that is managed via a federated OIDC provider,
            // then none of the user's properties can be updated because they come from
            // the federaed OIDC provider. The only changes allowed are to enable/disable
            // the user.
            const userHasFederatedOIDCProvider = user.federatedOIDCProviderSubjectId !== null && user.federatedOIDCProviderSubjectId !== "" ? true : false;
            if(userHasFederatedOIDCProvider && (
                    user.email !== existingUser.email ||
                    user.firstName !== existingUser.firstName ||
                    user.lastName !== existingUser.lastName ||
                    user.middleName !== existingUser.middleName ||
                    user.phoneNumber !== existingUser.phoneNumber
                )
            ){
                throw new GraphQLError("ERROR_PROFILE_IS_CONTROLLED_BY_EXTERNAL_OIDC_PROVIDER");
            }
            

            // Unlocking the user is done via a separate process, which may require
            // additional auditing.
            //
            // Did the email change and if so, what parts of the email have changed?
            // 1    domains 
            // 2    just the name
            // 3    both
            // In case of change.
            // 1    verify the email does not already exist
            // 2    unset the verified email flag
            // 3    send an email to verify the new address
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

    // ##########################################################################
    // 
    //                IDENTITY UTILITY METHODS
    //
    // ##########################################################################   
    
    public async checkPassword(password: string, passwordConfig: TenantPasswordConfig): Promise<boolean> {        

        // Need to check to see if the password is diallowed because is has been
        // previously found to be easily cracked, as in the top 100K or top 1M cracked passwords.
        const passwordProhibited: boolean = await identityDao.passwordProhibited(password);
        if(passwordProhibited){
            return Promise.resolve(false);
        }
        const passwordFormatIsValid: boolean = validatePasswordFormat(password, passwordConfig).result;
        return Promise.resolve(passwordFormatIsValid);
    }

    
    public validateUserCredentials(userCredential: UserCredential, password: string): boolean {
        // Note that the bcrypt hashing algorithm CAN automatically generate a random salt
        // and save both the salt value and the iteration value as part of the hashed password,
        // so we do NOT need to pass both those pieces of information to the validation
        // function.
        let valid: boolean = false;
        if(
            userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS ||
            userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS ||
            userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS
        ){
            valid = bcryptValidatePassword(password, userCredential.hashedPassword)
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS){
            const hashedPassword = sha256HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_64K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
            const hashedPassword = sha256HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_128K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){
            const hashedPassword = pbkdf2HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_128K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){
            const hashedPassword = pbkdf2HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_256K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS){
            const hashedPassword = scryptHashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_32K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS){
            const hashedPassword = scryptHashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_64K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS){
            const hashedPassword = scryptHashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_128K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        return valid;
    }    

    /**
     * 
     * @param userId 
     * @param password 
     * @param hashAlgorithm 
     * @returns 
     */
    public generateUserCredential(userId: string, password: string, hashAlgorithm: string): UserCredential {
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
    
    protected async getSortedAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        const arrUserAuthenticationState: Array<UserAuthenticationState> = await identityDao.getUserAuthenticationStates(authenticationSessionToken);
        arrUserAuthenticationState.sort(
            (a: UserAuthenticationState, b: UserAuthenticationState) => a.authenticationStateOrder - b.authenticationStateOrder
        );
        return arrUserAuthenticationState;
    }

    public async createTOTP(userId: string): Promise<TotpResponse> {
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_NOT_FOUND");
        }
        let userMfaRel: UserMfaRel | null = await identityDao.getTOTP(userId);

        let totp: OTPAuth.TOTP | null = null;        
        if(userMfaRel){
            throw new GraphQLError("ERROR_TOTP_ALREADY_CONFIGURED_FOR_THE_USER");            
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
        // why this code here? because the key from the response is not correctly encoded.
        const publicKeyUint8Array: Uint8Array = registrationInfo.credential.publicKey;
        const buffer = Buffer.from(publicKeyUint8Array);        
        const publicKeyAsString = buffer.toString("base64url");

        if(!verified){
            throw new GraphQLError("ERROR_FIDO2_REGISTRATION_IS_INVALID");
        }

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

    /**
     * 
     * @param registrationSessionToken 
     * @returns 
     */
    protected async getSortedRegistartionStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>>{

        const arrUserRegistrationState: Array<UserRegistrationState> = await identityDao.getUserRegistrationStates(registrationSessionToken);
        arrUserRegistrationState.sort(
            (a: UserRegistrationState, b: UserRegistrationState) => a.registrationStateOrder - b.registrationStateOrder
        );
        return Promise.resolve(arrUserRegistrationState);
    }    
    
    public async createFido2RegistrationChallenge(userId: string, sessionToken: string | null, sessionTokenType: string | null): Promise<Fido2RegistrationChallengeResponse> {

        // does the user exist and are they not locked, not enabled, or marked for delete?
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        if(user.locked === true || user.markForDelete === true){
            throw new GraphQLError("ERROR_USER_IS_NOT_ELIGIBLE_FOR_MODIFICATION");
        }
        if(sessionToken === null && user.enabled === false){
            throw new GraphQLError("ERROR_USER_IS_NOT_ENABLED_FOR_SECURITY_KEY_REGISTRATION");
        }
        if(sessionToken !== null && sessionTokenType === SESSION_TOKEN_TYPE_REGISTRATION){
            const arrUserRegistrationStates: Array<UserRegistrationState> = await this.getSortedRegistartionStates(sessionToken);
            const index = arrUserRegistrationStates.findIndex(
                (value: UserRegistrationState) => (value.registrationState === RegistrationState.ConfigureSecurityKeyRequired || value.registrationState === RegistrationState.ConfigureSecurityKeyOptional)
            );
            if(index < 0){
                throw new GraphQLError("ERROR_INVALID_REGISTRATION_TOKEN_FOR_SECURITY_KEY_REGISTRATION");
            }
        }
        if(sessionToken !== null && sessionTokenType === SESSION_TOKEN_TYPE_AUTHENTICATION){
            
            const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(sessionToken);
            const index = arrUserAuthenticationStates.findIndex(
                (value: UserAuthenticationState) => (value.authenticationState === AuthenticationState.ConfigureSecurityKey)
            );
            if(index < 0){
                throw new GraphQLError("ERROR_INVALID_AUTHENTICATION_TOKEN_FOR_SECURITY_KEY_REGISTRATION");
            }
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

    public async createFido2AuthenticationChallenge(userId: string, sessionToken: string | null, sessionTokenType: string | null): Promise<Fido2AuthenticationChallengeResponse> {
        // does the user exist and are they not locked, not enabled, or marked for delete?
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        if(user.locked === true || user.markForDelete === true){
            throw new GraphQLError("ERROR_USER_IS_NOT_ELIGIBLE_FOR_MODIFICATION");
        }
        if(sessionToken === null && user.enabled === false){
            throw new GraphQLError("ERROR_USER_IS_NOT_ENABLED_FOR_SECURITY_KEY_REGISTRATION");
        }
        if(sessionToken !== null && sessionTokenType === SESSION_TOKEN_TYPE_REGISTRATION){
            const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(sessionToken);
            const index = arrUserRegistrationState.findIndex(
                (value: UserRegistrationState) => (value.registrationState === RegistrationState.ValidateSecurityKey)
            );
            if(index < 0){
                throw new GraphQLError("ERROR_INVALID_REGISTRATION_TOKEN_FOR_SECURITY_KEY_VALIDATION");
            }
        }
        if(sessionToken !== null && sessionTokenType === SESSION_TOKEN_TYPE_AUTHENTICATION){
            const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(sessionToken);
            const index = arrUserAuthenticationStates.findIndex(
                (value: UserAuthenticationState) => (value.authenticationState === AuthenticationState.ValidateSecurityKey)
            );
            if(index < 0){
                throw new GraphQLError("ERROR_INVALID_AUTHENTICATION_TOKEN_FOR_SECURITY_KEY_VALIDATION");
            }
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


    protected async createFederatedOIDCRequestProperties(email: string | null, userId: string | null, provider: FederatedOidcProvider, tenantId: string, preAuthenticationState: PreAuthenticationState | null): Promise<{hasError: boolean, errorMessage: string, authorizationEndpoint: string}> {

        const state: string = generateRandomToken(32, "hex");
        const federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel = {
            federatedOIDCAuthorizationRelType: FederatedOidcAuthorizationRelType.AuthorizationRelTypePortalAuth,
            email: email,
            userId: userId,
            expiresAtMs: Date.now() + 15 /* minutes */ * 60 /* seconds/min  */ * 1000 /* ms/sec */,
            federatedOIDCProviderId: provider.federatedOIDCProviderId,
            initRedirectUri: preAuthenticationState ? preAuthenticationState.redirectUri : "",
            initResponseMode: preAuthenticationState? preAuthenticationState.responseMode : "" ,
            initClientId: preAuthenticationState ? preAuthenticationState.clientId : null,
            initResponseType: preAuthenticationState ? preAuthenticationState.responseMode : "",
            initScope: preAuthenticationState ? preAuthenticationState.scope : provider.scopes.join(" "),            
            initTenantId: tenantId,
            initCodeChallenge: preAuthenticationState ? preAuthenticationState.codeChallenge : null,
            initCodeChallengeMethod: preAuthenticationState ? preAuthenticationState.codeChallengeMethod : null,
            state: state,
            initState: preAuthenticationState && preAuthenticationState.state ? preAuthenticationState.state : state,
            returnUri: ""
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
        federatedOIDCAuthorizationRel.codeVerifier = verifier;
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

    protected async generateAuthorizationCode(userId: string, preAuthToken: string): Promise<AuthorizationReturnUri> {
                
        const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);
        if(preAuthenticationState === null){
            throw new GraphQLError("ERROR_INVALID_PRE_AUTHENTICATION_TOKEN");
        }
        await authDao.deletePreAuthenticationState(preAuthToken);
        if(preAuthenticationState.expiresAtMs < Date.now()){
            await authDao.deletePreAuthenticationState(preAuthToken);
            throw new GraphQLError("ERROR_PRE_AUTHENTICATION_TOKEN_IS_EXPIRED");
        }

        const authorizationCodeData: AuthorizationCodeData = {
            clientId: preAuthenticationState.clientId,
            code: generateRandomToken(32, "hex"),
            expiresAtMs: Date.now() + (30 * 60 * 1000),
            redirectUri: preAuthenticationState.redirectUri,
            scope: preAuthenticationState.scope,
            tenantId: preAuthenticationState.tenantId,
            userId: userId,
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

    protected getPortalAuthenTokenTTLSeconds(): number {
        return PORTAL_AUTH_TOKEN_TTL_SECONDS;
    }


}

export default IdentityService;