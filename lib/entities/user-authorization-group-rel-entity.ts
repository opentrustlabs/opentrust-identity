import type { UserAuthorizationGroupRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "user_authorization_group_rel"
})
class UserAuthorizationGroupRelEntity implements UserAuthorizationGroupRel {

    constructor(userAuthorizationGroupRel?: UserAuthorizationGroupRel){
        if(userAuthorizationGroupRel){
            Object.assign(this, userAuthorizationGroupRel);
        }
    }

    __typename?: "UserAuthorizationGroupRel" | undefined;
    
    @PrimaryKey({fieldName: "groupid"})
    groupId: string;

    @PrimaryKey({fieldName: "userid"})
    userId: string;
    
}

export default UserAuthorizationGroupRelEntity;