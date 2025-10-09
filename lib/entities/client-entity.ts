import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const ClientEntity = new EntitySchema({

    tableName: "client",
    name: "client",
    columns: {
        clientId: {
            type: String,
            primary: true,
            name: "clientid"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        clientName: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientname"
        },
        clientDescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "clientdescription"
        },
        clientSecret: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientsecret"
        },
        clientTokenTTLSeconds: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "clienttokenttlseconds"
        },
        clientType: {
            type: String,
            primary: false,
            nullable: false,
            name: "clienttype"
        },
        maxRefreshTokenCount: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "maxrefreshtokencount"
        },
        enabled: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "enabled",
            transformer: BooleanTransformer
        },
        oidcEnabled: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "oidcenabled",
            transformer: BooleanTransformer
        },
        pkceEnabled: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "pkceenabled",
            transformer: BooleanTransformer
        },
        userTokenTTLSeconds: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "usertokenttlseconds"
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        },
        audience: {
            type: String,
            primary: false,
            nullable: true,
            name: "audience"
        }
    },

});


export default ClientEntity;
