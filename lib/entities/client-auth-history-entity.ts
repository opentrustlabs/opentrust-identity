import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const ClientAuthHistoryEntity = new EntitySchema({
    
    columns: {
        jti: {
            type: String,
            primary: true,
            name: "jti"
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
        expiresAtSeconds: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatseconds"
        }
    },

    tableName: "client_auth_history",
    name: "clientAuthHistory",

});


export default ClientAuthHistoryEntity;
