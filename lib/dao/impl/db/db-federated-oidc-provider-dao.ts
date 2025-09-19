import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";
import FederatedOIDCProviderDao from "../../federated-oidc-provider-dao";
import FederatedOIDCProviderTenantRelEntity from "@/lib/entities/federated-oidc-provider-tenant-rel-entity";
import FederatedOIDCProviderDomainRelEntity from "@/lib/entities/federated-oidc-provider-domain-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";
import FederatedOIDCProviderEntity from "@/lib/entities/federated-oidc-provider-entity";


class DBFederatedOIDCProviderDao extends FederatedOIDCProviderDao {

    public async getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>> {
        
        const b: Array<FederatedOidcProviderTenantRel> = tenantId ? await this.getFederatedOidcProviderTenantRels(tenantId) : [];

        const t: Array<FederatedOIDCProviderEntity> = tenantId ?
             await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).findAll({
                where: {
                    federatedOIDCProviderId: {[Op.in] : b.map(e => e.federatedOIDCProviderId)}
                },
                order: [
                    ["federatedOIDCProviderName", "ASC"]
                ]
             }) 
             :
             await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).findAll({
                order: [
                    ["federatedOIDCProviderName", "ASC"]
                ]
             });
             ;
       
        const providers: Array<FederatedOidcProvider> = t.map(
            (e: FederatedOIDCProviderEntity) => this.providerEntityToModel(e)
        );
        return Promise.resolve(providers);
    }

    public async getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null> {
        

        // federatedOidcProvider
        const e: FederatedOIDCProviderEntity | null = await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).findOne({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderId
            }
        });
        
        if(e){     
            return this.providerEntityToModel(e);
        }
        else{
            return null;
        }
    }


    public async createFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        
        await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).create(federatedOIDCProvider);        
        return Promise.resolve(federatedOIDCProvider);
    }


    public async updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        
        await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).update(federatedOIDCProvider, {
            where: {
                federatedOIDCProviderId: federatedOIDCProvider.federatedOIDCProviderId
            }
        });
        return Promise.resolve(federatedOIDCProvider);
    }


    public async getFederatedOidcProviderTenantRels(tenantId?: string, federatedOIDCProviderId?: string): Promise<Array<FederatedOidcProviderTenantRel>> {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {};
        if(tenantId){
            whereClause.tenantId = tenantId;
        }
        if(federatedOIDCProviderId){
            whereClause.federatedOIDCProviderId = federatedOIDCProviderId;
        }
        const a: Array<FederatedOIDCProviderTenantRelEntity> = await (await DBDriver.getInstance().getFederatedOIDCProviderTenantRelEntity()).findAll({
            where: whereClause
        });
        return a.map((entity: FederatedOIDCProviderTenantRelEntity) => entity.dataValues);        
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        

        const federatedOIDCProviderDomainRelEntity: FederatedOIDCProviderDomainRelEntity | null = await (await DBDriver.getInstance().getFederatedOIDCProviderDomainRelEntity()).findOne({
            where:{
                domain: domain
            }
        });
        if(!federatedOIDCProviderDomainRelEntity){
            return Promise.resolve(null);
        }
        
        const federatedOIDCProviderEntity: FederatedOIDCProviderEntity | null = await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).findOne({
                where: {
                    federatedOIDCProviderId: federatedOIDCProviderDomainRelEntity.getDataValue("federatedOIDCProviderId")
                }
            }            
        );
        if(!federatedOIDCProviderEntity){
            return Promise.resolve(null);
        }

        return Promise.resolve(this.providerEntityToModel(federatedOIDCProviderEntity));
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        
        const federatedOidcProviderTenantRel: FederatedOIDCProviderTenantRelEntity = await (await DBDriver.getInstance().getFederatedOIDCProviderTenantRelEntity()).build({
            tenantId,
            federatedOIDCProviderId
        }).save();        
        return Promise.resolve(federatedOidcProviderTenantRel.dataValues as FederatedOidcProviderTenantRel);

    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        
        await (await DBDriver.getInstance().getFederatedOIDCProviderTenantRelEntity()).destroy({
            where: {
                tenantId,
                federatedOIDCProviderId
            }
        });
        const federatedOidcProviderTenantRel: FederatedOidcProviderTenantRel = {
            tenantId,
            federatedOIDCProviderId
        }
        return Promise.resolve(federatedOidcProviderTenantRel);

    }

    public async getFederatedOidcProviderDomainRels(federatedOIDCProviderId: string | null, domain: string | null): Promise<Array<FederatedOidcProviderDomainRel>> {
        

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {};
        if(federatedOIDCProviderId){
            params.federatedOIDCProviderId = federatedOIDCProviderId;
        }
        if(domain){
            params.domain = domain
        }
        const entities: Array<FederatedOIDCProviderDomainRelEntity> = await (await DBDriver.getInstance().getFederatedOIDCProviderDomainRelEntity()).findAll({
            where: params
        }); 
            

        const models = entities.map(
            (e: FederatedOIDCProviderDomainRelEntity) => e.dataValues as FederatedOidcProviderDomainRel
        );
        return Promise.resolve(models);
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        

        const federatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel = {
            federatedOIDCProviderId: federatedOIDCProviderId,
            domain: domain
        };
        await (await DBDriver.getInstance().getFederatedOIDCProviderDomainRelEntity()).create(federatedOIDCProviderDomainRel);
        return Promise.resolve(federatedOIDCProviderDomainRel);

    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        
        await (await DBDriver.getInstance().getFederatedOIDCProviderDomainRelEntity()).destroy({
            where: {
                federatedOIDCProviderId,
                domain
            }
        });
        
        return Promise.resolve({
            federatedOIDCProviderId,
            domain
        });
    }

    /**
     * 
     * @param federatedOIDCProviderId 
     */
    public async deleteFederatedOidcProvider(federatedOIDCProviderId: string): Promise<void> {
        

        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).destroy({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderId
            }
        });

        await (await DBDriver.getInstance().getFederatedOIDCProviderTenantRelEntity()).destroy({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderId
            }
        });

        await (await DBDriver.getInstance().getFederatedOIDCProviderDomainRelEntity()).destroy({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderId
            }
        });
        
        await (await DBDriver.getInstance().getFederatedOIDCProviderEntity()).destroy({
            where: {
                federatedOIDCProviderId
            }
        });

    }

    protected providerEntityToModel(entity: FederatedOIDCProviderEntity): FederatedOidcProvider {
        return {                    
            ...entity.dataValues,
            scopes: entity.dataValues.scopes ? entity.dataValues.scopes.split(",") : [],
        }
    }

}

export default DBFederatedOIDCProviderDao;