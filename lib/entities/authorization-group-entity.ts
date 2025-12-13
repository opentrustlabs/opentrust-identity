import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;


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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "defaultgroup",
            transformer: BooleanTransformer
        },
        allowForAnonymousUsers: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowforanonymoususers",
            transformer: BooleanTransformer
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        }
    },

    tableName: "authorization_group",
    name: "authorizationGroup",

});

export default AuthorizationGroupEntity;