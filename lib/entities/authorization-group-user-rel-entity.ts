import { EntitySchema } from 'typeorm';

const AuthorizationGroupUserRelEntity = new EntitySchema({


    columns: {
        groupId: {
            type: String,
            primary: true,
            name: "groupid"
        },
        userId: {
            type: String,
            primary: true,
            name: "userid"
        }
    },

    tableName: "authorization_group_user_rel",
    name: "authorizationGroupUserRel",

});



export default AuthorizationGroupUserRelEntity;
