import { Client, ObjectSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import ClientDao from "@/lib/dao/client-dao";
import { generateRandomToken } from "@/utils/dao-utils";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CLIENT_SECRET_ENCODING, CLIENT_TYPES_DISPLAY, SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";

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
        return (await clientDao.getClients(tenantId)).map(
            (client: Client) => {
                client.clientSecret = "";
                return client;
            }
        );
    }
    

    public async getClientById(clientId: string): Promise<Client | null> {
        const client = await clientDao.getClientById(clientId);  
        if(client){
            client.clientSecret = "";
        }
        return client === undefined ? Promise.resolve(null) : Promise.resolve(client);
    }

    public async createClient(client: Client): Promise<Client> {
        const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            })
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
        // tenantId is a write-only-read-only property, no updates regardless of what the client has sent
        // same for client secret
        clientToUpdate.clientDescription = client.clientDescription;
        clientToUpdate.clientName = client.clientName;
        clientToUpdate.enabled = client.enabled;
        clientToUpdate.oidcEnabled = client.oidcEnabled;
        clientToUpdate.pkceEnabled = client.pkceEnabled;
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
        
    }

    public async deleteClient(clientId: string): Promise<void> {
        // delete all LoginGroupClientRel
        // ClientTenantScopeRel
        // delete client
        throw new Error("Method not implemented.");
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>>{
        return clientDao.getRedirectURIs(clientId);
    }

    public async addRedirectURI(clientId: string, uri: string): Promise<string>{
        return clientDao.addRedirectURI(clientId, uri);
    }

    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{
        return clientDao.removeRedirectURI(clientId, uri);
    }
    
}

export default ClientService;