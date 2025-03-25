import type { Maybe, RateLimitServiceGroup } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "rate_limit_service_group"
})
class RateLimitServiceGroupEntity implements RateLimitServiceGroup {

    constructor(rateLimitServiceGroup?: RateLimitServiceGroup){
        if(rateLimitServiceGroup){
            Object.assign(this, rateLimitServiceGroup);
        }
    }
    
    __typename?: "RateLimitServiceGroup" | undefined;

    @PrimaryKey({fieldName: "servicegroupid"})
    servicegroupid: string;

    @Property({fieldName: "servicegroupname"})
    servicegroupname: string;

    @Property({fieldName: "servicegroupdescription"})
    servicegroupdescription?: Maybe<string> | undefined;
       
    
}

export default RateLimitServiceGroupEntity;