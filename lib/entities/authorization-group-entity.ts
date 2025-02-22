import type { AuthorizationGroup, Maybe } from "@/graphql/generated/graphql-types"
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "authorization_group"
})
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

    @Property({fieldName: "groupdescription"})
    groupDescription?: Maybe<string> | undefined;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "defaultgroup"})
    default: boolean;

}

export default AuthorizationGroupEntity;