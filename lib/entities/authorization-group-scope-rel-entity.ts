

// @Entity({
//     tableName: "authorization_group_scope_rel"

import { AuthorizationGroupScopeRel } from "@/graphql/generated/graphql-types";

// })
class AuthorizationGroupScopeRelEntity implements AuthorizationGroupScopeRel {

    constructor(m?: AuthorizationGroupScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "AuthorizationGroupScopeRel" | undefined;

    
    groupId: string;

    
    scopeId: string;

    
    tenantId: string;

}

export default AuthorizationGroupScopeRelEntity;