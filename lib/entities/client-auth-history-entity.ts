import { EntitySchema } from 'typeorm';

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
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatseconds"
        }
    },

    tableName: "client_auth_history",
    name: "clientAuthHistory",

});


export default ClientAuthHistoryEntity;
