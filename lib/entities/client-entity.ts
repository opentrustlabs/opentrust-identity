import type { Client, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";


@Entity({
    tableName: "client"
})
class ClientEntity implements Client {
    
    constructor(client: Client){
        Object.assign(this, client);
    }
    
    __typename?: "Client" | undefined;


    @Property({fieldName: "clientdescription", nullable: true})
    clientDescription?: Maybe<string> | undefined | null;
    
    @PrimaryKey({fieldName: "clientid"})
    clientId: string;

    @Property({fieldName: "clientname"})
    clientName: string;

    @Property({fieldName: "clientsecret"})
    clientSecret: string;

    @Property({fieldName: "clienttokenttlseconds", nullable: true})
    clientTokenTTLSeconds?: Maybe<number> | undefined | null;

    @Property({fieldName: "clienttype"})
    clientType: string;

    //@Property("clienttypeid")
    clienttypeid?: Maybe<string> | undefined | null;

    @Property({fieldName: "maxrefreshtokencount", nullable: true})
    maxRefreshTokenCount?: Maybe<number> | undefined | null;

    @Property({fieldName: "enabled"})
    enabled: boolean;

    @Property({fieldName: "oidcenabled"})
    oidcEnabled: boolean;

    @Property({fieldName: "pkceenabled"})
    pkceEnabled: boolean;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "usertokenttlseconds", nullable: true})
    userTokenTTLSeconds?: Maybe<number> | undefined | null;

}

export default ClientEntity;