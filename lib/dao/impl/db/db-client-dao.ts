import { Client, ClientAuthHistory } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import ClientAuthHistoryEntity from "@/lib/entities/client-auth-history-entity";
import ClientEntity from "@/lib/entities/client-entity";
import ClientRedirectUriRelEntity from "@/lib/entities/client-redirect-uri-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";

class DBClientDao extends ClientDao {

    public async getClients(tenantId?: string): Promise<Array<Client>> {
        
        const whereClause = tenantId ? {tenantId: tenantId} : {}
        const clientEntities: Array<ClientEntity> = await (await DBDriver.getInstance().getClientEntity()).findAll({
            where: whereClause
        });
        return clientEntities.map(e => e.dataValues);
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        
        const clientEntity: ClientEntity | null = await (await DBDriver.getInstance().getClientEntity()).findOne({
            where: {
                clientId: clientId
            }
        });

        if(clientEntity){            
            return clientEntity.dataValues as Client;
        }
        else{
            return null;
        }
    }

    public async createClient(client: Client): Promise<Client> {
        
        await (await DBDriver.getInstance().getClientEntity()).create(client);
        return Promise.resolve(client);
    }

    public async updateClient(client: Client): Promise<Client> {
        
        await (await DBDriver.getInstance().getClientEntity()).update(client, {
            where: {
                clientId: client.clientId
            }
        });
        return Promise.resolve(client);    
    }


    public async deleteClient(clientId: string): Promise<void> {
        
        
        
        await (await DBDriver.getInstance().getClientRedirectUriRelEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getAuthenticationGroupClientRelEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getClientScopeRelEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getPreAuthenticationStateEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getRefreshDataEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).destroy({
            where: {
                initClientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getClientAuthHistoryEntity()).destroy({
            where: {
                clientId: clientId
            }
        });
        
        await (await DBDriver.getInstance().getContactEntity()).destroy({
            where: {
                objectid: clientId
            }
        });

        await (await DBDriver.getInstance().getClientEntity()).destroy({
            where: {
                clientId: clientId
            }
        });        
    }


    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        
        const entity: ClientAuthHistoryEntity | null = await (await DBDriver.getInstance().getClientAuthHistoryEntity()).findOne({
            where: {
                jti: jti
            }
        }); 
        return entity ? Promise.resolve(entity.dataValues as ClientAuthHistory) : Promise.resolve(null);
    }

    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        
        await (await DBDriver.getInstance().getClientAuthHistoryEntity()).create(clientAuthHistory);
        return Promise.resolve();
    }

    public async deleteClientAuthHistory(jti: string): Promise<void> {
        
        await (await DBDriver.getInstance().getClientAuthHistoryEntity()).destroy({
            where: {
                jti: jti
            }
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void>{
        
        await (await DBDriver.getInstance().getClientAuthHistoryEntity()).destroy({
            where: {
                expiresAtSeconds: {
                    [Op.lt]: Math.floor(Date.now() / 1000)
                }
            }
        });
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>>{
        
        const resultList: Array<ClientRedirectUriRelEntity> = await (await DBDriver.getInstance().getClientRedirectUriRelEntity()).findAll({
            where: {
                clientId: clientId
            }
        });
        
        const retList: Array<string> = [];
        if(resultList.length > 0){
            resultList.forEach(
                (e: ClientRedirectUriRelEntity) => {

                    retList.push(e.getDataValue("redirectUri"))
                }
            )
        }
        return Promise.resolve(retList);
    }

    public async addRedirectURI(clientId: string, uri: string): Promise<string>{
        
        await (await DBDriver.getInstance().getClientRedirectUriRelEntity()).build({
            clientId: clientId, redirectUri: uri
        })
        .save();
        
        return Promise.resolve(uri);
    }
    
    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{        
        
        await (await DBDriver.getInstance().getClientRedirectUriRelEntity()).destroy({
            where: {
                clientId: clientId,
                redirectUri: uri
            }
        });
        return Promise.resolve();
    }

}

export default DBClientDao;