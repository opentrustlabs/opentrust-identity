import type { AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "authentication_group_user_rel"
})
class AuthenticationGroupUserRelEntity implements AuthenticationGroupUserRel {

    constructor(authenticationGroupUserRel?: AuthenticationGroupUserRel){
        if(authenticationGroupUserRel){
            Object.assign(this, authenticationGroupUserRel);
        }
    }

    __typename?: "AuthenticationGroupUserRel" | undefined;
    
    @PrimaryKey({fieldName: "authenticationgroupid"})
    authenticationGroupId: string;

    @PrimaryKey({fieldName: "userid"})
    userId: string;
    
}

export default AuthenticationGroupUserRelEntity;