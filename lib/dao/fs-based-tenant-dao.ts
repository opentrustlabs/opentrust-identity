import { Tenant, Client, Key, RateLimit, Group, LoginGroup, Scope, ClientTenantScopeRel, LoginGroupClientRel, TenantRateLimitRel, TenantScopeRel, UserGroupRel } from "@/graphql/generated/graphql-types";
import TenantDAO from "./tenant-dao";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from 'crypto'; 
import { GraphQLError } from "graphql";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedTenantDao extends TenantDAO {

    public async getRootTenant(): Promise<Tenant> {
        const tenant: Tenant = JSON.parse(this.getFileContents(`${dataDir}/root-tenant.json`, "{}"));
        if(!tenant?.tenantId){
            throw new GraphQLError("ERROR_ROOT_TENANT_DOES_NOT_EXIST");
        }
        return Promise.resolve(tenant);
    }
    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantId = randomUUID().toString();
        writeFileSync(`${dataDir}/root-tenant.json`, JSON.stringify(tenant), {encoding: "utf-8"});
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
        
        writeFileSync(`${dataDir}/root-tenant.json`, JSON.stringify(rootTenant), {encoding: "utf-8"});
        return Promise.resolve(rootTenant);       

    }
        
    public async getTenants(): Promise<Array<Tenant>> {
        const tenants: Array<Tenant> = JSON.parse(this.getFileContents(`${dataDir}/tenants.json`, "[]"));
        return Promise.resolve(tenants);        
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        const tenant: Tenant | undefined = tenants.find(
            (tenant: Tenant) => tenant.tenantId === tenantId
        )
        return tenant === undefined ? Promise.resolve(null) : Promise.resolve(tenant);
    }


    public async getClientsByTenant(tenantId: string): Promise<Array<Client>> {
        const allClients = await this.getClients();
        const clients: Array<Client> = allClients.filter(
            (client: Client) => client.tenantId === tenantId
        );
        return Promise.resolve(clients)
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        tenant.tenantId = randomUUID().toString();
        tenants.push(tenant);
        writeFileSync(`${dataDir}/tenants.json`, JSON.stringify(tenants), {encoding: "utf-8"});
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
        
        writeFileSync(`${dataDir}/tenants.json`, JSON.stringify(tenants), {encoding: "utf-8"});

        return Promise.resolve(tenant);
    }

    public async deleteTenant(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getClients(): Promise<Array<Client>> {
        const clients: Array<Client> = JSON.parse(this.getFileContents(`${dataDir}/clients.json`, "[]"));
        return Promise.resolve(clients);
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        const clients = await this.getClients();
        const client: Client | undefined = clients.find(
            (client: Client) => client.clientId === clientId
        );
        return client === undefined ? Promise.resolve(null) : Promise.resolve(client);

    }

    public async createClient(client: Client): Promise<Client> {
        const tenant: Tenant | null = await this.getTenantById(client.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            })
        }

        const clients = await this.getClients();
        client.clientId = randomUUID().toString();
        clients.push(client);
        writeFileSync(`${dataDir}/clients.json`, JSON.stringify(clients), {encoding: "utf-8"});
        return Promise.resolve(client)
    }

    public async updateClient(client: Client): Promise<Client> {
        const clients: Array<Client> = await this.getClients();
        const clientToUpdate = clients.find(
            (c: Client) => {
                return c.clientId === client.clientId
            }
        );
        if(!clientToUpdate){
            throw new GraphQLError("ERROR_CLIENT_NOT_FOUND")
        }
        clientToUpdate.clientDescription = client.clientDescription;
        clientToUpdate.clientName = client.clientName;
        clientToUpdate.enabled = client.enabled;
        clientToUpdate.oidcEnabled = client.oidcEnabled;
        clientToUpdate.pkceEnabled = client.pkceEnabled;
        clientToUpdate.redirectUris = client.redirectUris;
        writeFileSync(`${dataDir}/clients.json`, JSON.stringify(clients), {encoding: "utf-8"})

        return Promise.resolve(client);
    }

    public async deleteClient(clientId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    // SIGNING KEYS METHODS
    getSigningKeys(tenantId?: string): Promise<Array<Key>> {
        throw new Error("Method not implemented.");
    }    
    createSigningKey(key: Key): Promise<Key> {
        throw new Error("Method not implemented.");
    }    
    getSigningKeyById(keyId: string): Promise<Key> {
        throw new Error("Method not implemented.");
    }
    deleteSigningKey(keyId: String): Promise<Key> {
        throw new Error("Method not implemented.");
    }

    // RATE LIMIT METHODS
    getRateLimits(tenantId?: string): Promise<Array<RateLimit>> {
        throw new Error("Method not implemented.");
    }
    createRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        throw new Error("Method not implemented.");
    }
    getRateLimitById(rateLimitId: string): Promise<RateLimit> {
        throw new Error("Method not implemented.");
    }
    updateRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        throw new Error("Method not implemented.");
    }
    deleteRateLimit(rateLimitId: string): Promise<RateLimit> {
        throw new Error("Method not implemented.");
    }    
    assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, rateLimit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        throw new Error("Method not implemented.");
    }
    updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, rateLimit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        throw new Error("Method not implemented.");
    }
    removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<TenantRateLimitRel> {
        throw new Error("Method not implemented.");
    }


    // SCOPE METHODS
    getScope(tenantId?: string): Promise<Array<Scope>> {
        throw new Error("Method not implemented.");
    }
    getScopeById(scopeId: string): Promise<Scope> {
        throw new Error("Method not implemented.");
    }
    createScope(scope: Scope): Promise<Scope> {
        throw new Error("Method not implemented.");
    }
    updateScope(scope: Scope): Promise<Scope> {
        throw new Error("Method not implemented.");
    }
    deleteScope(scopeId: string): Promise<Scope> {
        throw new Error("Method not implemented.");
    }    
    assignScopeToTenant(tenantId: string, scopeId: string): Promise<TenantScopeRel> {
        throw new Error("Method not implemented.");
    }
    removeScopeFromTenant(tenantId: string, scopeId: string): Promise<TenantScopeRel> {
        throw new Error("Method not implemented.");
    }
    assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel> {
        throw new Error("Method not implemented.");
    }
    removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel> {
        throw new Error("Method not implemented.");
    }


    // LOGIN GROUPS METHODS
    getLoginGroups(tenantId?: string): Promise<Array<LoginGroup>> {
        throw new Error("Method not implemented.");
    }    
    getLoginGroupById(loginGroupId: string): Promise<LoginGroup> {
        throw new Error("Method not implemented.");
    }
    createLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        throw new Error("Method not implemented.");
    }
    updateLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        throw new Error("Method not implemented.");
    }
    deleteLoginGroup(loginGroupId: string): Promise<LoginGroup> {
        throw new Error("Method not implemented.");
    }
    assignLoginGroupToClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel> {
        throw new Error("Method not implemented.");
    }
    removeLoginGroupFromClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel> {
        throw new Error("Method not implemented.");
    }


    // GROUPS METHODS
    getGroups(tenantId?: string): Promise<Array<Group>> {
        throw new Error("Method not implemented.");
    }
    getGroupById(groupId: string): Promise<Group> {
        throw new Error("Method not implemented.");
    }
    createGroup(group: Group): Promise<Group> {
        throw new Error("Method not implemented.");
    }
    updateGroup(group: Group): Promise<Group> {
        throw new Error("Method not implemented.");
    }
    deleteGroup(groupId: string): Promise<Group> {
        throw new Error("Method not implemented.");
    }    
    addUserToGroup(userId: string, groupId: string): Promise<UserGroupRel> {
        throw new Error("Method not implemented.");
    }
    removeUserFromGroup(userId: string, groupId: string): Promise<UserGroupRel> {
        throw new Error("Method not implemented.");
    }

    protected getFileContents(fileName: string, defaultContents?: string): any {
        let fileContents; 

        if(!existsSync(fileName)){
            writeFileSync(fileName, defaultContents ?? "", {encoding: "utf-8"});
            fileContents = defaultContents ?? "";
        }
        else{
            fileContents = readFileSync(fileName, {encoding: "utf-8"});
        }
        return fileContents;
    }

}

export default FSBasedTenantDao;