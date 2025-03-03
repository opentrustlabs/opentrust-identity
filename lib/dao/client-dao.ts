import { Client, ClientAuthHistory } from "@/graphql/generated/graphql-types";


abstract class ClientDao {

        abstract getClients(tenantId?: string, clientIds?: Array<string>): Promise<Array<Client>>;
    
        abstract getClientById(clientId: string): Promise<Client | null>;
    
        abstract createClient(client: Client): Promise<Client>;
    
        abstract updateClient(client: Client): Promise<Client>;
    
        abstract deleteClient(clientId: string): Promise<void>;

        // abstract assignContactsToClient(clientId: string, contactList: Array<Contact>): Promise<Array<Contact>>;

        abstract getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null>;

        abstract saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void>;

        abstract deleteClientAuthHistory(jti: string): Promise<void>;
        
}

export default ClientDao;