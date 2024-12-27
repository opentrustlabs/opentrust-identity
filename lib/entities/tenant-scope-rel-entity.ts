import { Maybe, TenantScopeRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class TenantScopeRelEntity implements TenantScopeRel {
    
    constructor(m?: TenantScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    
    __typename?: "TenantScopeRel";
    
    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;
    
    @Property({fieldName: "accessruleid"})
    accessRuleId?: Maybe<string> | undefined;
   
}

export default TenantScopeRelEntity;