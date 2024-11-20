import { Tenant, Client, Group, LoginGroup,LoginGroupClientRel, UserGroupRel, ClientType } from "@/graphql/generated/graphql-types";
import TenantDAO from "../../tenant-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from 'crypto'; 
import { GraphQLError } from "graphql";
import { GROUP_FILE, LOGIN_GROUP_CLIENT_REL_FILE, LOGIN_GROUP_FILE, ROOT_TENANT_FILE, TENANT_FILE } from "@/utils/consts";
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
    public async createRootTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
        tenant.tenantId = randomUUID().toString();
        writeFileSync(`${dataDir}/${ROOT_TENANT_FILE}`, JSON.stringify(tenant), {encoding: "utf-8"});
        return Promise.resolve(tenant);
        
    }
    public async updateRootTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
        
        const rootTenant: Tenant = await this.getRootTenant();
        rootTenant.allowUnlimitedRate = tenant.allowUnlimitedRate;
        rootTenant.claimsSupported = tenant.claimsSupported;
        
        // TODO - check to make sure that any email domains do not already belong to
        // another tenant
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


    public async createTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        tenant.tenantId = randomUUID().toString();
        tenants.push(tenant);
        writeFileSync(`${dataDir}/${TENANT_FILE}`, JSON.stringify(tenants), {encoding: "utf-8"});
        return Promise.resolve(tenant);
    }

    public async updateTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
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
            tenantId: "",
            userTokenTTLSeconds: 0
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