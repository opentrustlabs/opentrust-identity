import { Client, ClientAuthHistory, ClientFapiConfiguration, ClientFapiConfigurationInput, TokenEnrichmentConfiguration, TokenEnrichmentConfigurationInput } from "@/graphql/generated/graphql-types";

export type ClientFapiConfigurationLookupType = "clientid" | "identifiervalue";
abstract class ClientDao {

        abstract getClients(tenantId?: string, clientIds?: Array<string>): Promise<Array<Client>>;
    
        abstract getClientById(clientId: string): Promise<Client | null>;

        abstract getClientByFapiIdentifier(identifierValue: string): Promise<Client | null>;
    
        abstract createClient(client: Client): Promise<Client>;
    
        abstract updateClient(client: Client): Promise<Client>;
    
        abstract deleteClient(clientId: string): Promise<void>;

        abstract getRedirectURIs(clientId: string): Promise<Array<string>>;

        abstract addRedirectURI(clientId: string, uri: string): Promise<string>;
        
        abstract removeRedirectURI(clientId: string, uri: string): Promise<void>;

        abstract getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null>;

        abstract saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void>;

        abstract deleteClientAuthHistory(jti: string): Promise<void>;

        abstract deleteExpiredData(): Promise<void>;

        abstract getClientFapiConfigurationBy(clientFapiConfigurationLookupType: ClientFapiConfigurationLookupType, value: string): Promise<ClientFapiConfiguration | null>;

        abstract createClientFapiConfiguration(fapiConfigurationInput: ClientFapiConfigurationInput): Promise<ClientFapiConfiguration>;

        abstract updateClientFapiConfiguration(fapiConfigurationInput: ClientFapiConfigurationInput): Promise<ClientFapiConfiguration>;

        abstract deleteClientFapiConfiguration(clientId: string): Promise<void>;

        abstract getTokenEnrichmentConfiguration(clientId: string): Promise<TokenEnrichmentConfiguration | null>;
        
        abstract createTokenEnrichmentConfiguration(configuartionInput: TokenEnrichmentConfigurationInput): Promise<TokenEnrichmentConfiguration>;

        abstract updateTokenEnrichmentConfiguration(configuartionInput: TokenEnrichmentConfigurationInput): Promise<TokenEnrichmentConfiguration>;

        abstract deleteTokenEnrichmentConfiguration(clientId: string): Promise<void>;
        
}

export default ClientDao;