import { Client, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import ClientDao from "@/lib/dao/client-dao";
import { generateRandomToken } from "@/utils/dao-utils";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CLIENT_CREATE_SCOPE, CLIENT_READ_SCOPE, CLIENT_SECRET_ENCODING, CLIENT_TYPES_DISPLAY, CLIENT_UPDATE_SCOPE, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";

const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();

class ClientService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }


    public async getClients(tenantId?: string): Promise<Array<Client>> {
        const getData = ServiceAuthorizationWrapper(
            {
                preProcess: async function(oidcContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return [args];
                },
                performOperation: async function(_, ...args) {
                    const clients: Array<Client> = await clientDao.getClients(...args);
                    return clients;
                },
                postProcess: async function(_, result) {
                    if(result){
                        result.forEach(
                            (c: Client) => c.clientSecret = ""
                        );                        
                    }
                    return result;
                },
            }
        );

        const clients = await getData(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        return clients || [];
    }
    

    public async getClientById(clientId: string): Promise<Client | null> {
        const getData = ServiceAuthorizationWrapper<any[], Client | null>(
            {
                performOperation: async function(oidcContext, ...args): Promise<Client | null> {
                    const client = await clientDao.getClientById(clientId);                       
                    return client;
                },
                additionalConstraintCheck: async function(oidcContext, result: Client | null): Promise<{ isAuthorized: boolean; errorMessage: string | null}> {
                    if(result && result.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorMessage: "ERROR_NO_ACCESS_TO_TENANT"}
                    }
                    return {isAuthorized: true, errorMessage: null}
                },
                postProcess: async function(_, result) {
                    if(result){
                        result.clientSecret = ""
                    }
                    return result;
                },
            }
        );

        const client = getData(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], clientId);
        return client === null ? Promise.resolve(null) : Promise.resolve(client);
    }

    public async createClient(client: Client): Promise<Client> {
        const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            });
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError("ERROR_TENANT_IS_DISABLED_OR_MARKED_FOR_DELETE");
        }

        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_CREATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        client.clientId = randomUUID().toString();
        const clientSecret = generateRandomToken(32, CLIENT_SECRET_ENCODING);
        const encryptedClientSecret = await kms.encrypt(clientSecret);
        if(encryptedClientSecret === null){
            throw new GraphQLError("ERROR_UNABLE_TO_ENCRYPT_CLIENT_SECRET");
        }        
        client.clientSecret = encryptedClientSecret;

        await clientDao.createClient(client);
        await this.updateSearchIndex(client);
        // Now we need to set the actual client secret back on the object that
        // we are going to return so that the user can copy it somewhere.
        client.clientSecret = clientSecret;
        return Promise.resolve(client);
    }

    public async updateClient(client: Client): Promise<Client> {
        const clientToUpdate: Client | null = await this.getClientById(client.clientId);
        
        if(!clientToUpdate){
            throw new GraphQLError("ERROR_CLIENT_NOT_FOUND")
        }
        
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, clientToUpdate.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        // tenantId is a write-only-read-only property, no updates regardless of what the client has sent
        // same for client secret
        clientToUpdate.clientDescription = client.clientDescription;
        clientToUpdate.clientName = client.clientName;
        clientToUpdate.enabled = client.enabled;
        clientToUpdate.oidcEnabled = client.oidcEnabled;
        // Only allow the pkce entension when oidc (i.e. SSO) is enabled.
        clientToUpdate.pkceEnabled = client.oidcEnabled === false ? false : client.pkceEnabled;
        clientToUpdate.clientTokenTTLSeconds = client.clientTokenTTLSeconds;
        clientToUpdate.clientType = client.clientType;
        clientToUpdate.maxRefreshTokenCount = client.maxRefreshTokenCount;
        clientToUpdate.userTokenTTLSeconds = client.userTokenTTLSeconds;        

        await clientDao.updateClient(clientToUpdate);
        await this.updateSearchIndex(clientToUpdate);

        return Promise.resolve(clientToUpdate);
    }

    protected async updateSearchIndex(client: Client): Promise<void> {
        
        const document: ObjectSearchResultItem = {
            name: client.clientName,
            description: client.clientDescription,
            objectid: client.clientId,
            objecttype: SearchResultType.Client,
            owningtenantid: client.tenantId,
            email: "",
            enabled: client.enabled,
            owningclientid: "",
            subtype: CLIENT_TYPES_DISPLAY.get(client.clientType),
            subtypekey: client.clientType
        }
        
        await searchClient.index({
            id: client.clientId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });

        const relSearch: RelSearchResultItem = {
            childid: client.clientId,
            childname: client.clientName,
            childtype: SearchResultType.Client,
            owningtenantid: client.tenantId,
            parentid: client.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: client.clientDescription
        }
        await searchClient.index({
            id: `${client.tenantId}::${client.clientId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });
        
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>>{
        const client: Client | null = await clientDao.getClientById(clientId);
        if(client){
            const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], client.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "ERROR");
            }
            return clientDao.getRedirectURIs(clientId);
        }
        return [];        
    }

    public async addRedirectURI(clientId: string, uri: string): Promise<string>{
        const client: Client | null = await this.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_CLIENT_BY_ID");
        }
        if(client.oidcEnabled === false){
            throw new GraphQLError("ERROR_OIDC_NOT_ENABLED_FOR_THIS_CLIENT");
        }

        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        return clientDao.addRedirectURI(clientId, uri);
    }

    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{
        const client: Client | null = await this.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_CLIENT_BY_ID");
        }
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }
        return clientDao.removeRedirectURI(clientId, uri);
    }
    
}

export default ClientService;