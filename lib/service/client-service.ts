import { Client, Contact, ObjectSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import ClientDao from "@/lib/dao/client-dao";
import { generateRandomToken, getClientDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CLIENT_SECRET_ENCODING, CLIENT_TYPES_DISPLAY, CONTACT_TYPE_FOR_CLIENT, SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";

const clientDao: ClientDao = getClientDaoImpl();
const tenantDao: TenantDao = getTenantDaoImpl();
const searchClient = getOpenSearchClient();

class ClientService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }


    public async getClients(tenantId?: string): Promise<Array<Client>> {
        return clientDao.getClients(tenantId);
    }

    public async getClientsByTenant(tenantId: string): Promise<Array<Client>> {
        const allClients = await this.getClients();
        const clients: Array<Client> = allClients.filter(
            (client: Client) => client.tenantId === tenantId
        );
        return Promise.resolve(clients)
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        const client = await clientDao.getClientById(clientId);        
        return client === undefined ? Promise.resolve(null) : Promise.resolve(client);
    }

    public async createClient(client: Client): Promise<Client> {
        const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            })
        }
        client.clientId = randomUUID().toString();
        client.clientSecret = generateRandomToken(32, CLIENT_SECRET_ENCODING);
        await clientDao.createClient(client);
        await this.updateSearchIndex(client);
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

    // public async assignContactsToClient(clientId: string, contactList: Array<Contact>): Promise<Array<Contact>>{
    //     contactList.forEach(
    //         (c: Contact) => {
    //             c.objectid = clientId;
    //             c.objecttype = CONTACT_TYPE_FOR_CLIENT
    //         }
    //     );
    //     const invalidContacts = contactList.filter(
    //         (c: Contact) => {
    //             if(c.email === null || c.email === "" || c.email.length < 3 || c.email.indexOf("@") < 0){
    //                 return true;
    //             }
    //             if(c.name === null || c.name === "" || c.name.length < 3){
    //                 return true;
    //             }
    //             return false;
    //         }
    //     );
    //     if(invalidContacts.length > 0){
    //         throw new GraphQLError("ERROR_INVALID_CONTACT_INFORMATION");
    //     }
    //     return clientDao.assignContactsToClient(clientId, contactList);
    // }
}

export default ClientService;