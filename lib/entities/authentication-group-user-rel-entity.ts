import { EntitySchema } from 'typeorm';

const AuthenticationGroupUserRelEntity = new EntitySchema({
    tableName: "authentication_group_user_rel",
    name: "authenticationGroupUserRel",
    columns: {

        authenticationGroupId: {
            type: String,
            primary: true,
            name: "authenticationgroupid"
        },
        userId: {
            type: String,
            primary: true,
            name: "userid"
        }
    }
});


export default AuthenticationGroupUserRelEntity;