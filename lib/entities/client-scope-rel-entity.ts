import type { ClientScopeRel, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "client_scope_rel"
})
class ClientScopeRelEntity implements ClientScopeRel {
    
    constructor(m?: ClientScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    
    __typename?: "ClientScopeRel"
    
    @PrimaryKey({fieldName: "clientid"})
    clientId: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "accessruleid", nullable: true})
    accessruleid?: Maybe<string> | undefined;
 
}

export default ClientScopeRelEntity;