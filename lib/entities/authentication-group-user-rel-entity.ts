import { AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


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