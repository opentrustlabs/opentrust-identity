import { AuthenticationGroupClientRel, Client, ClientAuthHistory, ClientFapiConfiguration, ClientFapiConfigurationInput, ClientScopeRel, Contact, TokenEnrichmentConfiguration, TokenEnrichmentConfigurationInput } from "@/graphql/generated/graphql-types";
import ClientDao, { ClientFapiConfigurationLookupType } from "../../client-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";
import { types } from "cassandra-driver";

class CassandraClientDao extends ClientDao {

    
    public async getClients(tenantId?: string, clientIds?: Array<string>): Promise<Array<Client>> {
        
        if(clientIds && clientIds.length > 0){
            const mapper = await CassandraDriver.getInstance().getModelMapper("client");
            const resultList = await mapper.find({
                clientId: cassandra.mapping.q.in_(clientIds)
            });
            return resultList.toArray();
        }
        else if(tenantId){
            const mapper = await CassandraDriver.getInstance().getModelMapper("client");
            const resultList = await mapper.find({
                tenantId: tenantId
            });
            return resultList.toArray();
        }
        else {
            return []
        }

    }

    public async getClientById(clientId: string): Promise<Client | null> {

        const mapper = await CassandraDriver.getInstance().getModelMapper("client");
        const results: Array<Client> = (await mapper.find({clientId: clientId}, {limit: 1})).toArray();
        if(results && results.length > 0){
            return results[0];
        }
        else{
            return null;
        }
    }
    
