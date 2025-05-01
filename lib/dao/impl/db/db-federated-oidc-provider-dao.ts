import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel, ObjectSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import FederatedOIDCProviderDao from "../../federated-oidc-provider-dao";
import FederatedOIDCProviderTenantRelEntity from "@/lib/entities/federated-oidc-provider-tenant-rel-entity";
import FederatedOIDCProviderDomainRelEntity from "@/lib/entities/federated-oidc-provider-domain-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";
import FederatedOIDCProviderEntity from "@/lib/entities/federated-oidc-provider-entity";


class DBFederatedOIDCProviderDao extends FederatedOIDCProviderDao {

    public async getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>> {

        const sequelize: Sequelize = await DBDriver.getConnection();
        const b: Array<FederatedOidcProviderTenantRel> = tenantId ? await this.getFederatedOidcProviderTenantRels(tenantId) : [];

        const t: Array<FederatedOIDCProviderEntity> = tenantId ?
             await sequelize.models.federatedOidcProvider.findAll({
                where: {
                    federatedOIDCProviderId: {[Op.in] : b.map(e => e.federatedOIDCProviderId)}
                }
             }) 
             :
             await sequelize.models.federatedOidcProvider.findAll();
             ;
       
        const providers: Array<FederatedOidcProvider> = t.map(
            (e: FederatedOIDCProviderEntity) => {
                return {                    
                    ...e.dataValues,
                    scopes: e.dataValues.scopes ? e.dataValues.scopes.split(",") : [],
                }                
            }
        );
        return Promise.resolve(providers);
    }

    public async getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        // federatedOidcProvider
        const e: FederatedOIDCProviderEntity | null = await sequelize.models.federatedOidcProvider.findOne({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderId
            }
        });
        
        if(e){     
            return {                    
                ...e.dataValues,
                scopes: e.dataValues.scopes ? e.dataValues.scopes.split(",") : [],
            } 
        }
        else{
            return null;
        }
    }


    public async createFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcProvider.create(federatedOIDCProvider);        
        return Promise.resolve(federatedOIDCProvider);
    }


    public async updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcProvider.update(federatedOIDCProvider, {
            where: {
                federatedOIDCProviderId: federatedOIDCProvider.federatedOIDCProviderId
            }
        });
        return Promise.resolve(federatedOIDCProvider);
    }


    public async getFederatedOidcProviderTenantRels(tenantId?: string, federatedOIDCProviderId?: string): Promise<Array<FederatedOidcProviderTenantRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const whereClause: any = {};
        if(tenantId){
            whereClause.tenantId = tenantId;
        }
        if(federatedOIDCProviderId){
            whereClause.federatedOIDCProviderId = federatedOIDCProviderId;
        }
        const a: Array<FederatedOIDCProviderTenantRelEntity> = await sequelize.models.federatedOidcProviderTenantRel.findAll({
            where: whereClause,
            raw: true
        });
        return Promise.resolve(a as any as Array<FederatedOidcProviderTenantRel>) ;
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        const federatedOIDCProviderDomainRelEntity: FederatedOIDCProviderDomainRelEntity | null = await sequelize.models.federatedOidcProviderDomainRel.findOne({
            where:{
                domain: domain
            }
        });
        if(!federatedOIDCProviderDomainRelEntity){
            return Promise.resolve(null);
        }
        
        const federatedOIDCProviderEntity: FederatedOIDCProviderEntity | null = await sequelize.models.federatedOidcProvider.findOne({
                where: {
                    federatedOIDCProviderId: federatedOIDCProviderDomainRelEntity.getDataValue("federatedOIDCProviderId")
                }
            }            
        );
        if(!federatedOIDCProviderEntity){
            return Promise.resolve(null);
        }
        return Promise.resolve(federatedOIDCProviderEntity.dataValues as FederatedOidcProvider);
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const federatedOidcProviderTenantRel: FederatedOIDCProviderTenantRelEntity = await sequelize.models.federatedOidcProviderTenantRel.build({
            tenantId,
            federatedOIDCProviderId
        }).save();        
        return Promise.resolve(federatedOidcProviderTenantRel as any as FederatedOidcProviderTenantRel);

    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcProviderTenantRel.destroy({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        const params: any = {};
        if(federatedOIDCProviderId){
            params.federatedOIDCProviderId = federatedOIDCProviderId;
        }
        if(domain){
            params.domain = domain
        }
        const entities: Array<FederatedOIDCProviderDomainRelEntity> = await sequelize.models.federatedOidcProviderDomainRel.findAll({
            where: params
        }); 
            

        const models = entities.map(
            (e: FederatedOIDCProviderDomainRelEntity) => e as any as FederatedOidcProviderDomainRel
        );
        return Promise.resolve(models);
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        const federatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel = {
            federatedOIDCProviderId: federatedOIDCProviderId,
            domain: domain
        };
        await sequelize.models.federatedOidcProviderDomainRel.create(federatedOIDCProviderDomainRel);
        return Promise.resolve(federatedOIDCProviderDomainRel);

    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcProviderDomainRel.destroy({
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

    public async deleteFederatedOidcProvider(federatedOIDCProviderId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBFederatedOIDCProviderDao;