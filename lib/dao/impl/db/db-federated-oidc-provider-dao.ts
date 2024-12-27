import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";
import FederatedOIDCProviderDao from "../../federated-oidc-provider-dao";
import connection  from "@/lib/data-sources/db";
import { FederatedOIDCProviderEntity } from "@/lib/entities/federated-oidc-provider-entity";
import FederatedOIDCProviderTenantRelEntity from "@/lib/entities/federated-oidc-provider-tenant-rel-entity";

class DBFederatedOIDCProviderDao extends FederatedOIDCProviderDao {

    public async getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>> {
        const em = connection.em.fork();
        // For custom join queries, see:   https://mikro-orm.io/docs/query-builder
        // Example:
        // const qb = em.createQueryBuilder(BookTag, 't');
        // qb.select(['b.*', 't.*'])
        // .leftJoin('t.books', 'b')
        // .where('b.title = ? or b.title = ?', ['test 123', 'lol 321'])
        // .andWhere('1 = 1')
        // .orWhere('1 = 2')
        // .limit(2, 1);
        // console.log(qb.getQuery());
        const b: Array<FederatedOidcProviderTenantRel> = tenantId ? await this.getFederatedOidcProviderTenantRels(tenantId) : [];
        const t: Array<FederatedOIDCProviderEntity> = tenantId ?
             await em.find(FederatedOIDCProviderEntity, {federatedoidcproviderid: b.map(e => e.federatedOIDCProviderId)})
             :
             await em.findAll(FederatedOIDCProviderEntity)
             ;
       
        const tenants: Array<FederatedOidcProvider> = t.map(
            (e: FederatedOIDCProviderEntity) => {
                return e.toModel();
            }
        );
        return Promise.resolve(tenants);
    }

    public async getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null> {
        const em = connection.em.fork();
        const e: FederatedOIDCProviderEntity | null = await em.findOne(FederatedOIDCProviderEntity, {federatedoidcproviderid: federatedOIDCProviderId});
        if(e){
            return e.toModel();
        }
        else{
            return null;
        }
    }

    public async createFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {

        const em = connection.em.fork();
        const e: FederatedOIDCProviderEntity = new FederatedOIDCProviderEntity(federatedOIDCProvider);        
        em.persist(e);
        await em.flush();
        return Promise.resolve(federatedOIDCProvider);
    }


    public async updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const em = connection.em.fork();
        const e: FederatedOIDCProviderEntity = new FederatedOIDCProviderEntity(federatedOIDCProvider);
        em.upsert(e);
        await em.flush();
        return Promise.resolve(federatedOIDCProvider);
    }

    public async getFederatedOidcProviderTenantRels(tenantId?: string): Promise<Array<FederatedOidcProviderTenantRel>> {
        const em = connection.em.fork();
        const whereClause = tenantId ? { tenantId: tenantId } : {};
        const a: Array<FederatedOIDCProviderTenantRelEntity> = await em.find(FederatedOIDCProviderTenantRelEntity, whereClause);
        return Promise.resolve(a)        ;
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        throw new Error("Method not implemented.");
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        throw new Error("Method not implemented.");
    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        throw new Error("Method not implemented.");
    }

    public async getFederatedOidcProviderDomainRels(): Promise<Array<FederatedOidcProviderDomainRel>> {
        throw new Error("Method not implemented.");
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        throw new Error("Method not implemented.");
    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        throw new Error("Method not implemented.");
    }

    public async deleteFederatedOidcProvider(federatedOIDCProviderId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBFederatedOIDCProviderDao;