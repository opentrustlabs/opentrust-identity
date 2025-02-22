import { Client, ClientAuthHistory, Contact, ObjectSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import connection  from "@/lib/data-sources/db";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import ClientAuthHistoryEntity from "@/lib/entities/client-auth-history-entity";
import ClientEntity from "@/lib/entities/client-entity";
import ClientRedirectUriRelEntity from "@/lib/entities/client-redirect-uri-rel-entity";
import ContactEntity from "@/lib/entities/contact-entity";
import { CLIENT_TYPES_DISPLAY, CONTACT_TYPE_FOR_CLIENT, SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";

const searchClient = getOpenSearchClient();

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
        await this.updateSearchIndex(client);
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
        await this.updateSearchIndex(client);
        return Promise.resolve(client);    
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
        throw new Error("Method not implemented.");
    }

    public async assignContactsToClient(clientId: string, contactList: Array<Contact>): Promise<Array<Contact>> {
        const em = connection.em.fork();
        await em.nativeDelete(
            ContactEntity, {
                objectid: clientId
            }
        );
        await em.flush();
        const entities: Array<ContactEntity> = contactList.map(
            (m: Contact) => {
                m.objectid = clientId;
                m.objecttype = CONTACT_TYPE_FOR_CLIENT;
                return new ContactEntity(m);
            }
        );
        for(let i = 0; i < entities.length; i++){
            await em.persistAndFlush(entities[i]);
        }
        return Promise.resolve(contactList);
    }

    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        const em = connection.em.fork();
        const entity: ClientAuthHistoryEntity | null = await em.findOne(ClientAuthHistoryEntity, {
            jti: jti
        });
        return Promise.resolve(entity);
    }

    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        const em = connection.em.fork();
        const entity: ClientAuthHistoryEntity = new  ClientAuthHistoryEntity(clientAuthHistory);
        await em.persistAndFlush(entity);
        return Promise.resolve();
    }

    public async deleteClientAuthHistory(jti: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(ClientAuthHistoryEntity, {
            jti: jti
        });
        return Promise.resolve();
    }

}

export default DBClientDao;