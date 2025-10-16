import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "usepkce",
            transformer: BooleanTransformer
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
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },

    tableName: "federated_auth_test",
    name: "federatedAuthTest",

});

export default FederatedAuthTestEntity;
