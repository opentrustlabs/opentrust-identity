import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const FederatedOIDCAuthorizationRelEntity = new EntitySchema({
    columns: {
        state: {
            type: String,
            primary: true,
            name: "state"
        },
        federatedOIDCAuthorizationRelType: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcauthorizationreltype"
        },
        email: {
            type: String,
            primary: false,
            nullable: true,
            name: "email"
        },
        userId: {
            type: String,
            primary: false,
            nullable: true,
            name: "userid"
        },
        codeVerifier: {
            type: String,
            primary: false,
            nullable: true,
            name: "codeverifier"
        },
        codechallengemethod: {
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
        federatedOIDCProviderId: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcproviderid"
        },
        initClientId: {
            type: String,
            primary: false,
            nullable: true,
            name: "initclientid"
        },
        initCodeChallenge: {
            type: String,
            primary: false,
            nullable: true,
            name: "initcodechallenge"
        },
        initCodeChallengeMethod: {
            type: String,
            primary: false,
            nullable: true,
            name: "initcodechallengemethod"
        },
        initRedirectUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "initredirecturi"
        },
        initResponseMode: {
            type: String,
            primary: false,
            nullable: false,
            name: "initresponsemode"
        },
        initResponseType: {
            type: String,
            primary: false,
            nullable: false,
            name: "initresponsetype"
        },
        initScope: {
            type: String,
            primary: false,
            nullable: false,
            name: "initscope"
        },
        initState: {
            type: String,
            primary: false,
            nullable: false,
            name: "initstate"
        },
        initTenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "inittenantid"
        }
    },

    tableName: "federated_oidc_authorization_rel",
    name: "federatedOidcAuthorizationRel",

});


export default FederatedOIDCAuthorizationRelEntity;
