// import type { RateLimitServiceGroupScopeRel } from "@/graphql/generated/graphql-types";


// @Entity({
//     tableName: "rate_limit_service_group_scope_rel"
// })
class RateLimitServiceGroupScopeRelEntity  {

    // constructor(rateLimitServiceGroupScopeRel?: RateLimitServiceGroupScopeRel){
    //     if(rateLimitServiceGroupScopeRel){
    //         Object.assign(this, rateLimitServiceGroupScopeRel);
    //     }
    // }
    __typename?: "RateLimitServiceGroupScopeRel" | undefined;

    scopeid: string;
    servicegroupid: string;
    
}

export default RateLimitServiceGroupScopeRelEntity