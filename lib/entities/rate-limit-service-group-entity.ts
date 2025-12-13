import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const RateLimitServiceGroupEntity = new EntitySchema({


    columns: {
        servicegroupid: {
            type: String,
            primary: true,
            name: "servicegroupid"
        },
        servicegroupname: {
            type: String,
            primary: false,
            nullable: false,
            name: "servicegroupname"
        },
        servicegroupdescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "servicegroupdescription"
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        }
    },

    tableName: "rate_limit_service_group",
    name: "rateLimitServiceGroup",

});

export default RateLimitServiceGroupEntity;
