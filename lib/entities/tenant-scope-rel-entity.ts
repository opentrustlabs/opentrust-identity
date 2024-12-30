import type { Maybe, TenantScopeRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_scope_rel"
})
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
    
    @Property({fieldName: "accessruleid", nullable: true})
    accessRuleId: string | undefined | null;
   
}

export default TenantScopeRelEntity;