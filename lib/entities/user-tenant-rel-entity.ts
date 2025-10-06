import { EntitySchema } from 'typeorm';

const UserTenantRelEntity = new EntitySchema({


    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        relType: {
            type: String,
            primary: false,
            nullable: false,
            name: "reltype"
        },
        enabled: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "enabled"
        }
    },

    tableName: "user_tenant_rel",
    name: "userTenantRel",

});



export default UserTenantRelEntity;
