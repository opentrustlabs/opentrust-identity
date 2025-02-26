import ClientService from "@/lib/service/client-service";
import TenantService from "@/lib/service/tenant-service";
import { Resolvers, QueryResolvers, MutationResolvers, Tenant, Client, SigningKey, Scope, AuthenticationGroup, AuthorizationGroup, FederatedOidcProvider, ContactInput, Contact, LoginUserNameHandlerResponse, LoginUserNameHandlerAction, LoginAuthenticationHandlerResponse, LoginAuthenticationHandlerAction, SecondFactorType, PortalUserProfile, User, LoginFailurePolicy, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import SigningKeysService from "@/lib/service/keys-service";
import ScopeService from "@/lib/service/scope-service";
import GroupService from "@/lib/service/group-service";
import AuthenticationGroupService from "@/lib/service/authentication-group-service";
import FederatedOIDCProviderService from "@/lib/service/federated-oidc-provider-service";
import { NAME_ORDER_WESTERN, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, SCOPE_USE_APPLICATION_MANAGEMENT, SIGNING_KEY_STATUS_ACTIVE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import SearchService from "@/lib/service/search-service";
import { GraphQLError } from "graphql";


const resolvers: Resolvers = {
    Query: {
        me: (_, __, oidcContext) => {
            const profile: PortalUserProfile = {
                domain: "charter.net",
                email: "dhayek@charter.net",
                emailVerified: true,
                enabled: true,
                firstName: "David",
                lastName: "Hayek",
                locked: false,
                nameOrder: NAME_ORDER_WESTERN,
                scope: [{
                    scopeId: "id",
                    scopeName: "all",
                    scopeDescription: "",
                    scopeUse: ""
                }],
                tenantId: "8256c1db-cd40-48d1-914f-71672b4d42fa",
                tenantName: "First Tenant",
                userId: "8256c1db-cd40-48d1-914f-71672b4d42fa",
                countryCode: "US",
                preferredLanguageCode: "en",
                managementAccessTenantId: "ad3e45b1-3e62-4fe2-ba59-530d35ae93d5"
            }
            // home depot: 2a303f6d-0ebc-4590-9d12-7ebab6531d7e
            // root tenant: ad3e45b1-3e62-4fe2-ba59-530d35ae93d5
            // airbnb: c42c29cb-1bf7-4f6a-905e-5f74760218e2
            return profile;
        },
        getUserById: (_, { userId }, oidcContext) => {
            const user: User = {
                domain: "charter.net",
                email: "alessandro.barbero@charter.net",
                emailVerified: true,
                enabled: true,
                firstName: "Alessandro",
                lastName: "Barbero",
                locked: false,
                nameOrder: NAME_ORDER_WESTERN,
                userId: "23478928374982734",
                address: "118 Via Milano",
                countryCode: "IT",
                preferredLanguageCode: "it",
                federatedOIDCProviderSubjectId: "",
                middleName: "Ricardo",
                twoFactorAuthType: "NONE"
            }
            return user;
        },
        search: (_, { searchInput }, oidcContenxt) => {
            const searchService: SearchService = new SearchService(oidcContenxt);
            return searchService.search(searchInput);
        },
        getRootTenant: (_, __, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getRootTenant();
        },
        getTenants: (_, __, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getTenants();
        },
        getTenantById: (_: any, { tenantId }, oidcContext: any ) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getTenantById(tenantId);
        },
        getTenantMetaData: (_: any, { tenantId }, oidcContext: any ) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getTenantMetaData(tenantId);
        },
        getClients: (_, { tenantId }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            return clientService.getClients(tenantId || undefined);
        },        
        getClientById: (_: any, { clientId }, oidcContext: any) => {
            const clientService: ClientService = new ClientService(oidcContext);
            return clientService.getClientById(clientId);
        },
        getSigningKeys: (_: any, { tenantId }, oidcContext: any) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            return keysService.getSigningKeys(tenantId || undefined);
        },
        getSigningKeyById: (_: any, { signingKeyId }, oidcContext: any) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            return keysService.getSigningKeyById(signingKeyId);
        },
        getScope: (_: any, __: any, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.getScope();
        },
        getScopeById: (_: any, { scopeId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.getScopeById(scopeId);
        },
        getAuthenticationGroups: (_: any, __: any, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            return authenticationGroupService.getAuthenticationGroups();
        },
        getAuthenticationGroupById: (_: any, { authenticationGroupId }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            return authenticationGroupService.getAuthenticationGroupById(authenticationGroupId);
        },
        getAuthorizationGroups: (_: any, __: any, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            return groupService.getGroups();
        },
        getAuthorizationGroupById: (_: any, { groupId }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            return groupService.getGroupById(groupId);
        },
        getFederatedOIDCProviders: (_: any, { tenantId }, oidcContext) => {
            const providerService: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return providerService.getFederatedOIDCProviders(tenantId || undefined);
        },
        getFederatedOIDCProviderById: (_: any, { federatedOIDCProviderId }, oidcContext) => {
            const providerService: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return providerService.getFederatedOIDCProviderById(federatedOIDCProviderId);
        },
        getLoginUserNameHandler: (_: any, { username, tenantId, preauthToken }, oidcContext) => {
            const response: LoginUserNameHandlerResponse = {
                action: LoginUserNameHandlerAction.EnterPassword,
                oidcRedirectActionHandlerConfig: {
                    clientId: "12343218723894",
                    redirectUri: "http://localhost:3000/authorize/oidc/redirect",
                    responseMode: "query",
                    responseType: "code",
                    state: "928374839029817341234",
                    codeChallenge: "",
                    codeChallengeMethod: "",
                    scope: "email id profile offline"
                },
                errorActionHandler: {
                    errorCode: "403",
                    errorMessage: "This is an error message. You do not have access to this client or tenant."
                    
                }
            }
            return response;
            //(username: String!, tenantId: String, preauthToken: String): LoginUserNameHandlerResponse!
        },
        getRateLimitServiceGroups: (_:any, { tenantId }, oidcContenxt) => {
            return [];
        },
        getTenantPasswordConfig: (_: any, { tenantId }, oidcContenxt) => {
            const tenantService: TenantService = new TenantService(oidcContenxt);
            return tenantService.getTenantPasswordConfig(tenantId);
        }
    },
    Mutation: {
        createRootTenant: async(_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
                claimsSupported: tenantInput.claimsSupported,
                enabled: true,
                tenantId: "",
                allowUnlimitedRate: tenantInput.allowUnlimitedRate,
                tenantName: tenantInput.tenantName,
                tenantDescription: tenantInput.tenantDescription ?? "",
                allowUserSelfRegistration: tenantInput.allowUserSelfRegistration,
                verifyEmailOnSelfRegistration: tenantInput.verifyEmailOnSelfRegistration,
                federatedAuthenticationConstraint: tenantInput.federatedAuthenticationConstraint,
                markForDelete: false,
                tenantType: TENANT_TYPE_ROOT_TENANT,
                allowSocialLogin: false,
                allowAnonymousUsers: false,
                migrateLegacyUsers: false,
                allowLoginByPhoneNumber: false,
                allowForgotPassword: false
            };
            await tenantService.createRootTenant(tenant);
            const contacts: Array<Contact> = tenantInput.contactInput.map((i: ContactInput) => { return {email: i.email, name: i.name, objectid: tenant.tenantId, objecttype:""}});
            await tenantService.assignContactsToTenant(tenant.tenantId, contacts);            
            return tenant;
        },
        updateRootTenant: async(_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
                tenantId: tenantInput.tenantId,
                claimsSupported: tenantInput.claimsSupported,
                enabled: tenantInput.enabled,
                tenantName: tenantInput.tenantName,
                allowUnlimitedRate: tenantInput.allowUnlimitedRate,
                tenantDescription: tenantInput.tenantDescription,
                allowUserSelfRegistration: tenantInput.allowUserSelfRegistration,
                verifyEmailOnSelfRegistration: tenantInput.verifyEmailOnSelfRegistration,
                federatedAuthenticationConstraint: tenantInput.federatedAuthenticationConstraint,
                markForDelete: tenantInput.markForDelete,
                tenantType: TENANT_TYPE_ROOT_TENANT,
                allowSocialLogin: false,
                allowAnonymousUsers: false,
                migrateLegacyUsers: false,
                allowLoginByPhoneNumber: false,
                allowForgotPassword: false
            }
            await tenantService.updateRootTenant(tenant);
            const contacts: Array<Contact> = tenantInput.contactInput.map((i: ContactInput) => { return {email: i.email, name: i.name, objectid: tenant.tenantId, objecttype:""}});
            await tenantService.assignContactsToTenant(tenant.tenantId, contacts);            
            return tenant;
        },
        createTenant: async (_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
                claimsSupported: tenantInput.claimsSupported,
                enabled: true,
                tenantId: "",
                allowUnlimitedRate: tenantInput.allowUnlimitedRate,
                tenantName: tenantInput.tenantName,
                tenantDescription: tenantInput.tenantDescription ?? "",
                allowUserSelfRegistration: tenantInput.allowUserSelfRegistration,
                verifyEmailOnSelfRegistration: tenantInput.verifyEmailOnSelfRegistration,
                federatedAuthenticationConstraint: tenantInput.federatedAuthenticationConstraint,
                markForDelete: false,
                tenantType: tenantInput.tenantType,
                allowSocialLogin: tenantInput.allowSocialLogin,
                allowAnonymousUsers: tenantInput.allowAnonymousUsers,
                migrateLegacyUsers: tenantInput.migrateLegacyUsers,
                allowLoginByPhoneNumber: tenantInput.allowLoginByPhoneNumber,
                allowForgotPassword: tenantInput.allowForgotPassword,
                defaultRateLimit: tenantInput.defaultRateLimit,
                defaultRateLimitPeriodMinutes: tenantInput.defaultRateLimitPeriodMinutes
            }
            await tenantService.createTenant(tenant);
            const contacts: Array<Contact> = tenantInput.contactInput.map((i: ContactInput) => { return {email: i.email, name: i.name, objectid: tenant.tenantId, objecttype:""}});
            await tenantService.assignContactsToTenant(tenant.tenantId, contacts);            
            return tenant; 
        },
        updateTenant: async (_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
                tenantId: tenantInput.tenantId,
                claimsSupported: tenantInput.claimsSupported,
                enabled: tenantInput.enabled,
                tenantName: tenantInput.tenantName,
                allowUnlimitedRate: tenantInput.allowUnlimitedRate,
                tenantDescription: tenantInput.tenantDescription,
                allowUserSelfRegistration: tenantInput.allowUserSelfRegistration,
                verifyEmailOnSelfRegistration: tenantInput.verifyEmailOnSelfRegistration,
                federatedAuthenticationConstraint: tenantInput.federatedAuthenticationConstraint,
                markForDelete: tenantInput.markForDelete,
                tenantType: tenantInput.tenantType,
                allowSocialLogin: tenantInput.allowSocialLogin,
                allowAnonymousUsers: tenantInput.allowAnonymousUsers,
                migrateLegacyUsers: tenantInput.migrateLegacyUsers,
                allowLoginByPhoneNumber: tenantInput.allowLoginByPhoneNumber,
                allowForgotPassword: tenantInput.allowForgotPassword,
                defaultRateLimit: tenantInput.defaultRateLimit,
                defaultRateLimitPeriodMinutes: tenantInput.defaultRateLimitPeriodMinutes
            }
            const updatedTenant: Tenant = await tenantService.updateTenant(tenant);
            const contacts: Array<Contact> = tenantInput.contactInput.map((i: ContactInput) => { return {email: i.email, name: i.name, objectid: tenant.tenantId, objecttype:""}});
            await tenantService.assignContactsToTenant(tenant.tenantId, contacts);            
            return updatedTenant;
        },
        deleteTenant: async (_: any, { tenantId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            await tenantService.deleteTenant(tenantId);
            return tenantId;
        },
        createClient: async (_: any, { clientInput }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            let client: Client = {
                clientId: "",
                clientSecret: "",
                clientName: clientInput.clientName,
                clientDescription: clientInput.clientDescription,
                tenantId: clientInput.tenantId,
                redirectUris: clientInput.redirectUris,
                enabled: true,
                oidcEnabled: clientInput.oidcEnabled ?? true,
                pkceEnabled: clientInput.pkceEnabled ?? true,
                clientType: clientInput.clientType,
                userTokenTTLSeconds: clientInput.userTokenTTLSeconds || 0,
                maxRefreshTokenCount: clientInput.maxRefreshTokenCount,
                clientTokenTTLSeconds: clientInput.clientTokenTTLSeconds,
                clienttypeid: ""
            }
            await clientService.createClient(client);
            const contacts: Array<Contact> = clientInput.contactInput.map((i: ContactInput) => { return {email: i.email, name: i.name, objectid: client.clientId, objecttype:""}});
            await clientService.assignContactsToClient(client.clientId, contacts);
            return client;
        },
        updateClient: async (_: any, { clientInput }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            let client: Client = {
                clientId: clientInput.clientId,
                clientSecret: "",
                clientName: clientInput.clientName,
                clientDescription: clientInput.clientDescription,
                tenantId: clientInput.tenantId,
                redirectUris: clientInput.redirectUris,
                enabled: clientInput.enabled,
                oidcEnabled: clientInput.oidcEnabled ?? true,
                pkceEnabled: clientInput.pkceEnabled ?? true,
                clientType: clientInput.clientType,
                userTokenTTLSeconds: clientInput.userTokenTTLSeconds || 0,
                maxRefreshTokenCount: clientInput.maxRefreshTokenCount,
                clientTokenTTLSeconds: clientInput.clientTokenTTLSeconds,
                clienttypeid: ""
            }
            await clientService.updateClient(client);
            const contacts: Array<Contact> = clientInput.contactInput.map((i: ContactInput) => { return {email: i.email, name: i.name, objectid: client.clientId, objecttype:""}});
            await clientService.assignContactsToClient(client.clientId, contacts);
            return client;
        },
        deleteClient: async(_: any, { clientId }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            await clientService.deleteClient(clientId);
            return clientId;
        },
        createSigningKey: async(_: any, { keyInput }, oidcContext) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            const key: SigningKey = {
                keyType: keyInput.keyType,
                tenantId: keyInput.tenantId,
                keyUse: keyInput.keyUse,
                keyName: keyInput.keyName,
                keyId: "",
                certificate: keyInput.certificate,
                privateKeyPkcs8: keyInput.privateKeyPkcs8,
                password: keyInput.password,
                expiresAtMs: keyInput.expiresAtMs ? keyInput.expiresAtMs : Date.now() + (120 * 24 * 60 * 60 * 1000), // TODO - derive from the certificate's expiration
                status: SIGNING_KEY_STATUS_ACTIVE,
                keyTypeId: "",
                publicKey: keyInput.publicKey,
                statusId: ""
            };
            await keysService.createSigningKey(key);
            return key;
        },
        deleteSigningKey: async(_: any, { keyId }, oidcContext) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            await keysService.deleteSigningKey(keyId);
            return keyId;
        },
        createScope: async(_: any, { scopeInput }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const scope: Scope = {
                scopeId: "",
                scopeName: scopeInput.scopeName,
                scopeDescription: scopeInput.scopeDescription,
                scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT
            };
            await scopeService.createScope(scope);
            return scope;
        },
        updateScope: async(_: any, { scopeInput }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const scope: Scope = {
                scopeId: scopeInput.scopeId,
                scopeName: scopeInput.scopeName,
                scopeDescription: scopeInput.scopeDescription,
                scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT
            };
            await scopeService.updateScope(scope);
            return scope;
        },
        deleteScope: async(_: any, { scopeId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.deleteScope(scopeId);
            return scopeId;
        },
        assignScopeToTenant: async(_: any, { scopeId, tenantId, accessRuleId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const rel = await scopeService.assignScopeToTenant(tenantId, scopeId, accessRuleId || null);
            return rel;
        },
        removeScopeFromTenant: async(_: any, { scopeId, tenantId }, oidcContext ) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.removeScopeFromTenant(tenantId, scopeId);
            return scopeId;
        },
        assignScopeToClient: async(_: any, { scopeId, clientId, tenantId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const rel = await scopeService.assignScopeToClient(tenantId, clientId, scopeId);
            return rel;
        },
        removeScopeFromClient: async(_: any, { scopeId, tenantId, clientId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.removeScopeFromClient(tenantId, clientId, scopeId);
            return scopeId;
        },
        createAuthenticationGroup: async(_: any, { authenticationGroupInput }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            const authenticationGroup: AuthenticationGroup = {
                authenticationGroupId: "",
                authenticationGroupName: authenticationGroupInput.authenticationGroupName,
                authenticationGroupDescription: authenticationGroupInput.authenticationGroupDescription,
                tenantId: authenticationGroupInput.tenantId,
                defaultGroup: authenticationGroupInput.defaultGroup
            }
            await authenticationGroupService.createAuthenticationGroup(authenticationGroup);
            return authenticationGroup;
        },
        updateAuthenticationGroup: async(_: any, { authenticationGroupInput }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            const authenticationGroup: AuthenticationGroup = {
                authenticationGroupId: authenticationGroupInput.authenticationGroupId,
                authenticationGroupName: authenticationGroupInput.authenticationGroupName,
                authenticationGroupDescription: authenticationGroupInput.authenticationGroupDescription,
                tenantId: authenticationGroupInput.tenantId,
                defaultGroup: authenticationGroupInput.defaultGroup
            }
            await authenticationGroupService.updateAuthenticationGroup(authenticationGroup);
            return authenticationGroupInput;
        },
        deleteAuthenticationGroup: async(_: any, { authenticationGroupId }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            await authenticationGroupService.deleteAuthenticationGroup(authenticationGroupId);
            return authenticationGroupId;
        },
        assignAuthenticationGroupToClient: async(_: any, { authenticationGroupId, clientId }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            const res = await authenticationGroupService.assignAuthenticationGroupToClient(authenticationGroupId, clientId);
            return res;
        },
        removeAuthenticationGroupFromClient: async(_: any, { authenticationGroupId, clientId }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            await authenticationGroupService.removeAuthenticationGroupFromClient(authenticationGroupId, clientId);
            return authenticationGroupId;
        },
        createAuthorizationGroup: async(_: any, { groupInput }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            const group: AuthorizationGroup = {
                default: groupInput.default,
                groupId: "",
                groupName: groupInput.groupName,
                tenantId: groupInput.tenantId,
                groupDescription: groupInput.groupDescription
            };
            await groupService.createGroup(group);
            return group;
        },
        updateAuthorizationGroup: async(_: any, { groupInput }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            const group: AuthorizationGroup = {
                default: groupInput.default,
                groupId: groupInput.groupId,
                groupName: groupInput.groupName,
                tenantId: groupInput.tenantId,
                groupDescription: groupInput.groupDescription
            };
            await groupService.updateGroup(group);
            return group;
        },
        deleteAuthorizationGroup: async(_: any, { groupId }, oidcContext ) => {
            const groupService: GroupService = new GroupService(oidcContext);
            await groupService.deleteGroup(groupId);
            return groupId;
        },
        addUserToAuthorizationGroup: async(_: any, { groupId, userId }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            const res = await groupService.addUserToGroup(userId, groupId);
            return res;
        },
        removeUserFromAuthorizationGroup: async(_: any, { groupId, userId }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            await groupService.removeUserFromGroup(userId, groupId);
            return userId;
        },
        createFederatedOIDCProvider: async(_: any, { oidcProviderInput }, oidcContext) => {
            const oidcProvider: FederatedOidcProvider = {
                federatedOIDCProviderClientId: oidcProviderInput.federatedOIDCProviderClientId,
                federatedOIDCProviderId: "", // to be assigned by the service class
                federatedOIDCProviderName: oidcProviderInput.federatedOIDCProviderName,
                federatedOIDCProviderWellKnownUri: oidcProviderInput.federatedOIDCProviderWellKnownUri,
                refreshTokenAllowed: oidcProviderInput.refreshTokenAllowed,
                usePkce: oidcProviderInput.usePkce,
                clientAuthType: oidcProviderInput.clientAuthType || OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
                federatedOIDCProviderClientSecret: oidcProviderInput.federatedOIDCProviderClientSecret,
                federatedOIDCProviderDescription: oidcProviderInput.federatedOIDCProviderDescription,
                federatedOIDCProviderTenantId: oidcProviderInput.federatedOIDCProviderTenantId,
                scopes: [],
                federatedOIDCProviderType: oidcProviderInput.federatedOIDCProviderType
            };
            const providerService: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            await providerService.createFederatedOIDCProvider(oidcProvider);
            return oidcProvider;
        },
        updateFederatedOIDCProvider: async(_: any, { oidcProviderInput }, oidcContext) => {
            const oidcProvider: FederatedOidcProvider = {
                federatedOIDCProviderClientId: oidcProviderInput.federatedOIDCProviderClientId,
                federatedOIDCProviderId: oidcProviderInput.federatedOIDCProviderId,
                federatedOIDCProviderName: oidcProviderInput.federatedOIDCProviderName,
                federatedOIDCProviderWellKnownUri: oidcProviderInput.federatedOIDCProviderWellKnownUri,
                refreshTokenAllowed: oidcProviderInput.refreshTokenAllowed,
                usePkce: oidcProviderInput.usePkce,
                clientAuthType: oidcProviderInput.clientAuthType || OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
                federatedOIDCProviderClientSecret: oidcProviderInput.federatedOIDCProviderClientSecret,
                federatedOIDCProviderDescription: oidcProviderInput.federatedOIDCProviderDescription,
                federatedOIDCProviderTenantId: oidcProviderInput.federatedOIDCProviderTenantId,
                scopes: [],
                federatedOIDCProviderType: oidcProviderInput.federatedOIDCProviderType
            };
            const providerService: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            await providerService.updateFederatedOIDCProvider(oidcProvider);
            return oidcProvider;
        },
        deleteFederatedOIDCProvider: async(_: any, { federatedOIDCProviderId }, oidcContext) => {
            const providerService: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            await providerService.deleteFederatedOIDCProvider(federatedOIDCProviderId);
            return federatedOIDCProviderId;
        },
        login: async(_: any, { username, password }, oidcContext ) => {
            const response: LoginAuthenticationHandlerResponse = {
                status: LoginAuthenticationHandlerAction.Error,
                successConfig: {
                    code: "123412341234",
                    redirectUri: "http://localhost:3000/not/avalid/uri",
                    responseMode: "fragment",
                    state: "347820198273401987324"
                },
                secondFactorType: SecondFactorType.Totp,
                errorActionHandler: {
                    errorCode: "error code",
                    errorMessage: "Authentication failed"
                }
            }
            return response;
        },
        updateLoginFailurePolicy: async(_: any, { loginFailurePolicyInput }, oidcContext) => {
            const loginFailurePolicy: LoginFailurePolicy = {
                failureThreshold: loginFailurePolicyInput.failureThreshold,
                loginFailurePolicyType: loginFailurePolicyInput.loginFailurePolicyType,
                tenantId: loginFailurePolicyInput.tenantId,
                initBackoffDurationMinutes: loginFailurePolicyInput.initBackoffDurationMinutes || 0,
                numberOfBackoffCyclesBeforeLocking: loginFailurePolicyInput.numberOfBackoffCyclesBeforeLocking || 0,
                numberOfPauseCyclesBeforeLocking: loginFailurePolicyInput.numberOfPauseCyclesBeforeLocking || 0,
                pauseDurationMinutes: loginFailurePolicyInput.pauseDurationMinutes || 0
            }            
            // TODO 
            // Implement the DAO and Service interfaces for assigning login failure policies.
            return loginFailurePolicy;
        },
        setTenantPasswordConfig: async(_: any, { passwordConfigInput }, oidcContenxt) => {
            //const tenantService: TenantService = new TenantService(oidcContenxt);
            // TODO
            // Implement the service and DAO classes
            const tenantPasswordConfig: TenantPasswordConfig = {
                allowMfa: passwordConfigInput.allowMfa,
                passwordHashingAlgorithm: passwordConfigInput.passwordHashingAlgorithm,
                passwordMaxLength: passwordConfigInput.passwordMaxLength,
                passwordMinLength: passwordConfigInput.passwordMinLength,
                requireLowerCase: passwordConfigInput.requireLowerCase,
                requireMfa: passwordConfigInput.requireMfa,
                requireNumbers: passwordConfigInput.requireNumbers,
                requireSpecialCharacters: passwordConfigInput.requireSpecialCharacters,
                requireUpperCase: passwordConfigInput.requireUpperCase,
                tenantId: passwordConfigInput.tenantId,
                maxRepeatingCharacterLength: passwordConfigInput.maxRepeatingCharacterLength,
                mfaTypesAllowed: passwordConfigInput.mfaTypesAllowed,
                mfaTypesRequired: passwordConfigInput.mfaTypesRequired,
                passwordHistoryPeriod: passwordConfigInput.passwordHistoryPeriod,
                passwordRotationPeriodDays: passwordConfigInput.passwordRotationPeriodDays,
                specialCharactersAllowed: passwordConfigInput.specialCharactersAllowed
            }
            //await tenantService.assignPasswordConfigToTenant(passwordConfigInput.tenantId, tenantPasswordConfig);
            return tenantPasswordConfig;
        }
    }
}

export default resolvers;