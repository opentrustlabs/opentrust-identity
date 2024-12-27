import type { SocialOidcProviderTenantRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";


@Entity({
    tableName: "social_oidc_provider_tenant_rel"
})
class SocialOIDCProviderTenantRelEntity {

    constructor(socialOidcProviderTenantRel?: SocialOidcProviderTenantRel){
        if(socialOidcProviderTenantRel){
            this.federatedoidcproviderid = socialOidcProviderTenantRel.federatedOIDCProviderId;
            this.tenantid = socialOidcProviderTenantRel.tenantId;
        }        
    }

    @PrimaryKey()
    federatedoidcproviderid: string;

    @PrimaryKey()
    tenantid: string;

    public toModel(): SocialOidcProviderTenantRel {
        return {
            federatedOIDCProviderId: this.federatedoidcproviderid,
            tenantId: this.tenantid
        }
    }

}

export default SocialOIDCProviderTenantRelEntity;