import type { Maybe, UserScopeRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "user_scope_rel"
})
class UserScopeRelEntity implements UserScopeRel {

    constructor(m?: UserScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "UserScopeRel";

    @PrimaryKey({fieldName: "userid"})
    userid: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeid: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantid: string;

    @Property({fieldName: "accessruleid"})
    accessruleid?: Maybe<string> | undefined;
    
}

export default UserScopeRelEntity;