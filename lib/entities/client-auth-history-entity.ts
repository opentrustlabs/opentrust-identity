import { ClientAuthHistory } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


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