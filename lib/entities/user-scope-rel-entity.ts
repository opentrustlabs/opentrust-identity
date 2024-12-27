import { Maybe, UserScopeRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


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