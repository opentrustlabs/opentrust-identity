import type { TenantAvailableScope } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_available_scope"
})
class TenantAvailableScopeEntity implements TenantAvailableScope {
    
    constructor(m?: TenantAvailableScope){
        if(m){
            Object.assign(this, m);
        }
    }
    
    __typename?: "TenantAvailableScope";
    
    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;
   
}

export default TenantAvailableScopeEntity;