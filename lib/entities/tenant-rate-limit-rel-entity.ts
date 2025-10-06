import { EntitySchema } from 'typeorm';

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
            type: "boolean",
            primary: false,
            nullable: true,
            name: "allowunlimitedrate"
        },
        rateLimit: {
            type: "int",
            primary: false,
            nullable: true,
            name: "ratelimit"
        },
        rateLimitPeriodMinutes: {
            type: "int",
            primary: false,
            nullable: true,
            name: "ratelimitperiodminutes"
        }
    },

    tableName: "tenant_rate_limit_rel",
    name: "tenantRateLimitRel",

});


export default TenantRateLimitRelEntity;
