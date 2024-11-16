import { Tenant, Client, Key, RateLimit, Group, LoginGroup, Scope, ClientTenantScopeRel, LoginGroupClientRel, TenantRateLimitRel, TenantScopeRel, UserGroupRel, ClientType } from "@/graphql/generated/graphql-types";
import TenantDAO from "../../tenant-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from 'crypto'; 
import { GraphQLError } from "graphql";
import { CLIENT_TENANT_SCOPE_REL_FILE, GROUP_FILE, KEY_FILE, LOGIN_GROUP_CLIENT_REL_FILE, LOGIN_GROUP_FILE, RATE_LIMIT_FILE, ROOT_TENANT_FILE, SCOPE_FILE, TENANT_FILE, TENANT_RATE_LIMIT_REL_FILE, TENANT_SCOPE_REL_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);


class FSBasedTenantDao extends TenantDAO {

    public async getRootTenant(): Promise<Tenant> {
        const tenant: Tenant = JSON.parse(getFileContents(`${dataDir}/${ROOT_TENANT_FILE}`, "{}"));
        if(!tenant?.tenantId){
            throw new GraphQLError("ERROR_ROOT_TENANT_DOES_NOT_EXIST");
        }
        return Promise.resolve(tenant);
    }
    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantId = randomUUID().toString();
        writeFileSync(`${dataDir}/${ROOT_TENANT_FILE}`, JSON.stringify(tenant), {encoding: "utf-8"});
        return Promise.resolve(tenant);
        
    }
    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        
        const rootTenant: Tenant = await this.getRootTenant();
        rootTenant.allowUnlimitedRate = tenant.allowUnlimitedRate;
        rootTenant.claimsSupported = tenant.claimsSupported;
        rootTenant.delegateAuthentication = tenant.delegateAuthentication;
        rootTenant.delegatedOIDCClientDef = tenant.delegatedOIDCClientDef;
        
        // TODO - check to make sure that any email domains do not already belong to
        // another tenant
        rootTenant.emailDomains = tenant.emailDomains;
        rootTenant.enabled = tenant.enabled;
        rootTenant.tenantDescription = tenant.tenantDescription;
        rootTenant.tenantName = tenant.tenantName;
        
        writeFileSync(`${dataDir}/${ROOT_TENANT_FILE}`, JSON.stringify(rootTenant), {encoding: "utf-8"});
        return Promise.resolve(rootTenant);       

    }
        
    public async getTenants(): Promise<Array<Tenant>> {
        const tenants: Array<Tenant> = JSON.parse(getFileContents(`${dataDir}/${TENANT_FILE}`, "[]"));
        return Promise.resolve(tenants);        
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        const tenant: Tenant | undefined = tenants.find(
            (tenant: Tenant) => tenant.tenantId === tenantId
        )
        return tenant === undefined ? Promise.resolve(null) : Promise.resolve(tenant);
    }


    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        tenant.tenantId = randomUUID().toString();
        tenants.push(tenant);
        writeFileSync(`${dataDir}/${TENANT_FILE}`, JSON.stringify(tenants), {encoding: "utf-8"});
        return Promise.resolve(tenant);
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const tenants: Array<Tenant> = await this.getTenants();
        const tenantToUpdate: Tenant | undefined = tenants.find(
            (t: Tenant) => t.tenantId === tenant.tenantId
        )
        if(!tenantToUpdate){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }
        tenantToUpdate.tenantName = tenant.tenantName;
        tenantToUpdate.tenantDescription = tenant.tenantDescription;
        tenantToUpdate.allowUnlimitedRate = tenant.allowUnlimitedRate;
        tenantToUpdate.claimsSupported = tenant.claimsSupported;
        tenantToUpdate.enabled = tenant.enabled;

        writeFileSync(`${dataDir}/${TENANT_FILE}`, JSON.stringify(tenants), {encoding: "utf-8"});

        return Promise.resolve(tenant);
    }

    public async deleteTenant(tenantId: string): Promise<void> {
        // delete all clients
        // delete all groups
        // delete all users
        // delete all login groups
        // delete all LoginGroupClientRel
        // delete all LoginGroupUserRel
        // delete all UserGroupRel
        // UserCredential
        // UserCredentialHistory
        // Key
        // TenantRateLimitRel
        // TenantScopeRel
        // ClientTenantScopeRel
        // delete tenant
        throw new Error("Method not implemented.");
    }

    


    // SIGNING KEYS METHODS
    public async getSigningKeys(tenantId?: string): Promise<Array<Key>> {
        let keys: Array<Key> = JSON.parse(getFileContents(`${dataDir}/${KEY_FILE}`, "[]"));
        if(tenantId){
            keys = keys.filter(
                (k: Key) => k.tenantId === tenantId
            )
        }
        return Promise.resolve(keys);
    }    

    public async createSigningKey(key: Key): Promise<Key> {
        const tenant: Tenant | null = await this.getTenantById(key.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            })
        }

        const keys = await this.getSigningKeys();
        key.keyId = randomUUID().toString();
        keys.push(key);
        writeFileSync(`${dataDir}/${KEY_FILE}`, JSON.stringify(keys), {encoding: "utf-8"});
        return Promise.resolve(key);
    }    

    public async getSigningKeyById(keyId: string): Promise<Key | null> {
        const keys: Array<Key> = await this.getSigningKeys();
        const key = keys.find(
            (k: Key) => k.keyId === keyId
        )
        return key === undefined ? Promise.resolve(null) : Promise.resolve(key);
    }

    public async deleteSigningKey(keyId: String): Promise<void> {
        const keys: Array<Key> = await this.getSigningKeys();
        const a: Array<Key> = keys.filter(
            (k: Key) => k.keyId !== keyId
        );
        writeFileSync(`${dataDir}/${KEY_FILE}`, JSON.stringify(a), {encoding: "utf-8"})
        
    }

    // RATE LIMIT METHODS
    public async getRateLimits(tenantId?: string): Promise<Array<RateLimit>> {
        let rateLimits: Array<RateLimit> = JSON.parse(getFileContents(`${dataDir}/${RATE_LIMIT_FILE}`, "[]"));
        if(tenantId){
            const tenantRateLimts: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
            rateLimits = rateLimits.filter(
                (r: RateLimit) => tenantRateLimts.find( (t: TenantRateLimitRel ) => t.rateLimitId === r.rateLimitId)
            )
        }
        return Promise.resolve(rateLimits);
    }

    public async createRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        const rateLimits: Array<RateLimit> = await this.getRateLimits();
        rateLimit.rateLimitId = randomUUID().toString();
        rateLimits.push(rateLimit);
        writeFileSync(`${dataDir}/${RATE_LIMIT_FILE}`, JSON.stringify(rateLimits), {encoding: "utf-8"});
        return Promise.resolve(rateLimit);
    }

    public async getRateLimitById(rateLimitId: string): Promise<RateLimit | null> {
        const rateLimits: Array<RateLimit> = await this.getRateLimits();
        const rateLimit = rateLimits.find(
            (r: RateLimit) => r.rateLimitId === rateLimitId
        )
        return rateLimit === undefined ? Promise.resolve(null) : Promise.resolve(rateLimit);
    }

    public async updateRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        const rateLimits: Array<RateLimit> = await this.getRateLimits();
        const rateLimitToUpdate = rateLimits.find( (r: RateLimit) => r.rateLimitId === rateLimit.rateLimitId);
        if(!rateLimitToUpdate){
            throw new GraphQLError("ERROR_RATE_LIMIT_NOT_FOUND");
        }
        rateLimitToUpdate.rateLimitDescription = rateLimit.rateLimitDescription;
        rateLimitToUpdate.rateLimitDomain = rateLimit.rateLimitDomain;
        writeFileSync(`${dataDir}/${RATE_LIMIT_FILE}`, JSON.stringify(rateLimits), {encoding: "utf-8"});
        return Promise.resolve(rateLimit);
    }

    public async deleteRateLimit(rateLimitId: string): Promise<void> {
        // delete TenantRateLimitRel
        // delete RateLimit
        throw new Error("Method not implemented.");
    } 
    
        
    public async getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>> {
        let tenantRateLimitRels = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"));
        tenantRateLimitRels = tenantRateLimitRels.filter(
            (t: TenantRateLimitRel) => t.tenantId === tenantId
        )
        return Promise.resolve(tenantRateLimitRels);
    }

    
    public async assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const tenant = await this.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_TO_ASSIGN_RATE_LIMIT");
        }
        const rateLimit = await this.getRateLimitById(rateLimitId);
        if(!rateLimit){
            throw new GraphQLError("ERROR_CANNOT_FIND_RATE_LIMIT_TO_ASSIGN_TO_TENANT");
        }
        let existingRels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
        const existingRateLimitRel = existingRels.find(
            (r: TenantRateLimitRel) => r.rateLimitId === rateLimit.rateLimitId
        )
        if(existingRateLimitRel){
            throw new GraphQLError("ERROR_TENENT_IS_ALREADY_ASSIGNED_RATE_LIMIT");
        }
        const a: Array<TenantRateLimitRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"));
        const rel: TenantRateLimitRel = {
            tenantId: tenantId,
            rateLimitId: rateLimitId,
            rateLimit: limit < 0 ? 15 : limit > 1000000 ? 15 : limit,
            rateLimitPeriodMinutes: rateLimitPeriodMinutes,
            allowUnlimitedRate: allowUnlimited
        };
        a.push(rel);
        writeFileSync(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(rel);        
    }

    public async updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const tenantRateLimitRels: Array<TenantRateLimitRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"))
        const existingRel: TenantRateLimitRel | undefined = tenantRateLimitRels.find(
            (r: TenantRateLimitRel) => r.rateLimitId === rateLimitId && r.tenantId === tenantId
        );
        if(!existingRel){
            throw new GraphQLError("ERROR_CANNOT_FIND_EXISTING_TENANT_RATE_LIMIT_REL_TO_UPDATE");
        }
        existingRel.allowUnlimitedRate = allowUnlimited;
        existingRel.rateLimit = limit < 0 ? 15 : limit > 1000000 ? 15 : limit;
        existingRel.rateLimitPeriodMinutes = rateLimitPeriodMinutes > 480 ? 480 : rateLimitPeriodMinutes < 5 ? 480 : rateLimitPeriodMinutes;
        writeFileSync(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, JSON.stringify(tenantRateLimitRels), {encoding: "utf-8"});
        return Promise.resolve(existingRel);
    }

    public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
        let tenantRateLimitRels: Array<TenantRateLimitRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"));
        const existingRel: TenantRateLimitRel | undefined = tenantRateLimitRels.find(
            (r: TenantRateLimitRel) => r.rateLimitId === rateLimitId && r.tenantId === tenantId
        );
        if(existingRel){
            tenantRateLimitRels = tenantRateLimitRels.filter(
                (rel: TenantRateLimitRel) => !(rel.rateLimitId === rateLimitId && rel.tenantId === tenantId)
            )
            writeFileSync(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, JSON.stringify(tenantRateLimitRels), {encoding: "utf-8"});
        }
    }

    
    // SCOPE METHODS
    public async getScope(tenantId?: string): Promise<Array<Scope>> {
        let scopes: Array<Scope> = JSON.parse(getFileContents(`${dataDir}/${SCOPE_FILE}`, "[]"));
        if(tenantId){
            const rels: Array<TenantScopeRel> = await this.getTenantScopeRel(tenantId);
            scopes = scopes.filter(
                (s: Scope) => rels.find(
                    (r: TenantScopeRel) => r.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(scopes);
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const scopes: Array<Scope> = await this.getScope();
        const scope: Scope | undefined = scopes.find(
            (s: Scope) => s.scopeId === scopeId
        )
        return scope === undefined ? Promise.resolve(null) : Promise.resolve(scope);
    }

    public async createScope(scope: Scope): Promise<Scope> {
        const scopes: Array<Scope> = await this.getScope();
        scope.scopeId = randomUUID().toString();
        scopes.push(scope);
        writeFileSync(`${dataDir}/${SCOPE_FILE}`, JSON.stringify(scopes), {encoding: "utf-8"});
        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        const scopes: Array<Scope> = await this.getScope();
        const existingScope = scopes.find(
            (s: Scope) => s.scopeId === scope.scopeId
        )
        if(!existingScope){
            throw new GraphQLError("ERROR_SCOPE_NOT_FOUND");
        }
        existingScope.scopeDescription = scope.scopeDescription;
        existingScope.scopeName = scope.scopeName;
        writeFileSync(`${dataDir}/${SCOPE_FILE}`, JSON.stringify(scopes), {encoding: "utf-8"});
        return Promise.resolve(existingScope);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        let scopes: Array<Scope> = await this.getScope();
        scopes = scopes.filter(
            (s: Scope) => s.scopeId !== scopeId
        )
        writeFileSync(`${dataDir}/${SCOPE_FILE}`, JSON.stringify(scopes), {encoding: "utf-8"});
    }
        

    protected async getTenantScopeRel(tenantId?: String): Promise<Array<TenantScopeRel>> {
        const tenantScopeRels: Array<TenantScopeRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                tenantScopeRels.filter(
                    (t: TenantScopeRel) => t.tenantId === tenantId
                )
            );
        }
        else {
            return Promise.resolve(tenantScopeRels);
        }
    }
    
    public async assignScopeToTenant(tenantId: string, scopeId: string): Promise<TenantScopeRel> {
        const tenant: Tenant | null = await this.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_FOR_SCOPE_ASSIGNMENT");
        }
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError("ERROR_CANNOT_FIND_SCOPE_TO_ASSIGN_TO_TENANT");
        }
        const a: Array<TenantScopeRel> = await this.getTenantScopeRel();
        const existingRel = a.find(
            (r: TenantScopeRel) => r.tenantId === tenantId && r.scopeId === scopeId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const rel: TenantScopeRel = {
            tenantId: tenantId,
            scopeId: scopeId
        }
        a.push(rel);
        writeFileSync(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(rel);

    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        let a: Array<TenantScopeRel> = await this.getTenantScopeRel();
        a = a.filter(
            (rel: TenantScopeRel) => !(rel.tenantId === tenantId && rel.scopeId === scopeId)
        );
        writeFileSync(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel> {
        const client: Client | null = await this.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_CLIENT_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        if(client.tenantId !== tenantId){
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_BELONG_TO_TENANT");
        }
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError("ERROR_SCOPE_ID_NOT_FOUND_FOR_CLIENT_ASSIGNMENT");
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the client
        const tenantScopes: Array<TenantScopeRel> = await this.getTenantScopeRel(tenantId);
        const rel = tenantScopes.find(
            (t: TenantScopeRel) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError("ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT");
        }
        const clientTenantScopeRels: Array<ClientTenantScopeRel> = getFileContents(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, "[]");
        const existingRel = clientTenantScopeRels.find(
            (r: ClientTenantScopeRel) => r.tenantId === tenantId && r.clientId === clientId && r.scopeId === scopeId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const newRel: ClientTenantScopeRel = {
            tenantId: tenantId,
            clientId: clientId,
            scopeId: scopeId
        }
        clientTenantScopeRels.push(newRel);
        writeFileSync(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, JSON.stringify(clientTenantScopeRels), {encoding: "utf-8"});
        return Promise.resolve(newRel);

    }
    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        let clientTenantScopeRels: Array<ClientTenantScopeRel> = getFileContents(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, "[]");
        clientTenantScopeRels = clientTenantScopeRels.filter(
            (r: ClientTenantScopeRel) => !(r.tenantId === tenantId && r.clientId === clientId && r.scopeId === scopeId)
        )
        writeFileSync(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, JSON.stringify(clientTenantScopeRels), {encoding: "utf-8"});
    }


    // LOGIN GROUPS METHODS
    public async getLoginGroups(tenantId?: string): Promise<Array<LoginGroup>> {
        const loginGroups: Array<LoginGroup> = JSON.parse(getFileContents(`${dataDir}/${LOGIN_GROUP_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                loginGroups.filter(
                    (l: LoginGroup) => l.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(loginGroups);
    }
    
    public async getLoginGroupById(loginGroupId: string): Promise<LoginGroup | null> {
        const loginGroups: Array<LoginGroup> = await this.getLoginGroups();
        const loginGroup = loginGroups.find(
            (l: LoginGroup) => l.loginGroupId === loginGroupId
        )
        return loginGroup === undefined ? Promise.resolve(null) : Promise.resolve(loginGroup);
    }

    public async createLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        const tenant: Tenant | null = await this.getTenantById(loginGroup.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST_FOR_LOGIN_GROUP");
        }
        const a: Array<LoginGroup> = await this.getLoginGroups();
        loginGroup.loginGroupId = randomUUID().toString();
        a.push(loginGroup);
        writeFileSync(`${dataDir}/${LOGIN_GROUP_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(loginGroup);
    }

    public async updateLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        const a: Array<LoginGroup> = await this.getLoginGroups();
        const existingLoginGroup = a.find(
            (l: LoginGroup) => l.loginGroupId === loginGroup.loginGroupId
        )
        if(!existingLoginGroup){
            throw new GraphQLError("ERROR_CANNOT_FIND_LOGIN_GROUP_FOR_UPDATE");
        }
        existingLoginGroup.loginGroupDescription = loginGroup.loginGroupDescription;
        existingLoginGroup.loginGroupName = loginGroup.loginGroupName;
        writeFileSync(`${dataDir}/${LOGIN_GROUP_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(existingLoginGroup);
    }

    public async deleteLoginGroup(loginGroupId: string): Promise<void> {
        let a: Array<LoginGroup> = await this.getLoginGroups();
        a = a.filter(
            (l: LoginGroup) => l.loginGroupId !== loginGroupId
        )
        writeFileSync(`${dataDir}/${LOGIN_GROUP_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
    }

    async getClientById(clientId: string): Promise<Client> {
        return Promise.resolve({
            clientId: "",
            clientName: "",
            clientSecret: "",
            clientType: ClientType.ServiceAccountAndUserDelegatedPermissions,
            oidcEnabled: true,
            pkceEnabled: true,
            tenantId: ""
        })
    }

    public async assignLoginGroupToClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel> {
        const client: Client | null = await this.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_EXIST_FOR_LOGIN_GROUP_ASSIGNMENT");
        }
        const loginGroup = await this.getLoginGroupById(loginGroupId);
        if(!loginGroup){
            throw new GraphQLError("ERROR_LOGIN_GROUP_DOES_NOT_EXIST_FOR_CLIENT_ASSIGNMENT");
        }
        // Do the tenants match?
        if(loginGroup.tenantId !== client.tenantId){
            throw new GraphQLError("ERROR_CANNOT_ASSIGN_LOGIN_GROUP_TO_CLIENT")
        }
        const rels: Array<LoginGroupClientRel> = JSON.parse(getFileContents(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`));
        const existingRel = rels.find(
            (r: LoginGroupClientRel) => r.clientId === clientId && r.loginGroupId === loginGroupId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const newRel: LoginGroupClientRel = {
            loginGroupId: loginGroupId,
            clientId: clientId
        }
        rels.push(newRel);
        writeFileSync(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve(newRel);
    }
    public async removeLoginGroupFromClient(loginGroupId: string, clientId: string): Promise<void> {
        let rels: Array<LoginGroupClientRel> = JSON.parse(getFileContents(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`));
        rels = rels.filter(
            (r: LoginGroupClientRel) => !(r.clientId === clientId && r.loginGroupId === loginGroupId)
        )
        writeFileSync(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
    }


    // GROUPS METHODS
    public async getGroups(tenantId?: string): Promise<Array<Group>> {
        const groups: Array<Group> = JSON.parse(getFileContents(`${dataDir}/${GROUP_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                groups.filter(
                    (g: Group) => g.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(groups);
    }

    public async getGroupById(groupId: string): Promise<Group> {
        const groups: Array<Group> = await this.getGroups();
        const group: Group | undefined = groups.find(
            (g: Group) => g.groupId === groupId
        )
        if(!group){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        return Promise.resolve(group);        
    }

    public async createGroup(group: Group): Promise<Group> {
        const tenant: Tenant | null = await this.getTenantById(group.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND_FOR_GROUP_CREATION");
        }
        group.groupId = randomUUID().toString();
        const groups: Array<Group> = await this.getGroups();
        groups.push(group);
        writeFileSync(`${dataDir}/${GROUP_FILE}`, JSON.stringify(groups), {encoding: "utf-8"});
        return Promise.resolve(group);
    }

    public async updateGroup(group: Group): Promise<Group> {
        const groups: Array<Group> = await this.getGroups();
        const existingGroup: Group | undefined = groups.find(
            (g: Group) => g.groupId === group.groupId
        )
        if(!existingGroup){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }

        existingGroup.groupName = group.groupName;
        writeFileSync(`${dataDir}/${GROUP_FILE}`, JSON.stringify(groups), {encoding: "utf-8"});
        return Promise.resolve(existingGroup);  
    }
    public async deleteGroup(groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserToGroup(userId: string, groupId: string): Promise<UserGroupRel> {
        throw new Error("Method not implemented.");
    }
    public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    

}

export default FSBasedTenantDao;