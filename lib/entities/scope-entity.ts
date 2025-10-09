import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const ScopeEntity = new EntitySchema({

    columns: {
        scopeId: {
            type: String,
            primary: true,
            name: "scopeid"
        },
        scopeName: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopename"
        },
        scopeDescription: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopedescription"
        },
        scopeUse: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopeuse"
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        }
    },

    tableName: "scope",
    name: "scope",

});


export default ScopeEntity;

