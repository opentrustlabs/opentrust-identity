
import { ExternalOidcProvider, ExternalOidcProviderTenantDomainRel } from "@/graphql/generated/graphql-types";


abstract class ExternalOIDCProviderDao {

    abstract getExternalOIDCProviders(tenantId?: string): Promise<Array<ExternalOidcProvider>>;

    abstract getExternalOIDCProviderById(externalOIDCProviderId: string): Promise<ExternalOidcProvider | null>;

    abstract createExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider>;

    abstract updateExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider>;

    abstract assignExternalOIDCProviderToTenant(externalOIDCProviderId: string, tenantId: string, domains: Array<string>): Promise<Array<ExternalOidcProviderTenantDomainRel>>;

    abstract removeExternalOIDCProviderFromTenant(externalOIDCProviderId: string, tenantId: string, domains: Array<string>): Promise<Array<ExternalOidcProviderTenantDomainRel>>;

    abstract deleteExternalOIDCProvider(externalOIDCProviderId: string): Promise<void>;

}

export default ExternalOIDCProviderDao