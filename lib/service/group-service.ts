import { AuthorizationGroup, AuthorizationGroupUserRel, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant, User, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import GroupDao from "../dao/authorization-group-dao";
import { AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, AUTHORIZATION_GROUP_UPDATE_SCOPE, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, NAME_ORDER_EASTERN, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { DaoFactory } from "../data-sources/dao-factory";
import IdentityDao from "../dao/identity-dao";
import { authorizeByScopeAndTenant, containsScope, filterResultsByTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const groupDao: GroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const searchClient: Client = getOpenSearchClient();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();

class GroupService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {

        const getData = ServiceAuthorizationWrapper(
            {
                async preProcess(oidcContext, tenantId) {
                    if(!tenantId){
                        if(oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
                            if(oidcContext.portalUserProfile && oidcContext.portalUserProfile.managementAccessTenantId){
                                return [oidcContext.portalUserProfile.managementAccessTenantId];
                            }
                            else{
                                return [tenantId];
                            }
                        }
                        else{
                            return [tenantId];
                        }
                    }
                    return [tenantId];
                },
                async performOperation(_, ...args): Promise<Array<AuthorizationGroup>> {
                    const groups = await groupDao.getAuthorizationGroups(...args);
                    return groups;
                }
            }
        );
        const data = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE], tenantId);
        return data ? data : [];
        
    }

    public async getGroupById(groupId: string): Promise<AuthorizationGroup | null> {            
        const getData = ServiceAuthorizationWrapper(
            {
                async performOperation(_, groupId): Promise<AuthorizationGroup | null> {
                    const result = await groupDao.getAuthorizationGroupById(groupId);
                    return result;
                },
                async additionalConstraintCheck(oidcContext: OIDCContext, result: AuthorizationGroup | null) {
                    if(result && result.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorCode: ERROR_CODES.EC00027.errorCode, result: null};
                    }
                    else{
                        return { isAuthorized: true, errorCode: "", result: result};
                    } 
                }
            }
        );
        const t = await getData(this.oidcContext, [AUTHORIZATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], groupId);
        return t;           
    }

    public async createGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {

        const {isAuthorized, errorCode} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_CREATE_SCOPE, group.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorCode);
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(group.tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode);
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode);
        }
        
        group.groupId = randomUUID().toString();

        await groupDao.createAuthorizationGroup(group);
        await this.updateSearchIndex(group);
        return Promise.resolve(group);
    }

    public async updateGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        
        const existingGroup: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(group.groupId);
        if(!existingGroup){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode);
        }
        const {isAuthorized, errorCode} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_UPDATE_SCOPE, existingGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorCode);
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

        const relSearch: RelSearchResultItem = {
            childid: group.groupId,
            childname: group.groupName,
            childtype: SearchResultType.AuthorizationGroup,
            owningtenantid: group.tenantId,
            parentid: group.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: group.groupDescription
        }
        await searchClient.index({
            id: `${group.tenantId}::${group.groupId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });        
    }
    

    public async addUserToGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const user: User | null = await identityDao.getUserBy("id", userId);
        // Checks:
        // 1.   Does the user exist
        if(!user){
            throw new GraphQLError(ERROR_CODES.EC00013.errorCode);
        }
        // 2.   Does the authz group exist
        const authzGroup: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(groupId);
        if(!authzGroup){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode);
        }
        // 3.   Is the user a member of the tenant?
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(authzGroup.tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError(ERROR_CODES.EC00029.errorCode);
        }

        // Is the user authorized to perform the action?
        const {isAuthorized, errorCode} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, authzGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorCode);
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
        const authzGroup: AuthorizationGroup | null = await groupDao.getAuthorizationGroupById(groupId);
        if(authzGroup){
            const {isAuthorized, errorCode} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, authzGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorCode);
            }

            await groupDao.removeUserFromAuthorizationGroup(userId, groupId);        
            await searchClient.delete({
                id: `${groupId}::${userId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                refresh: "wait_for"
            });  
        }
        return Promise.resolve();
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {

        const getData = ServiceAuthorizationWrapper(
            {
                performOperation: async function (_, __): Promise<Array<AuthorizationGroup>>  {
                    const groups: Array<AuthorizationGroup> = await groupDao.getUserAuthorizationGroups(userId);
                    return groups;
                }, 
                postProcess: async function(oidcContext: OIDCContext, result: Array<AuthorizationGroup> | null) {
                    if(result && oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
                        return filterResultsByTenant(result, oidcContext, (g: AuthorizationGroup) => g.tenantId);   
                    }
                    else {
                        return result;
                    }                    
                },
            }
        );
        const groups = await getData(this.oidcContext, [AUTHORIZATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], userId);
        return groups || [];
    }
}

export default GroupService;