import { AuthorizationGroup, AuthorizationGroupUserRel, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getAuthorizationGroupDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import GroupDao from "../dao/authorization-group-dao";

const tenantDao: TenantDao = getTenantDaoImpl();
const groupDao: GroupDao = getAuthorizationGroupDaoImpl();

class GroupService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        return groupDao.getAuthorizationGroups(tenantId);
    }

    public async getGroupById(groupId: string): Promise<AuthorizationGroup> {
        
        const group: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(groupId);
        if(!group){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        return Promise.resolve(group);        
    }

    public async createGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const tenant: Tenant | null = await tenantDao.getTenantById(group.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND_FOR_GROUP_CREATION");
        }
        group.groupId = randomUUID().toString();
        return groupDao.createAuthorizationGroup(group);
    }

    public async updateGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const existingGroup: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(group.groupId);
        if(!existingGroup){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        existingGroup.groupName = group.groupName;
        existingGroup.default = group.default;
        return groupDao.updateAuthorizationGroup(group);
    }

    public async deleteGroup(groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserToGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        throw new Error("Method not implemented.");
    }
    
    public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default GroupService;