import { TenantManagementDomainRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


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