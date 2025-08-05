import ClientService from "@/lib/service/client-service";
import TenantService from "@/lib/service/tenant-service";
import { Resolvers, QueryResolvers, MutationResolvers, Tenant, Client, SigningKey, Scope, AuthenticationGroup, AuthorizationGroup, FederatedOidcProvider, Contact, User, TenantLoginFailurePolicy, TenantPasswordConfig, TenantLegacyUserMigrationConfig, TenantAnonymousUserConfiguration, TenantLookAndFeel, RateLimitServiceGroup, TenantRateLimitRel, RelSearchResultItem, MarkForDelete } from "@/graphql/generated/graphql-types";
import SigningKeysService from "@/lib/service/keys-service";
import ScopeService from "@/lib/service/scope-service";
import GroupService from "@/lib/service/group-service";
import AuthenticationGroupService from "@/lib/service/authentication-group-service";
import FederatedOIDCProviderService from "@/lib/service/federated-oidc-provider-service";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, SCOPE_USE_APPLICATION_MANAGEMENT, SIGNING_KEY_STATUS_ACTIVE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import SearchService from "@/lib/service/search-service";
import ContactService from "@/lib/service/contact-service";
import IdentityService from "@/lib/service/identity-service";
import RateLimitService from "@/lib/service/rate-limit-service";
import { OIDCContext } from "../graphql-context";
import ViewSecretService from "@/lib/service/view-secret-service";
import MarkForDeleteService from "@/lib/service/mark-for-delete-service";
import I18NService from "@/lib/service/i18n-service";
import RegisterUserService from "@/lib/service/register-user-service";
import AuthenticateUserService from "@/lib/service/authenticate-user-service";
import SecretShareService from "@/lib/service/secret-share-service";


