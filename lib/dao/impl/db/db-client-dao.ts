import { Client, ClientAuthHistory } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import connection  from "@/lib/data-sources/db";
import ClientEntity from "@/lib/entities/client-entity";
import ClientRedirectUriRelEntity from "@/lib/entities/client-redirect-uri-rel-entity";

class DBClientDao extends ClientDao {

    public async getClients(tenantId?: string): Promise<Array<Client>> {
        const em = connection.em.fork();
        const whereClause = tenantId ? {tenantId: tenantId} : {}
        const clientEntities: Array<ClientEntity> = await em.find(ClientEntity, whereClause);
        return Promise.resolve(clientEntities);
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        const em = connection.em.fork();
        const clientEntity: Client | null = await em.findOne(ClientEntity, {clientId: clientId});
        if(clientEntity){
            const redirectUris: Array<ClientRedirectUriRelEntity> = await em.find(ClientRedirectUriRelEntity, {clientId: clientId});
            if(redirectUris){
                clientEntity.redirectUris = redirectUris.map(r => r.redirectUri);
            }
            return clientEntity;
        }
        else{
            return null;
        }
    }

    public async createClient(client: Client): Promise<Client> {
        const em = connection.em.fork();
        const e: ClientEntity | null= new ClientEntity(client);        
        em.persist(e);
        await em.flush();
        em.nativeDelete(ClientRedirectUriRelEntity, {clientId: client.clientId});
        if(client.redirectUris && client.redirectUris.length > 0){
            for(let i = 0; i < client.redirectUris.length; i++){
                const uriEntity: ClientRedirectUriRelEntity = new ClientRedirectUriRelEntity(client.clientId, client.redirectUris[i]);
                em.persist(uriEntity);
                await em.flush();
            }            
        }
        // TODO
        // Delete then Add contacts
        
        return Promise.resolve(client);
    }

    public async updateClient(client: Client): Promise<Client> {
        let em = connection.em.fork();
        const e: ClientEntity = new ClientEntity(client);
        em.upsert(e);
        await em.flush();
        em.nativeDelete(ClientRedirectUriRelEntity, {clientId: client.clientId});
        if(client.redirectUris && client.redirectUris.length > 0){
            em = connection.em.fork();
            for(let i = 0; i < client.redirectUris.length; i++){
                const uriEntity: ClientRedirectUriRelEntity = new ClientRedirectUriRelEntity(client.clientId, client.redirectUris[i]);
                em.persist(uriEntity);
                await em.flush();
            }            
        }
        // TODO
        // Delete then Add contacts
        return Promise.resolve(client);    
    }

    public async deleteClient(clientId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        throw new Error("Method not implemented.");
    }

    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteClientAuthHistory(jti: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBClientDao;