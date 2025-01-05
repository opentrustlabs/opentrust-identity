import type { TenantAuthenticationDomainRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_authentication_domain_rel"
})
class TenantAuthenticationDomainRelEntity implements TenantAuthenticationDomainRel{

    constructor(tenantAuthenticationDomainRel?: TenantAuthenticationDomainRel){
        Object.assign(this, tenantAuthenticationDomainRel)
    }

    __typename?: "TenantAuthenticationDomainRel";

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;    

    @PrimaryKey({fieldName: "domain"})
    domain: string;    

}

export default TenantAuthenticationDomainRelEntity;