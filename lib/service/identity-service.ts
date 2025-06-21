import { OIDCContext } from "@/graphql/graphql-context";
import * as OTPAuth from "otpauth";
import IdentityDao from "../dao/identity-dao";
import { Client, Fido2AuthenticationChallengeResponse, Fido2Challenge, Fido2RegistrationChallengeResponse, Fido2KeyRegistrationInput, ObjectSearchResultItem, RefreshData, RelSearchResultItem, SearchResultType, Tenant, TenantPasswordConfig, TotpResponse, User, UserCreateInput, UserCredential, UserMfaRel, UserSession, UserTenantRel, UserTenantRelView, Fido2KeyAuthenticationInput, TenantRestrictedAuthenticationDomainRel, TenantManagementDomainRel, FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcAuthorizationRel, FederatedOidcAuthorizationRelType, AuthorizationCodeData, PreAuthenticationState, AuthorizationReturnUri, UserRegistrationStateResponse, UserRegistrationState, RegistrationState, UserAuthenticationStateResponse, AuthenticationState, AuthenticationErrorTypes, UserAuthenticationState, UserFailedLogin, TenantLoginFailurePolicy } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from "crypto";
import { DEFAULT_LOGIN_FAILURE_POLICY, DEFAULT_LOGIN_PAUSE_TIME_MINUTES, DEFAULT_MAXIMUM_LOGIN_FAILURES, DEFAULT_PASSWORD_HISTORY_PERIOD, DEFAULT_TENANT_PASSWORD_CONFIGURATION, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, LOGIN_FAILURE_POLICY_PAUSE, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, NAME_ORDER_WESTERN, OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED, PASSWORD_HASH_ITERATION_128K, PASSWORD_HASH_ITERATION_256K, PASSWORD_HASH_ITERATION_32K, PASSWORD_HASH_ITERATION_64K, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, QUERY_PARAM_TENANT_ID, RANKED_DESCENDING_HASHING_ALGORITHS, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, STATUS_COMPLETE, STATUS_INCOMPLETE, STATUS_OMITTED, TENANT_TYPE_ROOT_TENANT, TOKEN_TYPE_END_USER, TOKEN_TYPE_IAM_PORTAL_USER, TOKEN_TYPE_PROVISIONAL_USER, TOTP_HASH_ALGORITHM_SHA1, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import { sha256HashPassword, pbkdf2HashPassword, bcryptHashPassword, generateSalt, scryptHashPassword, generateRandomToken, generateCodeVerifierAndChallenge, bcryptValidatePassword } from "@/utils/dao-utils";
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

    // ##########################################################################
    // 
    //                    USER CREATE METHODS
    //
    // ##########################################################################

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
    protected async _createUser(userCreateInput: UserCreateInput, tenantId: string, isRegistration: boolean): Promise<{user: User, tenant: Tenant, tenantPasswordConfig: TenantPasswordConfig}>  {

        // Always need to make sure that we lower-case the email for consistency purposes.
        userCreateInput.email = userCreateInput.email.toLowerCase();

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

    /**
     * 
     * @param userId 
     * @param password 
     * @param hashAlgorithm 
     * @returns 
     */
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


    // ##########################################################################
    // 
    //                AUTHENTICATION METHODS
    //
    // ##########################################################################
    /**
     * Error conditions:
     * 1.   preAuthToken argument is present but no preauth state exists, or is
     *      different from the supplied tenant id
     * 2.   The tenant exists and does not allow authentication for the given domain.
     * 3.   No domains for management of a tenant
     * 4.   No user, no federated IdP, and no tenants that allow self-registration
     * 5.   No user, there IS a federated IdP, but the IdP is not attached to 
     *      any of the tenants that the domain can manage
     * 6.   User exists, there is NO IdP for the user, and none of the tenants allows
     *      username/password authentication
     * 7.   User exists, there is an IdP for the user, but the IdP is not attached
     *      to the tenant
     * 
     * @param email 
     * @param tenantId 
     * @returns 
     */
    public async authenticateHandleUserNameInput(email: string, tenantId: string | null, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {        

        // 1.   If the user is coming from a 3rd party site for authentication
        if(preAuthToken){
            return this.authenticateExternalUserNameHandler(email, preAuthToken);
        }
        // Otherwise they are trying to log directly into the IAM portal itself.
        else{
            return this.authenticatePortalUserNameHandler(email, tenantId);
            
        }        
    }


    /**
     * 
     * @param email 
     * @param preAuthToken 
     * @returns 
     */
    protected async authenticateExternalUserNameHandler(email: string, preAuthToken: string): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", "", preAuthToken);

        const p: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);
        if(!p){
            response.authenticationError.errorCode = "ERROR_INVALID_PRE_AUTH_TOKEN";
            return response;
        }
        const domain: string = this.getDomainFromEmail(email);
        const tenant: Tenant | null = await tenantDao.getTenantById(p.tenantId);
        if(tenant === null){
            response.authenticationError.errorCode = "ERROR_INVALID_TENANT_FOR_PRE_AUTH_TOKEN";
            return response;
        }
        const federatedOidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        let providerTenantRels: Array<FederatedOidcProviderTenantRel> = [];
        if(federatedOidcProvider !== null){            
            providerTenantRels = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(p.tenantId, federatedOidcProvider.federatedOIDCProviderId);
            
            // If there is a federated provider for the domain and is not attached to the tenant, then error
            const r: FederatedOidcProviderTenantRel | undefined = providerTenantRels.find(
                (v: FederatedOidcProviderTenantRel) => v.tenantId === tenant.tenantId
            )
            if(!r){
                response.authenticationError.errorCode = "ERROR_DOMAIN_IS_NOT_PERMITTED_ACCESS_TO_THIS_TENANT";
                return response;
            }
        }
        else{
            // There is no federated provider, and the tenant exclusively uses federated OIDC provider for authentication
            if(tenant.federatedAuthenticationConstraint === FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE){
                response.authenticationError.errorCode = "ERROR_USER_REGISTRATION_IS_NOT_PERMITTED_FOR_THIS_TENANT";
                return response;
            }
        }
        
        const user: User | null = await identityDao.getUserBy("email", email.toLowerCase()); 

        // If user does not exist, there is no provider, and the tenant does not allow self-registration
        if(user === null && federatedOidcProvider === null && tenant.allowUserSelfRegistration === false){
            response.authenticationError.errorCode = "ERROR_USER_REGISTRATION_IS_NOT_PERMITTED_FOR_THIS_TENANT";
            return response;
        }
        // If the user exists but is not in a state where they can be authenticated.
        if(user && (user.enabled === false || user.locked === true || user.markForDelete === true)){
            response.authenticationError.errorCode = "ERROR_USER_ACCOUNT_STATUS_NOT_VALID_FOR_AUTHENTICATION";
            return response;
        }
        

        // Success cases
        //
        // At this point we know that the tenant exists and allows either a external OIDC provider
        // or allows the user to login with a username/password or allows the user to register

        response.userAuthenticationState.tenantId = p.tenantId;
        // 1.   There is a provider, and regardless of whether the user exists, send the the user to the provider
        //      for authentication.
        if(federatedOidcProvider !== null){
            response.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
            const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email.toLowerCase(), user ? user.userId : null, federatedOidcProvider, tenant.tenantId);
            console.log("checkpoint 9.23");
            if(hasError){
                throw new GraphQLError(errorMessage);
            }
            console.log("checkpoint 9.24");            
            response.uri = authorizationEndpoint;
        }
        // 2.   There is no provider, so we either need to register the user if they do not exist, or
        //      authenticate with username/password + other MFA types.
        else {
            if(user === null){
                response.userAuthenticationState.authenticationState = AuthenticationState.Register;                
                response.uri = `/authorize/register?${QUERY_PARAM_TENANT_ID}=${p.tenantId}&username=${email.toLowerCase()}`;
                return response;
            }
            const userCredential: UserCredential | null = await identityDao.getUserCredentialForAuthentication(user.userId);
            if(!userCredential){
                response.authenticationError.errorCode = "ERROR_NO_CREDENTIALS_FOUND_FOR_USER";
                return response;
            }
            else{
                const stateOrder: Array<AuthenticationState> = [];
                stateOrder.push(AuthenticationState.EnterPassword);
                const passwordConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(p.tenantId);
                if(passwordConfig && this.requirePasswordRotation(userCredential, passwordConfig)){
                    stateOrder.push(AuthenticationState.RotatePassword);
                }
                let requiredMfaTypes: Array<string> = [];
                if(passwordConfig && passwordConfig.requireMfa){
                    requiredMfaTypes = passwordConfig.mfaTypesRequired?.split(",") || [];
                }
                
                const arrUserMfaConfig: Array<UserMfaRel> = await identityDao.getUserMFARels(user.userId);
                const userMfaRelTotp: UserMfaRel | undefined = arrUserMfaConfig.find(
                    (v: UserMfaRel) => v.mfaType === MFA_AUTH_TYPE_TIME_BASED_OTP
                );
                const userMfaRelSecurityKey : UserMfaRel | undefined = arrUserMfaConfig.find(
                    (v: UserMfaRel) => v.mfaType === MFA_AUTH_TYPE_FIDO2
                );
                // If the user has configured totp, always use it first
                if(userMfaRelTotp){
                    stateOrder.push(AuthenticationState.ValidateTotp);
                }
                // Otherwise, if the tenant requires it and the user does not have totp, then
                // require the user to configure totp and validate it
                if(requiredMfaTypes.includes(MFA_AUTH_TYPE_TIME_BASED_OTP) && !userMfaRelTotp){
                    stateOrder.push(AuthenticationState.ConfigureTotp);
                    stateOrder.push(AuthenticationState.ValidateTotp);
                }
                // If the user has configured a security key, always use it after totp (if that exists);
                if(userMfaRelSecurityKey){
                    stateOrder.push(AuthenticationState.ValidateSecurityKey);
                }
                // Otherwise, if the tenant requires it and the user does not have a security key configured, then
                // require the user to configure a security key and validate it
                if(requiredMfaTypes.includes(MFA_AUTH_TYPE_FIDO2) && !userMfaRelSecurityKey){
                    stateOrder.push(AuthenticationState.ConfigureSecurityKey);
                    stateOrder.push(AuthenticationState.ValidateSecurityKey);
                }
                stateOrder.push(AuthenticationState.RedirectBackToApplication);

                const arrUserAuthenticationStates: Array<UserAuthenticationState> = [];
                const authenticationSessionToken: string = generateRandomToken(20, "hex");
                // authentication completion will expire after 30 minutes. 
                const expiresAt: number = Date.now() + (60 * 30 * 1000);

                for(let i = 0; i < stateOrder.length; i++){
                    const uas: UserAuthenticationState = {
                        authenticationSessionToken: authenticationSessionToken,
                        authenticationState: stateOrder[i],
                        authenticationStateOrder: i + 1,
                        authenticationStateStatus: STATUS_INCOMPLETE,
                        expiresAtMs: expiresAt,
                        tenantId: p.tenantId,
                        userId: user.userId
                    }
                    arrUserAuthenticationStates.push(uas);
                }
                await identityDao.createUserAuthenticationStates(arrUserAuthenticationStates);
                response.userAuthenticationState = arrUserAuthenticationStates[0];
            }
            
        }

        return response;
           
    }

    protected async authenticatePortalUserNameHandler(email: string, tenantId: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", tenantId || "", null);
        
        console.log("checkpoint 1");
        
        const domain: string = this.getDomainFromEmail(email);
        const tenant: Tenant | null = tenantId ? await tenantDao.getTenantById(tenantId) : null;
        const federatedOidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        let providerTenantRels: Array<FederatedOidcProviderTenantRel> = [];
        if(federatedOidcProvider !== null){
            providerTenantRels = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(tenantId || undefined, federatedOidcProvider.federatedOIDCProviderId);            
        }
        const managementDomains: Array<TenantManagementDomainRel> = await tenantDao.getDomainTenantManagementRels(tenantId || undefined, domain);
        
        // 1.   Error condition #1: No domains for management of a tenant
        if(!managementDomains || managementDomains.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoManagementDomain;
            return response;
        }
        console.log("checkpoint 2");

        const d = managementDomains.find(
            (v: TenantManagementDomainRel) => v.domain === domain
        );
        if(!d){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoManagementDomain;
            return response;
        }
        console.log("checkpoint 2.1");
        
        // Obtain the basic information for deciding on error conditions or the next steps
        const user: User | null = await identityDao.getUserBy("email", email);

        console.log("checkpoint 3");
        const tenants: Array<Tenant> = tenant ? 
                                        await tenantDao.getTenants([tenant.tenantId]) :
                                        await tenantDao.getTenants(managementDomains.map( (d: TenantManagementDomainRel) => d.tenantId));
        const tenantsThatAllowSelfRegistration = tenants.filter(
            (t: Tenant) => t.allowUserSelfRegistration === true
        );

        // 2.   Error condition #2: No user, no federated IdP, and no tenants that allow self-registration        
        if(user === null && federatedOidcProvider === null && tenantsThatAllowSelfRegistration.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingUserAndNoTenantSelfRegistration;
            return response;
        }
        console.log("checkpoint 4");

        // 4.   Error condition #4. The user is disabled, marked for delete, or locked
        if(user && (user.enabled === false || user.locked === true || user.markForDelete === true)){
            response.authenticationError.errorCode = "ERROR_USER_ACCOUNT_STATUS_NOT_VALID_FOR_AUTHENTICATION";
            return response;
        }
        console.log("checkpoint 4.1");

        // Find all of the providers attached to any of the tenants
        const tenantsThatAreAttachedToProviders = tenants.filter(
            (t: Tenant) => {
                const rel = providerTenantRels.find(
                    (f: FederatedOidcProviderTenantRel) => f.tenantId === t.tenantId
                )
                return rel !== undefined;
            }
        );
        console.log("checkpoint 5");

        // 3.   Error condition #3: No user, there IS a federated IdP, but the IdP is not attached
        //      to any of the tenants that the domain can manage
        if(user === null && federatedOidcProvider !== null && tenantsThatAreAttachedToProviders.length === 0){            
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return response;
        }
        console.log("checkpoint 6");

        const tenantsThatAllowPasswordLogin: Array<Tenant> = tenants.filter(
            (t: Tenant) => t.federatedAuthenticationConstraint !== FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE
        );
        //  4.   Error condition # 3: User exists, there is NO IdP for the user, and none of the tenants allows
        //       username/password authentication
        if(user !== null && federatedOidcProvider === null && tenantsThatAllowPasswordLogin.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorExclusiveTenantAndNoFederatedOidcProvider;
            return response;
        }
        console.log("checkpoint 7");

        //  5.   Error condition #5: User exists, there is an IdP for the user, but the IdP is not attached
        //       to any tenant that has the user's domain for management
        if(user !== null && federatedOidcProvider !== null && tenantsThatAreAttachedToProviders.length === 0){            
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return response;
        }
        
        console.log("checkpoint 8");

        // SUCCESS SCENARIOS 
        // 1.   The user can select the tenant and register. In this scenario, there is no
        //      need to create database entries for the user authentication state. Instead
        //      there will be entries created for the user registration state later.    
        if(user === null && federatedOidcProvider === null && tenantsThatAllowSelfRegistration.length > 0){
            
            response.userAuthenticationState.authenticationState = tenantsThatAllowSelfRegistration.length === 1 ? AuthenticationState.Register : AuthenticationState.SelectTenantThenRegister;            
            response.availableTenants = [];
            tenantsThatAllowSelfRegistration.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                ));
            if(tenantsThatAllowSelfRegistration.length === 1){
                response.uri = `/authorize/register?${QUERY_PARAM_TENANT_ID}=${tenantsThatAllowSelfRegistration[0].tenantId}&username=${email.toLowerCase()}`;
            }
            return response;
        }
        console.log("checkpoint 9");
                
        // 2.   The user can select the tenant by which they want to do SSO and thereby "autoregister"
        //      or just "autoregister" if there is exactly one tenant
        if(federatedOidcProvider !== null && tenantsThatAreAttachedToProviders.length > 0){            
            // Otherwise, set the tenant information and then decide what the next steps are.
            console.log("checkpoint 9.1");
            response.availableTenants = [];
                tenantsThatAreAttachedToProviders.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                ));
                console.log("checkpoint 9.2");
            if(tenantsThatAreAttachedToProviders.length === 1){
                response.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
                console.log("checkpoint 9.22");
                const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email, user ? user.userId : null, federatedOidcProvider, tenantsThatAreAttachedToProviders[0].tenantId);
                console.log("checkpoint 9.23");
                if(hasError){
                    throw new GraphQLError(errorMessage);
                }
                console.log("checkpoint 9.24");            
                response.uri = authorizationEndpoint;
                return response;
            }            
            else {
                response.userAuthenticationState.authenticationState = AuthenticationState.SelectTenant;                
            }
            console.log("checkpoint 9.4");
            return response;            
        }
        console.log("checkpoint 10");

        // 3.   The user can select which tenant to log into with username/password (plus
        //      one or more MFA types). In this case, if the tenant list contains exactly 1
        //      tenant, then we need to create the authentication state values in the database
        //      to track the authentication process.
        if(user !== null && federatedOidcProvider === null && tenantsThatAllowPasswordLogin.length > 0){
            response.availableTenants = [];
            tenantsThatAllowPasswordLogin.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, tenantName: t.tenantName
                    }
                )
            )
            if(tenantsThatAllowPasswordLogin.length === 1){
                const stateOrder: Array<AuthenticationState> = [];
                stateOrder.push(AuthenticationState.EnterPassword);
                const passwordConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(tenantsThatAllowPasswordLogin[0].tenantId);
                const userCredential: UserCredential | null = await identityDao.getUserCredentialForAuthentication(user.userId);
                if(!userCredential){
                    response.authenticationError.errorCode = "ERROR_NO_CREDENTIALS_FOUND_FOR_USER";
                    return response;
                }
                if(passwordConfig && this.requirePasswordRotation(userCredential, passwordConfig)){
                    stateOrder.push(AuthenticationState.RotatePassword);
                }
                let requiredMfaTypes: Array<string> = [];
                if(passwordConfig && passwordConfig.requireMfa){
                    requiredMfaTypes = passwordConfig.mfaTypesRequired?.split(",") || [];
                }
                const arrUserMfaConfig: Array<UserMfaRel> = await identityDao.getUserMFARels(user.userId);
                const userMfaRelTotp: UserMfaRel | undefined = arrUserMfaConfig.find(
                    (v: UserMfaRel) => v.mfaType === MFA_AUTH_TYPE_TIME_BASED_OTP
                );
                const userMfaRelSecurityKey : UserMfaRel | undefined = arrUserMfaConfig.find(
                    (v: UserMfaRel) => v.mfaType === MFA_AUTH_TYPE_FIDO2
                );
                // If the user has configured totp, always use it first
                if(userMfaRelTotp){
                    stateOrder.push(AuthenticationState.ValidateTotp);
                }
                // Otherwise, if the tenant requires it and the user does not have totp, then
                // require the user to configure totp and validate it
                if(requiredMfaTypes.includes(MFA_AUTH_TYPE_TIME_BASED_OTP) && !userMfaRelTotp){
                    stateOrder.push(AuthenticationState.ConfigureTotp);
                    stateOrder.push(AuthenticationState.ValidateTotp);
                }
                // If the user has configured a security key, always use it after totp (if that exists);
                if(userMfaRelSecurityKey){
                    stateOrder.push(AuthenticationState.ValidateSecurityKey);
                }
                // Otherwise, if the tenant requires it and the user does not have a security key configured, then
                // require the user to configure a security key and validate it
                if(requiredMfaTypes.includes(MFA_AUTH_TYPE_FIDO2) && !userMfaRelSecurityKey){
                    stateOrder.push(AuthenticationState.ConfigureSecurityKey);
                    stateOrder.push(AuthenticationState.ValidateSecurityKey);
                }
                stateOrder.push(AuthenticationState.RedirectToIamPortal);

                const arrUserAuthenticationStates: Array<UserAuthenticationState> = [];
                const authenticationSessionToken: string = generateRandomToken(20, "hex");
                // authentication completion will expire after 30 minutes. 
                const expiresAt: number = Date.now() + (60 * 30 * 1000);

                for(let i = 0; i < stateOrder.length; i++){
                    const uas: UserAuthenticationState = {
                        authenticationSessionToken: authenticationSessionToken,
                        authenticationState: stateOrder[i],
                        authenticationStateOrder: i + 1,
                        authenticationStateStatus: STATUS_INCOMPLETE,
                        expiresAtMs: expiresAt,
                        tenantId: tenantsThatAllowPasswordLogin[0].tenantId,
                        userId: user.userId
                    }
                    arrUserAuthenticationStates.push(uas);
                }
                await identityDao.createUserAuthenticationStates(arrUserAuthenticationStates);
                response.userAuthenticationState = arrUserAuthenticationStates[0];
            }
            else{
                response.userAuthenticationState.authenticationState = AuthenticationState.SelectTenant;    
            }
            
            return response;
        }

        console.log("checkpoint 11");
        
        response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorConditionsForAuthenticationNotMet;
        return response;
    }

    /**
     * 
     * @param username 
     * @param password 
     * @param tenantId 
     * @param authenticationSessionToken 
     * @param preAuthToken 
     * @returns 
     */
    public async authenticateUser(username: string, password: string, tenantId: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse>{
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, tenantId, preAuthToken);

        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.EnterPassword);
        if(index < 0){
            return Promise.resolve(response);
        }
        
        const user: User | null = await identityDao.getUserBy("email", username);
        if(!user){
            throw new GraphQLError("ERROR_USER_NOT_FOUND_FOR_AUTHENTICATION");
        }
        if(user.enabled === false || user.markForDelete === true || user.locked === true){
            throw new GraphQLError("ERROR_AUTHENTICATION_DISLABLED_FOR_USER");
        }
        

        const userFailedLoginAttempts: Array<UserFailedLogin> = await identityDao.getFailedLogins(user.userId);
        let loginFailurePolicy: TenantLoginFailurePolicy | null = await tenantDao.getLoginFailurePolicy(arrUserAuthenticationStates[index].tenantId);
        if(loginFailurePolicy === null){
            loginFailurePolicy = DEFAULT_LOGIN_FAILURE_POLICY;
        }

        // We will check to see if the user can authenticate based on the number of failures they have previously
        // and if we have a failure policy type of pause and the next login time allowed is at some point in the past.
        if(userFailedLoginAttempts.length > 0 && loginFailurePolicy.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE){
            if(userFailedLoginAttempts[length - 1].nextLoginNotBefore > Date.now()){
                throw new GraphQLError("ERROR_AUTHENTICTION_IS_PAUSED_FOR_USER");
            }
        }

        const userCredential: UserCredential | null = await identityDao.getUserCredentialForAuthentication(user.userId);
        if(!userCredential){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_CREDENTIALS_FOR_USER");
        }

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

        if(!valid){

            // 1.   Do we need to lock the user
            // 2.   If not, do we need to pause the login attempts for any length of time?
            const nowMs = Date.now();
            const failureCount: number = userFailedLoginAttempts.length === 0 ? 1 : userFailedLoginAttempts[userFailedLoginAttempts.length - 1].failureCount + 1;
            let nextLoginTime = nowMs;
            let lockUser: boolean = false;

            if(loginFailurePolicy.loginFailurePolicyType === LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT){
                if(failureCount >= loginFailurePolicy.failureThreshold){
                    nextLoginTime = Number.MAX_SAFE_INTEGER;
                    lockUser = true;
                }
            }
            else if(loginFailurePolicy.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE){
                // Have we surpassed the globally maximum allowed login failures (globally, either by tenant configuration or by system default)?
                const maximumLoginFailures: number = loginFailurePolicy.maximumLoginFailures ? loginFailurePolicy.maximumLoginFailures : DEFAULT_MAXIMUM_LOGIN_FAILURES;
                if(failureCount >= maximumLoginFailures){
                    nextLoginTime = Number.MAX_SAFE_INTEGER;
                    lockUser = true;
                }
                else{
                    const failureThreshold = loginFailurePolicy.failureThreshold;
                    // Are we just at the threshold for another pause? For example, the threshold is 8 consecutive
                    // failed logins before a pause at we are at the 8th or 16th or 24th or ... failure, 
                    if(failureCount % failureThreshold === 0){
                        const pauseDurationInMinutes: number = loginFailurePolicy.pauseDurationMinutes ? loginFailurePolicy.pauseDurationMinutes : DEFAULT_LOGIN_PAUSE_TIME_MINUTES;
                        nextLoginTime = nowMs + (pauseDurationInMinutes * 60 * 1000);
                    }
                }
            }

            await identityDao.addFailedLogin({
                failureAtMs: nowMs,
                failureCount: failureCount,
                nextLoginNotBefore: nextLoginTime,
                userId: user.userId
            });

            if(lockUser){
                user.locked = true;
                await identityDao.updateUser(user);
            }
            // We can safely delete the previous failed attempts
            if(userFailedLoginAttempts.length > 0){
                for(let i = 0; i < userFailedLoginAttempts.length; i++){
                    identityDao.removeFailedLogin(userFailedLoginAttempts[i].userId, userFailedLoginAttempts[i].failureAtMs);
                }
            }
            
            response.authenticationError.errorCode = "ERROR_INVALID_CREDENTIALS";
            return Promise.resolve(response);
        }


        // Otherwise the password is valid and we should remove the failed login attempts
        // and update the existing authentication state and return the new state.
        identityDao.resetFailedLoginAttempts(user.userId);

        arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
        const nextUserAuthenticationState: UserAuthenticationState = arrUserAuthenticationStates[index + 1];
                
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, response);
        }
        else{
            response.userAuthenticationState = nextUserAuthenticationState;
        }
        
        return Promise.resolve(response);

    }


    public async authenticateRotatePassword(userId: string, newPassword: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse>{
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        
        // 1. Is this the correct step of the authentication process?
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.RotatePassword);
        if(index < 0){
            return Promise.resolve(response);
        }
        
        // Does the user exist and have credentials?
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_USER_NOT_FOUND";
            return response;
        }
        const arrUserCredentials: Array<UserCredential> = await identityDao.getUserCredentials(userId);
        if(arrUserCredentials.length === 0){
            response.authenticationError.errorCode = "ERROR_NO_CREDENTIALS_FOUND_FOR_USER";
            return response;
        }

        // Need to validate the password and find the hashing algorithm for the new password
        const tenantPasswordConfig: TenantPasswordConfig = await this.determineTenantPasswordConfig(userId, arrUserAuthenticationStates[0].tenantId);
        const isValidPassword: boolean = await this.checkPassword(newPassword, tenantPasswordConfig);
        if(!isValidPassword){
            response.authenticationError.errorCode = "ERROR_PASSWORD_DOES_NOT_MEET_REQUIRED_FORMAT";
            return response;
        }
        const cred: UserCredential = this.generateUserCredential(userId, newPassword, tenantPasswordConfig.passwordHashingAlgorithm);
        await identityDao.addUserCredential(cred);

        arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
        const nextUserAuthenticationState = arrUserAuthenticationStates[index + 1];
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, response);
        }
        else{
            response.userAuthenticationState = nextUserAuthenticationState;
        }
        return response;
    }

    protected async determineTenantPasswordConfig(userId: string, targetTenantId: string): Promise<TenantPasswordConfig> {
        // Need to validate the password and find the hashing algorithm for the new password: Does the user belong to any tenants? Prefer, in order
        // 1.   Primary tenant
        // 2.   Secondary tenant if there is exactly one user-to-tenant relationshipt
        // 3.   Default hashing algorithm from the object DEFAULT_TENANT_PASSWORD_CONFIGURATION
        let tenantPasswordConfig: TenantPasswordConfig = DEFAULT_TENANT_PASSWORD_CONFIGURATION        
        const userTenantRels = await identityDao.getUserTenantRelsByUserId(userId);
        if(userTenantRels && userTenantRels.length > 0){
            let tenantId =  userTenantRels[0].tenantId;
            if(userTenantRels.length > 1){
                for(let i = 0; i < userTenantRels.length; i++){
                    if(userTenantRels[i].relType === USER_TENANT_REL_TYPE_PRIMARY){
                        tenantId = userTenantRels[i].tenantId;
                        break;
                    }
                }
            }
            const config: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(tenantId);
            if(config){
                tenantPasswordConfig = config;
            }
        }
        
        // We need to compare 2 password configurations if the user is logging into a
        // different tenant than is the user's primary tenant. If one exists for the target tenant
        // then we need to check to see if then merge the 2 configurations, taking 
        // the more robust option from each.
        if(tenantPasswordConfig.tenantId !== targetTenantId){
        
            const passwordConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(targetTenantId);
            if(passwordConfig){
                // Merge the 2 configurations, taking the more robust option from each.
                tenantPasswordConfig.passwordMaxLength = tenantPasswordConfig.passwordMaxLength > passwordConfig.passwordMaxLength ? tenantPasswordConfig.passwordMaxLength : passwordConfig.passwordMaxLength;
                tenantPasswordConfig.passwordMinLength = tenantPasswordConfig.passwordMinLength > passwordConfig.passwordMinLength ? tenantPasswordConfig.passwordMinLength : passwordConfig.passwordMinLength;
                tenantPasswordConfig.requireLowerCase = tenantPasswordConfig.requireLowerCase || passwordConfig.requireLowerCase;
                tenantPasswordConfig.requireUpperCase = tenantPasswordConfig.requireUpperCase || passwordConfig.requireUpperCase;
                tenantPasswordConfig.requireNumbers = tenantPasswordConfig.requireNumbers || passwordConfig.requireNumbers;
                tenantPasswordConfig.requireSpecialCharacters = tenantPasswordConfig.requireSpecialCharacters || passwordConfig.requireSpecialCharacters;
                const specialCharactersAllowed = this.findCharacterIntersection(tenantPasswordConfig.specialCharactersAllowed || "", passwordConfig.specialCharactersAllowed || "");
                // If there are no intersecting special characters and special characters are required, then
                // select the special characters from the target tenant if they exist, otherwise the choose the user's tenant, otherwise choose default
                if(specialCharactersAllowed === "" && tenantPasswordConfig.requireSpecialCharacters === true){
                    tenantPasswordConfig.specialCharactersAllowed = 
                        passwordConfig.specialCharactersAllowed ? passwordConfig.specialCharactersAllowed :
                        tenantPasswordConfig.specialCharactersAllowed ? tenantPasswordConfig.specialCharactersAllowed :
                        DEFAULT_TENANT_PASSWORD_CONFIGURATION.specialCharactersAllowed
                }
                else{
                    tenantPasswordConfig.specialCharactersAllowed = specialCharactersAllowed;
                }
                const passwordHistoryPeriod1: number = tenantPasswordConfig.passwordHistoryPeriod ? tenantPasswordConfig.passwordHistoryPeriod : DEFAULT_PASSWORD_HISTORY_PERIOD;
                const passwordHistoryPeriod2: number = passwordConfig.passwordHistoryPeriod ? passwordConfig.passwordHistoryPeriod : DEFAULT_PASSWORD_HISTORY_PERIOD;
                tenantPasswordConfig.passwordHistoryPeriod = passwordHistoryPeriod1 > passwordHistoryPeriod2 ? passwordHistoryPeriod1 : passwordHistoryPeriod2;
                if(tenantPasswordConfig.passwordHashingAlgorithm !== passwordConfig.passwordHashingAlgorithm){
                    tenantPasswordConfig.passwordHashingAlgorithm = this.determinePreferredHashAlgorithm(tenantPasswordConfig.passwordHashingAlgorithm, passwordConfig.passwordHashingAlgorithm);
                }
            }
        } 
        return tenantPasswordConfig; 
    }

    /**
     * Credit to Google's AI overview
     * @param str1 
     * @param str2 
     * @returns 
     */
    protected findCharacterIntersection(str1: string, str2: string): string {
        const chars1 = str1.split("");
        const chars2 = str2.split("");
      
        const intersection = chars1.filter(char => chars2.includes(char));
      
        // Remove duplicates if necessary (filter might produce duplicates if a character appears multiple times in str1)
        return Array.from(new Set(intersection)).join("");
    }

    protected determinePreferredHashAlgorithm(hashalgorithm1: string, hashalgorithm2: string): string {
        let retVal = hashalgorithm1;
        // prefer scrypt over bcrypt over pbkdf2 over sha256
        const index1 = RANKED_DESCENDING_HASHING_ALGORITHS.indexOf(hashalgorithm1);
        const index2 = RANKED_DESCENDING_HASHING_ALGORITHS.indexOf(hashalgorithm2);
        // Should never happen...
        if(index1 === -1 && index2 === -1){
            retVal = DEFAULT_TENANT_PASSWORD_CONFIGURATION.passwordHashingAlgorithm
        }
        else{
            retVal = index1 < index2 ? RANKED_DESCENDING_HASHING_ALGORITHS[index1] : RANKED_DESCENDING_HASHING_ALGORITHS[index2];
        }
        return retVal;
    }

    /**
     * 
     * @param userId 
     * @param totpTokenValue 
     * @param authenticationSessionToken 
     * @param preAuthToken 
     * @returns 
     */
    public async authenticateValidateTOTP(userId: string, totpTokenValue: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.ValidateTotp);
        if(index < 0){
            return Promise.resolve(response);
        }
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_USER_ID";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }

        const isTokenValid: boolean = await this.validateTOTP(userId, totpTokenValue);
        if(!isTokenValid){
            response.authenticationError.errorCode = "ERROR_INVALID_TOTP_TOKEN";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }

        // Update the authentication state values;
        arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
        const nextUserAuthenticationState = arrUserAuthenticationStates[index + 1];
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, response);
        }
        else{
            response.userAuthenticationState = nextUserAuthenticationState;
        }
        return response;
    }


    public async cancelAuthentication(userId: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        return response;
    }   


    protected async getSortedAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        const arrUserAuthenticationState: Array<UserAuthenticationState> = await identityDao.getUserAuthenticationStates(authenticationSessionToken);
        arrUserAuthenticationState.sort(
            (a: UserAuthenticationState, b: UserAuthenticationState) => a.authenticationStateOrder - b.authenticationStateOrder
        );
        return arrUserAuthenticationState;
    }

    /**
     * 
     * @param arrUserAuthenticationState 
     * @param response 
     * @param expectedState 
     * @returns 
     */

    protected initUserAuthenticationStateResponse(authenticationSessionToken: string, tenantId: string, preAuthToken: string | null): UserAuthenticationStateResponse {
        const response: UserAuthenticationStateResponse = {
            userAuthenticationState: {
                expiresAtMs: 0,
                preAuthToken: preAuthToken,
                authenticationSessionToken: authenticationSessionToken,
                authenticationState: AuthenticationState.Error,
                authenticationStateOrder: 0,
                authenticationStateStatus: STATUS_INCOMPLETE,
                tenantId: tenantId,
                userId: ""
            },
            authenticationError: {
                errorCode: "",
                errorMessage: ""
            },
            accessToken: null,
            totpSecret: null,
            uri: null
        };
        return response;
    }

    protected async validateAuthenticationStep(arrUserAuthenticationState: Array<UserAuthenticationState>, response: UserAuthenticationStateResponse, expectedState: AuthenticationState): Promise<number> {
        
        let stepIndex: number = -1;
        let expectedAuthenticationState: UserAuthenticationState | null = null;
        for(let i = 0; i < arrUserAuthenticationState.length; i++){
            if(arrUserAuthenticationState[i].authenticationState === expectedState){
                stepIndex = i;
                expectedAuthenticationState = arrUserAuthenticationState[i];
                break;
            }
        }

        if(expectedAuthenticationState === null){
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            response.authenticationError.errorCode = "ERROR_NO_VALID_AUTHENTICATION_SESSION_FOUND";
            return stepIndex;
        }

        // If expired before registration has been completed, then delete everything,
        // including the email token, the user that was previous created, and any other relationships.
        if(expectedAuthenticationState.expiresAtMs < Date.now()){
            response.userAuthenticationState.authenticationState = AuthenticationState.Expired;
            response.authenticationError.errorCode = "ERROR_AUTHORIZATION_SESSION_HAS_EXPIRED";
            for(let i = 0; i < arrUserAuthenticationState.length; i++){
                await identityDao.deleteUserAuthenticationState(arrUserAuthenticationState[i]);
            }
            return -1;
        }
        
        // Are there previous steps and have the previous steps been completed?
        if(stepIndex > 0){
            for(let i = 0; i < stepIndex; i++){
                const previousState: UserAuthenticationState = arrUserAuthenticationState[i];
                if(previousState.authenticationStateStatus !== STATUS_COMPLETE){
                    response.userAuthenticationState.authenticationState = AuthenticationState.Error;
                    response.authenticationError.errorCode = "ERROR_INCOMPLETE_AUTHENTICATION_STATE_FOUND";
                    stepIndex = -1;
                    break;
                }
            }
        }

        return stepIndex;
    }

    /**
     * 
     * @param user 
     * @param userAuthenticationState 
     * @param response 
     */
    protected async handleAuthenticationCompletion(user: User, userAuthenticationState: UserAuthenticationState, response: UserAuthenticationStateResponse): Promise<void> {
        if(userAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication){
            try {
                const authorizationCode: AuthorizationReturnUri = await this.generateAuthorizationCode(userAuthenticationState.userId, userAuthenticationState.preAuthToken || "");
                response.userAuthenticationState = userAuthenticationState;
                response.uri = authorizationCode.uri;
                userAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;
                await identityDao.updateUserAuthenticationState(userAuthenticationState);

            }
            catch(err: any){
                response.authenticationError.errorCode = err.message;
                response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            }            
        }
        else if(userAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            try {
                const tenant: Tenant | null = await tenantDao.getTenantById(userAuthenticationState.tenantId);
                if(tenant === null){
                    response.authenticationError.errorCode = "ERROR_INVALID_TENANT_FOR_AUTHENTICATION_COMPLETION";
                    response.userAuthenticationState.authenticationState = AuthenticationState.Error;
                }
                else{
                    const accessToken: string | null = await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, 60 * 60 * 12, TOKEN_TYPE_IAM_PORTAL_USER);
                    if(accessToken === null){
                        response.authenticationError.errorCode = "ERROR_GENERATING_ACCESS_TOKEN_AUTHENTICATION_COMPLETION";
                        response.userAuthenticationState.authenticationState = AuthenticationState.Error;
                    }
                    else{
                        response.userAuthenticationState = userAuthenticationState;
                        response.uri = `/${userAuthenticationState.tenantId}`;
                        response.accessToken = accessToken;
                        userAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;
                        await identityDao.updateUserAuthenticationState(userAuthenticationState);
                    }
                }
            }
            catch(err: any){
                response.authenticationError.errorCode = err.message;
                response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            }
        }
    }    

    protected requirePasswordRotation(userCredential: UserCredential, tenantPasswordConfig: TenantPasswordConfig): boolean {
        let bRetVal = false;
        if(tenantPasswordConfig.passwordRotationPeriodDays){
            const t: Date = new Date(userCredential.dateCreated);
            const now: number = Date.now();
            const timeForRotation = now + ( tenantPasswordConfig.passwordRotationPeriodDays * 24 * 60 * 60 * 1000);
            if(t.getTime() > timeForRotation){
                bRetVal = true;
            }
        }
        return bRetVal;
    }

    // ##########################################################################
    // 
    //                      REGISTRATION METHODS
    //
    // ##########################################################################   
    
    
    public async registerUser(userCreateInput: UserCreateInput, tenantId: string, preAuthToken: string | null | undefined): Promise<UserRegistrationStateResponse>{
        
        // TODO
        // Need to check to see if there is an active registration session happening with the
        // user, based on their email. If so, then return error if the session has not expired.
        // Otherwise, delete the old registration session, any user and relationships that were
        // created, and continue.
        
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
                preAuthToken: preAuthToken
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
        const  index = skip ? 
                        await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyOptional) :
                        await this.validateRegistrationStep(arrUserRegistrationState, response, RegistrationState.ConfigureSecurityKeyRequired);
        
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
                await this.handleRegistrationCompletion(nextRegistrationState, response);
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
            await this.handleRegistrationCompletion(nextRegistrationState, response);
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
                await this.handleRegistrationCompletion(nextRegistrationState, response);
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
                    await this.handleRegistrationCompletion(nextRegistrationState, response);
                }
            }
        }
        catch(err){
            response.registrationError.errorCode = "ERROR_VALIDATING_SECURITY_KEY_VALIDATION_INPUT";
            response.userRegistrationState.registrationState = RegistrationState.Error;
        }

        return Promise.resolve(response);
    }


    public async cancelRegistration(userId: string, registrationSessionToken: string, preAuthToken: string | null): Promise<UserRegistrationStateResponse> {
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
                userId: userId
            },
            registrationError: {
                errorCode: "",
                errorMessage: ""
            }
        };
        const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(registrationSessionToken);
        let tenantId: string | null = null;
        if(arrUserRegistrationState.length > 0){
            tenantId = arrUserRegistrationState[0].tenantId;
        }
        for(let i = 0; i < arrUserRegistrationState.length; i++){
            await identityDao.deleteUserRegistrationState(arrUserRegistrationState[i]);
        }
        if(tenantId){
            await this.deleteRegisteredUser(tenantId, userId);
        }
        response.userRegistrationState.registrationStateStatus = STATUS_COMPLETE
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
            response.uri = "/authorize/login";
        }
        return Promise.resolve(response);
    }    

    /**
     * 
     * @param userRegistrationState 
     * @param response 
     */
    protected async handleRegistrationCompletion(userRegistrationState: UserRegistrationState, response: UserRegistrationStateResponse): Promise<void> {
        
        const user: User | null = await identityDao.getUserBy("id", userRegistrationState.userId);
        if(!user){
            response.registrationError.errorCode = "ERROR_NO_USER_FOUND_FOR_REGISTRATION_COMPLETION";
            response.userRegistrationState.registrationState = RegistrationState.Error;
        }
        else{
            user.enabled = true;
            await identityDao.updateUser(user);

            if(userRegistrationState.registrationState === RegistrationState.RedirectBackToApplication){
                try{
                    const authorizationCode: AuthorizationReturnUri = await this.generateAuthorizationCode(userRegistrationState.userId, userRegistrationState.preAuthToken || "");
                    response.userRegistrationState = userRegistrationState;
                    response.uri = authorizationCode.uri;
                    userRegistrationState.registrationStateStatus = STATUS_COMPLETE;
                    await identityDao.updateUserRegistrationState(userRegistrationState);
                }
                catch(err: any){
                    response.registrationError.errorCode = err.message;
                    response.userRegistrationState.registrationState = RegistrationState.Error;
                }
            }
            else if(userRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                try{
                    const tenant: Tenant | null = await tenantDao.getTenantById(userRegistrationState.tenantId);
                    if(tenant === null){
                        response.registrationError.errorCode = "ERROR_INVALID_TENANT_FOR_REGISTRATION_COMPLETION";
                        response.userRegistrationState.registrationState = RegistrationState.Error;
                    }
                    else{
                        const accessToken: string | null = await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, 60 * 60 * 12, TOKEN_TYPE_IAM_PORTAL_USER);
                        if(accessToken === null){
                            response.registrationError.errorCode = "ERROR_GENERATING_ACCESS_TOKEN_REGISTRATION_COMPLETION";
                            response.userRegistrationState.registrationState = RegistrationState.Error;
                        }
                        else{
                            response.userRegistrationState = userRegistrationState;
                            response.uri = `/${userRegistrationState.tenantId}`;
                            response.accessToken = accessToken;
                            userRegistrationState.registrationStateStatus = STATUS_COMPLETE;
                            await identityDao.updateUserRegistrationState(userRegistrationState);
                        }
                    }
                }
                catch(err: any){
                    response.registrationError.errorCode = err.message;
                    response.userRegistrationState.registrationState = RegistrationState.Error;
                }
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


    // ##########################################################################
    // 
    //                IDENTITY UTILITY METHODS
    //
    // ##########################################################################     
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
        if(sessionToken !== null){
            const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(sessionToken);
            const index = arrUserRegistrationState.findIndex(
                (value: UserRegistrationState) => (value.registrationState === RegistrationState.ConfigureSecurityKeyRequired || value.registrationState === RegistrationState.ConfigureSecurityKeyOptional)
            );
            if(index < 0){
                throw new GraphQLError("ERROR_INVALID_REGISTRATION_TOKEN_FOR_SECURITY_KEY_REGISTRATION");
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
        if(sessionToken !== null){
            const arrUserRegistrationState: Array<UserRegistrationState> = await this.getSortedRegistartionStates(sessionToken);
            const index = arrUserRegistrationState.findIndex(
                (value: UserRegistrationState) => (value.registrationState === RegistrationState.ValidateSecurityKey)
            );
            if(index < 0){
                throw new GraphQLError("ERROR_INVALID_REGISTRATION_TOKEN_FOR_SECURITY_KEY_VALIDATION");
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


    protected getDomainFromEmail(email: string): string {
        const domain: string = email.substring(
            email.indexOf("@") + 1
        );
        return domain;
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


}

export default IdentityService;