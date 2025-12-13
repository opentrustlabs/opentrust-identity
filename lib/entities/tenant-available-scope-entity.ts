import { EntitySchema } from 'typeorm';

const TenantAvailableScopeEntity = new EntitySchema({


    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        scopeId: {
            type: String,
            primary: true,
            name: "scopeid"
        },
        accessRuleId: {
            type: String,
            primary: false,
            nullable: true,
            name: "accessruleid"
        }
    },

    tableName: "tenant_available_scope",
    name: "tenantAvailableScope",

});


export default TenantAvailableScopeEntity;
