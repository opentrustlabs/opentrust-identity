import { Client, ClientTenantScopeRel, Group, Key, LoginGroup, LoginGroupClientRel, RateLimit, Scope, Tenant, TenantRateLimitRel, TenantScopeRel, UserGroupRel } from "@/graphql/generated/graphql-types";


abstract class TenantDao {

    /////////////////   TENANTS   ///////////////////////
    abstract getRootTenant(): Promise<Tenant>;

    abstract createRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract getTenants(): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract createTenant(tenant: Tenant): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;


    /////////////////   CLIENTS   ///////////////////////
    abstract getClients(tenantId?: string): Promise<Array<Client>>;
    
    abstract getClientById(clientId: string): Promise<Client | null>;

    abstract createClient(client: Client): Promise<Client>;

    abstract updateClient(client: Client): Promise<Client>;

    abstract deleteClient(clientId: string): Promise<void>;


    /////////////////   SIGNING KEYS   ///////////////////////
    abstract getSigningKeys(tenantId?: string): Promise<Array<Key>>;

    abstract getSigningKeyById(keyId: string): Promise<Key>;

    abstract createSigningKey(key: Key): Promise<Key>;

    abstract deleteSigningKey(keyId: String): Promise<Key>;


    /////////////////   RATE LIMITS   ///////////////////////
    abstract getRateLimits(tenantId?: string): Promise<Array<RateLimit>>;

    abstract createRateLimit(rateLimit: RateLimit): Promise<RateLimit>;

    abstract getRateLimitById(rateLimitId: string): Promise<RateLimit>;

    abstract updateRateLimit(rateLimit: RateLimit): Promise<RateLimit>;

    abstract deleteRateLimit(rateLimitId: string): Promise<RateLimit>;

    abstract assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, rateLimit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, rateLimit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<TenantRateLimitRel>;


    /////////////////   SCOPE   ///////////////////////
    abstract getScope(tenantId?: string): Promise<Array<Scope>>;

    abstract getScopeById(scopeId: string): Promise<Scope>;

    abstract createScope(scope: Scope): Promise<Scope>;

    abstract updateScope(scope: Scope): Promise<Scope>;

    abstract deleteScope(scopeId: string): Promise<Scope>;

    abstract assignScopeToTenant(tenantId: string, scopeId: string): Promise<TenantScopeRel>;

    abstract removeScopeFromTenant(tenantId: string, scopeId: string): Promise<TenantScopeRel>;

    abstract assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel>;

    abstract removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel>;


    /////////////////   LOGIN GROUPS   ///////////////////////
    abstract getLoginGroups(tenantId?: string): Promise<Array<LoginGroup>>;

    abstract getLoginGroupById(loginGroupId: string): Promise<LoginGroup>;

    abstract createLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup>;

    abstract updateLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup>;

    abstract deleteLoginGroup(loginGroupId: string): Promise<LoginGroup>;

    abstract assignLoginGroupToClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel>;

    abstract removeLoginGroupFromClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel>;


    /////////////////   GROUPS   ///////////////////////
    abstract getGroups(tenantId?: string): Promise<Array<Group>>;
    
    abstract getGroupById(groupId: string): Promise<Group>;

    abstract createGroup(group: Group): Promise<Group>;

    abstract updateGroup(group: Group): Promise<Group>;

    abstract deleteGroup(groupId: string): Promise<Group>;

    abstract addUserToGroup(userId: string, groupId: string): Promise<UserGroupRel>;

    abstract removeUserFromGroup(userId: string, groupId: string): Promise<UserGroupRel>;
   

}

export default TenantDao;