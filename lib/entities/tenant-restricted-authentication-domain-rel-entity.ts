import type { TenantRestrictedAuthenticationDomainRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_restricted_authentication_domain_rel"
})
class TenantRestrictedAuthenticationDomainRelEntity implements TenantRestrictedAuthenticationDomainRel{

    constructor(tenantAuthenticationDomainRel?: TenantRestrictedAuthenticationDomainRel){
        Object.assign(this, tenantAuthenticationDomainRel)
    }

    __typename?: "TenantRestrictedAuthenticationDomainRel";

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;    

    @PrimaryKey({fieldName: "domain"})
    domain: string;    

}

export default TenantRestrictedAuthenticationDomainRelEntity;