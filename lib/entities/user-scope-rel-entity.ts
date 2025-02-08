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
    userId: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "accessruleid"})
    accessRuleId?: Maybe<string> | undefined;
    
}

export default UserScopeRelEntity;