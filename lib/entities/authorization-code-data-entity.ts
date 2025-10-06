import { EntitySchema } from 'typeorm';

const AuthorizationCodeDataEntity = new EntitySchema({
    tableName: "authorization_code_data",
    name: "authorizationCodeData",

    columns: {
        code: {
            type: String,
            primary: true,
            name: "code"
        },
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        codeChallenge: {
            type: String,
            primary: false,
            nullable: true,
            name: "codechallenge"
        },
        codeChallengeMethod: {
            type: String,
            primary: false,
            nullable: true,
            name: "codechallengemethod"
        },
        expiresAtMs: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        redirectUri: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "redirecturi"
        },
        scope: {
            type: String,
            primary: false,
            nullable: false,
            name: "scope"
        },
        userId: {
            type: String,
            primary: false,
            nullable: false,
            name: "userid"
        }
    }
});



export default AuthorizationCodeDataEntity;
