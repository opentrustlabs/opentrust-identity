import { EntitySchema } from 'typeorm';


export interface ClientRedirectUriRel {
    clientId: string,
    redirectUri: string
}

const ClientRedirectUriRelEntity = new EntitySchema({


    columns: {
        clientId: {
            type: String,
            primary: true,
            name: "clientid"
        },
        redirectUri: {
            type: String,
            primary: true,
            name: "redirecturi"
        }
    },

    tableName: "client_redirect_uri_rel",
    name: "clientRedirectUriRel",

});


export default ClientRedirectUriRelEntity;
