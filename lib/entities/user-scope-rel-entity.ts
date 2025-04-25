import type { UserScopeRel } from "@/graphql/generated/graphql-types";


// @Entity({
//     tableName: "user_scope_rel"
// })
class UserScopeRelEntity implements UserScopeRel {

    constructor(m?: UserScopeRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "UserScopeRel";

    userId: string;

    scopeId: string;

    tenantId: string;

    
}

export default UserScopeRelEntity;