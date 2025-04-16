import type { Maybe, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_rate_limit_rel"
})
class TenantRateLimitRelEntity implements TenantRateLimitRel {

    constructor(tenantRateLimitRel?: TenantRateLimitRel){
        if(tenantRateLimitRel){
            Object.assign(this, tenantRateLimitRel);
        }
    }
    __typename?: "TenantRateLimitRel" | undefined;
    
    @PrimaryKey({fieldName: "servicegroupid"})
    servicegroupid: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "allowunlimitedrate"})
    allowUnlimitedRate?: Maybe<boolean> | undefined;

    @Property({fieldName: "ratelimit", nullable: true})
    rateLimit?: Maybe<number> | undefined;
    
    @Property({fieldName: "ratelimitperiodminutes", nullable: true})
    rateLimitPeriodMinutes?: Maybe<number> | undefined;
    
}

export default TenantRateLimitRelEntity