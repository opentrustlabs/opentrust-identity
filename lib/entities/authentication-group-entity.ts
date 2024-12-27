import { AuthenticationGroup, Maybe } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class AuthenticationGroupEntity implements AuthenticationGroup {

    constructor(authenticationGroup?: AuthenticationGroup){
        if(authenticationGroup){
            Object.assign(this, authenticationGroup);
        }
    }

    __typename?: "AuthenticationGroup" | undefined;
    
    @PrimaryKey({fieldName: "authenticationgroupid"})
    authenticationGroupId: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "authenticationgroupname"})
    authenticationGroupName: string;

    @Property({fieldName: "authenticationgroupdescription"})
    authenticationGroupDescription?: Maybe<string> | undefined;    
    
}

export default AuthenticationGroupEntity;