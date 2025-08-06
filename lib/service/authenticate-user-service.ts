import { OIDCContext } from "@/graphql/graphql-context";
import IdentityDao from "../dao/identity-dao";
import { Tenant, TenantPasswordConfig, User, UserCredential, UserMfaRel, TenantManagementDomainRel, FederatedOidcProvider, FederatedOidcProviderTenantRel, PreAuthenticationState, AuthorizationReturnUri, UserAuthenticationStateResponse, AuthenticationState, AuthenticationErrorTypes, UserAuthenticationState, UserFailedLogin, TenantLoginFailurePolicy, Fido2KeyAuthenticationInput, Fido2KeyRegistrationInput, TotpResponse, UserTermsAndConditionsAccepted, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, AuthenticationGroup, AuthorizationDeviceCodeData, DeviceCodeAuthorizationStatus } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { DEFAULT_LOGIN_FAILURE_POLICY, DEFAULT_LOGIN_PAUSE_TIME_MINUTES, DEFAULT_MAXIMUM_LOGIN_FAILURES, DEFAULT_PASSWORD_HISTORY_PERIOD, DEFAULT_TENANT_PASSWORD_CONFIGURATION, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, LOGIN_FAILURE_POLICY_PAUSE, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_DEVICE_CODE_ID, QUERY_PARAM_TENANT_ID, RANKED_DESCENDING_HASHING_ALGORITHS, STATUS_COMPLETE, STATUS_INCOMPLETE, PRINCIPAL_TYPE_IAM_PORTAL_USER, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import { generateHash, generateRandomToken, getDomainFromEmail } from "@/utils/dao-utils";
import AuthDao from "../dao/auth-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import JwtServiceUtils from "./jwt-service-utils";
import IdentityService from "./identity-service";
import OIDCServiceUtils from "./oidc-service-utils";
import { randomUUID } from "node:crypto";
import { LegacyUserProfile } from "../models/principal";
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import { SecurityEventType } from "../models/security-event";


const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const authenticationGroupDao: AuthenticationGroupDao = DaoFactory.getInstance().getAuthenticationGroupDao();

const {
    SECURITY_EVENT_CALLBACK_URI
} = process.env;

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
    public async authenticateHandleUserNameInput(email: string, tenantId: string | null, preAuthToken: string | null, returnToUri: string | null, deviceCodeId: string | null): Promise<UserAuthenticationStateResponse> {        

        // 1.   If the user is coming from a 3rd party site for authentication
        if(preAuthToken || deviceCodeId){
            return this.authenticateExternalUserNameHandler(email, preAuthToken, deviceCodeId);
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

    public async authenticateAcceptTermsAndConditions(accepted: boolean, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        if(accepted === false){
            response.authenticationError.errorCode = "ERROR_REQUIRED_TERMS_AND_CONDITIONS_NOT_ACCEPTED";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }
        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.AcceptTermsAndConditions);
        if(index < 0){
            response.authenticationError.errorCode = "ERROR_INVALID_AUTHENTICATION_STATE";
            return Promise.resolve(response);
        }
        const user: User | null = await identityDao.getUserBy("id", arrUserAuthenticationStates[index].userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_INVALID_USER_ID";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return response;
        }

        const userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted = {
            acceptedAtMs: Date.now(),
            tenantId: arrUserAuthenticationStates[index].tenantId,
            userId: arrUserAuthenticationStates[index].userId
        }
        await identityDao.addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted);

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

    public async authenticateHandleUserCodeInput(userCode: string): Promise<UserAuthenticationStateResponse> {
        
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", "", "");
        const hashedUserCode = generateHash(userCode);
        const deviceCodeData: AuthorizationDeviceCodeData | null = await authDao.getAuthorizationDeviceCodeData(hashedUserCode, "usercode");
        if(deviceCodeData === null){
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            response.authenticationError.errorCode = "ERROR_INVALID_USER_CODE_FOR_DEVICE_CODE_NOT_FOUND";
            return response;
        }
        if(deviceCodeData.expiresAtMs < Date.now()){
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            response.authenticationError.errorCode = "ERROR_DEVICE_CODE_HAS_EXPIRED";
            return response;
        }
        if(deviceCodeData.authorizationStatus === DeviceCodeAuthorizationStatus.Cancelled || deviceCodeData.authorizationStatus === DeviceCodeAuthorizationStatus.Approved){
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            response.authenticationError.errorCode = "ERROR_DEVICE_CODE_HAS_BEEN_FINALIZED";
            return response;
        }
        // Note that we cannot save the authentiation states until we know who the user is. 
        // But we DO KNOW who the tenant is. So we just return the next authn state, which will be to
        // enter the user name, along with any other data that is useful.
        const nextAuthenticationState: UserAuthenticationState = {
            authenticationSessionToken: "",
            authenticationState: AuthenticationState.EnterEmail,
            authenticationStateOrder: 0,
            authenticationStateStatus: STATUS_INCOMPLETE,
            expiresAtMs: 0,
            tenantId: deviceCodeData.tenantId,
            userId: "",
            deviceCodeId: deviceCodeData.deviceCodeId
        }
        response.userAuthenticationState = nextAuthenticationState;
        return response;
    }

    /**
     * 
     * @param email 
     * @param preAuthToken 
     * @returns 
     */
    protected async authenticateExternalUserNameHandler(email: string, preAuthToken: string | null, deviceCodeId: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", "", preAuthToken);

        let preAuthenticationState: PreAuthenticationState | null = null;
        if(preAuthToken){
            preAuthenticationState = await authDao.getPreAuthenticationState(preAuthToken);
        }
        let deviceCodeData: AuthorizationDeviceCodeData | null = null;
        if(deviceCodeId){
            deviceCodeData = await authDao.getAuthorizationDeviceCodeData(deviceCodeId, "devicecodeid");
        }
        
        // 1.   Error. No preauthentication data or device code data is found, so no way to check the tenant, client, user, etc.
        if(preAuthenticationState === null && deviceCodeData === null){
            response.authenticationError.errorCode = "ERROR_INVALID_PRE_AUTH_TOKEN_OR_DEVICE_CODE";
            return response;
        }
        
        const domain: string = getDomainFromEmail(email);
        const tenantId = preAuthenticationState? preAuthenticationState.tenantId : deviceCodeData ? deviceCodeData.tenantId : ""; 
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);

        // 2.   Error. No tenant found
        if(tenant === null){
            response.authenticationError.errorCode = "ERROR_INVALID_TENANT_FOR_PRE_AUTH_TOKEN";
            return response;
        }
        const federatedOidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        
        // 3.   Error. There is no federated provider, and the tenant exclusively uses federated OIDC provider for authentication
        if(federatedOidcProvider === null && tenant.federatedAuthenticationConstraint === FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE){
            response.authenticationError.errorCode = "ERROR_USER_REGISTRATION_IS_NOT_PERMITTED_FOR_THIS_TENANT";
            return response;
        }

        // 4.   Error. If the tenant only allows certain domain to authenticate users, and this user is not
        //      among them.
        const arrRestrictedDomains: Array<TenantRestrictedAuthenticationDomainRel> = await tenantDao.getDomainsForTenantRestrictedAuthentication(tenant.tenantId);
        if(arrRestrictedDomains.length > 0){
            const belongsToRestrictedDomain = arrRestrictedDomains.find(
                (d: TenantRestrictedAuthenticationDomainRel) => d.domain === domain
            );
            if(!belongsToRestrictedDomain){
                response.authenticationError.errorCode = "ERROR_USER_AUTHENTICATION_IS_NOT_PERMITTED_FOR_THIS_TENANT";
                return response;
            }
        }

        const user: User | null = await identityDao.getUserBy("email", email.toLowerCase());
        // 5.   Error. If the user exists but is not in a state where they can be authenticated.
        if(user && (user.enabled === false || user.locked === true || user.markForDelete === true)){
            response.authenticationError.errorCode = "ERROR_USER_ACCOUNT_STATUS_NOT_VALID_FOR_AUTHENTICATION";
            return response;
        }
        
        
        // 6.   Possible Error. If the user exists, but does not belong to a suitable authentication group.
        // 
        //      Mitigating circumstances: If the user is null and the tenant allows for self registration or migration
        //      then register or migrate the user completely, including any MFA types that are required.
        //      At the end of registration or authentication throw an error saying the user has no access if there
        //      is no default authn group.
        if(user !== null){            
            let hasDefaultAuthnGroup: boolean = false;
            const clientId = preAuthenticationState ? preAuthenticationState.clientId : deviceCodeData ? deviceCodeData.clientId : "";
            const clientAuthnGroups: Array<AuthenticationGroup> = await authenticationGroupDao.getAuthenticationGroups(undefined, clientId, undefined);
            for(let i = 0; i < clientAuthnGroups.length; i++){
                if(clientAuthnGroups[i].defaultGroup === true){
                    hasDefaultAuthnGroup = true;
                    break;
                }
            }
            if(!hasDefaultAuthnGroup){
                const userAuthnGroups: Array<AuthenticationGroup> = await authenticationGroupDao.getAuthenticationGroups(undefined, undefined, user.userId);
                const matchingGroup = userAuthnGroups.find(
                    (userAuthnGroup: AuthenticationGroup) => {
                        const a = clientAuthnGroups.find(
                            (clientAuthnGroup: AuthenticationGroup) => userAuthnGroup.authenticationGroupId === clientAuthnGroup.authenticationGroupId
                        );
                        return a;
                    }
                );
                if(matchingGroup === undefined){
                    response.authenticationError.errorCode = "ERROR_USER_DOES_NOT_BELONG_TO_VALID_AUTHENTICATION_GROUP_FOR_CLIENT";
                    return response;
                }
            }
        }


        // 7.   Error. If user does not exist (either in the local data store or in a legacy system), there is no provider, 
        //      and the tenant does not allow self-registration
        //      Need to check if there is a legacy system configured, and if so, is the user 
        //      in that system?
        let canMigrateUser: boolean = false;
        if(user === null){
            let tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig | null = null;
            if(tenant.migrateLegacyUsers === true){
                tenantLegacyUserMigrationConfig = await tenantDao.getLegacyUserMigrationConfiguration(tenant.tenantId);
                if(tenantLegacyUserMigrationConfig && tenantLegacyUserMigrationConfig.usernameCheckUri && tenantLegacyUserMigrationConfig.authenticationUri && tenantLegacyUserMigrationConfig.userProfileUri){
                    const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                    const userExistsInLegacySystem = await oidcServiceUtils.legacyUsernameCheck(tenantLegacyUserMigrationConfig.usernameCheckUri, email.toLowerCase(), authToken || "");
                    if(userExistsInLegacySystem){
                        canMigrateUser = true;
                    }
                }
            }
        }
        if(user === null && !canMigrateUser && federatedOidcProvider === null && tenant.allowUserSelfRegistration === false){
            response.authenticationError.errorCode = "ERROR_USER_REGISTRATION_IS_NOT_PERMITTED_FOR_THIS_TENANT";
            return response;
        }
        
        // At this point we know that the tenant exists and allows either a external OIDC provider,
        // or allows the user to login with a username/password, or allows the user to register
        // or there is a legacy user that needs to be migrated.
        response.userAuthenticationState.tenantId = tenantId;
        
        // 8.   Success. There is a provider, and regardless of whether the user exists, send the the user to the provider
        //      for authentication. The user will be created automatically through this process (if successful)
        if(federatedOidcProvider !== null){
            response.userAuthenticationState.authenticationState = AuthenticationState.AuthWithFederatedOidc;
            const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email.toLowerCase(), user ? user.userId : null, federatedOidcProvider, tenant.tenantId, preAuthenticationState);
            if(hasError){
                throw new GraphQLError(errorMessage);
            }
            response.uri = authorizationEndpoint;
        }

        // 9.   There is no provider, so we either need to register the user if they do not exist, or
        //      authenticate with username/password + other MFA types, or migrate from legacy system
        else {
            if(user === null && !canMigrateUser){                
                response.userAuthenticationState.authenticationState = AuthenticationState.Register;                
                response.uri = `/authorize/register?${QUERY_PARAM_TENANT_ID}=${tenantId}&username=${email.toLowerCase()}`;
                if(deviceCodeId && deviceCodeData){
                    response.uri = response.uri + `&${QUERY_PARAM_DEVICE_CODE_ID}=${deviceCodeId}`
                }
                return response;
                
            }
            let userCredential: UserCredential | null = null;
            if(user !== null){
                userCredential = await identityDao.getUserCredentialForAuthentication(user.userId);
                if(!userCredential){
                    response.authenticationError.errorCode = "ERROR_NO_CREDENTIALS_FOUND_FOR_USER";
                    return response;
                }
            }
            const stateOrder: Array<AuthenticationState> = [];
            if(user !== null){
                stateOrder.push(AuthenticationState.EnterPassword);
            }
            else{
                stateOrder.push(AuthenticationState.EnterPasswordAndMigrateUser);
            }
            const passwordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;
            
            let requiredMfaTypes: Array<string> = [];
            if(passwordConfig && passwordConfig.requireMfa){
                requiredMfaTypes = passwordConfig.mfaTypesRequired?.split(",") || [];
            }
            
            let arrUserMfaConfig: Array<UserMfaRel> = [];
            if(user){
                arrUserMfaConfig = await identityDao.getUserMFARels(user.userId);
            }
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
            if(!canMigrateUser && userCredential && this.requirePasswordRotation(userCredential, passwordConfig)){
                stateOrder.push(AuthenticationState.RotatePassword);
            }
            if(preAuthToken){
                stateOrder.push(AuthenticationState.RedirectBackToApplication);
            }
            else if(deviceCodeId){
                stateOrder.push(AuthenticationState.RedirectToIamPortal);
            }

            // Finally, send a security event message to a web hook if configured. This may be modfied
            // in the during authentication if a user enters a duress password (if allowed).
            // This should ALWAYS be the last entry and should never be exposed to any client.
            if(SECURITY_EVENT_CALLBACK_URI){
                if(preAuthToken){
                    stateOrder.push(AuthenticationState.PostAuthnStateSendSecurityEventSuccessLogon);
                }
                else if(deviceCodeId){
                    stateOrder.push(AuthenticationState.PostAuthnStateSendSecurityEventDeviceRegistered);
                }
            }

            const arrUserAuthenticationStates: Array<UserAuthenticationState> = [];
            const authenticationSessionToken: string = generateRandomToken(20, "hex");
            // authentication completion will expire after 60 minutes. 
            const expiresAt: number = Date.now() + (60 * 60 * 1000);
            
            // In case we need to migrate the user from a legacy system, we can just
            // create a placeholder userid now which will be used to fill in the 
            // data later after they successfully authenticate in the next step.
            const userId: string = user ? user.userId : randomUUID().toString();
            if(user === null && canMigrateUser){
                const u: User = {
                    domain: domain,
                    email: email.toLowerCase(),
                    emailVerified: false,
                    enabled: false,
                    firstName: "",
                    lastName: "",
                    locked: true,
                    markForDelete: true,                        
                    nameOrder: "",
                    userId: userId
                }
                await identityDao.createUser(u);
            }

            for(let i = 0; i < stateOrder.length; i++){
                const uas: UserAuthenticationState = {
                    authenticationSessionToken: authenticationSessionToken,
                    authenticationState: stateOrder[i],
                    authenticationStateOrder: i + 1,
                    authenticationStateStatus: STATUS_INCOMPLETE,
                    expiresAtMs: expiresAt,
                    tenantId: tenantId,
                    userId: userId,
                    deviceCodeId: deviceCodeId
                }
                arrUserAuthenticationStates.push(uas);
            }
            await identityDao.createUserAuthenticationStates(arrUserAuthenticationStates);
            response.userAuthenticationState = arrUserAuthenticationStates[0];
        }
        return response;           
    }

    /**
     * 
     * @param email 
     * @param tenantId 
     * @param returnToUri 
     * @returns 
     */
    protected async authenticatePortalUserNameHandler(email: string, tenantId: string | null, returnToUri: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse("", tenantId || "", null);
                
        const domain: string = getDomainFromEmail(email);
        const federatedOidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        const managementDomains: Array<TenantManagementDomainRel> = await tenantDao.getDomainTenantManagementRels(tenantId || undefined, domain);
        
        // 1.   Error condition #1: No domains for management of a tenant
        if(!managementDomains || managementDomains.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoManagementDomain;
            return response;
        }        

        const user: User | null = await identityDao.getUserBy("email", email);
        
        // 2.   Error condition #2. The user is disabled, marked for delete, or locked
        if(user && (user.enabled === false || user.locked === true || user.markForDelete === true)){
            response.authenticationError.errorCode = "ERROR_USER_ACCOUNT_STATUS_NOT_VALID_FOR_AUTHENTICATION";
            return response;
        }

        const tenants: Array<Tenant> = tenantId ? 
                                        await tenantDao.getTenants([tenantId]) :
                                        await tenantDao.getTenants(managementDomains.map( (d: TenantManagementDomainRel) => d.tenantId));
        
        const tenantsThatAllowSelfRegistration = tenants.filter(
            (t: Tenant) => t.allowUserSelfRegistration === true
        );

        const tenantsThatAllowPasswordLogin: Array<Tenant> = tenants.filter(
            (t: Tenant) => t.federatedAuthenticationConstraint !== FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE
        );

        const tenantsThatAllowFederatedOIDCLogin: Array<Tenant> = tenants.filter(
            (t: Tenant) => t.federatedAuthenticationConstraint === FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE || t.federatedAuthenticationConstraint === FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE
        )

        //  3.   Error condition #3: There is NO external IdP for the user, and none of the tenants allows
        //       username/password authentication or allows self-registration. This is regardless if the user exists.
        if(federatedOidcProvider === null && tenantsThatAllowPasswordLogin.length === 0 && tenantsThatAllowSelfRegistration.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorExclusiveTenantAndNoFederatedOidcProvider;
            return response;
        }

        // 4.   If there is an external IdP for the user, but none of the tenants allows it.
        if(federatedOidcProvider !== null && tenantsThatAllowFederatedOIDCLogin.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingFederatedProviderForTenant;
            return response;
        }
        
        // 5.   Success case #1: The user can do SSO and thereby "autoregister" event if they do not exist currently in the system
        if(federatedOidcProvider !== null){
            response.availableTenants = [];
            tenantsThatAllowFederatedOIDCLogin.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                )
            );  
            response.userAuthenticationState.authenticationState = tenantsThatAllowFederatedOIDCLogin.length === 1 ? AuthenticationState.AuthWithFederatedOidc : AuthenticationState.SelectTenant;
            if(tenantsThatAllowFederatedOIDCLogin.length === 1){
                const {hasError, errorMessage, authorizationEndpoint} = await this.createFederatedOIDCRequestProperties(email, user ? user.userId : null, federatedOidcProvider, tenants[0].tenantId, null);
                if(hasError){
                    throw new GraphQLError(errorMessage);
                }
                response.uri = authorizationEndpoint;
            }
            return response;
        }
        
        // Need to check if there is a legacy system configured, and if so, is the user 
        // in that system?
        // At this point we know that there is NOT a federated oidc provider, so the user
        // MUST login with a username/password, which they can do by either registering
        // or being migrated from a legacy IdP. If the user is null, we will prefer to migrate from an existing        
        // legacy IdP if one exists, followed by registration if allowed. 
        let canMigrateUser: boolean = false;
        const migrationFriendlyTenants: Array<Tenant> = [];
        if(user === null){
            const checkedTenantIds: Array<string> = tenantsThatAllowPasswordLogin.map((t: Tenant) => t.tenantId);
            for(let i = 0; i < tenantsThatAllowPasswordLogin.length; i++){
                const tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig | null = await tenantDao.getLegacyUserMigrationConfiguration(tenantsThatAllowPasswordLogin[i].tenantId);
                if(tenantLegacyUserMigrationConfig && tenantLegacyUserMigrationConfig.usernameCheckUri && tenantLegacyUserMigrationConfig.authenticationUri && tenantLegacyUserMigrationConfig.userProfileUri){
                    const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                    const userExistsInLegacySystem = await oidcServiceUtils.legacyUsernameCheck(tenantLegacyUserMigrationConfig.usernameCheckUri, email.toLowerCase(), authToken || "");
                    if(userExistsInLegacySystem){
                        migrationFriendlyTenants.push(tenantsThatAllowPasswordLogin[i]);
                    }
                }
            }
            
            for(let i = 0; i < tenantsThatAllowSelfRegistration.length; i++){
                if(checkedTenantIds.includes(tenantsThatAllowSelfRegistration[i].tenantId)){
                    continue;
                }
                const tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig | null = await tenantDao.getLegacyUserMigrationConfiguration(tenantsThatAllowSelfRegistration[i].tenantId);
                if(tenantLegacyUserMigrationConfig && tenantLegacyUserMigrationConfig.usernameCheckUri && tenantLegacyUserMigrationConfig.authenticationUri && tenantLegacyUserMigrationConfig.userProfileUri){
                    const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                    const userExistsInLegacySystem = await oidcServiceUtils.legacyUsernameCheck(tenantLegacyUserMigrationConfig.usernameCheckUri, email.toLowerCase(), authToken || "");
                    if(userExistsInLegacySystem){
                        migrationFriendlyTenants.push(tenantsThatAllowPasswordLogin[i]);
                    }
                }
            }
        }
        
        // 6.   Error condition: There is no user, the cannot be migrated from a legacy system, and none of
        //      the tenants allows for self-registration
        canMigrateUser = migrationFriendlyTenants.length > 0;
        if(user === null && !canMigrateUser && tenantsThatAllowSelfRegistration.length === 0){
            response.authenticationError.errorCode = AuthenticationErrorTypes.ErrorNoMatchingUserAndNoTenantSelfRegistration;
            return response;
        }

        // 7.   The user can select the tenant and register. In this scenario, there is no
        //      need to create database entries for the user authentication state. Instead
        //      there will be entries created for the user registration state later.    
        if(user === null && !canMigrateUser && tenantsThatAllowSelfRegistration.length > 0){
            response.availableTenants = [];
            tenantsThatAllowSelfRegistration.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, 
                        tenantName: t.tenantName
                    }                    
                )
            ); 
            response.userAuthenticationState.authenticationState = tenantsThatAllowSelfRegistration.length === 1 ? AuthenticationState.Register : AuthenticationState.SelectTenantThenRegister;            
            if(tenantsThatAllowSelfRegistration.length === 1){
                response.uri = `/authorize/register?${QUERY_PARAM_TENANT_ID}=${tenantsThatAllowSelfRegistration[0].tenantId}&username=${email.toLowerCase()}`;                
            }            
            return response;
        }
        
        
        // 8.   The user can select which tenant to log into with username/password (plus
        //      one or more MFA types). In this case, if the tenant list contains exactly 1
        //      tenant, then we need to create the authentication state values in the database
        //      to track the authentication process.
        const tenantsToProcess: Array<Tenant> = canMigrateUser ? migrationFriendlyTenants : tenantsThatAllowPasswordLogin;
        if(tenantsToProcess.length > 0){
            response.availableTenants = [];
            tenantsToProcess.forEach(
                (t: Tenant) => response.availableTenants?.push(
                    {
                        tenantId: t.tenantId, tenantName: t.tenantName
                    }
                )
            )
            if(tenantsToProcess.length === 1){
                const passwordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(tenantsToProcess[0].tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;                
                let userCredential: UserCredential | null = null;
                if(user !== null){
                    userCredential = await identityDao.getUserCredentialForAuthentication(user.userId);
                    if(!userCredential){
                        response.authenticationError.errorCode = "ERROR_NO_CREDENTIALS_FOUND_FOR_USER";
                        return response;
                    }
                }
                let requiredMfaTypes: Array<string> = [];
                if(passwordConfig && passwordConfig.requireMfa){
                    requiredMfaTypes = passwordConfig.mfaTypesRequired?.split(",") || [];
                }
                let arrUserMfaConfig: Array<UserMfaRel> = [];
                if(user){
                    arrUserMfaConfig = await identityDao.getUserMFARels(user.userId);
                }
                const userMfaRelTotp: UserMfaRel | undefined = arrUserMfaConfig.find(
                    (v: UserMfaRel) => v.mfaType === MFA_AUTH_TYPE_TIME_BASED_OTP
                );
                const userMfaRelSecurityKey : UserMfaRel | undefined = arrUserMfaConfig.find(
                    (v: UserMfaRel) => v.mfaType === MFA_AUTH_TYPE_FIDO2
                );

                let userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted | null = null;
                if(user){
                    userTermsAndConditionsAccepted = await identityDao.getUserTermsAndConditionsAccepted(user.userId, tenantsToProcess[0].tenantId);
                }                
                
                // Create the authentication states in order of completion
                const stateOrder: Array<AuthenticationState> = [];
                if(user){
                    stateOrder.push(AuthenticationState.EnterPassword);
                }
                else{
                    stateOrder.push(AuthenticationState.EnterPasswordAndMigrateUser);
                }

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
                // Did the user accept the terms and conditions for this tenant, if required?
                if(userTermsAndConditionsAccepted === null && tenantsToProcess[0].registrationRequireTermsAndConditions === true){
                    stateOrder.push(AuthenticationState.AcceptTermsAndConditions);
                }
                // Finally, once all the user verification steps have been completed, do we need
                // to rotate the password before we send the user back to the 3rd party app?                
                if(userCredential &&  this.requirePasswordRotation(userCredential, passwordConfig)){
                    stateOrder.push(AuthenticationState.RotatePassword);
                }
                stateOrder.push(AuthenticationState.RedirectToIamPortal);

                // Finally, send a security event message to a web hook if configured. This may be modfied
                // in the during authentication if a user enters a duress password (if allowed).
                // This should ALWAYS be the last entry and should never be exposed to any client.
                if(SECURITY_EVENT_CALLBACK_URI){
                    stateOrder.push(AuthenticationState.PostAuthnStateSendSecurityEventSuccessLogon);
                }

                const arrUserAuthenticationStates: Array<UserAuthenticationState> = [];
                const authenticationSessionToken: string = generateRandomToken(20, "hex");
                // authentication completion will expire after 60 minutes. 
                const expiresAt: number = Date.now() + (60 * 60 * 1000);

                // In case we need to migrate the user from a legacy system, we can just
                // create a placeholder userid now which will be used to fill in the 
                // data later after they successfully authenticate in the next step.

                // First, create a temporary user with ID for completion after the user enters their password
                const userId: string = user ? user.userId : randomUUID().toString();
                if(user === null && canMigrateUser){
                    const u: User = {
                        domain: domain,
                        email: email.toLowerCase(),
                        emailVerified: false,
                        enabled: false,
                        firstName: "",
                        lastName: "",
                        locked: true,
                        markForDelete: true,                        
                        nameOrder: "",
                        userId: userId
                    }
                    await identityDao.createUser(u);
                }
                
                for(let i = 0; i < stateOrder.length; i++){
                    const uas: UserAuthenticationState = {
                        authenticationSessionToken: authenticationSessionToken,
                        authenticationState: stateOrder[i],
                        authenticationStateOrder: i + 1,
                        authenticationStateStatus: STATUS_INCOMPLETE,
                        expiresAtMs: expiresAt,
                        tenantId: tenantsToProcess[0].tenantId,
                        userId: userId,
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
        
        // 9.   Final error conditions: There is no mechanism for authenticating or registering the user.
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

        const validationResult = await this.validateAuthenticationAttempt(user, arrUserAuthenticationStates[index].tenantId, password, arrUserAuthenticationStates[index]);
        if(!validationResult.isValid){            
            response.authenticationError.errorCode = validationResult.errorMessage;
            return Promise.resolve(response);
        }
        // If this is a duress logon, and if the last entry in the list of authn states is to send a successful logon message, 
        // delete the old record, update the record and insert it.
        if(validationResult.isDuress){
            const finalUserAuthenticationState = arrUserAuthenticationStates[arrUserAuthenticationStates.length - 1];
            if(
                finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventSuccessLogon ||
                finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventDeviceRegistered
            ){
                await identityDao.deleteUserAuthenticationState(arrUserAuthenticationStates[arrUserAuthenticationStates.length - 1]);
                arrUserAuthenticationStates[arrUserAuthenticationStates.length - 1].authenticationState = AuthenticationState.PostAuthnStateSendSecurityEventDuressLogon;
                await identityDao.createUserAuthenticationStates([arrUserAuthenticationStates[arrUserAuthenticationStates.length - 1]]);
            }
        }

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

    public async authenticateUserAndMigrate(username: string, password: string, tenantId: string, authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, tenantId, preAuthToken);

        const arrUserAuthenticationStates: Array<UserAuthenticationState> = await this.getSortedAuthenticationStates(authenticationSessionToken);
        const index: number = await this.validateAuthenticationStep(arrUserAuthenticationStates, response, AuthenticationState.EnterPasswordAndMigrateUser);
        if(index < 0){
            return Promise.resolve(response);
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(arrUserAuthenticationStates[index].tenantId);
        if(tenant === null){
            response.authenticationError.errorCode = "ERROR_TENANT_NOT_FOUND";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return Promise.resolve(response);
        }

        const user: User | null = await identityDao.getUserBy("id", arrUserAuthenticationStates[index].userId);
        if(user === null){
            response.authenticationError.errorCode = "ERROR_USER_NOT_FOUND";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return Promise.resolve(response);
        }

        const legacyUserMigrationConfiguration: TenantLegacyUserMigrationConfig | null = await tenantDao.getLegacyUserMigrationConfiguration(arrUserAuthenticationStates[index].tenantId);
        if(!legacyUserMigrationConfiguration || !legacyUserMigrationConfiguration.authenticationUri || !legacyUserMigrationConfiguration.userProfileUri){
            response.authenticationError.errorCode = "ERROR_NO_LEGACY_USER_MIGRATION_CONFIGURATION_FOUND";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return Promise.resolve(response);
        }

        const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
        const authnResponse: boolean = await oidcServiceUtils.legacyUserAuthentication(legacyUserMigrationConfiguration.authenticationUri, username, password, authToken || "");
        if(authnResponse === false){
            response.authenticationError.errorCode = "ERROR_INVALID_CREDENTIALS_FOR_USER_MIGRATION";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return Promise.resolve(response);
        }

        const legacyProfile: LegacyUserProfile | null = await oidcServiceUtils.legacyUserProfile(legacyUserMigrationConfiguration.userProfileUri, username, authToken || "");
        if(legacyProfile === null){
            response.authenticationError.errorCode = "ERROR_NO_LEGACY_USER_PROFILE_FOUND";
            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            return Promise.resolve(response);
        }

        user.address = legacyProfile.address;
        user.emailVerified = legacyProfile.emailVerified;
        user.enabled = true;
        user.firstName = legacyProfile.firstName;
        user.lastName = legacyProfile.lastName,
        user.locked = false,
        user.nameOrder = legacyProfile.nameOrder,
        user.address = legacyProfile.address,
        user.addressLine1 = legacyProfile.addressLine1,
        user.city = legacyProfile.city,
        user.postalCode = legacyProfile.postalCode,
        user.stateRegionProvince = legacyProfile.stateRegionProvince,
        user.countryCode = legacyProfile.countryCode,
        user.middleName = legacyProfile.middleName,
        user.phoneNumber = legacyProfile.phoneNumber,
        user.preferredLanguageCode = legacyProfile.preferredLanguageCode,
        user.federatedOIDCProviderSubjectId = "",
        user.markForDelete = false;
        
        const tenantPasswordConfig: TenantPasswordConfig = await tenantDao.getTenantPasswordConfig(arrUserAuthenticationStates[index].tenantId) || DEFAULT_TENANT_PASSWORD_CONFIGURATION;

        await identityDao.updateUser(user);
        await identityDao.assignUserToTenant(arrUserAuthenticationStates[index].tenantId, user.userId, "PRIMARY");
        
        const userCredential: UserCredential = this.generateUserCredential(user.userId, password, tenantPasswordConfig.passwordHashingAlgorithm);
        await identityDao.addUserCredential(userCredential);
        
        await this.updateObjectSearchIndex(tenant, user, "PRIMARY");
        await this.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, user, USER_TENANT_REL_TYPE_PRIMARY);
        
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
        return response;
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
        // If the user configured a duress password, then we need to check this as well.
        const duressUserCredential: UserCredential | null = await identityDao.getUserDuressCredential(userId);
        if(duressUserCredential){
            const b: boolean = this.validateUserCredentials(duressUserCredential, newPassword);
            if(b){
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

        const validationResult = await this.validateAuthenticationAttempt(user, arrUserAuthenticationStates[index].tenantId, totpTokenValue, arrUserAuthenticationStates[index]);        
        if(!validationResult.isValid){
            response.authenticationError.errorCode = validationResult.errorMessage;
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
        let validationResult = null;
        try{
            validationResult = await this.validateAuthenticationAttempt(user, arrUserAuthenticationStates[index].tenantId, fido2KeyAuthenticationInput, arrUserAuthenticationStates[index])
        }
        catch(err: any){
            response.authenticationError.errorCode = err.message
            return response;
        }
        if(!validationResult.isValid){
            response.authenticationError.errorCode = validationResult.errorMessage;
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

    public async cancelAuthentication(authenticationSessionToken: string, preAuthToken: string | null): Promise<UserAuthenticationStateResponse> {
        const response: UserAuthenticationStateResponse = this.initUserAuthenticationStateResponse(authenticationSessionToken, "", preAuthToken);
        const arrUserAuthenticationState = await identityDao.getUserAuthenticationStates(authenticationSessionToken);
        // If this is a device registration, need to set it to the cancelled state;
        let deviceCodeId: string | null = null;
        if(arrUserAuthenticationState.length > 0){
            deviceCodeId= arrUserAuthenticationState[0].deviceCodeId || null;
            if(deviceCodeId){
                const deviceCodeData: AuthorizationDeviceCodeData | null = await authDao.getAuthorizationDeviceCodeData(deviceCodeId, "devicecodeid");
                if(deviceCodeData){
                    deviceCodeData.authorizationStatus = DeviceCodeAuthorizationStatus.Cancelled;
                    await authDao.updateAuthorizationDeviceCodeData(deviceCodeData);
                }
            }
        }
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
            if(deviceCodeId){
                response.uri = `/access-error?access_error_code=00075`;
            }
            else{
               response.uri = `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`;
            }
        }
        return response;
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
     * @param user 
     * @param tenantId 
     * @param authenticationToken 
     * @returns 
     */
    protected async validateAuthenticationAttempt(user: User, tenantId: string, authenticationToken: string | Fido2KeyAuthenticationInput, userAuthenticationState: UserAuthenticationState): Promise<{isValid: boolean, errorMessage: string, isDuress: boolean}>{

        if(user.locked === true){
            return {isValid: false, errorMessage: "ERROR_USER_IS_LOCKED", isDuress: false};
        }
        const userFailedLoginAttempts: Array<UserFailedLogin> = await identityDao.getFailedLogins(user.userId);
        let loginFailurePolicy: TenantLoginFailurePolicy | null = await tenantDao.getLoginFailurePolicy(tenantId);
        if(loginFailurePolicy === null){
            loginFailurePolicy = DEFAULT_LOGIN_FAILURE_POLICY;
        }

        // We will check to see if the user can authenticate based on the number of failures they have previously
        // and if we have a failure policy type of pause and the next login time allowed is at some point in the past.
        if(userFailedLoginAttempts.length > 0 && loginFailurePolicy.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE){
            if(userFailedLoginAttempts[length - 1].nextLoginNotBefore > Date.now()){
                return {isValid: false, errorMessage: "ERROR_AUTHENTICTION_IS_PAUSED_FOR_USER", isDuress: false}
            }
        }

        let valid: boolean = false;
        let errorMessage: string = "";
        let isDuress: boolean = false;
        if(userAuthenticationState.authenticationState === AuthenticationState.EnterPassword){
            const userCredential: UserCredential | null = await identityDao.getUserCredentialForAuthentication(user.userId);
            if(!userCredential){
                return {isValid: false, errorMessage: "ERROR_UNABLE_TO_FIND_CREDENTIALS_FOR_USER", isDuress: false};
            }
            valid = this.validateUserCredentials(userCredential, authenticationToken as string);
            errorMessage = "ERROR_INVALID_CREDENTIALS";
            // Need to check a duress password in this case.
            if(!valid){
                const userDuressCredential: UserCredential | null = await identityDao.getUserDuressCredential(user.userId);
                if(userDuressCredential){
                    valid = this.validateUserCredentials(userDuressCredential, authenticationToken as string);
                    if(valid){
                        isDuress = true;
                        errorMessage = "";
                    }
                }
            }            
        }
        else if(userAuthenticationState.authenticationState === AuthenticationState.ValidateTotp){
            valid = await this.validateTOTP(user.userId, authenticationToken as string);
            errorMessage = "ERROR_TOTP_TOKEN_INVALID";
        }
        else if(userAuthenticationState.authenticationState === AuthenticationState.ValidateSecurityKey){
            valid = await this.authenticateFIDO2Key(user.userId, authenticationToken as Fido2KeyAuthenticationInput);
            errorMessage = "ERROR_INVALID_SECURITY_KEY_INPUT";
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
                const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                oidcServiceUtils.fireSecurityEvent("account_locked", this.oidcContext, user, null, authToken);
            }
            // We can safely delete the previous failed attempts
            if(userFailedLoginAttempts.length > 0){
                for(let i = 0; i < userFailedLoginAttempts.length; i++){
                    identityDao.removeFailedLogin(userFailedLoginAttempts[i].userId, userFailedLoginAttempts[i].failureAtMs);
                }
            }
            return {isValid: false, errorMessage: errorMessage, isDuress: isDuress};
        }
        
        // Otherwise the password is valid and we should remove the failed login attempts
        identityDao.resetFailedLoginAttempts(user.userId);
        
        return {isValid: true, errorMessage: errorMessage, isDuress: isDuress};
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
        if(userAuthenticationState.deviceCodeId){
            const deviceCodeData: AuthorizationDeviceCodeData | null = await authDao.getAuthorizationDeviceCodeData(userAuthenticationState.deviceCodeId, "devicecodeid");
            if(deviceCodeData){
                deviceCodeData.authorizationStatus = DeviceCodeAuthorizationStatus.Approved;
                deviceCodeData.userId = user.userId;
                await authDao.updateAuthorizationDeviceCodeData(deviceCodeData);
            }
        }
        if(userAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication){
            try {
                const authorizationCode: AuthorizationReturnUri = await this.generateAuthorizationCode(userAuthenticationState.userId, userAuthenticationState.preAuthToken || "");
                response.userAuthenticationState = userAuthenticationState;
                response.uri = authorizationCode.uri;
                userAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;                
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
                    let jti: string | null = null;
                    if(userAuthenticationState.deviceCodeId){
                        response.userAuthenticationState = userAuthenticationState;
                        response.uri = "/device/registered";
                    }
                    else{
                        const jwtSigningResponse = await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, this.getPortalAuthenTokenTTLSeconds(), PRINCIPAL_TYPE_IAM_PORTAL_USER);                        
                        if(!jwtSigningResponse || jwtSigningResponse.accessToken === null){
                            response.authenticationError.errorCode = "ERROR_GENERATING_ACCESS_TOKEN_AUTHENTICATION_COMPLETION";
                            response.userAuthenticationState.authenticationState = AuthenticationState.Error;
                        }
                        else {
                            response.userAuthenticationState = userAuthenticationState;
                            response.uri = userAuthenticationState.returnToUri ? userAuthenticationState.returnToUri : `/${userAuthenticationState.tenantId}`;
                            response.accessToken = jwtSigningResponse.accessToken;
                            response.tokenExpiresAtMs = Date.now() + (this.getPortalAuthenTokenTTLSeconds() * 1000);
                            userAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;
                            jti = jwtSigningResponse.principal.jti || null;
                        }
                    }
                    // If the last step in authentication is to send a security event:
                    const finalUserAuthenticationState = arrUserAuthenticationStates[arrUserAuthenticationStates.length - 1];
                    if(
                        finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventSuccessLogon ||
                        finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventDuressLogon ||
                        finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventDeviceRegistered
                    ){
                        finalUserAuthenticationState.authenticationStateStatus = STATUS_COMPLETE;
                        const securityEventType: SecurityEventType = 
                            finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventSuccessLogon
                                ? "successful_authentication" : 
                                finalUserAuthenticationState.authenticationState === AuthenticationState.PostAuthnStateSendSecurityEventDuressLogon ? 
                                "duress_authentication" :
                                "device_registered"
                        const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
                        oidcServiceUtils.fireSecurityEvent(securityEventType, this.oidcContext, user, jti, authToken);
                    }
                }
            }
            catch(err: any){
                response.authenticationError.errorCode = err.message;
                response.userAuthenticationState.authenticationState = AuthenticationState.Error;
            }
        }
        // If all is successful, we can delete all of the state records tied to this authentication attempt
        if(response.userAuthenticationState.authenticationState !== AuthenticationState.Error){
            for(let i = 0; i < arrUserAuthenticationStates.length; i++){
                await identityDao.deleteUserAuthenticationState(arrUserAuthenticationStates[i]);
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

