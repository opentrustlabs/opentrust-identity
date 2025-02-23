import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel, Client, ObjectSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getClientDaoImpl, getAuthenticationGroupDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import ClientDao from "../dao/client-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import { SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";
import { Client as SearchClient } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";

const searchClient: SearchClient = getOpenSearchClient();

const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();
const authenticationGroupDao: AuthenticationGroupDao = getAuthenticationGroupDaoImpl();


class AuthenticationGroupService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getAuthenticationGroups(tenantId?: string): Promise<Array<AuthenticationGroup>> {
        return authenticationGroupDao.getAuthenticationGroups(tenantId);
    }

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        return authenticationGroupDao.getAuthenticationGroupById(authenticationGroupId);
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const tenant: Tenant | null = await tenantDao.getTenantById(authenticationGroup.tenantId);
        if (!tenant) {
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST_FOR_LOGIN_GROUP");
        }
        authenticationGroup.authenticationGroupId = randomUUID().toString();

        await authenticationGroupDao.createAuthenticationGroup(authenticationGroup);
        await this.updateSearchIndex(authenticationGroup);

        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        
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
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        return authenticationGroupDao.deleteAuthenticationGroup(authenticationGroupId);
    }


    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if (!client) {
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_EXIST_FOR_LOGIN_GROUP_ASSIGNMENT");
        }
        const authenticationGroup = await this.getAuthenticationGroupById(authenticationGroupId);
        if (!authenticationGroup) {
            throw new GraphQLError("ERROR_LOGIN_GROUP_DOES_NOT_EXIST_FOR_CLIENT_ASSIGNMENT");
        }
        // Do the tenants match?
        if (authenticationGroup.tenantId !== client.tenantId) {
            throw new GraphQLError("ERROR_CANNOT_ASSIGN_LOGIN_GROUP_TO_CLIENT")
        }
        const newRel = await authenticationGroupDao.assignAuthenticationGroupToClient(authenticationGroupId, clientId);        
        return Promise.resolve(newRel);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        return authenticationGroupDao.removeAuthenticationGroupFromClient(authenticationGroupId, clientId);
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default AuthenticationGroupService;