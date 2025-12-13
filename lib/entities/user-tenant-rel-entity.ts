import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "enabled",
            transformer: BooleanTransformer
        }
    },

    tableName: "user_tenant_rel",
    name: "userTenantRel",

});



export default UserTenantRelEntity;
