import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";
import FederatedOIDCProviderDao from "../../federated-oidc-provider-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { types } from "cassandra-driver";
import cassandra from "cassandra-driver";
class CassandraFederatedOIDCProviderDao extends FederatedOIDCProviderDao {

    public async getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>> {
        if(tenantId){
            const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_tenant_rel");
            const results: Array<FederatedOidcProviderTenantRel> = (await mapper.find({
                tenantId: tenantId
            })).toArray();
            if(results && results.length > 0){
                const providerMapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider");
                const ids = results.map(
                    (rel: FederatedOidcProviderTenantRel) => rel.federatedOIDCProviderId
                )
                const retVal: Array<FederatedOidcProvider> = (await providerMapper.find({
                    federatedOIDCProviderId: cassandra.mapping.q.in_(ids)
                })).toArray();
                return retVal;
            }
            else{
                return []
            }
        }
        else{
            const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider");
            const results = await mapper.findAll();
            return results.toArray();
        }
    }

    public async getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider");
        return mapper.get({federatedOIDCProviderId: types.Uuid.fromString(federatedOIDCProviderId)});
    }


    public async createFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider");
        await mapper.insert(federatedOIDCProvider);
        return federatedOIDCProvider;
    }


    public async updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider");
        await mapper.update(federatedOIDCProvider);
        return federatedOIDCProvider;
    }

    public async getFederatedOidcProviderTenantRels(tenantId?: string, federatedOIDCProviderId?: string): Promise<Array<FederatedOidcProviderTenantRel>> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {}
        if(tenantId){
            queryParams.tenantId = tenantId;
        }
        if(federatedOIDCProviderId){
            queryParams.federatedOIDCProviderId = federatedOIDCProviderId;
        }        
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_tenant_rel");
        const results = await mapper.find(queryParams);
        return results.toArray();
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_domain_rel");
        const results: Array<FederatedOidcProviderTenantRel> = (await mapper.find({domain: domain})).toArray();
        if(results && results.length > 0){
            return this.getFederatedOidcProviderById(results[0].federatedOIDCProviderId);
        }
        else{
            return null;
        }
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_tenant_rel");
        const rel: FederatedOidcProviderTenantRel = {
            federatedOIDCProviderId: federatedOIDCProviderId,
            tenantId: tenantId
        };
        await mapper.insert(rel);
        return rel;
    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_tenant_rel");
        await mapper.remove({
            federatedOIDCProviderId: types.Uuid.fromString(federatedOIDCProviderId),
            tenantId: types.Uuid.fromString(tenantId)
        });
        return {
            federatedOIDCProviderId: federatedOIDCProviderId,
            tenantId: tenantId
        }
    }

    public async getFederatedOidcProviderDomainRels(federatedOIDCProviderId: string | null, domain: string | null): Promise<Array<FederatedOidcProviderDomainRel>> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {}
        if(federatedOIDCProviderId){
            queryParams.federatedOIDCProviderId = federatedOIDCProviderId;
        }
        if(domain){
            queryParams.domain = domain;
        }
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_domain_rel");
        const results = await mapper.find(queryParams);
        return results.toArray();
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_domain_rel");
        const rel: FederatedOidcProviderDomainRel = {
            domain: domain,
            federatedOIDCProviderId: federatedOIDCProviderId
        };
        await mapper.insert(rel);
        return rel;
    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_domain_rel");
        await mapper.remove({
            domain: domain,
            federatedOIDCProviderId: types.Uuid.fromString(federatedOIDCProviderId)
        });
        return {
            domain: domain,
            federatedOIDCProviderId: federatedOIDCProviderId
        }
    }

    public async deleteFederatedOidcProvider(federatedOIDCProviderId: string): Promise<void> {
        const tenantRelMapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_tenant_rel");
        const arrTenantRel: Array<FederatedOidcProviderTenantRel> = await this.getFederatedOidcProviderTenantRels(undefined, federatedOIDCProviderId);

        const oidcUuid = types.Uuid.fromString(federatedOIDCProviderId);
        for(let i = 0; i < arrTenantRel.length; i++){
            tenantRelMapper.remove({
                tenantId: types.Uuid.fromString(arrTenantRel[i].tenantId),
                federatedOIDCProviderId: oidcUuid
            });
        }

        const domainRelMapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider_domain_rel");
        const arrDomainRel = await this.getFederatedOidcProviderDomainRels(federatedOIDCProviderId, null);
        for(let i = 0; i < arrDomainRel.length; i++){
            domainRelMapper.remove({
                domain: arrDomainRel[i].domain,
                federatedOIDCProviderId: oidcUuid
            });
        }

        const federatedOidcMapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_provider");
        federatedOidcMapper.remove({
            federatedOIDCProviderId: oidcUuid
        });


    }

}

export default CassandraFederatedOIDCProviderDao;