import { Group, Tenant, UserGroupRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getGroupDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import GroupDao from "../dao/authorization-group-dao";

const tenantDao: TenantDao = getTenantDaoImpl();
const groupDao: GroupDao = getGroupDaoImpl();

class GroupService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getGroups(tenantId?: string): Promise<Array<Group>> {
        return groupDao.getGroups(tenantId);
    }

    public async getGroupById(groupId: string): Promise<Group> {
        
        const group: Group | null = await groupDao.getGroupById(groupId);
        if(!group){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        return Promise.resolve(group);        
    }

    public async createGroup(group: Group): Promise<Group> {
        const tenant: Tenant | null = await tenantDao.getTenantById(group.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND_FOR_GROUP_CREATION");
        }
        group.groupId = randomUUID().toString();
        return groupDao.createGroup(group);
    }

    public async updateGroup(group: Group): Promise<Group> {
        const existingGroup: Group | null = await groupDao.getGroupById(group.groupId);
        if(!existingGroup){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        existingGroup.groupName = group.groupName;
        existingGroup.default = group.default;
        return groupDao.updateGroup(group);
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

export default GroupService;