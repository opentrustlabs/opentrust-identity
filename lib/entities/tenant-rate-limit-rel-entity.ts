import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const TenantRateLimitRelEntity = new EntitySchema({
    columns: {
        servicegroupid: {
            type: String,
            primary: true,
            name: "servicegroupid"
        },
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        allowUnlimitedRate: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "allowunlimitedrate",
            transformer: BooleanTransformer
        },
        rateLimit: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "ratelimit"
        },
        rateLimitPeriodMinutes: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "ratelimitperiodminutes"
        }
    },

    tableName: "tenant_rate_limit_rel",
    name: "tenantRateLimitRel",

});


export default TenantRateLimitRelEntity;
