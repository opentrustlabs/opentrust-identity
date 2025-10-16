import { EntitySchema } from 'typeorm';


const AuthenticationGroupClientRelEntity = new EntitySchema({
    tableName: "authentication_group_client_rel",
    name: "authenticationGroupClientRel",
    columns: {
        authenticationGroupId: {
            type: String,
            primary: true,
            name: "authenticationgroupid"
        },
        clientId: {
            type: String,
            primary: true,
            name: "clientid"
        }
    }
});



export default AuthenticationGroupClientRelEntity;