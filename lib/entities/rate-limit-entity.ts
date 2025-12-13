import type { RateLimit } from "@/graphql/generated/graphql-types";

// @Entity({
//     tableName: "rate_limit"
// })
class RateLimitEntity implements RateLimit {

    constructor(rateLimit?: RateLimit){
        if(rateLimit){
            Object.assign(this, rateLimit);
        }
    }
    __typename?: "RateLimit" | undefined;

    ratelimitid: string;

    ratelimitname: string;

    servicegroupid: string;

}

export default RateLimitEntity;