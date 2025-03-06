
import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";


abstract class FederatedOIDCProviderDao {

    abstract getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>>;

    abstract getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null>;

    abstract createFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>;

    abstract updateFederatedOidcProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>;

    abstract getFederatedOidcProviderTenantRels(tenantId?: string): Promise<Array<FederatedOidcProviderTenantRel>>;

    abstract getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null>;

    abstract assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel>;

    abstract removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel>;

    abstract getFederatedOidcProviderDomainRels(federatedOIDCProviderId: string | null, domain: string | null): Promise<Array<FederatedOidcProviderDomainRel>>;

    abstract assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel>;

    abstract removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel>;

    abstract deleteFederatedOidcProvider(federatedOIDCProviderId: string): Promise<void>;

}

export default FederatedOIDCProviderDao