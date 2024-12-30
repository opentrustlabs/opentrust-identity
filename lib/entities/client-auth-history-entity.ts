import type { ClientAuthHistory } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "client_auth_history"
})
class ClientAuthHistoryEntity implements ClientAuthHistory {

    constructor(m?: ClientAuthHistory){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "ClientAuthHistory" | undefined;
    
    @PrimaryKey({fieldName: "jti"})
    jti: string;

    @Property({fieldName: "clientid"})
    clientId: string;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "expiresatms"})
    expiresAtSeconds: number;
   

}

export default ClientAuthHistoryEntity;