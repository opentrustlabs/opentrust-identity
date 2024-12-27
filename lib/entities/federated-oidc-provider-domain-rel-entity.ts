import type { FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";


@Entity({
    tableName: "federated_oidc_provider_domain_rel"
})
class FederatedOIDCProviderDomainRelEntity {

    constructor(federatedOidcProviderDomainRel?: FederatedOidcProviderDomainRel){
        if(federatedOidcProviderDomainRel){
            this.domain = federatedOidcProviderDomainRel.domain;
            this.federatedoidcproviderid = federatedOidcProviderDomainRel.federatedOIDCProviderId;
        }
    }

    @PrimaryKey()
    federatedoidcproviderid: string;

    @PrimaryKey()
    domain: string;

    public toModel(): FederatedOidcProviderDomainRel {
        return {
            federatedOIDCProviderId: this.federatedoidcproviderid,
            domain: this.domain
        }
    }
}

export default FederatedOIDCProviderDomainRelEntity;