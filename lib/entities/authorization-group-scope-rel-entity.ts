import type { AuthorizationGroupScopeRel, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "authorization_group_scope_rel"
})
class AuthorizationGroupScopeRelEntity implements AuthorizationGroupScopeRel {

    constructor(m?: AuthorizationGroupScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "AuthorizationGroupScopeRel" | undefined;

    @PrimaryKey({fieldName: "groupid"})
    groupId: string;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "accessruleid"})
    accessRuleId?: Maybe<string> | undefined;

}

export default AuthorizationGroupScopeRelEntity;