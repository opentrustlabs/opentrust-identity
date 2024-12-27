import { RateLimitServiceGroupScopeRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


class RateLimitServiceGroupScopeRelEntity implements RateLimitServiceGroupScopeRel {

    constructor(rateLimitServiceGroupScopeRel?: RateLimitServiceGroupScopeRel){
        if(rateLimitServiceGroupScopeRel){
            Object.assign(this, rateLimitServiceGroupScopeRel);
        }
    }
    __typename?: "RateLimitServiceGroupScopeRel" | undefined;

    @PrimaryKey({fieldName: "scopeid"})
    scopeid: string;

    @PrimaryKey({fieldName: "servicegroupid"})
    servicegroupid: string;
    
}

export default RateLimitServiceGroupScopeRelEntity