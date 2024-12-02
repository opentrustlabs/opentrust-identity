import ClientService from "@/lib/service/client-service";
import TenantService from "@/lib/service/tenant-service";
import { Resolvers, QueryResolvers, MutationResolvers, Tenant, Client, Key, Scope, AuthenticationGroup, Group } from "../generated/graphql-types";
import SigningKeysService from "@/lib/service/keys-service";
import ScopeService from "@/lib/service/scope-service";
import GroupService from "@/lib/service/group-service";
import AuthenticationGroupService from "@/lib/service/authentication-group-service";


const resolvers: Resolvers = {
    Query: {
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
        getClients: (_, { tenantId }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            return clientService.getClients(tenantId);
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
        getGroups: (_: any, __: any, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            return groupService.getGroups();
        },
        getGroupById: (_: any, { groupId }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            return groupService.getGroupById(groupId);
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
                delegatedAuthenticationConstraint: tenantInput.delegatedAuthenticationConstraint,
                markForDelete: false,
                externalOIDCProviderId: tenantInput.externalOIDCProviderId
            };
            await tenantService.createRootTenant(tenant);
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
                delegatedAuthenticationConstraint: tenantInput.delegatedAuthenticationConstraint,
                markForDelete: tenantInput.markForDelete,
                externalOIDCProviderId: tenantInput.externalOIDCProviderId
            }
            await tenantService.updateRootTenant(tenant);
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
                delegatedAuthenticationConstraint: tenantInput.delegatedAuthenticationConstraint,
                markForDelete: false,
                externalOIDCProviderId: tenantInput.externalOIDCProviderId
            }
            await tenantService.createTenant(tenant);
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
                delegatedAuthenticationConstraint: tenantInput.delegatedAuthenticationConstraint,
                markForDelete: tenantInput.markForDelete,
                externalOIDCProviderId: tenantInput.externalOIDCProviderId
            }
            const updatedTenant: Tenant = await tenantService.updateTenant(tenant);
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
                maxRefreshTokenCount: clientInput.maxRefreshTokenCount
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
                redirectUris: clientInput.redirectUris,
                enabled: clientInput.enabled,
                oidcEnabled: clientInput.oidcEnabled ?? true,
                pkceEnabled: clientInput.pkceEnabled ?? true,
                clientType: clientInput.clientType,
                userTokenTTLSeconds: clientInput.userTokenTTLSeconds || 0,
                maxRefreshTokenCount: clientInput.maxRefreshTokenCount
            }
            await clientService.updateClient(client);
            return client;
        },
        deleteClient: async(_: any, { clientId }, oidcContext) => {
            const clientService: ClientService = new ClientService(oidcContext);
            await clientService.deleteClient(clientId);
            return clientId;
        },
        createSigningKey: async(_: any, { keyInput }, oidcContext) => {
            const keysService: SigningKeysService = new SigningKeysService(oidcContext);
            const key: Key = {
                e: keyInput.e,
                exp: keyInput.exp,
                keyType: keyInput.keyType,
                n: keyInput.n,
                tenantId: keyInput.tenantId,
                use: keyInput.use,
                x5c: keyInput.x5c,
                keyId: ""
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
                scopeConstraintSchemaId: scopeInput.scopeConstraintSchemaId
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
                scopeConstraintSchemaId: scopeInput.scopeConstraintSchemaId
            };
            await scopeService.updateScope(scope);
            return scope;
        },
        deleteScope: async(_: any, { scopeId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            await scopeService.deleteScope(scopeId);
            return scopeId;
        },
        assignScopeToTenant: async(_: any, { scopeId, tenantId }, oidcContext) => {
            const scopeService: ScopeService = new ScopeService(oidcContext);
            const rel = await scopeService.assignScopeToTenant(tenantId, scopeId);
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
                tenantId: authenticationGroupInput.tenantId
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
                tenantId: authenticationGroupInput.tenantId
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
        createGroup: async(_: any, { groupInput }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            const group: Group = {
                default: groupInput.default,
                groupId: "",
                groupName: groupInput.groupName,
                tenantId: groupInput.tenantId
            };
            await groupService.createGroup(group);
            return group;
        },
        updateGroup: async(_: any, { groupInput }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            const group: Group = {
                default: groupInput.default,
                groupId: groupInput.groupId,
                groupName: groupInput.groupName,
                tenantId: groupInput.tenantId
            };
            await groupService.updateGroup(group);
            return group;
        },
        deleteGroup: async(_: any, { groupId }, oidcContext ) => {
            const groupService: GroupService = new GroupService(oidcContext);
            await groupService.deleteGroup(groupId);
            return groupId;
        },
        addUserToGroup: async(_: any, { groupId, userId }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            const res = await groupService.addUserToGroup(userId, groupId);
            return res;
        },
        removeUserFromGroup: async(_: any, { groupId, userId }, oidcContext) => {
            const groupService: GroupService = new GroupService(oidcContext);
            await groupService.removeUserFromGroup(userId, groupId);
            return userId;
        }
    }
}

export default resolvers;