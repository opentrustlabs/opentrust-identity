import { Entity, PrimaryKey } from "@mikro-orm/core";


@Entity({
    tableName: "client_redirect_uri_rel"
})
class ClientRedirectUriRelEntity {

    constructor(clientId: string, redirectUri: string){
        this.clientId = clientId;
        this.redirectUri = redirectUri;
    }
    
    @PrimaryKey({fieldName: "clientid"})
    clientId: string;

    @PrimaryKey({fieldName: "redirecturi"})
    redirectUri: string;
    

}

export default ClientRedirectUriRelEntity;