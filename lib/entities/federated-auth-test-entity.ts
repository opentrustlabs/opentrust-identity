import { EntitySchema } from 'typeorm';

const FederatedAuthTestEntity = new EntitySchema({


    columns: {
        authState: {
            type: String,
            primary: true,
            name: "authstate"
        },
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
        },
        clientSecret: {
            type: String,
            primary: false,
            nullable: true,
            name: "clientsecret"
        },
        usePkce: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "usepkce"
        },
        codeVerifier: {
            type: String,
            primary: false,
            nullable: true,
            name: "codeverifier"
        },
        wellKnownUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "wellknownuri"
        },
        scope: {
            type: String,
            primary: false,
            nullable: false,
            name: "scope"
        },
        redirectUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "redirecturi"
        },
        clientAuthType: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientauthtype"
        },
        expiresAtMs: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },

    tableName: "federated_auth_test",
    name: "federatedAuthTest",

});

export default FederatedAuthTestEntity;
