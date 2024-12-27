import { AuthorizationGroup } from "@/graphql/generated/graphql-types"
import { PrimaryKey, Property } from "@mikro-orm/core";


class AuthorizationGroupEntity implements AuthorizationGroup {

    constructor(authorizationGroup?: AuthorizationGroup){
        if(authorizationGroup){
            Object.assign(this, authorizationGroup);
        }
    }

    __typename?: "AuthorizationGroup" | undefined
    
    @PrimaryKey({fieldName: "groupid"})
    groupId: string;

    @Property({fieldName: "groupname"})
    groupName: string;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "defaultgroup"})
    default: boolean;

}

export default AuthorizationGroupEntity;