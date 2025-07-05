import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel, Client, ObjectSearchResultItem, RelSearchResultItem, Scope, SearchResultType, Tenant, User, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import { AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE, NAME_ORDER_EASTERN, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { Client as SearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import IdentityDao from "../dao/identity-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { withAuthAndInputFilter, containsScope } from "@/utils/authz-utils";

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
        containsScope(AUTHENTICATION_GROUP_READ_SCOPE, this.oidcContext.portalUserProfile?.scope || [])
        
        return authenticationGroupDao.getAuthenticationGroups(tenantId, clientId, userId)
            
    }        

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {

        const getData = withAuthAndInputFilter(
            authenticationGroupDao.getAuthenticationGroupById,
            {                
                authorize: async function (oidcContext: OIDCContext, authenticationGroupId: string): Promise<{ isAuthorized: boolean; errorMessage: string | null; result: AuthenticationGroup | null; }> {                    
                    const result = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
                    if(result && result.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorMessage: "ERROR_INSUFFICIENT_PERMISSIONS_TO_READ_OBJECT", result: null};
                    }
                    else{
                        return { isAuthorized: true, errorMessage: null, result: result};
                    }                    
                }
            } 
        );
        const t = await getData(this.oidcContext, [AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE], authenticationGroupId);
        return t;

    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup | null> {
        const createData = withAuthAndInputFilter(
            authenticationGroupDao.createAuthenticationGroup,
            {
                preProcess: async function (_, authenticationGroup: AuthenticationGroup): Promise<[AuthenticationGroup]> {
                    authenticationGroup.authenticationGroupId = randomUUID().toString();
                    return Promise.resolve([authenticationGroup]);
                    
                },
                authorize: async function (oidcContext: OIDCContext, authenticationGroup: AuthenticationGroup): Promise<{ isAuthorized: boolean; errorMessage: string | null; result: AuthenticationGroup | null; }> {
                    if(oidcContext.portalUserProfile?.managementAccessTenantId !== authenticationGroup.tenantId){
                        return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSIONS_FOR_TENANT", result: null};
                    }
                    const tenant: Tenant | null = await tenantDao.getTenantById(authenticationGroup.tenantId);
                    if (!tenant) {
                         return {isAuthorized: false, errorMessage: "ERROR_TENANT_DOES_NOT_EXIST", result: null};
                    }
                    const g = await authenticationGroupDao.createAuthenticationGroup(authenticationGroup);
                    return {isAuthorized: true, errorMessage: null, result: g}                    
                }
            }                
        );

        const g = await createData(this.oidcContext, AUTHENTICATION_GROUP_CREATE_SCOPE, authenticationGroup);
        if(g !== null){
            await this.updateSearchIndex(g);
        }        
        return Promise.resolve(g);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        
        const updateData = withAuthAndInputFilter(
            authenticationGroupDao.updateAuthenticationGroup,
            {
                authorize: async function (oidcContext: OIDCContext, authenticationGroup: AuthenticationGroup): Promise<{ isAuthorized: boolean; errorMessage: string | null; result: AuthenticationGroup | null; }> {
                    return {isAuthorized: false, errorMessage: "ERROR_TENANT_DOES_NOT_EXIST", result: null};
                }
            }
        );

        const existingAuthenticationGroup = await authenticationGroupDao.getAuthenticationGroupById(authenticationGroup.authenticationGroupId);
        if (!existingAuthenticationGroup) {
            throw new GraphQLError("ERROR_CANNOT_FIND_LOGIN_GROUP_FOR_UPDATE");
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
        return authenticationGroupDao.deleteAuthenticationGroup(authenticationGroupId);
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
        const newRel = await authenticationGroupDao.assignAuthenticationGroupToClient(authenticationGroupId, clientId);        
        return Promise.resolve(newRel);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        return authenticationGroupDao.removeAuthenticationGroupFromClient(authenticationGroupId, clientId);
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
        await authenticationGroupDao.removeUserFromAuthenticationGroup(userId, authenticationGroupId);

        await searchClient.delete({
            id: `${authenticationGroupId}::${userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            refresh: "wait_for"
        });

        return Promise.resolve();
    }
    
}

export default AuthenticationGroupService;