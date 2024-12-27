import { Maybe, RefreshData } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property, Ref } from "@mikro-orm/core";


class RefreshDataEntity implements RefreshData {

    constructor(m?: RefreshData){
        if(m){
            Object.assign(this, m);
        }
    }

    __typename?: "RefreshData" | undefined;
    
    @PrimaryKey({fieldName: "refreshtoken"})
    refreshToken: string;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "clientid"})
    clientId: string;

    @Property({fieldName: "redirecturi"})
    redirecturi: string;

    @Property({fieldName: "refreshcount"})
    refreshCount: number;
    
    @Property({fieldName: "refreshtokenclienttype"})
    refreshTokenClientType: string;

    //@Property({fieldName: ""})
    refreshtokenclienttypeid?: Maybe<string> | undefined;

    @Property({fieldName: "scope"})
    scope: string;
    
}

export default RefreshDataEntity