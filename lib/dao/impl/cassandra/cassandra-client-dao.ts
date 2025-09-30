import { AuthenticationGroupClientRel, Client, ClientAuthHistory, Contact } from "@/graphql/generated/graphql-types";
import ClientDao from "../../client-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";
import { types } from "cassandra-driver";

class CassandraClientDao extends ClientDao {
    
    public async getClients(tenantId?: string, clientIds?: Array<string>): Promise<Array<Client>> {
        
        if(clientIds){
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
        const cruMapper = await CassandraDriver.getInstance().getModelMapper("client_redirect_uri_rel");

        const clientUuid = types.Uuid.fromString(clientId);
        await cruMapper.remove({clientId: clientUuid});

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
        await csrMapper.remove({clientId: clientId});
                        

        const cMapper = await CassandraDriver.getInstance().getModelMapper("contact");
        const contactResults: cassandra.mapping.Result<Contact> = await cMapper.find({objectid: clientId});
        const cArr: Array<Contact> = contactResults.toArray();
        for(let i = 0; i < cArr.length; i++){
            await cMapper.remove({
                objectid: clientUuid, 
                contactid: types.Uuid.fromString(cArr[i].contactid)
            });
        }

        const mapper = await CassandraDriver.getInstance().getModelMapper("client");
        const client: Client = await mapper.get({
            clientId: types.Uuid.fromString(clientId)
        });
        if(client){
            await mapper.remove({
                clientId: clientUuid,
                tenantId: types.Uuid.fromString(client.tenantId)
            });
        }
        

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

}

export default CassandraClientDao;