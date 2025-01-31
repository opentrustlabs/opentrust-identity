import type { AuthorizationGroupUserRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "authorization_group_user_rel"
})
class AuthorizationGroupUserRelEntity implements AuthorizationGroupUserRel {

    constructor(userAuthorizationGroupRel?: AuthorizationGroupUserRel){
        if(userAuthorizationGroupRel){
            Object.assign(this, userAuthorizationGroupRel);
        }
    }

    __typename?: "AuthorizationGroupUserRel" | undefined;
    
    @PrimaryKey({fieldName: "groupid"})
    groupId: string;

    @PrimaryKey({fieldName: "userid"})
    userId: string;
    
}

export default AuthorizationGroupUserRelEntity;