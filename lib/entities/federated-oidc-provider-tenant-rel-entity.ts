import { FederatedOidcProviderTenantRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


class FederatedOIDCProviderTenantRelEntity {

    constructor(federatedOidcProviderTenantRel?: FederatedOidcProviderTenantRel){
        if(federatedOidcProviderTenantRel){
            this.federatedoidcproviderid = federatedOidcProviderTenantRel.federatedOIDCProviderId;
            this.tenantid = federatedOidcProviderTenantRel.tenantId;
        }
    }

    @PrimaryKey()
    federatedoidcproviderid: string;

    @PrimaryKey()
    tenantid: string;

    public toModel(): FederatedOidcProviderTenantRel {
        return {
            federatedOIDCProviderId: this.federatedoidcproviderid,
            tenantId: this.tenantid
        }
    }

}

export default FederatedOIDCProviderTenantRelEntity