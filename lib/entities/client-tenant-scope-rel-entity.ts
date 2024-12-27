import { ClientTenantScopeRel, Maybe } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class ClientTenantScopeRelEntity implements ClientTenantScopeRel {
    
    constructor(m?: ClientTenantScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    
    __typename?: "ClientTenantScopeRel" | undefined;
    
    @PrimaryKey({fieldName: "clientid"})
    clientId: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "accessruleid"})
    accessruleid?: Maybe<string> | undefined;
 
}

export default ClientTenantScopeRelEntity;