const resolvers: Resolvers = {
    Query: {
        me: (_, __, oidcContext) => {            
            return oidcContext.portalUserProfile;
        },
        getUserById: (_, { userId }, oidcContext) => {
            const identityService: IdentityService = new IdentityService(oidcContext);
            return identityService.getUserById(userId);            
        },
        getUserTenantRels: (_, { userId }, oidcContext) => {
            const identityService: IdentityService = new IdentityService(oidcContext);
            return identityService.getUserTenantRels(userId);
        },
        search: (_, { searchInput }, oidcContext) => {
            const searchService: SearchService = new SearchService(oidcContext);
            return searchService.search(searchInput);            
        },
        lookahead: (_, { term }, oidcContext) => {
            const searchService: SearchService = new SearchService(oidcContext);
            return searchService.lookahead(term);
        },
        relSearch: async (_, { relSearchInput}, oidcContext) => {            
            const searchService: SearchService = new SearchService(oidcContext);
            const res = await searchService.relSearch(relSearchInput);
            return res;
        },
        getRootTenant: (_, __, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getRootTenant();
        },
        getTenants: (_, { tenantIds, federatedOIDCProviderId, scopeId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getTenants(tenantIds || undefined, federatedOIDCProviderId || undefined, scopeId || undefined);
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
        getScope: (_: any, { tenantId, filterBy }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.getScope(tenantId, filterBy);
        },
        getScopeById: (_: any, { scopeId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.getScopeById(scopeId);
        },
        getAuthenticationGroups: (_: any, { tenantId, clientId, userId }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            return authenticationGroupService.getAuthenticationGroups(tenantId || undefined, clientId || undefined, userId || undefined);
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
        getRateLimitServiceGroups: (_:any, { tenantId }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            return service.getRateLimitServiceGroups(tenantId || null);
        },
        getRateLimitServiceGroupById: (_: any, { serviceGroupId }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            return service.getRateLimitServiceGroupById(serviceGroupId);
        },
        getRateLimitTenantRelViews: (_: any, { rateLimitServiceGroupId, tenantId }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            return service.getRateLimitTenantRelViews(rateLimitServiceGroupId || null, tenantId || null);
        },
        getRateLimitTenantRels: (_: any, { tenantId, rateLimitServiceGroupId }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            return service.getRateLimitTenantRel(tenantId || null, rateLimitServiceGroupId || null);
        },
        getTenantPasswordConfig: (_: any, { tenantId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getTenantPasswordConfig(tenantId);
        },
        getLegacyUserMigrationConfiguration: (_: any, { tenantId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getLegacyUserMigrationConfiguration(tenantId);
        },
        getTenantLookAndFeel: (_: any, { tenantId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getTenantLookAndFeel(tenantId);
        },
        getDomainsForTenantManagement: (_: any, { tenantId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getDomainTenantManagementRels(tenantId);
        },
        getDomainsForTenantAuthentication: (_: any, { tenantId }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.getDomainsForTenantRestrictedAuthentication(tenantId);            
        },
        getContacts: (_: any, { objectId }, oidcContext) => {
            const contactService: ContactService = new ContactService(oidcContext);
            return contactService.getContacts(objectId);
        },
        getRedirectURIs: (_: any, { clientId }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            return clientService.getRedirectURIs(clientId);
        },
        getFederatedOIDCProviderDomainRels: (_: any, { federatedOIDCProviderId, domain }, oidcContext) => {
            const service: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return service.getFederatedOIDCProviderDomainRels(federatedOIDCProviderId || null, domain || null);
        },
        getUserAuthorizationGroups: (_: any, { userId }, oidcContext) => {
            const service: GroupService = new GroupService(oidcContext);
            return service.getUserAuthorizationGroups(userId);
        },
        getSecretValue: async (_: any, { objectId, objectType }, oidcContext) => {
            const service: ViewSecretService = new ViewSecretService(oidcContext);
            const val: string | null | undefined = await service.viewSecret(objectId, objectType);
            return val;
        },
        getMarkForDeleteById: (_: any, { markForDeleteId }, oidcContext) => {
            const service: MarkForDeleteService = new MarkForDeleteService(oidcContext);
            return service.getMarkForDeleteById(markForDeleteId);
        },
        getDeletionStatus: (_: any, { markForDeleteId }, oidcContext) => {
            const service: MarkForDeleteService = new MarkForDeleteService(oidcContext);
            return service.getDeletionStatus(markForDeleteId);
        },
        getClientScopes: (_: any, { clientId }, oidcContext) => {
            const service: ScopeService = new ScopeService(oidcContext);
            return service.getClientScopes(clientId);
        },
        getAuthorizationGroupScopes: (_: any, { groupId }, oidcContext) => {
            const service: ScopeService = new ScopeService(oidcContext);
            return service.getAuthorizationGroupScopes(groupId);
        },
        getUserScopes: (_: any, { userId, tenantId }, oidcContext) => {
            const service: ScopeService = new ScopeService(oidcContext);
            return service.getUserScopes(userId, tenantId);
        },
        getUserMFARels: (_: any, { userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            return service.getUserMFARels(userId);            
        },
        getUserSessions: (_: any, { userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            return service.getUserSessions(userId);
        },
        getStateProvinceRegions: (_: any, { countryCode }, oidcContext) => {
            const service: I18NService = new I18NService(oidcContext);
            return service.getStateProvinceRegions(countryCode);
        },
        getTenantLoginFailurePolicy: (_: any, { tenantId }, oidcContext) => {
            const service: TenantService = new TenantService(oidcContext);
            return service.getTenantLoginFailurePolicy(tenantId);
        },
        getCaptchaConfig: (_: any, {}, oidcContext) => {
            const service: TenantService = new TenantService(oidcContext);
            return service.getCaptchaConfig();
        },
        getSystemSettings: (_: any, {}, oidcContext) => {
            const service: TenantService = new TenantService(oidcContext);
            return service.getSystemSettings();
        },
        getRunningJobs: (_: any, {}, oidcContext) => {
            const service: TenantService = new TenantService(oidcContext);
            return service.getJobData();
        }
    },
    Mutation: {
        createRootTenant: async(_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
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
                allowForgotPassword: false,
                registrationRequireCaptcha: false,
                registrationRequireTermsAndConditions: false,
                termsAndConditionsUri: tenantInput.termsAndConditionsUri
            };
            await tenantService.createRootTenant(tenant);          
            return tenant;
        },
        updateRootTenant: async(_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
                tenantId: tenantInput.tenantId,
                enabled: tenantInput.enabled,
                tenantName: tenantInput.tenantName,
                allowUnlimitedRate: tenantInput.allowUnlimitedRate,
                tenantDescription: tenantInput.tenantDescription,
                allowUserSelfRegistration: tenantInput.allowUserSelfRegistration,
                verifyEmailOnSelfRegistration: tenantInput.verifyEmailOnSelfRegistration,
                federatedAuthenticationConstraint: tenantInput.federatedAuthenticationConstraint,
                markForDelete: false,
                tenantType: TENANT_TYPE_ROOT_TENANT,
                allowSocialLogin: false,
                allowAnonymousUsers: false,
                migrateLegacyUsers: false,
                allowLoginByPhoneNumber: false,
                allowForgotPassword: false,
                registrationRequireCaptcha: tenantInput.registrationRequireCaptcha,
                registrationRequireTermsAndConditions: tenantInput.registrationRequireTermsAndConditions,
                termsAndConditionsUri: tenantInput.termsAndConditionsUri
            }
            await tenantService.updateRootTenant(tenant);        
            return tenant;
        },
        createTenant: async (_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
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
                defaultRateLimitPeriodMinutes: tenantInput.allowUnlimitedRate ? null: DEFAULT_RATE_LIMIT_PERIOD_MINUTES,
                registrationRequireCaptcha: tenantInput.registrationRequireCaptcha,
                registrationRequireTermsAndConditions: tenantInput.registrationRequireTermsAndConditions,
                termsAndConditionsUri: tenantInput.termsAndConditionsUri
            }
            await tenantService.createTenant(tenant);         
            return tenant; 
        },
        updateTenant: async (_: any, { tenantInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            let tenant: Tenant = {
                tenantId: tenantInput.tenantId,
                enabled: tenantInput.enabled,
                tenantName: tenantInput.tenantName,
                allowUnlimitedRate: tenantInput.allowUnlimitedRate,
                tenantDescription: tenantInput.tenantDescription,
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
                defaultRateLimit: tenantInput.allowUnlimitedRate ? null : tenantInput.defaultRateLimit,
                defaultRateLimitPeriodMinutes: tenantInput.allowUnlimitedRate ? null: DEFAULT_RATE_LIMIT_PERIOD_MINUTES,
                registrationRequireCaptcha: tenantInput.registrationRequireCaptcha,
                registrationRequireTermsAndConditions: tenantInput.registrationRequireTermsAndConditions,
                termsAndConditionsUri: tenantInput.termsAndConditionsUri
            }
            const updatedTenant: Tenant = await tenantService.updateTenant(tenant);          
            return updatedTenant;
        },
        createClient: async (_: any, { clientInput }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            let client: Client = {
                clientId: "",
                clientSecret: "",
                clientName: clientInput.clientName,
                clientDescription: clientInput.clientDescription,
                tenantId: clientInput.tenantId,
                enabled: true,
                oidcEnabled: clientInput.oidcEnabled ?? true,
                pkceEnabled: clientInput.pkceEnabled ?? true,
                clientType: clientInput.clientType,
                userTokenTTLSeconds: clientInput.userTokenTTLSeconds || 0,
                maxRefreshTokenCount: clientInput.maxRefreshTokenCount,
                clientTokenTTLSeconds: clientInput.clientTokenTTLSeconds,
                clienttypeid: "",
                markForDelete: false
            }
            await clientService.createClient(client);            
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
                enabled: clientInput.enabled,
                oidcEnabled: clientInput.oidcEnabled ?? true,
                pkceEnabled: clientInput.pkceEnabled ?? true,
                clientType: clientInput.clientType,
                userTokenTTLSeconds: clientInput.userTokenTTLSeconds || 0,
                maxRefreshTokenCount: clientInput.maxRefreshTokenCount,
                clientTokenTTLSeconds: clientInput.clientTokenTTLSeconds,
                clienttypeid: "",
                markForDelete: false
            }
            await clientService.updateClient(client);
            return client;
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
                expiresAtMs: keyInput.expiresAtMs ? keyInput.expiresAtMs : Date.now() + (120 * 24 * 60 * 60 * 1000), // see service impl for parsing of certificate value
                status: SIGNING_KEY_STATUS_ACTIVE,
                keyTypeId: "",
                publicKey: keyInput.publicKey,
                statusId: "",
                markForDelete: false,
                createdAtMs: Date.now()
            };
            await keysService.createSigningKey(key);
            return key;
        },
        autoCreateSigningKey: async(_: any, { keyInput }, oidcContext) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            const key: SigningKey = await keysService.autoCreateSigningKey(keyInput);
            return key;
        },
        updateSigningKey: async(_: any, { keyInput }, oidcContext) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            const key: SigningKey = {
                keyType: "",
                tenantId: "",
                keyUse: "",
                keyName: keyInput.keyName || "",
                keyId: keyInput.keyId,
                certificate: "",
                privateKeyPkcs8: "",
                password: "",
                expiresAtMs: 0,
                status: keyInput.status,
                keyTypeId: "",
                publicKey: "",
                statusId: "",
                markForDelete: false,
                createdAtMs: 0
            };
            const updatedKey = await keysService.updateSigningKey(key);
            return updatedKey;
        },
        createScope: async(_: any, { scopeInput }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const scope: Scope = {
                scopeId: "",
                scopeName: scopeInput.scopeName,
                scopeDescription: scopeInput.scopeDescription,
                scopeUse: scopeInput.scopeUse, //SCOPE_USE_APPLICATION_MANAGEMENT,
                markForDelete: false
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
                scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT,
                markForDelete: false
            };
            await scopeService.updateScope(scope);
            return scope;
        },
        assignScopeToTenant: async(_: any, { scopeId, tenantId, accessRuleId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const rel = await scopeService.assignScopeToTenant(tenantId, scopeId, accessRuleId || null);
            return rel;
        },
        bulkAssignScopeToTenant: async(_: any, {tenantId, bulkScopeInput}, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.bulkAssignScopeToTenant(tenantId, bulkScopeInput);
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
        bulkAssignScopeToClient: async(_: any, { clientId, tenantId, bulkScopeInput }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.bulkAssignScopeToClient(tenantId, clientId, bulkScopeInput);
        },
        removeScopeFromClient: async(_: any, { scopeId, tenantId, clientId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.removeScopeFromClient(tenantId, clientId, scopeId);
            return scopeId;
        },
        assignScopeToAuthorizationGroup: async(_: any, { scopeId, tenantId, groupId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);            
            const rel = await scopeService.assignScopeToAuthorizationGroup(groupId, scopeId, tenantId);
            return rel;
        },
        bulkAssignScopeToAuthorizationGroup: async(_: any, { groupId, tenantId, bulkScopeInput }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.bulkAssignScopeToAuthorizationGroup(groupId, tenantId, bulkScopeInput);
        },
        removeScopeFromAuthorizationGroup: async(_: any, { scopeId, tenantId, groupId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.removeScopeFromAuthorizationGroup(groupId, scopeId, tenantId);
            return scopeId;
        },
        assignScopeToUser: async(_: any, { userId, scopeId, tenantId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const rel = await scopeService.assignScopeToUser(userId, tenantId, scopeId);
            return rel;
        },
        bulkAssignScopeToUser: async(_: any, { userId, tenantId, bulkScopeInput }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            return scopeService.bulkAssignScopeToUser(userId, tenantId, bulkScopeInput);
        },
        removeScopeFromUser: async(_: any, { userId, scopeId, tenantId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.removeScopeFromUser(userId, tenantId, scopeId);
            return scopeId;

        },
        createAuthenticationGroup: async(_: any, { authenticationGroupInput }, oidcContext) => {
            const authenticationGroupService: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            const authenticationGroup: AuthenticationGroup = {
                authenticationGroupId: "",
                authenticationGroupName: authenticationGroupInput.authenticationGroupName,
                authenticationGroupDescription: authenticationGroupInput.authenticationGroupDescription,
                tenantId: authenticationGroupInput.tenantId,
                defaultGroup: authenticationGroupInput.defaultGroup,
                markForDelete: false
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
                defaultGroup: authenticationGroupInput.defaultGroup,
                markForDelete: false
            }
            await authenticationGroupService.updateAuthenticationGroup(authenticationGroup);
            return authenticationGroup;
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
                groupDescription: groupInput.groupDescription,
                allowForAnonymousUsers: groupInput.allowForAnonymousUsers,
                markForDelete: false
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
                groupDescription: groupInput.groupDescription,
                allowForAnonymousUsers: groupInput.allowForAnonymousUsers,
                markForDelete: false
            };
            await groupService.updateGroup(group);
            return group;
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
                scopes: oidcProviderInput.scopes,
                federatedOIDCProviderType: oidcProviderInput.federatedOIDCProviderType,
                socialLoginProvider: oidcProviderInput.socialLoginProvider,
                markForDelete: false
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
                scopes: oidcProviderInput.scopes,
                federatedOIDCProviderType: oidcProviderInput.federatedOIDCProviderType,
                socialLoginProvider: oidcProviderInput.socialLoginProvider,
                markForDelete: false
            };
            const providerService: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            await providerService.updateFederatedOIDCProvider(oidcProvider);
            return oidcProvider;
        },
        setTenantLoginFailurePolicy: async(_: any, { tenantLoginFailurePolicyInput }, oidcContext) => {
            const loginFailurePolicy: TenantLoginFailurePolicy = {
                failureThreshold: tenantLoginFailurePolicyInput.failureThreshold,
                loginFailurePolicyType: tenantLoginFailurePolicyInput.loginFailurePolicyType,
                tenantId: tenantLoginFailurePolicyInput.tenantId,
                pauseDurationMinutes: tenantLoginFailurePolicyInput.pauseDurationMinutes,
                maximumLoginFailures: tenantLoginFailurePolicyInput.maximumLoginFailures
            }
            const service: TenantService = new TenantService(oidcContext);
            return service.setTenantLoginFailurePolicy(loginFailurePolicy);
            
        },
        removeTenantLoginFailurePolicy: async(_: any, { tenantId }, oidcContext) => {
            const service: TenantService = new TenantService(oidcContext);
            await service.removeTenantLoginFailurePolicy(tenantId);
            return tenantId;
        },  
        setTenantPasswordConfig: async(_: any, { passwordConfigInput }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);            
            const tenantPasswordConfig: TenantPasswordConfig = {
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
                mfaTypesRequired: passwordConfigInput.mfaTypesRequired,
                passwordHistoryPeriod: passwordConfigInput.passwordHistoryPeriod,
                passwordRotationPeriodDays: passwordConfigInput.passwordRotationPeriodDays,
                specialCharactersAllowed: passwordConfigInput.specialCharactersAllowed
            };
            await tenantService.assignPasswordConfigToTenant(tenantPasswordConfig);
            return tenantPasswordConfig;
        },
        setTenantLegacyUserMigrationConfig: async(_: any, { tenantLegacyUserMigrationConfigInput }, oidcContext) => {
            const tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig = {
                authenticationUri: tenantLegacyUserMigrationConfigInput.authenticationUri,
                tenantId: tenantLegacyUserMigrationConfigInput.tenantId,
                userProfileUri: tenantLegacyUserMigrationConfigInput.userProfileUri,
                usernameCheckUri: tenantLegacyUserMigrationConfigInput.usernameCheckUri
            }
            const tenantService: TenantService = new TenantService(oidcContext);
            await tenantService.setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig);            
            return tenantLegacyUserMigrationConfig;
        },
        setTenantAnonymousUserConfig: async(_: any, { tenantAnonymousUserConfigInput }, oidcContext) => {
            // TODO
            // Implement the service and dao functions.
            //const tenantService: TenantService = new TenantService(oidcContext);
            const anonymousUserConfig: TenantAnonymousUserConfiguration = {
                tenantId: tenantAnonymousUserConfigInput.tenantId,
                tokenttlseconds: tenantAnonymousUserConfigInput.tokenttlseconds,
                defaultcountrycode: tenantAnonymousUserConfigInput.defaultcountrycode,
                defaultlangugecode: tenantAnonymousUserConfigInput.defaultlangugecode
            }
            //await tenantService.setTenantAnonymousUserConfig(anonymousUserConfig);
            return anonymousUserConfig;
        },
        setTenantLookAndFeel: async(_: any, { tenantLookAndFeelInput }, oidcContext) => {            
            const tenantService: TenantService = new TenantService(oidcContext);
            const tenantLookAndFeel: TenantLookAndFeel = {
                tenantid: tenantLookAndFeelInput.tenantid,
                authenticationheaderbackgroundcolor: tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                authenticationheadertextcolor: tenantLookAndFeelInput.authenticationheadertextcolor,
                authenticationheadertext: tenantLookAndFeelInput.authenticationheadertext,
                authenticationlogo: tenantLookAndFeelInput.authenticationlogo,
                authenticationlogomimetype: tenantLookAndFeelInput.authenticationlogomimetype,
                adminheaderbackgroundcolor: tenantLookAndFeelInput.adminheaderbackgroundcolor,
                adminheadertext: tenantLookAndFeelInput.adminheadertext,
                adminheadertextcolor: tenantLookAndFeelInput.adminheadertextcolor,
                adminlogo: tenantLookAndFeelInput.adminlogo
            }
            await tenantService.setTenantLookAndFeel(tenantLookAndFeel);
            return tenantLookAndFeel;
        },
        addDomainToTenantManagement: async(_: any, { tenantId, domain }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.addDomainToTenantManagement(tenantId, domain);
        },
        removeDomainFromTenantManagement: async(_: any, { tenantId, domain }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            await tenantService.removeDomainFromTenantManagement(tenantId, domain);
            return "";
        },
        addDomainToTenantRestrictedAuthentication: async(_: any, { tenantId, domain }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            return tenantService.addDomainToTenantRestrictedAuthentication(tenantId, domain);
        },
        removeDomainFromTenantRestrictedAuthentication: async(_: any, { tenantId, domain }, oidcContext) => {
            const tenantService: TenantService = new TenantService(oidcContext);
            await tenantService.removeDomainFromTenantRestrictedAuthentication(tenantId, domain);
            return "";
        },
        assignFederatedOIDCProviderToTenant: async(_: any, { tenantId, federatedOIDCProviderId }, oidcContext) => {
            const service: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return service.assignFederatedOIDCProviderToTenant(federatedOIDCProviderId, tenantId);
        },
        removeFederatedOIDCProviderFromTenant: async(_: any, { tenantId, federatedOIDCProviderId }, oidcContext) => {
            const service: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return service.removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId, tenantId);            
        },
        addContact: async(_: any, { contactCreateInput }, oidcContext) => {
            const contactService: ContactService = new ContactService(oidcContext);
            const contact: Contact = {
                contactid: "",
                email: contactCreateInput.email,
                objectid: contactCreateInput.objectid,
                objecttype: contactCreateInput.objecttype,
                name: contactCreateInput.name,
                userid: contactCreateInput.userid
            }
            return contactService.addContact(contact);
        },
        removeContact: async(_: any, { contactId }, oidcContext) => {
            const contactService: ContactService = new ContactService(oidcContext);
            await contactService.removeContact(contactId);
            return contactId;
        },
        addRedirectURI: async(_: any, { clientId, uri }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            return clientService.addRedirectURI(clientId, uri);
        },
        removeRedirectURI: async(_: any, { clientId, uri }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            await clientService.removeRedirectURI(clientId, uri);
            return uri;
        },
        assignFederatedOIDCProviderToDomain: async(_: any, { federatedOIDCProviderId, domain}, oidcContext) => {
            const service: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return service.assignFederatedOIDCProviderToDomain(federatedOIDCProviderId, domain);
        },
        removeFederatedOIDCProviderFromDomain: async(_: any, { federatedOIDCProviderId, domain}, oidcContext) => {
            const service: FederatedOIDCProviderService = new FederatedOIDCProviderService(oidcContext);
            return service.removeFederatedOIDCProviderFromDomain(federatedOIDCProviderId, domain);
        },
        addUserToAuthenticationGroup: async(_: any, { authenticationGroupId, userId}, oidcContext) => {
            const service: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            return service.assignUserToAuthenticationGroup(userId, authenticationGroupId);
        },
        removeUserFromAuthenticationGroup: async(_: any, { authenticationGroupId, userId}, oidcContext) => {
            const service: AuthenticationGroupService = new AuthenticationGroupService(oidcContext);
            await service.removeUserFromAuthenticationGroup(userId, authenticationGroupId);
            return authenticationGroupId;
        },
        updateUser: async(_: any, { userInput }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);            
            const user: User = {
                domain: userInput.domain,
                email: userInput.email,
                emailVerified: userInput.emailVerified,
                enabled: userInput.enabled,
                firstName: userInput.firstName,
                lastName: userInput.lastName,
                locked: false,
                nameOrder: userInput.nameOrder,
                userId: userInput.userId,
                address: userInput.address,
                addressLine1: userInput.addressLine1,
                city: userInput.city,
                countryCode: userInput.countryCode,
                middleName: userInput.middleName,
                phoneNumber: userInput.phoneNumber,
                postalCode: userInput.postalCode,
                preferredLanguageCode: userInput.preferredLanguageCode,
                stateRegionProvince: userInput.stateRegionProvince,
                markForDelete: false
            }
            await service.updateUser(user);
            return user;
        },
        assignUserToTenant: async(_: any, { tenantId, userId, relType }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            return service.assignUserToTenant(tenantId, userId, relType);
        },
        updateUserTenantRel: async(_: any, { tenantId, userId, relType }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            return service.assignUserToTenant(tenantId, userId, relType);
        },
        removeUserFromTenant: async(_: any, { tenantId, userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            await service.removeUserFromTenant(tenantId, userId);
            return userId;
        },
        createRateLimitServiceGroup: async(_: any, { rateLimitServiceGroupInput }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            const r: RateLimitServiceGroup = await service.createRateLimitServiceGroup({
                servicegroupid: "",
                servicegroupname: rateLimitServiceGroupInput.servicegroupname,
                servicegroupdescription: rateLimitServiceGroupInput.servicegroupdescription,
                markForDelete: false
            });
            return r;
        },
        updateRateLimitServiceGroup: async(_: any, { rateLimitServiceGroupInput }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            const r: RateLimitServiceGroup = await service.updateRateLimitServiceGroup({
                servicegroupid: rateLimitServiceGroupInput.servicegroupid,
                servicegroupname: rateLimitServiceGroupInput.servicegroupname,
                servicegroupdescription: rateLimitServiceGroupInput.servicegroupdescription,
                markForDelete: false
            });
            return r;
        },
        assignRateLimitToTenant: async(_: any, { tenantId, serviceGroupId, allowUnlimited, limit, rateLimitPeriodMinutes }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            const r: TenantRateLimitRel = await service.assignRateLimitToTenant(tenantId, serviceGroupId, allowUnlimited || false, limit || 0, rateLimitPeriodMinutes || 0);
            return r;
        },
        updateRateLimitForTenant: async(_: any, { tenantId, serviceGroupId, allowUnlimited, limit, rateLimitPeriodMinutes }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            const r: TenantRateLimitRel = await service.updateRateLimitForTenant(tenantId, serviceGroupId, allowUnlimited || false, limit || 0, rateLimitPeriodMinutes || 0);
            return r;
        },
        removeRateLimitFromTenant: async(_: any, { tenantId, serviceGroupId }, oidcContext) => {
            const service: RateLimitService = new RateLimitService(oidcContext);
            await service.removeRateLimitFromTenant(tenantId, serviceGroupId);
            return serviceGroupId;
        },
        markForDelete: async(_: any, { markForDeleteInput }, oidcContext) => {
            const service: MarkForDeleteService = new MarkForDeleteService(oidcContext);
            // markForDeleteId, submitted by, and submitted date to be assigned by the service class.
            const m: MarkForDelete = {
                markForDeleteId: "",
                objectType: markForDeleteInput.markForDeleteObjectType,
                objectId: markForDeleteInput.objectId,
                submittedBy: "",
                submittedDate: 0
            }
            await service.markForDelete(m);
            return m;

        },
        generateTOTP: async(_: any, { userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            const totpResponse = await service.createTOTP(userId);
            return totpResponse;
        },
        deleteTOTP: async(_: any, { userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            await service.deleteTOTP(userId);
            return userId;
        },
        deleteFIDOKey: async(_: any, { userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            await service.deleteFIDOKey(userId);
            return userId;
        },
        deleteUserSession: async(_: any, { userId, tenantId, clientId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            await service.deleteUserSession(userId, clientId, tenantId);
            return userId;
        },
        createFido2RegistrationChallenge: async(_: any, {userId, sessionToken, sessionTokenType }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            return service.createFido2RegistrationChallenge(userId, sessionToken || null, sessionTokenType || null);
        },
        createFido2AuthenticationChallenge: async(_: any, { userId, sessionToken, sessionTokenType }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            return service.createFido2AuthenticationChallenge(userId, sessionToken || null, sessionTokenType || null);
        },
        createUser: async(_: any, { tenantId, userInput }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.createUser(userInput, tenantId);
        },        
        authenticateHandleUserNameInput: async(_: any, { username, tenantId, preAuthToken, returnToUri, deviceCodeId}, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateHandleUserNameInput(username, tenantId || null, preAuthToken || null, returnToUri || null, deviceCodeId || null);
        },
        authenticateUser: async(_: any, { username, password, authenticationSessionToken, tenantId, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateUser(username, password, tenantId, authenticationSessionToken, preAuthToken || null);
        },
        authenticateHandleForgotPassword: async(_: any, { authenticationSessionToken, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateHandleForgotPassword(authenticationSessionToken, preAuthToken || null);
        },
        authenticateRotatePassword: async(_: any, { userId, newPassword, authenticationSessionToken, preAuthToken}, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateRotatePassword(userId, newPassword, authenticationSessionToken, preAuthToken || null);
        },
        authenticateValidateTOTP: async(_: any, { authenticationSessionToken, totpTokenValue, userId, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateValidateTOTP(userId, totpTokenValue, authenticationSessionToken, preAuthToken || null);
        },
        authenticateConfigureTOTP: async(_: any, { userId, authenticationSessionToken, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateConfigureTOTP(userId, authenticationSessionToken, preAuthToken || null);
        },
        authenticateValidateSecurityKey: async(_: any, { userId, authenticationSessionToken, fido2KeyAuthenticationInput, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateValidateSecurityKey(userId, authenticationSessionToken, fido2KeyAuthenticationInput, preAuthToken || null);
        },
        authenticateRegisterSecurityKey: async(_: any, { userId, authenticationSessionToken, fido2KeyRegistrationInput, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateRegisterSecurityKey(userId, authenticationSessionToken, fido2KeyRegistrationInput, preAuthToken || null);
        },
        authenticateValidatePasswordResetToken: async(_: any, { token, authenticationSessionToken, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateValidatePasswordResetToken(token, authenticationSessionToken, preAuthToken || null);
        },
        cancelAuthentication: async(_: any, { authenticationSessionToken, preAuthToken}, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.cancelAuthentication(authenticationSessionToken, preAuthToken || null);
        },
        authenticateWithSocialOIDCProvider: async(_: any, { federatedOIDCProviderId, preAuthToken, tenantId }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateWithSocialOIDCProvider(preAuthToken || null, tenantId, federatedOIDCProviderId);
        },
        authenticateUserAndMigrate: async(_: any, { authenticationSessionToken, password, tenantId, username, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateUserAndMigrate(username, password, tenantId, authenticationSessionToken, preAuthToken || null);
        },
        authenticateAcceptTermsAndConditions: async(_: any, {accepted, authenticationSessionToken, preAuthToken }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateAcceptTermsAndConditions(accepted, authenticationSessionToken, preAuthToken || null);
        },
        authenticateHandleUserCodeInput: async(_: any, { userCode }, oidcContext) => {
            const service: AuthenticateUserService = new AuthenticateUserService(oidcContext);
            return service.authenticateHandleUserCodeInput(userCode);
        },
        registerUser: async(_: any, { tenantId, userInput, preAuthToken, deviceCodeId }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerUser(userInput, tenantId, preAuthToken || null, deviceCodeId || null);
        },
        registerVerifyEmailAddress: async(_: any, { userId, token, registrationSessionToken, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerVerifyEmailAddress(userId, token, registrationSessionToken, preAuthToken);
        },
        registerConfigureTOTP: async(_: any, { userId, skip, registrationSessionToken, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerConfigureTOTP(userId, registrationSessionToken, preAuthToken, skip);
        },
        registerValidateTOTP: async(_: any, { userId, totpTokenValue, registrationSessionToken, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerValidateTOTP(userId, registrationSessionToken, totpTokenValue, preAuthToken);
        },
        registerConfigureSecurityKey: async(_: any, { userId, registrationSessionToken, skip, fido2KeyRegistrationInput, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerConfigureSecurityKey(userId, registrationSessionToken, fido2KeyRegistrationInput || null, preAuthToken || null, skip);
        },
        registerValidateSecurityKey: async(_: any, { userId, registrationSessionToken, fido2KeyAuthenticationInput, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerValidateSecurityKey(userId, registrationSessionToken, fido2KeyAuthenticationInput, preAuthToken || null);
        },
        registerAddBackupEmail: async(_: any, { userId, registrationSessionToken, backupEmail, skip, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerAddBackupEmail(userId, backupEmail || null, registrationSessionToken, preAuthToken || null, skip);
        },
        registerVerifyBackupEmail: async(_: any, { userId, token, registrationSessionToken, preAuthToken}, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerVerifyBackupEmail(userId, token, registrationSessionToken, preAuthToken || null);
        },
        registerAddDuressPassword: async(_: any, { userId, password, skip, registrationSessionToken, preAuthToken }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.registerAddDuressPassword(userId, password || null, skip, registrationSessionToken, preAuthToken || null);
        },
        cancelRegistration: async(_: any, { userId, registrationSessionToken, preAuthToken, deviceCodeId }, oidcContext) => {
            const service: RegisterUserService = new RegisterUserService(oidcContext);
            return service.cancelRegistration(userId, registrationSessionToken, preAuthToken || null, deviceCodeId || null);
        },
        unlockUser: async(_: any, { userId }, oidcContext) => {
            const service: IdentityService = new IdentityService(oidcContext);
            await service.unlockUser(userId);
            return true;
        },
        updateSystemSettings: async(_: any, { systemSettingsUpdateInput }, oidcContext) => {
            const service: TenantService = new TenantService(oidcContext);
            return service.updateSystemSettings(systemSettingsUpdateInput);
        },
        generateSecretShareLink: async(_: any, { email, objectId, secretShareObjectType}, oidcContext) => {
            const service: SecretShareService = new SecretShareService(oidcContext);
            return service.generateSecretShareLink(objectId, secretShareObjectType, email);
        },
        enterSecretValue: async(_: any, { secretValue, otp }, oidcContext) => {
            const service: SecretShareService = new SecretShareService(oidcContext);
            return service.enterSecretValue(otp, secretValue);
        }
    },
    RelSearchResultItem : {
        owningtenantname: async (item: RelSearchResultItem, _: any, oidcContext: OIDCContext) => {
            let tenant: Tenant | null = null;
            if(oidcContext.requestCache.has(item.owningtenantid)){
                tenant = oidcContext.requestCache.get(item.owningtenantid);
                return tenant?.tenantName || "";
            }
            else{
                const service: TenantService = new TenantService(oidcContext);
                tenant = await service.getTenantById(item.owningtenantid);
                if(tenant){
                    oidcContext.requestCache.set(item.owningtenantid, tenant);
                    return tenant.tenantName;
                }
                else{
                    return "";
                }
            }
            
        }
    }
}

export default resolvers;