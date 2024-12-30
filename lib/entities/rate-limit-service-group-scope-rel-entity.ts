import type { RateLimitServiceGroupScopeRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "rate_limit_service_group_scope_rel"
})
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