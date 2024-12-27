import { Maybe, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class TenantRateLimitRelEntity implements TenantRateLimitRel {

    constructor(tenantRateLimitRel?: TenantRateLimitRel){
        if(tenantRateLimitRel){
            Object.assign(this, tenantRateLimitRel);
        }
    }
    __typename?: "TenantRateLimitRel" | undefined;
    
    @PrimaryKey({fieldName: "ratelimitid"})
    rateLimitId: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "allowunlimitedrate"})
    allowUnlimitedRate?: Maybe<boolean> | undefined;

    @Property({fieldName: "ratelimit"})
    rateLimit?: Maybe<number> | undefined;
    
    @Property({fieldName: "ratelimitperiodminutes"})
    rateLimitPeriodMinutes?: Maybe<number> | undefined;
    
}

export default TenantRateLimitRelEntity