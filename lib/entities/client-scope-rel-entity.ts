import { EntitySchema } from 'typeorm';

const ClientScopeRelEntity = new EntitySchema({


    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        clientId: {
            type: String,
            primary: true,
            name: "clientid"
        },
        scopeId: {
            type: String,
            primary: true,
            name: "scopeid"
        }
    },

    tableName: "client_scope_rel",
    name: "clientScopeRel",

});


export default ClientScopeRelEntity;
