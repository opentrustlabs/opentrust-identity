import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel, Client, ObjectSearchResultItem, RelSearchResultItem, Scope, SearchResultType, Tenant, User, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import { AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE, AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_DELETE_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE, AUTHENTICATION_GROUP_UPDATE_SCOPE, AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, NAME_ORDER_EASTERN, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { Client as SearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import IdentityDao from "../dao/identity-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { ServiceAuthorizationWrapper, authorizeByScopeAndTenant } from "@/utils/authz-utils";


const searchClient: SearchClient = getOpenSearchClient();

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authenticationGroupDao: AuthenticationGroupDao = DaoFactory.getInstance().getAuthenticationGroupDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();

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
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], null);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            return authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
        }
        else if(tenantId){
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            return authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
        }
        else if(clientId){
            const client: Client | null = await clientDao.getClientById(clientId);
            if(!client){
                throw new GraphQLError("ERROR_INVALID_CLIENT");
            }
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], client.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
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
                throw new GraphQLError("ERROR_NO_MATCHING_TENANT");
            }
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], matchingRel.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            const arr: Array<AuthenticationGroup> = await authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId);
            return arr.filter(
                (g: AuthenticationGroup) => g.tenantId === matchingRel.tenantId
            );
        }
        return [];            
    }        

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const getData = ServiceAuthorizationWrapper<any[], AuthenticationGroup | null>(
            {
                performOperation: async function(_, authenticationGroupId: string): Promise<AuthenticationGroup | null> {
                    return authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
                },
                additionalConstraintCheck: async function (oidcContext: OIDCContext, authenticationGroup: AuthenticationGroup | null): Promise<{ isAuthorized: boolean, errorMessage: string | null}> {
                    if(authenticationGroup && authenticationGroup.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorMessage: "ERROR_INSUFFICIENT_PERMISSIONS_TO_READ_OBJECT"};
                    }
                    else{
                        return { isAuthorized: true, errorMessage: null};
                    }                    
                }
            } 
        );
        const t = await getData(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], authenticationGroupId);
        return t;
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup | null> {

        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_CREATE_SCOPE, authenticationGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(authenticationGroup.tenantId);
        if (!tenant) {
                throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError("ERROR_TENANT_IS_DISABLED_OR_MARKED_FOR_DELETE");
        }
        
        authenticationGroup.authenticationGroupId = randomUUID().toString();
        const g = await authenticationGroupDao.createAuthenticationGroup(authenticationGroup);

        if(g !== null){
            await this.updateSearchIndex(g);
        }        
        return Promise.resolve(g);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {

        const existingAuthenticationGroup = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroup.authenticationGroupId);
        if (!existingAuthenticationGroup) {
            throw new GraphQLError("ERROR_CANNOT_FIND_AUTHENTICATION_GROUP_FOR_UPDATE");
        }
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_UPDATE_SCOPE, existingAuthenticationGroup.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        existingAuthenticationGroup.authenticationGroupDescription = authenticationGroup.authenticationGroupDescription;
        existingAuthenticationGroup.authenticationGroupName = authenticationGroup.authenticationGroupName;

        await authenticationGroupDao.updateAuthenticationGroup(existingAuthenticationGroup);
        await this.updateSearchIndex(existingAuthenticationGroup);
        return Promise.resolve(existingAuthenticationGroup);
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

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        // TODO
        // Remove the search index relationships
        const authNGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
        if(authNGroup){
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_DELETE_SCOPE, authNGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            // Need to delete 
            //      client/authn group rel
            //      user/authn group rel
            //      
            //await authenticationGroupDao.deleteAuthenticationGroup(authenticationGroupId);
        }
        
        return Promise.resolve();

        
    }


    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if (!client) {
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_EXIST_FOR_AUTHENTICATION_GROUP_ASSIGNMENT");
        }
        const authenticationGroup = await this.getAuthenticationGroupById(authenticationGroupId);
        if (!authenticationGroup) {
            throw new GraphQLError("ERROR_AUTHENTICATION_GROUP_DOES_NOT_EXIST_FOR_CLIENT_ASSIGNMENT");
        }
        // Do the tenants match?
        if (authenticationGroup.tenantId !== client.tenantId) {
            throw new GraphQLError("ERROR_CANNOT_ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT")
        }

        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        const newRel = await authenticationGroupDao.assignAuthenticationGroupToClient(authenticationGroupId, clientId);        
        return Promise.resolve(newRel);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        const authnGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
        if(authnGroup){
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE, authnGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            authenticationGroupDao.removeAuthenticationGroupFromClient(authenticationGroupId, clientId);
        }
        return Promise.resolve();
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        const user: User | null = await identityDao.getUserBy("id", userId);
        // Checks:
        // 1.   Does the user exist
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
        // 2.   Does the authn group exist
        const authnGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
        if(!authnGroup){
            throw new GraphQLError("ERROR_AUTHENTICATION_GROUP_DOES_NOT_EXIST");
        }
        // 3.   Is the user a member of the tenant?
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(authnGroup.tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError("ERROR_INVALID_TENANT_FOR_USER");
        }

        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, userTenantRel.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
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

        return r;

    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        const authnGroup: AuthenticationGroup | null = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
        if(authnGroup){
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, authnGroup.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            await authenticationGroupDao.removeUserFromAuthenticationGroup(userId, authenticationGroupId);

            await searchClient.delete({
                id: `${authenticationGroupId}::${userId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                refresh: "wait_for"
            });
        }
        
        return Promise.resolve();
    }
    
}

export default AuthenticationGroupService;