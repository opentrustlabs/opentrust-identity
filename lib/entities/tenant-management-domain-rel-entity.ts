import type { TenantManagementDomainRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_management_domain_rel"
})
class TenantManagementDomainRelEntity {

    constructor(tenantManagementDomainRel?: TenantManagementDomainRel){
        if(tenantManagementDomainRel){
            this.tenantid = tenantManagementDomainRel.tenantId;
            this.domain = tenantManagementDomainRel.domain;
        }
    }

    @PrimaryKey()
    tenantid: string;

    @PrimaryKey()
    domain: string;

    public toModel(): TenantManagementDomainRel {
        return {
            tenantId: this.tenantid,
            domain: this.domain
        }
    }

}

export default TenantManagementDomainRelEntity;