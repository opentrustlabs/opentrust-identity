import { TenantAnonymousUserConfigurationRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


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