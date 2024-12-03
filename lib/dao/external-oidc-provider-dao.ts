
import { ExternalOidcProvider, ExternalOidcProviderTenantRel, ExternalOidcProviderDomainRel } from "@/graphql/generated/graphql-types";


abstract class ExternalOIDCProviderDao {

    abstract getExternalOIDCProviders(tenantId?: string): Promise<Array<ExternalOidcProvider>>;

    abstract getExternalOIDCProviderById(externalOIDCProviderId: string): Promise<ExternalOidcProvider | null>;

    abstract createExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider>;

    abstract updateExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider>;

    abstract getExternalOIDCProviderTenantRels(tenantId?: string): Promise<Array<ExternalOidcProviderTenantRel>>;

    abstract getExternalOIDCProviderByDomain(domain: string): Promise<ExternalOidcProvider | null>;

    abstract assignExternalOIDCProviderToTenant(externalOIDCProviderId: string, tenantId: string): Promise<ExternalOidcProviderTenantRel>;

    abstract removeExternalOIDCProviderFromTenant(externalOIDCProviderId: string, tenantId: string): Promise<ExternalOidcProviderTenantRel>;

    abstract getExternalOIDCProviderDomainRels(): Promise<Array<ExternalOidcProviderDomainRel>>;

    abstract assignExternalOIDCProviderToDomain(externalOIDCProviderId: string, domain: string): Promise<ExternalOidcProviderDomainRel>;

    abstract removeExternalOIDCProviderFromDomain(externalOIDCProviderId: string, domain: string): Promise<ExternalOidcProviderDomainRel>;

    abstract deleteExternalOIDCProvider(externalOIDCProviderId: string): Promise<void>;

}

export default ExternalOIDCProviderDao