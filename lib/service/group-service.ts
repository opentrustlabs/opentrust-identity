import { AuthorizationGroup, AuthorizationGroupUserRel, ObjectSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getAuthorizationGroupDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import GroupDao from "../dao/authorization-group-dao";
import { SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { Client } from "@opensearch-project/opensearch";


const tenantDao: TenantDao = getTenantDaoImpl();
const groupDao: GroupDao = getAuthorizationGroupDaoImpl();
const searchClient: Client = getOpenSearchClient();

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

        await groupDao.createAuthorizationGroup(group);
        await this.updateSearchIndex(group);
        return Promise.resolve(group);
    }

    public async updateGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const existingGroup: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(group.groupId);
        if(!existingGroup){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        existingGroup.groupName = group.groupName;
        existingGroup.default = group.default;
        existingGroup.groupDescription = group.groupDescription;
        await groupDao.updateAuthorizationGroup(existingGroup);
        await this.updateSearchIndex(existingGroup);
        return Promise.resolve(existingGroup);
    }

    protected async updateSearchIndex(group: AuthorizationGroup): Promise<void> {
        const document: ObjectSearchResultItem = {
            name: group.groupName,
            description: group.groupDescription,
            objectid: group.groupId,
            objecttype: SearchResultType.AuthorizationGroup,
            owningtenantid: group.tenantId,
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: "",
            subtypekey: ""            
        }
        
        await searchClient.index({
            id: group.groupId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });        
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