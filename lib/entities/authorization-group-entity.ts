import { EntitySchema } from 'typeorm';

const AuthorizationGroupEntity = new EntitySchema({

    columns: {
        groupId: {
            type: String,
            primary: true,
            name: "groupid"
        },
        groupName: {
            type: String,
            primary: false,
            nullable: false,
            name: "groupname"
        },
        groupDescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "groupdescription"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        default: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "defaultgroup"
        },
        allowForAnonymousUsers: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowforanonymoususers"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    },

    tableName: "authorization_group",
    name: "authorizationGroup",

});

export default AuthorizationGroupEntity;