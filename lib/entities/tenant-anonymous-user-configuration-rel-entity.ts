import type { TenantAnonymousUserConfigurationRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_anonymous_user_configuration_rel"
})
class TenantAnonymousUserConfigurationRelEntity implements TenantAnonymousUserConfigurationRel {

    constructor(m?: TenantAnonymousUserConfigurationRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "TenantAnonymousUserConfigurationRel";

    @PrimaryKey({fieldName: "anonymoususerconfigurationid"})
    anonymoususerconfigurationid: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantid: string;
    
}

export default TenantAnonymousUserConfigurationRelEntity;