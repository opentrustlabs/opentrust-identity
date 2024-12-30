import type { RateLimit } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "rate_limit"
})
class RateLimitEntity implements RateLimit {

    constructor(rateLimit?: RateLimit){
        if(rateLimit){
            Object.assign(this, rateLimit);
        }
    }
    __typename?: "RateLimit" | undefined;

    @PrimaryKey({fieldName: "ratelimitid"})
    ratelimitid: string;

    @Property({fieldName: "ratelimitname"})
    ratelimitname: string;

    @Property({fieldName: "servicegroupid"})
    servicegroupid: string;

}

export default RateLimitEntity;