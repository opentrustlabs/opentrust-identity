import { UserAuthorizationGroupRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


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