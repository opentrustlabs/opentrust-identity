import type { UserTenantRel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({
    tableName: "user_tenant_rel"
})
class UserTenantRelEntity implements UserTenantRel {

    constructor(userTenantRel?: UserTenantRel){
        if(userTenantRel){
            Object.assign(this, userTenantRel);
        }
    }
    __typename?: "UserTenantRel" | undefined;

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @PrimaryKey({fieldName: "userid"})
    userId: string;    
    
}

export default UserTenantRelEntity;