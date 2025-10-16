import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "defaultgroup",
            transformer: BooleanTransformer
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        }
    }
});



export default AuthenticationGroupEntity;