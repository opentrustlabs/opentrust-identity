import type { AuthorizationCodeData, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "authorization_code_data"
})
class AuthorizationCodeDataEntity implements AuthorizationCodeData {

    constructor(m?: AuthorizationCodeData){
        if(m){
            Object.assign(this , m);
        }
    }
    __typename?: "AuthorizationCodeData" | undefined;
    
    @PrimaryKey({fieldName: "code"})
    code: string;

    @Property({fieldName: "clientid"})
    clientId: string;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "codechallenge", nullable: true})
    codeChallenge?: Maybe<string> | undefined;

    @Property({fieldName: "codechallengemethod", nullable: true})
    codeChallengeMethod?: Maybe<string> | undefined;

    @Property({fieldName: "expiresatms"})
    expiresAtMs: number;

    @Property({fieldName: "redirecturi"})
    redirectUri: string;

    @Property({fieldName: "scope"})
    scope: string;
    
    @Property({fieldName: "userid"})
    userId: string;
  
}

export default AuthorizationCodeDataEntity;