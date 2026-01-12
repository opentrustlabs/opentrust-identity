import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBigIntTypeForDriver, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const PreAuthenticationStateEntity = new EntitySchema({
    columns: {
        token: {
            type: String,
            primary: true,
            name: "token"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
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
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        redirectUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "redirecturi"
        },
        responseMode: {
            type: String,
            primary: false,
            nullable: false,
            name: "responsemode"
        },
        responseType: {
            type: String,
            primary: false,
            nullable: false,
            name: "responsetype"
        },
        scope: {
            type: String,
            primary: false,
            nullable: false,
            name: "scope"
        },
        state: {
            type: String,
            primary: false,
            nullable: true,
            name: "state"
        },
        nonce: {
            type: String,
            primary: false,
            nullable: true,
            name: "nonce"
        },
        certificateThumbprint: {
            type: String,
            primary: false,
            nullable: true,
            name: "certificatethumbprint"
        },
        preAuthenticationStateProtocol: {
            type: String,
            primary: false,
            nullable: false,
            name: "preauthenticationstateprotocol"
        },
        userAuthenticated: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "userauthenticated",
            transformer: BooleanTransformer
        },
        authenticatedUserId: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticateduserid"
        }
    },

    tableName: "pre_authentication_state",
    name: "preAuthenticationState",

});
export default PreAuthenticationStateEntity;
