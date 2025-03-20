import { AuthorizationGroup, AuthorizationGroupUserRel, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant, User, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import GroupDao from "../dao/authorization-group-dao";
import { NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { DaoImpl } from "../data-sources/dao-impl";
import IdentityDao from "../dao/identity-dao";


const tenantDao: TenantDao = DaoImpl.getInstance().getTenantDao();
const groupDao: GroupDao = DaoImpl.getInstance().getAuthorizationGroupDao();
const searchClient: Client = getOpenSearchClient();
const identityDao: IdentityDao = DaoImpl.getInstance().getIdentityDao();

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
        const user: User | null = await identityDao.getUserBy("id", userId);
        // Checks:
        // 1.   Does the user exist
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        // 2.   Does the authz group exist
        const authzGroup: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(groupId);
        if(!authzGroup){
            throw new GraphQLError("ERROR_AUTHORIZATION_GROUP_DOES_NOT_EXIST");
        }
        // 3.   Is the user a member of the tenant?
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(authzGroup.tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError("ERROR_INVALID_TENANT_FOR_USER");
        }

        const r: AuthorizationGroupUserRel = await groupDao.addUserToAuthorizationGroup(userId, groupId);

        const document: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_EASTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: authzGroup.tenantId,
            parentid: authzGroup.groupId,
            parenttype: SearchResultType.AuthorizationGroup,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${groupId}::${userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document,
            refresh: "wait_for"
        });

        return Promise.resolve(r);
        
    }
    
    public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
        await groupDao.removeUserFromAuthorizationGroup(userId, groupId);
        
        await searchClient.delete({
            id: `${groupId}::${userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            refresh: "wait_for"
        });  
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        return groupDao.getUserAuthorizationGroups(userId);
    }
}

export default GroupService;