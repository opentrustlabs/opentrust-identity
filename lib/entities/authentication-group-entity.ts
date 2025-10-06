import { EntitySchema } from 'typeorm';

const AuthenticationGroupEntity = new EntitySchema({

    tableName: "authentication_group",
    name: "authenticationGroup",
    columns: {
        authenticationGroupId: {
            type: String,
            primary: true,
            name: "authenticationgroupid"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        authenticationGroupName: {
            type: String,
            primary: false,
            nullable: false,
            name: "authenticationgroupname"
        },
        authenticationGroupDescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticationgroupdescription"
        },
        defaultGroup: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "defaultgroup"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    }
});



export default AuthenticationGroupEntity;