import { UserTenantRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";


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