    public async createClient(client: Client): Promise<Client> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client");
        mapper.insert(client);
        return client;
    }

    public async updateClient(client: Client): Promise<Client> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client");
        await mapper.update(client);
        return client;
    }

    public async deleteClient(clientId: string): Promise<void> {
        
        const client: Client | null = await this.getClientById(clientId);
        if(client === null){
            return;
        }

        const clientUuid = types.Uuid.fromString(clientId);

        const cruMapper = await CassandraDriver.getInstance().getModelMapper("client_redirect_uri_rel");
        const redirectUris = await this.getRedirectURIs(clientId);
        for(let i = 0; i < redirectUris.length; i++){
            await cruMapper.remove({
                clientId: clientUuid,
                redirectUri: redirectUris[i]
            });
        }
        
        const agcrMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_client_rel");
        const resultList: cassandra.mapping.Result<AuthenticationGroupClientRel> = await agcrMapper.find({clientId: clientId});
        const arr: Array<AuthenticationGroupClientRel> = resultList.toArray();
        for(let i = 0; i < arr.length; i++){
            await agcrMapper.remove({
                clientId: clientUuid,
                authenticationGroupId: types.Uuid.fromString(arr[i].authenticationGroupId)
            });
        }

        const csrMapper = await CassandraDriver.getInstance().getModelMapper("client_scope_rel");
        const csrResults: Array<ClientScopeRel> = (await csrMapper.find({clientId: clientId})).toArray();
        for(let i = 0; i < csrResults.length; i++){
            await csrMapper.remove({
                clientId: clientUuid,
                tenantId: types.Uuid.fromString(csrResults[i].tenantId),
                scopeId: types.Uuid.fromString(csrResults[i].scopeId)
            });
        }
        

        const cMapper = await CassandraDriver.getInstance().getModelMapper("contact");
        const contactResults: cassandra.mapping.Result<Contact> = await cMapper.find({objectid: clientId});
        const cArr: Array<Contact> = contactResults.toArray();
        for(let i = 0; i < cArr.length; i++){
            await cMapper.remove({
                objectid: clientUuid, 
                contactid: types.Uuid.fromString(cArr[i].contactid)
            });
        }

        await this.deleteClientFapiConfiguration(clientId);
        await this.deleteTokenEnrichmentConfiguration(clientId);

        const mapper = await CassandraDriver.getInstance().getModelMapper("client");
        await mapper.remove({
            clientId: clientUuid,
            tenantId: types.Uuid.fromString(client.tenantId)
        });
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_redirect_uri_rel");
        const results: cassandra.mapping.Result = await mapper.find({clientId: clientId});
        const arr = results.toArray();
        return arr.map(
            (m) => m.redirectUri
        );
    }

    public async addRedirectURI(clientId: string, uri: string): Promise<string> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_redirect_uri_rel");
        await mapper.insert({
            clientId: clientId,
            redirectUri: uri
        });
        return uri;
    }

    public async removeRedirectURI(clientId: string, uri: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_redirect_uri_rel");
        await mapper.remove({
            clientId: types.Uuid.fromString(clientId),
            redirectUri: uri
        });
    }

    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_auth_history");
        return mapper.get({jti: jti});
    }

    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_auth_history");
        const ttlSeconds = clientAuthHistory.expiresAtSeconds - (Math.floor( Date.now() / 1000 ));

        await mapper.insert(clientAuthHistory, {ttl: ttlSeconds});
    }

    public async deleteClientAuthHistory(jti: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_auth_history");
        await mapper.remove({
            jti: jti
        })
    }
    
    public async deleteExpiredData(): Promise<void> {
        // NO OP
        // The only data with an expiration time on it is the ClientAuthHistory object,
        // which is inserted with a TTL
    }

    public async getClientByFapiIdentifier(identifierValue: string): Promise<Client | null> {
        const clientFapiMapper = await CassandraDriver.getInstance().getModelMapper("client_fapi_configuration");
        const clientFapiConfigurations = await clientFapiMapper.find({
            identifierValue: identifierValue
        });
        if(clientFapiConfigurations){
            const arr = clientFapiConfigurations.toArray();
            if(arr.length === 1){
                const config: ClientFapiConfiguration = arr[0];
                return this.getClientById(config.clientId);
            }
        }
        return null;
    }

    public async getClientFapiConfigurationBy(clientFapiConfigurationLookupType: ClientFapiConfigurationLookupType, value: string): Promise<ClientFapiConfiguration | null> {
        const clientFapiMapper = await CassandraDriver.getInstance().getModelMapper("client_fapi_configuration");
        if(clientFapiConfigurationLookupType === "clientid"){
            const arr = await clientFapiMapper.find({
                clientId: value
            });            
            return arr.first();            
        }
        else if(clientFapiConfigurationLookupType === "identifiervalue"){
            const arr = await clientFapiMapper.find({
                identifierValue: value
            });
            return arr.first();            
        }
        else{
            return null;
        }
    }
    
    public async createClientFapiConfiguration(fapiConfigurationInput: ClientFapiConfigurationInput): Promise<ClientFapiConfiguration> {
        const clientFapiMapper = await CassandraDriver.getInstance().getModelMapper("client_fapi_configuration");
        const clientFapiConfiguration: ClientFapiConfiguration = {
            clientId: fapiConfigurationInput.clientId,
            identifierType: fapiConfigurationInput.identifierType,
            identifierValue: fapiConfigurationInput.identifierValue
        }
        await clientFapiMapper.insert(clientFapiConfiguration);
        return clientFapiConfiguration;
    }

    public async updateClientFapiConfiguration(fapiConfigurationInput: ClientFapiConfigurationInput): Promise<ClientFapiConfiguration> {
        const clientFapiMapper = await CassandraDriver.getInstance().getModelMapper("client_fapi_configuration");
        const clientFapiConfiguration: ClientFapiConfiguration = {
            clientId: fapiConfigurationInput.clientId,
            identifierType: fapiConfigurationInput.identifierType,
            identifierValue: fapiConfigurationInput.identifierValue
        }
        await clientFapiMapper.update(clientFapiConfiguration);
        return clientFapiConfiguration;
    }

    public async deleteClientFapiConfiguration(clientId: string): Promise<void> {
        const config = await this.getClientFapiConfigurationBy("clientid", clientId);
        if(config){
            const fapiClientMapper = await CassandraDriver.getInstance().getModelMapper("client_fapi_configuration");
            await fapiClientMapper.remove({
                clientId: types.Uuid.fromString(clientId),
                identifierValue: config.identifierValue
            });
        }
    }

    public async getTokenEnrichmentConfiguration(clientId: string): Promise<TokenEnrichmentConfiguration | null>{
        const enrichmentMapper: cassandra.mapping.ModelMapper<TokenEnrichmentConfiguration> = await CassandraDriver.getInstance().getModelMapper("client_token_enrichment_configuration");
        const result = await enrichmentMapper.get({
            clientId: types.Uuid.fromString(clientId),
        });
        return result;
    }
            
    public async createTokenEnrichmentConfiguration(configuartionInput: TokenEnrichmentConfigurationInput): Promise<TokenEnrichmentConfiguration>{
        const config: TokenEnrichmentConfiguration = {
            clientId: configuartionInput.clientId,
            failureMode: configuartionInput.failureMode,
            timeoutMs: configuartionInput.timeoutMs,
            uri: configuartionInput.uri
        };
        const enrichmentMapper: cassandra.mapping.ModelMapper<TokenEnrichmentConfiguration> = await CassandraDriver.getInstance().getModelMapper("client_token_enrichment_configuration");
        await enrichmentMapper.insert(config);
        return config;

    }
    
    public async updateTokenEnrichmentConfiguration(configuartionInput: TokenEnrichmentConfigurationInput): Promise<TokenEnrichmentConfiguration>{
        const config: TokenEnrichmentConfiguration = {
            clientId: configuartionInput.clientId,
            failureMode: configuartionInput.failureMode,
            timeoutMs: configuartionInput.timeoutMs,
            uri: configuartionInput.uri
        };
        const enrichmentMapper: cassandra.mapping.ModelMapper<TokenEnrichmentConfiguration> = await CassandraDriver.getInstance().getModelMapper("client_token_enrichment_configuration");
        await enrichmentMapper.update(config);
        return config;
    }
    
    public async deleteTokenEnrichmentConfiguration(clientId: string): Promise<void>{
        const enrichmentMapper: cassandra.mapping.ModelMapper<TokenEnrichmentConfiguration> = await CassandraDriver.getInstance().getModelMapper("client_token_enrichment_configuration");
        await enrichmentMapper.remove({
            clientId: types.Uuid.fromString(clientId),
        });
        return;
    }

}

export default CassandraClientDao;