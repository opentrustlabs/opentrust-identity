import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";
import FederatedOIDCProviderDao from "../../federated-oidc-provider-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { In } from "typeorm";

class DBFederatedOIDCProviderDao extends FederatedOIDCProviderDao {

    public async getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>> {
        const federatedOidCProviderRepo = await RDBDriver.getInstance().getFederatedOIDCProviderRepository();        
        const b: Array<FederatedOidcProviderTenantRel> = tenantId ? await this.getFederatedOidcProviderTenantRels(tenantId) : [];

        const t: Array<FederatedOidcProvider> = tenantId ?
             await federatedOidCProviderRepo.find({
                where: {
                    federatedOIDCProviderId: In(b.map(e => e.federatedOIDCProviderId))
                },
                order: {
                    federatedOIDCProviderName: "ASC"
                } 
             }) 
             :
             await federatedOidCProviderRepo.find({                
                order: {
                    federatedOIDCProviderName: "ASC"
                }
             });
        ;
       
        return Promise.resolve(t);
    }

    public async getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null> {        

        const federatedOidCProviderRepo = await RDBDriver.getInstance().getFederatedOIDCProviderRepository(); 
        const e: FederatedOidcProvider | null = await federatedOidCProviderRepo.findOne({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderId
            }
        });
        return e;
    }


    public async createFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const federatedOidCProviderRepo = await RDBDriver.getInstance().getFederatedOIDCProviderRepository(); 
        await federatedOidCProviderRepo.insert(federatedOIDCProvider);        
        return Promise.resolve(federatedOIDCProvider);
    }


    public async updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const federatedOidCProviderRepo = await RDBDriver.getInstance().getFederatedOIDCProviderRepository(); 
        await federatedOidCProviderRepo.update(
            {
                federatedOIDCProviderId: federatedOIDCProvider.federatedOIDCProviderId
            },
            federatedOIDCProvider
            
        );
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
        const federatedOidcProviderTenantRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderTenantRelRepository();
        const a = await federatedOidcProviderTenantRelRepo.find({
            where: whereClause
        });
        return a;
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        
        const federatedOidcProviderDomainRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderDomainRelRepository();
        const federatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel | null = await federatedOidcProviderDomainRelRepo.findOne({
            where: {
                domain: domain
            }
        });
        
        if(!federatedOIDCProviderDomainRel){
            return Promise.resolve(null);
        }
        
        const federatedOidCProviderRepo = await RDBDriver.getInstance().getFederatedOIDCProviderRepository(); 
        const result = await federatedOidCProviderRepo.findOne({
            where: {
                federatedOIDCProviderId: federatedOIDCProviderDomainRel.federatedOIDCProviderId
            }
        });
        return result;
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const federatedOidcProviderTenantRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderTenantRelRepository();
        const federatedOidcProviderTenantRel: FederatedOidcProviderTenantRel = {
            federatedOIDCProviderId: federatedOIDCProviderId,
            tenantId: tenantId
        }
        await federatedOidcProviderTenantRelRepo.insert(federatedOidcProviderTenantRel);
        return federatedOidcProviderTenantRel;
    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        
        const federatedOidcProviderTenantRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderTenantRelRepository();
        await federatedOidcProviderTenantRelRepo.delete({
            tenantId,
            federatedOIDCProviderId
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
        const federatedOidcProviderDomainRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderDomainRelRepository();
        const results = await federatedOidcProviderDomainRelRepo.find({
            where: params
        });
        return results;
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        
        const federatedOidcProviderDomainRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderDomainRelRepository();
        const federatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel = {
            federatedOIDCProviderId: federatedOIDCProviderId,
            domain: domain
        };
        await federatedOidcProviderDomainRelRepo.insert(federatedOIDCProviderDomainRel);
        return Promise.resolve(federatedOIDCProviderDomainRel);

    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const federatedOidcProviderDomainRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderDomainRelRepository();
        await federatedOidcProviderDomainRelRepo.delete({
            federatedOIDCProviderId,
            domain
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
        
        const federatedOidcProviderAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await federatedOidcProviderAuthRelRepo.delete({
            federatedOIDCProviderId: federatedOIDCProviderId
        });

        const federatedOidcProviderTenantRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderTenantRelRepository();
        await federatedOidcProviderTenantRelRepo.delete({
            federatedOIDCProviderId: federatedOIDCProviderId
        });


        const federatedOidcProviderDomainRelRepo = await RDBDriver.getInstance().getFederatedOIDCProviderDomainRelRepository();
        await federatedOidcProviderDomainRelRepo.delete({
            federatedOIDCProviderId: federatedOIDCProviderId
        });
        
        const federatedOidCProviderRepo = await RDBDriver.getInstance().getFederatedOIDCProviderRepository(); 
        await federatedOidCProviderRepo.delete({
            federatedOIDCProviderId: federatedOIDCProviderId
        });
    }

}

export default DBFederatedOIDCProviderDao;