import { AuthorizationGroup, AuthorizationGroupUserRel, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant, User, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import GroupDao from "../dao/authorization-group-dao";
import { AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, AUTHORIZATION_GROUP_UPDATE_SCOPE, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP, CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_USER_REL, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, NAME_ORDER_EASTERN, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { DaoFactory } from "../data-sources/dao-factory";
import IdentityDao from "../dao/identity-dao";
import { authorizeByScopeAndTenant, filterResultsByTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";


class GroupService {

    static tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
    static groupDao: GroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
    static searchClient: Client = getOpenSearchClient();
    static identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
    static changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

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
                    const groups = await GroupService.groupDao.getAuthorizationGroups(...args);
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
                    const result = await GroupService.groupDao.getAuthorizationGroupById(groupId);
                    return result;
                },
                async additionalConstraintCheck(oidcContext: OIDCContext, result: AuthorizationGroup | null) {
                    if(result && result.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorDetail: ERROR_CODES.EC00027, result: null};
                    }
                    else{
                        return { isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR, result: result};
                    } 
                }
            }
        );
        const t = await getData(this.oidcContext, [AUTHORIZATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], groupId);
        return t;           
    }

    public async createGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_CREATE_SCOPE, group.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const tenant: Tenant | null = await GroupService.tenantDao.getTenantById(group.tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00009}});
        }
        
        group.groupId = randomUUID().toString();

        await GroupService.groupDao.createAuthorizationGroup(group);
        await this.updateSearchIndex(group);
        GroupService.changeEventDao.addChangeEvent({
            objectId: group.groupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...group})
        });
        return Promise.resolve(group);
    }

    public async updateGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        
        const existingGroup: AuthorizationGroup | null = await GroupService.groupDao.getAuthorizationGroupById(group.groupId);
        if(!existingGroup){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00028}});
        }
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_UPDATE_SCOPE, existingGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        // If the incoming authz group is set to default, but previous it had been set to NOT be the default, then
        // we need to remove all of the authz/group rels after the db and search index have been updated.
        const needToDeleteUserGroupRels: boolean = group.default === true && existingGroup.default === false;
        
        existingGroup.groupName = group.groupName;
        existingGroup.default = group.default;
        existingGroup.groupDescription = group.groupDescription;
        await GroupService.groupDao.updateAuthorizationGroup(existingGroup);
        await this.updateSearchIndex(existingGroup);
        GroupService.changeEventDao.addChangeEvent({
            objectId: group.groupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...group})
        });

        if(needToDeleteUserGroupRels === true){
            // No need to wait on this since it may contain 1000s of relationships.
           GroupService.groupDao.deleteUserAuthorizationGroupRels(group.groupId);
        }

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
        
        await GroupService.searchClient.index({
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
        await GroupService.searchClient.index({
            id: `${group.tenantId}::${group.groupId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });        
    }
    

    public async addUserToGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const user: User | null = await GroupService.identityDao.getUserBy("id", userId);
        // Checks:
        // 1.   Does the user exist
        if(!user){
            throw new GraphQLError(ERROR_CODES.EC00013.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00013}});
        }
        // 2.   Does the authz group exist
        const authzGroup: AuthorizationGroup | null = await GroupService.groupDao.getAuthorizationGroupById(groupId);
        if(!authzGroup){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00028}});
        }
        // 3.   Is the user a member of the tenant?
        const userTenantRel: UserTenantRel | null = await GroupService.identityDao.getUserTenantRel(authzGroup.tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError(ERROR_CODES.EC00029.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00029}});
        }

        // Is the user authorized to perform the action?
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, authzGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        if(authzGroup.default === true){
            throw new GraphQLError(ERROR_CODES.EC00226.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00226}});
        }

        const r: AuthorizationGroupUserRel = await GroupService.groupDao.addUserToAuthorizationGroup(userId, groupId);

        const document: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_EASTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: authzGroup.tenantId,
            parentid: authzGroup.groupId,
            parenttype: SearchResultType.AuthorizationGroup,
            childdescription: user.email
        }
        await GroupService.searchClient.index({
            id: `${groupId}::${userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document,
            refresh: "wait_for"
        });

        GroupService.changeEventDao.addChangeEvent({
            objectId: groupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_USER_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({groupId, userId})
        });

        return Promise.resolve(r);
        
    }
    
    public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
        const authzGroup: AuthorizationGroup | null = await GroupService.groupDao.getAuthorizationGroupById(groupId);
        if(authzGroup){
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, authzGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }

            await GroupService.groupDao.removeUserFromAuthorizationGroup(userId, groupId);        
            await GroupService.searchClient.delete({
                id: `${groupId}::${userId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                refresh: "wait_for"
            });  
        }

        GroupService.changeEventDao.addChangeEvent({
            objectId: groupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_USER_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({groupId, userId})
        });

        return Promise.resolve();
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {

        const getData = ServiceAuthorizationWrapper(
            {
                performOperation: async function (): Promise<Array<AuthorizationGroup>>  {
                    const groups: Array<AuthorizationGroup> = await GroupService.groupDao.getUserAuthorizationGroups(userId);
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
        const groups = await getData(this.oidcContext, [AUTHORIZATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE]);
        return groups || [];
    }
}

export default GroupService;