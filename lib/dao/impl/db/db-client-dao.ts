import { Client, ClientAuthHistory, RefreshData } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import { ClientRedirectUriRel } from "@/lib/entities/client-redirect-uri-rel-entity";
import RDBDriver from "@/lib/data-sources/rdb";
import { In, LessThan } from "typeorm";

class DBClientDao extends ClientDao {

    public async getClients(tenantId?: string): Promise<Array<Client>> {
        const clientRepo = await RDBDriver.getInstance().getClientRepository();
        const whereClause = tenantId ? {tenantId: tenantId} : {}

        const clients = await clientRepo.find({
            where: whereClause
        });
        return clients;
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        const clientRepo = await RDBDriver.getInstance().getClientRepository();
        const result = await clientRepo.findOne({
            where: {
                clientId: clientId
            }
        });
        return result;
    }

    public async createClient(client: Client): Promise<Client> {
        const clientRepo = await RDBDriver.getInstance().getClientRepository();
        await clientRepo.insert(client);
        return client;
    }

    public async updateClient(client: Client): Promise<Client> {
        const clientRepo = await RDBDriver.getInstance().getClientRepository();
        await clientRepo.update(
            {
                clientId: client.clientId
            },
            client
        );
        return Promise.resolve(client);    
    }


    public async deleteClient(clientId: string): Promise<void> {
        const clientRedirectUriRepo = await RDBDriver.getInstance().getClientRedirectUriRelRepository();
        await clientRedirectUriRepo.delete({
            clientId: clientId
        });
        
        const clientAuthnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupClientRelRepository()
        await clientAuthnGroupRepo.delete({
            clientId: clientId
        });
        
        const clientScopeRelRepo = await RDBDriver.getInstance().getClientScopeRelRepository();
        await clientScopeRelRepo.delete({
            clientId: clientId
        });
        
        const preAuthStateRepo = await RDBDriver.getInstance().getPreAuthenticationStateRepository();
        await preAuthStateRepo.delete({
            clientId: clientId
        });
        
        const authCodeRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        await authCodeRepo.delete({
            clientId: clientId
        });
        
        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        let hasMore: boolean = true;
        while(hasMore === true){
            const arrRefreshData: Array<RefreshData> = await refreshDataRepo.find({
                where: {
                    clientId: clientId
                },
                take: 1000
            });
            const tokens: Array<string> = arrRefreshData.map(
                (d: RefreshData) => d.refreshToken
            );
            await refreshDataRepo.delete({
                refreshToken: In(tokens)
            });
            hasMore = arrRefreshData.length === 1000;
        }
        
        const federatedOIDCAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await federatedOIDCAuthRelRepo.delete({
            initClientId: clientId
        });
        
        const clientAuthHistoryRepo = await RDBDriver.getInstance().getClientAuthHistoryRepository();
        await clientAuthHistoryRepo.delete({
            clientId: clientId
        })
        
        const contactRepo = await RDBDriver.getInstance().getContactRepository();
        await contactRepo.delete({
            objectid: clientId
        });
        
        const clientRepo = await RDBDriver.getInstance().getClientRepository();
        await clientRepo.delete({
            clientId: clientId
        });      
    }


    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        const clientAuthHistoryRepo = await RDBDriver.getInstance().getClientAuthHistoryRepository();
        const result = await clientAuthHistoryRepo.findOne({
            where: {
                jti: jti
            }
        });
        return result;
    }

    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        const clientAuthHistoryRepo = await RDBDriver.getInstance().getClientAuthHistoryRepository();
        await clientAuthHistoryRepo.insert(clientAuthHistory);
        return Promise.resolve();
    }

    public async deleteClientAuthHistory(jti: string): Promise<void> {
        const clientAuthHistoryRepo = await RDBDriver.getInstance().getClientAuthHistoryRepository();
        await clientAuthHistoryRepo.delete({
            jti: jti
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void>{
        const clientAuthHistoryRepo = await RDBDriver.getInstance().getClientAuthHistoryRepository();
        await clientAuthHistoryRepo.delete({
            expiresAtSeconds: LessThan( Math.floor( Date.now() / 1000 ) )
        });
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>>{
        const clientRedirectUriRepo = await RDBDriver.getInstance().getClientRedirectUriRelRepository();
        const resultList = await clientRedirectUriRepo.find({
            where: {
                clientId: clientId
            }
        });
                
        const retList: Array<string> = [];
        if(resultList.length > 0){
            resultList.forEach(
                (e: ClientRedirectUriRel) => {

                    retList.push(e.redirectUri)
                }
            )
        }
        return Promise.resolve(retList);
    }

    public async addRedirectURI(clientId: string, uri: string): Promise<string>{
        const clientRedirectUriRepo = await RDBDriver.getInstance().getClientRedirectUriRelRepository();
        const clientRedirectRel: ClientRedirectUriRel = {
            clientId: clientId,
            redirectUri: uri
        };
        await clientRedirectUriRepo.insert(clientRedirectRel);
        return Promise.resolve(uri);
    }
    
    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{        
        const clientRedirectUriRepo = await RDBDriver.getInstance().getClientRedirectUriRelRepository();
        await clientRedirectUriRepo.delete({
            clientId: clientId,
            redirectUri: uri
        });
        return Promise.resolve();
    }

}

export default DBClientDao;