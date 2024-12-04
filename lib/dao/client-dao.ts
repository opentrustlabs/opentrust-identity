import { Client } from "@/graphql/generated/graphql-types";


abstract class ClientDao {

        abstract getClients(tenantId?: string): Promise<Array<Client>>;
    
        abstract getClientById(clientId: string): Promise<Client | null>;
    
        abstract createClient(client: Client): Promise<Client>;
    
        abstract updateClient(client: Client): Promise<Client>;
    
        abstract deleteClient(clientId: string): Promise<void>;

        abstract validateClientAuthCredentials(clientId: string, clientSecret: string): Promise<boolean>;

        abstract validateClientAuthJwt(jwt: string): Promise<boolean>;
        
}

export default ClientDao;