import { OIDCContext } from "@/graphql/graphql-context";
import IdentityDao from "../dao/identity-dao";
import { Tenant, TenantPasswordConfig, User, UserCredential, UserMfaRel, TenantManagementDomainRel, FederatedOidcProvider, FederatedOidcProviderTenantRel, PreAuthenticationState, AuthorizationReturnUri, UserAuthenticationStateResponse, AuthenticationState, AuthenticationErrorTypes, UserAuthenticationState, UserFailedLogin, TenantLoginFailurePolicy, Fido2KeyAuthenticationInput, Fido2KeyRegistrationInput, TotpResponse } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { DEFAULT_LOGIN_FAILURE_POLICY, DEFAULT_LOGIN_PAUSE_TIME_MINUTES, DEFAULT_MAXIMUM_LOGIN_FAILURES, DEFAULT_PASSWORD_HISTORY_PERIOD, DEFAULT_TENANT_PASSWORD_CONFIGURATION, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, LOGIN_FAILURE_POLICY_PAUSE, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_TENANT_ID, RANKED_DESCENDING_HASHING_ALGORITHS, STATUS_COMPLETE, STATUS_INCOMPLETE, TOKEN_TYPE_IAM_PORTAL_USER, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import { generateRandomToken, getDomainFromEmail } from "@/utils/dao-utils";
import AuthDao from "../dao/auth-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import JwtServiceUtils from "./jwt-service-utils";
import IdentityService from "./identity-service";

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();

class AuthenticateUserService extends IdentityService {

    constructor(oidcContext: OIDCContext) {
        super(oidcContext);
    }


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
    public async authenticateHandleUserNameInput(email: string, tenantId: string | null, preAuthToken: string | null, returnToUri: string | null): Promise<UserAuthenticationStateResponse> {        

        // 1.   If the user is coming from a 3rd party site for authentication
        if(preAuthToken){
            return this.authenticateExternalUserNameHandler(email, preAuthToken);
        }
        // Otherwise they are trying to log directly into the IAM portal itself.
        else{
            return this.authenticatePortalUserNameHandler(email, tenantId, returnToUri);
            
        }        
    }

    public async authenticateHandleForgotPassword(authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        // Outline of the logic
        // There must be an existing authentication session (that is, the user has selected a tenant and gone to the next page where they have tried to enter
        // their password and have likely failed). 
        // 1.   Is the user on the correct stage of authentication? (that is, entering their password)
        // 2.   Does the user exist and is the user enabled? (Note that the user might be locked due to too many failed logins)
        // 3.      

        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.EnterPassword);
        if(index < 0){
            response.authenticationError.errorCode = "ERROR_INVALID_AUTHENTICATION_STATE";
            return Promise.resolve(response);
        }
        const user: User | null = await identityDao.getUserBy("id", arrUserAuthenticationStates[0].userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_USER_ID";
            return Promise.resolve(response);
        }
        if(user.markForDelete || user.enabled === false){
            response.authenticationError.errorCode = "ERROR_USER_CANNOT_BE_AUTHENTICATED";
            return Promise.resolve(response);
        }

        // Need to delete the earlier authentication records and replace them
        // with a new set.
        // The first element will be the validation of the reset token sent to their email
        const newArrayAuthenticationState: Array<AuthenticationState> = [];
        newArrayAuthenticationState.push(AuthenticationState.ValidatePasswordResetToken);
        // Now grab all of the remaining steps except for the very last one and add
        // them
        for(let i = 1; i < arrUserAuthenticationStates.length - 1; i++){
            newArrayAuthenticationState.push(arrUserAuthenticationStates[i].authenticationState);
        }
        // Now we need to add the actual password reset action
        newArrayAuthenticationState.push(AuthenticationState.RotatePassword);
        // Finally, put the last one on the list
        newArrayAuthenticationState.push(arrUserAuthenticationStates[arrUserAuthenticationStates.length - 1].authenticationState);
        
        const token: string = generateRandomToken(8, "hex").toUpperCase();        
        // TODO
        // Send email to the user with the token value.
        await identityDao.savePasswordResetToken(arrUserAuthenticationStates[0].userId, token);

        for(let i = 0; i < arrUserAuthenticationStates.length; i++){
            await identityDao.deleteUserAuthenticationState(arrUserAuthenticationStates[i]);
        }

        const arr: Array<UserAuthenticationState> = [];
        const expiresAt: number = Date.now() + (60 * 30 * 1000);
        for(let i = 0; i < newArrayAuthenticationState.length; i++){
            arr.push({
                authenticationSessionToken: authenticationSessionToken,
                authenticationState: newArrayAuthenticationState[i],
                authenticationStateOrder: i + 1,
                authenticationStateStatus: STATUS_INCOMPLETE,
                expiresAtMs: expiresAt,
                tenantId: arrUserAuthenticationStates[0].tenantId,
                userId: arrUserAuthenticationStates[0].userId,
                preAuthToken: arrUserAuthenticationStates[0].preAuthToken,
                returnToUri: arrUserAuthenticationStates[0].returnToUri,

            });
        }
        await identityDao.createUserAuthenticationStates(arr);
        response.userAuthenticationState = arr[0];
        return response;
    }

    public async authenticateValidatePasswordResetToken(token: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.ValidatePasswordResetToken);
        if(index < 0){
            response.authenticationError.errorCode = "ERROR_INVALID_AUTHENTICATION_STATE";
            return Promise.resolve(response);
        }
        
        const user: User | null = await identityDao.getUserByPasswordResetToken(token);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_RESET_TOKEN";
            return Promise.resolve(response);
        }
        // Make sure we delete the reset token before continuing...
        await identityDao.deletePasswordResetToken(token);
        if(user.markForDelete || user.enabled === false){
            response.authenticationError.errorCode = "ERROR_USER_CANNOT_BE_AUTHENTICATED";
            return Promise.resolve(response);
        }
        arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
        response.userAuthenticationState = arrUserAuthenticationStates[index + 1];
        return response;

    }


    /**
     * 
     * @param email 
     * @param preAuthToken 
     * @returns 
     */
    protected async authenticateExternalUserNameHandler(email: string, preAuthToken: string): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", "", preAuthToken);

        const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);
        if(!preAuthenticationState){
            response.authenticationError.errorCode = "ERROR_INVALID_PRE_AUTH_TOKEN";
            return response;
        }
        const domain: string = getDomainFromEmail(email);
        const tenant: Tenant | null = await tenantDao.getTenantById(preAuthenticationState.tenantId);
        if(tenant === null){
            response.authenticationError.errorCode = "ERROR_INVALID_TENANT_FOR_PRE_AUTH_TOKEN";
            return response;
        }
        const federatedOidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        let providerTenantRels: Array<FederatedOidcProviderTenantRel> = [];
        if(federatedOidcProvider !== null){            
            providerTenantRels = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(preAuthenticationState.tenantId, federatedOidcProvider.federatedOIDCProviderId);
            
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

        response.userAuthenticationState.tenantId = preAuthenticationState.tenantId;
        // 1.   There is a provider, and regardless of whether the user exists, send the the user to the provider
        //      for authentication.
        if(federatedOidcProvider !== null){
            response.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
            const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email.toLowerCase(), user ? user.userId : null, federatedOidcProvider, tenant.tenantId, preAuthenticationState);
            if(hasError){
                throw new GraphQLError(errorMessage);
            }
            response.uri = authorizationEndpoint;
        }
        // 2.   There is no provider, so we either need to register the user if they do not exist, or
        //      authenticate with username/password + other MFA types.
        else {
            if(user === null){
                response.userAuthenticationState.authenticationState = AuthenticationState.Register;                
                response.uri = `/authorize/register?${QUERY_PARAM_TENANT_ID}=${preAuthenticationState.tenantId}&username=${email.toLowerCase()}`;
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
                const passwordConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(preAuthenticationState.tenantId);
                
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
                // Finally, once all the user verification steps have been completed, do we need
                // to rotate the password before we send the user back to the 3rd party app?
                if(passwordConfig && this.requirePasswordRotation(userCredential, passwordConfig)){
                    stateOrder.push(AuthenticationState.RotatePassword);
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
                        tenantId: preAuthenticationState.tenantId,
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

    protected async authenticatePortalUserNameHandler(email: string, tenantId: string | null, returnToUri: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", tenantId || "", null);
                
        const domain: string = getDomainFromEmail(email);
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
        const d = managementDomains.find(
            (v: TenantManagementDomainRel) => v.domain === domain
        );
        if(!d){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoManagementDomain;
            return response;
        }
        
        // Obtain the basic information for deciding on error conditions or the next steps
        const user: User | null = await identityDao.getUserBy("email", email);

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
        
        // 4.   Error condition #4. The user is disabled, marked for delete, or locked
        if(user && (user.enabled === false || user.locked === true || user.markForDelete === true)){
            response.authenticationError.errorCode = "ERROR_USER_ACCOUNT_STATUS_NOT_VALID_FOR_AUTHENTICATION";
            return response;
        }

        // Find all of the providers attached to any of the tenants
        const tenantsThatAreAttachedToProviders = tenants.filter(
            (t: Tenant) => {
                const rel = providerTenantRels.find(
                    (f: FederatedOidcProviderTenantRel) => f.tenantId === t.tenantId
                )
                return rel !== undefined;
            }
        );

        // 3.   Error condition #3: No user, there IS a federated IdP, but the IdP is not attached
        //      to any of the tenants that the domain can manage
        if(user === null && federatedOidcProvider !== null && tenantsThatAreAttachedToProviders.length === 0){            
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return response;
        }

        const tenantsThatAllowPasswordLogin: Array<Tenant> = tenants.filter(
            (t: Tenant) => t.federatedAuthenticationConstraint !== FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE
        );
        //  4.   Error condition # 3: User exists, there is NO IdP for the user, and none of the tenants allows
        //       username/password authentication
        if(user !== null && federatedOidcProvider === null && tenantsThatAllowPasswordLogin.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorExclusiveTenantAndNoFederatedOidcProvider;
            return response;
        }

        //  5.   Error condition #5: User exists, there is an IdP for the user, but the IdP is not attached
        //       to any tenant that has the user's domain for management
        if(user !== null && federatedOidcProvider !== null && tenantsThatAreAttachedToProviders.length === 0){            
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return response;
        }
        

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
                
        // 2.   The user can select the tenant by which they want to do SSO and thereby "autoregister"
        //      or just "autoregister" if there is exactly one tenant
        if(federatedOidcProvider !== null && tenantsThatAreAttachedToProviders.length > 0){            
            // Otherwise, set the tenant information and then decide what the next steps are.
            
            response.availableTenants = [];
                tenantsThatAreAttachedToProviders.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                ));
            if(tenantsThatAreAttachedToProviders.length === 1){
                response.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
                
                const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email, user ? user.userId : null, federatedOidcProvider, tenantsThatAreAttachedToProviders[0].tenantId, null);
                if(hasError){
                    throw new GraphQLError(errorMessage);
                }
                response.uri = authorizationEndpoint;
                return response;
            }            
            else {
                response.userAuthenticationState.authenticationState = AuthenticationState.SelectTenant;                
            }
            return response;            
        }
        
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
                // Finally, once all the user verification steps have been completed, do we need
                // to rotate the password before we send the user back to the 3rd party app?                
                if(passwordConfig && this.requirePasswordRotation(userCredential, passwordConfig)){
                    stateOrder.push(AuthenticationState.RotatePassword);
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
                        userId: user.userId,
                        returnToUri: returnToUri
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

        const valid: boolean = this.validateUserCredentials(userCredential, password);
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
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RotatePassword){
            const passwordConfig = await this.determineTenantPasswordConfig(nextUserAuthenticationState.userId, nextUserAuthenticationState.tenantId);
            response.passwordConfig = passwordConfig;
        }
                
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, arrUserAuthenticationStates, response);
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

        // Need to validate the password format and find the hashing algorithm for the new password
        const tenantPasswordConfig: TenantPasswordConfig = await this.determineTenantPasswordConfig(userId, arrUserAuthenticationStates[0].tenantId);
        const isValidPassword: boolean = await this.checkPassword(newPassword, tenantPasswordConfig);
        if(!isValidPassword){
            response.authenticationError.errorCode = "ERROR_PASSWORD_DOES_NOT_MEET_REQUIRED_FORMAT";
            return response;
        }
        // Need to validate the password has not been used within the last N password changes,
        // where N = the password configuration history period. 
        const historyPeriod: number | null = tenantPasswordConfig.passwordHistoryPeriod || null;        
        if(historyPeriod){
            const maxIndex: number = historyPeriod < arrUserCredentials.length ? historyPeriod : arrUserCredentials.length;
            let passwordHasBeenUsed: boolean = false;
            // If this password is valid based on ANY of the previously used passwords, then error.
            for(let i = 0; i < maxIndex; i++){
                const b: boolean = this.validateUserCredentials(arrUserCredentials[i], newPassword);
                if(b){
                    passwordHasBeenUsed = true;
                    break;
                }
            }
            if(passwordHasBeenUsed){
                response.userAuthenticationState.authenticationState = AuthenticationState.Error;
                response.authenticationError.errorCode = "ERROR_PASSWORD_HAS_BEEN_PREVIOUSLY_USED_WITHIN_THE_PASSWORD_HISTORY_PERIOD";
                return response;
            }
        }

        const cred: UserCredential = this.generateUserCredential(userId, newPassword, tenantPasswordConfig.passwordHashingAlgorithm);
        await identityDao.addUserCredential(cred);

        arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
        
        const nextUserAuthenticationState = arrUserAuthenticationStates[index + 1];
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, arrUserAuthenticationStates, response);
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
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RotatePassword){
            const passwordConfig = await this.determineTenantPasswordConfig(nextUserAuthenticationState.userId, nextUserAuthenticationState.tenantId);
            response.passwordConfig = passwordConfig;
        }
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, arrUserAuthenticationStates, response);
        }
        else{
            response.userAuthenticationState = nextUserAuthenticationState;
        }
        return response;
    }

    public async authenticateConfigureTOTP(userId: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse>{
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.ConfigureTotp);
        if(index < 0){
            return Promise.resolve(response);
        }
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_USER_ID";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }
        
        // This will be the generation of the totp token for validation in the next step.
        try{
            const totpResponse: TotpResponse = await this.createTOTP(userId);
            response.userAuthenticationState = arrUserAuthenticationStates[index + 1];
            response.totpSecret = totpResponse.userMFARel.totpSecret;
            response.uri = totpResponse.uri;
            
            arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
        }
        catch(err){
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            response.authenticationError.errorCode = "ERROR_CREATING_TOTP"
        }  
        return response;
    }

    public async authenticateValidateSecurityKey(userId: string, authenticationSessionToken: string, fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.ValidateSecurityKey);
        if(index < 0){
            return Promise.resolve(response);
        }
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_USER_ID";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }
        let isValid: boolean = false;
        try{
            isValid = await this.authenticateFIDO2Key(userId, fido2KeyAuthenticationInput);
        }
        catch(err: any){
            response.authenticationError.errorCode = err.message
            return response;
        }
        if(!isValid){
            response.authenticationError.errorCode = "ERROR_INVALID_SECURITY_KEY_INPUT";
            return response;
        }
        // Update the authentication state values;
        arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
        await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);

        const nextUserAuthenticationState = arrUserAuthenticationStates[index + 1];
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RotatePassword){
            const passwordConfig = await this.determineTenantPasswordConfig(nextUserAuthenticationState.userId, nextUserAuthenticationState.tenantId);
            response.passwordConfig = passwordConfig;
        }
        if(nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication || nextUserAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
            await this.handleAuthenticationCompletion(user, nextUserAuthenticationState, arrUserAuthenticationStates, response);
        }
        else{
            response.userAuthenticationState = nextUserAuthenticationState;
        }
        return response;

    }

    public async authenticateRegisterSecurityKey(userId: string, authenticationSessionToken: string, fido2KeyRegistrationInput: Fido2KeyRegistrationInput, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.ConfigureSecurityKey);
        if(index < 0){
            return Promise.resolve(response);
        }
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_USER_ID";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }

         try{
            await this.registerFIDO2Key(userId, fido2KeyRegistrationInput);
            arrUserAuthenticationStates[index].authenticationStateStatus = STATUS_COMPLETE;
            await identityDao.updateUserAuthenticationState(arrUserAuthenticationStates[index]);
            response.userAuthenticationState = arrUserAuthenticationStates[index + 1];
        }
        catch(err: any){
            response.authenticationError.errorCode = "ERROR_VALIDATING_SECURITY_KEY_REGISTRATION_INPUT";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
        }
        return response;
    }

    public async authenticateWithSocialOIDCProvider(preAuthToken: string | null, tenantId: string, federatedOIDCProviderId: string): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", "", preAuthToken);
        const oidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(federatedOIDCProviderId);
        if(oidcProvider === null){
            response.authenticationError.errorCode = "ERROR_INVALID_OIDC_PROVIDER";
            return response;
        }
        if(oidcProvider.federatedOIDCProviderType !== FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL){
            response.authenticationError.errorCode = "ERROR_NOT_A_VALID_SOCIAL_OIDC_PROVIDER";
            return response;
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(tenant === null){
            response.authenticationError.errorCode = "ERROR_INVALID_TENANT";
            return response;
        }

        const rels: Array<FederatedOidcProviderTenantRel> = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(tenantId, federatedOIDCProviderId);
        if(rels.length === 0){
            response.authenticationError.errorCode = "ERROR_SOCIAL_PROVIDER_NOT_ASSIGNED_TO_TENANT";
            return response;
        }

        const preAuthenticationState: PreAuthenticationState | null = preAuthToken ? await authDao.getPreAuthenticationState(preAuthToken) : null;
                
        const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(null, null, oidcProvider, tenantId, preAuthenticationState);
        if(hasError){
            response.authenticationError.errorCode = errorMessage;
            return response;
        }

        response.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
        response.uri = authorizationEndpoint;
        return response;
    }

    public async cancelAuthentication(userId: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationState = await identityDao.getUserAuthenticationStates(authenticationSessionToken);
        for(let i = 0; i < arrUserAuthenticationState.length; i++){
            identityDao.deleteUserAuthenticationState(arrUserAuthenticationState[i]);
        }
        if(preAuthToken){
            const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);
            if(preAuthenticationState){                
                const redirectUri = `${preAuthenticationState.redirectUri}?error=${OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED}&error_description=ERROR_USER_CANCELLED_REGISTRATION`;
                response.userAuthenticationState.authenticationState = AuthenticationState.RedirectBackToApplication;
                response.uri = redirectUri;
                await authDao.deletePreAuthenticationState(preAuthToken);
            }  
        }
        else{
            response.userAuthenticationState.authenticationState = AuthenticationState.RedirectToIamPortal;
            response.uri = `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`;
        }
        return response;
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
            uri: null,
            passwordConfig: null
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
    protected async handleAuthenticationCompletion(user: User, userAuthenticationState: UserAuthenticationState, arrUserAuthenticationStates: Array<UserAuthenticationState>, response: UserAuthenticationStateResponse): Promise<void> {
        // If the user was locked from a previous failed login attempt, then unlock the user
        if(user.locked){
            user.locked = false;
            await identityDao.updateUser(user);
        }
        if(userAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication){
            try {
                const authorizationCode: AuthorizationReturnUri = await this.generateAuthorizationCode(userAuthenticationState.userId, userAuthenticationState.preAuthToken || "");
                response.userAuthenticationState = userAuthenticationState;
                response.uri = authorizationCode.uri;
                userAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;
                //await identityDao.updateUserAuthenticationState(userAuthenticationState);
                // If all is successful, we can delete all of the state records tied to this authentication attempt
                for(let i = 0; i < arrUserAuthenticationStates.length; i++){
                    await identityDao.deleteUserAuthenticationState(arrUserAuthenticationStates[i]);
                }
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
                    const accessToken: string | null = await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, this.getPortalAuthenTokenTTLSeconds(), TOKEN_TYPE_IAM_PORTAL_USER);
                    if(accessToken === null){
                        response.authenticationError.errorCode = "ERROR_GENERATING_ACCESS_TOKEN_AUTHENTICATION_COMPLETION";
                        response.userAuthenticationState.authenticationState = AuthenticationState.Error;
                    }
                    else{
                        response.userAuthenticationState = userAuthenticationState;
                        response.uri = userAuthenticationState.returnToUri ? userAuthenticationState.returnToUri : `/${userAuthenticationState.tenantId}`;
                        response.accessToken = accessToken;
                        response.tokenExpiresAtMs = Date.now() + (this.getPortalAuthenTokenTTLSeconds() * 1000);
                        userAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;
                        //await identityDao.updateUserAuthenticationState(userAuthenticationState);
                        // If all is successful, we can delete all of the state records tied to this authentication attempt
                        for(let i = 0; i < arrUserAuthenticationStates.length; i++){
                            await identityDao.deleteUserAuthenticationState(arrUserAuthenticationStates[i]);
                        }
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
            /*
                in milliseconds, we want the distance between now and the time that the user last created a password.
                if this exceeds the number of milliseconds for the password rotation period, then return true.
            */
            const datePasswordLastChanged: Date = new Date(userCredential.dateCreated);
            const now: number = Date.now();
            const timeDiffSinceLastPasswordChangeInMs: number = now - datePasswordLastChanged.getTime();
            const timeDiffForRotationInMs = tenantPasswordConfig.passwordRotationPeriodDays * 24 * 60 * 60 * 1000;
            
            if(timeDiffSinceLastPasswordChangeInMs > timeDiffForRotationInMs){
                bRetVal = true;
            }
        }
        return bRetVal;
    }    

}

export default AuthenticateUserService