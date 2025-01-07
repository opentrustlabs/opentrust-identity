import { Client, Contact, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import ClientDao from "@/lib/dao/client-dao";
import { generateRandomToken, getClientDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CLIENT_SECRET_ENCODING, CONTACT_TYPE_FOR_CLIENT } from "@/utils/consts";

const clientDao: ClientDao = getClientDaoImpl();
const tenantDao: TenantDao = getTenantDaoImpl();

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
        return clientDao.createClient(client);                
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
        clientToUpdate.redirectUris = client.redirectUris;
        return clientDao.updateClient(clientToUpdate);
    }

    public async deleteClient(clientId: string): Promise<void> {
        // delete all LoginGroupClientRel
        // ClientTenantScopeRel
        // delete client
        throw new Error("Method not implemented.");
    }

    public async assignContactsToClient(clientId: string, contactList: Array<Contact>): Promise<Array<Contact>>{
        contactList.forEach(
            (c: Contact) => {
                c.objectid = clientId;
                c.objecttype = CONTACT_TYPE_FOR_CLIENT
            }
        );
        const invalidContacts = contactList.filter(
            (c: Contact) => {
                if(c.email === null || c.email === "" || c.email.length < 3 || c.email.indexOf("@") < 0){
                    return true;
                }
                if(c.name === null || c.name === "" || c.name.length < 3){
                    return true;
                }
                return false;
            }
        );
        if(invalidContacts.length > 0){
            throw new GraphQLError("ERROR_INVALID_CONTACT_INFORMATION");
        }
        return clientDao.assignContactsToClient(clientId, contactList);
    }
}

export default ClientService;