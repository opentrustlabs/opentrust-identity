import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel, ObjectSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import FederatedOIDCProviderDao from "../../federated-oidc-provider-dao";
import connection  from "@/lib/data-sources/db";
import { FederatedOIDCProviderEntity } from "@/lib/entities/federated-oidc-provider-entity";
import FederatedOIDCProviderTenantRelEntity from "@/lib/entities/federated-oidc-provider-tenant-rel-entity";
import FederatedOIDCProviderDomainRelEntity from "@/lib/entities/federated-oidc-provider-domain-rel-entity";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";

const searchClient: Client = getOpenSearchClient();

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
        await this.updateSearchIndex(federatedOIDCProvider);
        return Promise.resolve(federatedOIDCProvider);
    }


    public async updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const em = connection.em.fork();
        const e: FederatedOIDCProviderEntity = new FederatedOIDCProviderEntity(federatedOIDCProvider);
        em.upsert(e);
        await em.flush();
        await this.updateSearchIndex(federatedOIDCProvider);
        return Promise.resolve(federatedOIDCProvider);
    }

    protected async updateSearchIndex(federatedOIDCProvider: FederatedOidcProvider): Promise<void> {
            
            const document: ObjectSearchResultItem = {
                name: federatedOIDCProvider.federatedOIDCProviderName,
                description: federatedOIDCProvider.federatedOIDCProviderDescription,
                objectid: federatedOIDCProvider.federatedOIDCProviderId,
                objecttype: SearchResultType.OidcProvider,
                owningtenantid: "",
                email: "",
                enabled: true,
                owningclientid: "",
                subtype: FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(federatedOIDCProvider.federatedOIDCProviderType),
                subtypekey: federatedOIDCProvider.federatedOIDCProviderType
            }
            
            await searchClient.index({
                id: federatedOIDCProvider.federatedOIDCProviderId,
                index: SEARCH_INDEX_OBJECT_SEARCH,
                body: document
            });        
        }

    public async getFederatedOidcProviderTenantRels(tenantId?: string): Promise<Array<FederatedOidcProviderTenantRel>> {
        const em = connection.em.fork();
        const whereClause = tenantId ? { tenantId: tenantId } : {};
        const a: Array<FederatedOIDCProviderTenantRelEntity> = await em.find(FederatedOIDCProviderTenantRelEntity, whereClause);
        return Promise.resolve(a)        ;
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        const em = connection.em.fork();
        const federatedOIDCProviderDomainRelEntity: FederatedOIDCProviderDomainRelEntity | null = await em.findOne(
            FederatedOIDCProviderDomainRelEntity,
            {
                domain: domain
            }
        );
        if(!federatedOIDCProviderDomainRelEntity){
            return Promise.resolve(null);
        }
        const federatedOIDCProviderEntity: FederatedOIDCProviderEntity | null = await em.findOne(
            FederatedOIDCProviderEntity,
            {
                federatedoidcproviderid: federatedOIDCProviderDomainRelEntity.federatedoidcproviderid
            }
        );
        if(!federatedOIDCProviderEntity){
            return Promise.resolve(null);
        }
        return Promise.resolve(federatedOIDCProviderEntity.toModel());
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const federatedOidcProviderTenantRel: FederatedOIDCProviderTenantRelEntity = new FederatedOIDCProviderTenantRelEntity({
            tenantId,
            federatedOIDCProviderId
        });
        const em = connection.em.fork();
        em.persist(federatedOidcProviderTenantRel);
        await em.flush();
        return Promise.resolve(federatedOidcProviderTenantRel);

    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const federatedOidcProviderTenantRel: FederatedOIDCProviderTenantRelEntity = new FederatedOIDCProviderTenantRelEntity({
            tenantId,
            federatedOIDCProviderId
        });
        const em = connection.em.fork();
        em.nativeDelete(FederatedOIDCProviderTenantRelEntity, {federatedOIDCProviderId: federatedOIDCProviderId, tenantId: tenantId});
        await em.flush();
        return Promise.resolve(federatedOidcProviderTenantRel);

    }

    public async getFederatedOidcProviderDomainRels(): Promise<Array<FederatedOidcProviderDomainRel>> {
        const em = connection.em.fork();
        const entities: Array<FederatedOIDCProviderDomainRelEntity> = await em.findAll(FederatedOIDCProviderDomainRelEntity);
        const models = entities.map(
            (e: FederatedOIDCProviderDomainRelEntity) => e.toModel()
        );
        return Promise.resolve(models);
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const em = connection.em.fork();
        const federatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel = {
            federatedOIDCProviderId: federatedOIDCProviderId,
            domain: domain
        };
        const entity: FederatedOIDCProviderDomainRelEntity = new FederatedOIDCProviderDomainRelEntity(federatedOIDCProviderDomainRel);
        await em.persist(entity).flush();
        return Promise.resolve(federatedOIDCProviderDomainRel);

    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const em = connection.em.fork();
        em.nativeDelete(FederatedOIDCProviderDomainRelEntity, {federatedoidcproviderid: federatedOIDCProviderId, domain: domain});
        await em.flush();
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