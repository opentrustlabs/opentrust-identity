import { Client, ClientAuthHistory } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import ClientAuthHistoryEntity from "@/lib/entities/client-auth-history-entity";
import ClientEntity from "@/lib/entities/client-entity";
import ClientRedirectUriRelEntity from "@/lib/entities/client-redirect-uri-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Sequelize } from "sequelize";

class DBClientDao extends ClientDao {

    public async getClients(tenantId?: string): Promise<Array<Client>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const whereClause = tenantId ? {tenantId: tenantId} : {}
        const clientEntities: Array<ClientEntity> = await sequelize.models.client.findAll({
            where: whereClause
        });
        return clientEntities.map(e => e.dataValues);
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const clientEntity: ClientEntity | null = await sequelize.models.client.findOne({
            where: {
                clientId: clientId
            }
        });

        if(clientEntity){            
            return clientEntity.dataValues as any as Client;
        }
        else{
            return null;
        }
    }

    public async createClient(client: Client): Promise<Client> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.client.create(client);
        return Promise.resolve(client);
    }

    public async updateClient(client: Client): Promise<Client> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.client.update(client, {
            where: {
                clientId: client.clientId
            }
        });
        return Promise.resolve(client);    
    }


    public async deleteClient(clientId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: ClientAuthHistoryEntity | null = await sequelize.models.clientAuthHistory.findOne({
            where: {
                jti: jti
            }
        }); 
        return entity ? Promise.resolve(entity as any as ClientAuthHistory) : Promise.resolve(null);
    }

    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.clientAuthHistory.create(clientAuthHistory);
        return Promise.resolve();
    }

    public async deleteClientAuthHistory(jti: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.clientAuthHistory.destroy({
            where: {
                jti: jti
            }
        });
        return Promise.resolve();
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const resultList: Array<ClientRedirectUriRelEntity> = await sequelize.models.clientRedirectUriRel.findAll({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.clientRedirectUriRel.build({
            clientId: clientId, redirectUri: uri
        })
        .save();
        
        return Promise.resolve(uri);
    }
    
    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{        
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.clientRedirectUriRel.destroy({
            where: {
                clientId: clientId,
                redirectUri: uri
            }
        });
        return Promise.resolve();
    }

}

export default DBClientDao;