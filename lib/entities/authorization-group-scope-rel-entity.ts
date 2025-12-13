import { EntitySchema } from 'typeorm';

const AuthorizationGroupScopeRelEntity = new EntitySchema({


    columns: {
        groupId: {
            type: String,
            primary: true,
            name: "groupid"
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

    tableName: "authorization_group_scope_rel",
    name: "authorizationGroupScopeRel",

});


export default AuthorizationGroupScopeRelEntity;
