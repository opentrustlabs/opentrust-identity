import { EntitySchema } from 'typeorm';

const UserScopeRelEntity = new EntitySchema({


    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        scopeId: {
            type: String,
            primary: true,
            name: "scopeid"
        },
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        }
    },

    tableName: "user_scope_rel",
    name: "userScopeRel",

});

export default UserScopeRelEntity;

