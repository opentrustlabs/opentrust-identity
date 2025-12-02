import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel, Client, ErrorDetail, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant, User, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import { AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE, AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE, AUTHENTICATION_GROUP_UPDATE_SCOPE, AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP, CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP_USER_REL, CHANGE_EVENT_CLASS_CLIENT_AUTHENTICATION_GROUP, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, CLIENT_TYPE_SERVICE_ACCOUNT, NAME_ORDER_EASTERN, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { Client as SearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import IdentityDao from "../dao/identity-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { ServiceAuthorizationWrapper, authorizeByScopeAndTenant } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";
import { logWithDetails } from "../logging/logger";


const searchClient: SearchClient = getOpenSearchClient();

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authenticationGroupDao: AuthenticationGroupDao = DaoFactory.getInstance().getAuthenticationGroupDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class AuthenticationGroupService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        // Need to specify at least one parameter
        if(!tenantId && !clientId && !userId){
            return [];
        }
        
        if(this.oidcContext.portalUserProfile?.managementAccessTenantId === this.oidcContext.rootTenant.tenantId){
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], null);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            return authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
        }
        else if(tenantId){
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            return authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
        }
        else if(clientId){
            const client: Client | null = await clientDao.getClientById(clientId);
            if(!client){
                throw new GraphQLError(ERROR_CODES.EC00001.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00001}});
            }
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], client.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            return authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
        }
        else if(userId){
            const rels = await identityDao.getUserTenantRelsByUserId(userId);
            // Does at least one tenant match?
            const matchingRel = rels.find(
                (rel: UserTenantRel) => rel.tenantId === this.oidcContext.portalUserProfile?.managementAccessTenantId
            )
            if(!matchingRel){
                throw new GraphQLError(ERROR_CODES.EC00006.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00006}});
            }
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], matchingRel.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }

            const arr: Array<AuthenticationGroup> = await authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
            return arr.filter(
                (g: AuthenticationGroup) => g.tenantId === matchingRel.tenantId
            );
        }
        return [];            
    }        

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getData = ServiceAuthorizationWrapper<any[], AuthenticationGroup | null>(
            {
                performOperation: async function(_, authenticationGroupId: string): Promise<AuthenticationGroup | null> {
                    return authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
                },
                additionalConstraintCheck: async function (oidcContext: OIDCContext, authenticationGroup: AuthenticationGroup | null): Promise<{ isAuthorized: boolean, errorDetail: ErrorDetail}> {
                    if(authenticationGroup && authenticationGroup.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorDetail: ERROR_CODES.EC00007};
                    }
                    else{
                        return { isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR};
                    }                    
                }
            } 
        );
        const t = await getData(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], authenticationGroupId);        
        return t;
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup | null> {

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_CREATE_SCOPE, authenticationGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(authenticationGroup.tenantId);
        if (!tenant) {
                throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008 }});
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00009 }});
        }
        
        authenticationGroup.authenticationGroupId = randomUUID().toString();
        const g = await authenticationGroupDao.createAuthenticationGroup(authenticationGroup);

        if(g !== null){
            await this.updateSearchIndex(g);
        }
        changeEventDao.addChangeEvent({
            objectId: authenticationGroup.authenticationGroupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...authenticationGroup})
        });
        return Promise.resolve(g);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {

        const existingAuthenticationGroup = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroup.authenticationGroupId);
        if (!existingAuthenticationGroup) {
            throw new GraphQLError(ERROR_CODES.EC00010.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00010}});
        }
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_UPDATE_SCOPE, existingAuthenticationGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        // If the incoming authn group is set to default, but previous it had been set to NOT be the default, then
        // we need to remove all of the authn/group rels after the db and search index have been updated.
        const needToDeleteUserGroupRels: boolean = authenticationGroup.defaultGroup === true && existingAuthenticationGroup.defaultGroup === false;

        existingAuthenticationGroup.authenticationGroupDescription = authenticationGroup.authenticationGroupDescription;
        existingAuthenticationGroup.authenticationGroupName = authenticationGroup.authenticationGroupName;
        existingAuthenticationGroup.defaultGroup = authenticationGroup.defaultGroup;

        await authenticationGroupDao.updateAuthenticationGroup(existingAuthenticationGroup);
        await this.updateSearchIndex(existingAuthenticationGroup);
        changeEventDao.addChangeEvent({
            objectId: authenticationGroup.authenticationGroupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...existingAuthenticationGroup})
        });

        if(needToDeleteUserGroupRels === true){
            // No need to wait on the deletion since it may be 1000s of records
            authenticationGroupDao.deleteUserAuthenticationGroupRels(authenticationGroup.authenticationGroupId);
            this.removeUserAuthenticationGroupSearchRecords(authenticationGroup.authenticationGroupId);
        }
        
        return Promise.resolve(existingAuthenticationGroup);
    }


    protected async removeUserAuthenticationGroupSearchRecords(authenticationGroupId: string): Promise<void> {        
        const query: any = {
            bool: {
                must: []
            }
        }
        query.bool.must.push({
            term: { parentid: authenticationGroupId }
        });
        query.bool.must.push({
            term: { childtype: SearchResultType.User }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchBody: any = {
            query: query
        }
        try {
            searchClient.deleteByQuery({
                index: SEARCH_INDEX_REL_SEARCH,
                body: searchBody,
                requests_per_second: 100,
                conflicts: "proceed",
                wait_for_completion: false,
                scroll: "240m"
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error bulk deleting user-authz-group rel search index records. ${err.message}.`, {...err, authenticationGroupId});
        } 
    }

    protected async updateSearchIndex(authenticationGroup: AuthenticationGroup): Promise<void> {
        const document: ObjectSearchResultItem = {
            name: authenticationGroup.authenticationGroupName,
            description: authenticationGroup.authenticationGroupDescription,
            objectid: authenticationGroup.authenticationGroupId,
            objecttype: SearchResultType.AuthenticationGroup,
            owningtenantid: authenticationGroup.tenantId,
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: "",
            subtypekey: ""            
        }
        
        await searchClient.index({
            id: authenticationGroup.authenticationGroupId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });  
        
        const relSearch: RelSearchResultItem = {
            childid: authenticationGroup.authenticationGroupId,
            childname: authenticationGroup.authenticationGroupName,
            childtype: SearchResultType.AuthenticationGroup,
            owningtenantid: authenticationGroup.tenantId,
            parentid: authenticationGroup.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: authenticationGroup.authenticationGroupDescription
        }
        await searchClient.index({
            id: `${authenticationGroup.tenantId}::${authenticationGroup.authenticationGroupId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });
    }


    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if (!client) {
            throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011 }});
        }
        // Is the client type enabled for authenticaiton groups?
        if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT){
            throw new GraphQLError(ERROR_CODES.EC00189.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00189 }});
        }
        const authenticationGroup = await this.getAuthenticationGroupById(authenticationGroupId);
        if (!authenticationGroup) {
            throw new GraphQLError(ERROR_CODES.EC00010.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00010 }});
        }
        // Do the tenants match?
        if (authenticationGroup.tenantId !== client.tenantId) {
            throw new GraphQLError(ERROR_CODES.EC00012.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00012 }});
        }
        

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const newRel = await authenticationGroupDao.assignAuthenticationGroupToClient(authenticationGroupId, clientId);
        changeEventDao.addChangeEvent({
            objectId: authenticationGroupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_AUTHENTICATION_GROUP,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({authenticationGroupId, clientId})
        });

        const document: RelSearchResultItem = {
            childid: client.clientId,
            childname: client.clientName,
            childtype: SearchResultType.Client,
            owningtenantid: authenticationGroup.tenantId,
            parentid: authenticationGroup.authenticationGroupId,
            parenttype: SearchResultType.AuthenticationGroup,
            parentname: authenticationGroup.authenticationGroupName,
            childdescription: client.clientDescription
        }
        await searchClient.index({
            id: `${authenticationGroupId}::${clientId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document,
            refresh: "wait_for"
        });

        return Promise.resolve(newRel);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        const authnGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);

        if(authnGroup){
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE, authnGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            authenticationGroupDao.removeAuthenticationGroupFromClient(authenticationGroupId, clientId);
            changeEventDao.addChangeEvent({
                objectId: authenticationGroupId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_CLIENT_AUTHENTICATION_GROUP,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
                changeTimestamp: Date.now(),
                data: JSON.stringify({authenticationGroupId, clientId})
            });
            await searchClient.delete({
                id: `${authenticationGroupId}::${clientId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                refresh: "wait_for"
            });
        }

        return Promise.resolve();
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        const user: User | null = await identityDao.getUserBy("id", userId);
        // Checks:
        // 1.   Does the user exist
        if(!user){
            throw new GraphQLError(ERROR_CODES.EC00013.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00013 }});
        }
        // 2.   Does the authn group exist.
        const authnGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
        if(!authnGroup){
            throw new GraphQLError(ERROR_CODES.EC00010.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00010 }});
        }
        // 3.   Is the user a member of the tenant?
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(authnGroup.tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError(ERROR_CODES.EC00014.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00014 }});
        }

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, userTenantRel.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        // 4.   Is this a default Authn group? If so, then do not allow assignment
        if(authnGroup.defaultGroup === true){
            throw new GraphQLError(ERROR_CODES.EC00225.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00225}});
        }

        const r: AuthenticationGroupUserRel = await authenticationGroupDao.assignUserToAuthenticationGroup(userId, authenticationGroupId);

        const document: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_EASTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: authnGroup.tenantId,
            parentid: authnGroup.authenticationGroupId,
            parenttype: SearchResultType.AuthenticationGroup,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${authenticationGroupId}::${userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document,
            refresh: "wait_for"
        });
        changeEventDao.addChangeEvent({
            objectId: authenticationGroupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP_USER_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({authenticationGroupId, userId})
        });

        return r;

    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        const authnGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
        if(authnGroup){
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, authnGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            await authenticationGroupDao.removeUserFromAuthenticationGroup(userId, authenticationGroupId);

            await searchClient.delete({
                id: `${authenticationGroupId}::${userId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                refresh: "wait_for"
            });
        }
        changeEventDao.addChangeEvent({
            objectId: authenticationGroupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP_USER_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({authenticationGroupId, userId})
        });
        
        return Promise.resolve();
    }
    
}

export default AuthenticationGroupService;