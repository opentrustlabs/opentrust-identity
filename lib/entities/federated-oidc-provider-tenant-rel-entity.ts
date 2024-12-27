import type { FederatedOidcProviderTenantRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";


@Entity({
    tableName: "federated_oidc_provider_tenant_rel"
})
class FederatedOIDCProviderTenantRelEntity implements FederatedOidcProviderTenantRel {

    constructor(federatedOidcProviderTenantRel?: FederatedOidcProviderTenantRel){
        if(federatedOidcProviderTenantRel){
            //Object.assign(this, federatedOidcProviderTenantRel);
            this.federatedOIDCProviderId = federatedOidcProviderTenantRel.federatedOIDCProviderId;
            this.tenantId = federatedOidcProviderTenantRel.tenantId;
            
        }
    }

    __typename?: "FederatedOIDCProviderTenantRel" | undefined;
    
    @PrimaryKey({fieldName: "federatedoidcproviderid"})
    federatedOIDCProviderId: string;
    
    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;


}

export default FederatedOIDCProviderTenantRelEntity