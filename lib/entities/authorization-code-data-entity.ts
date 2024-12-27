import { AuthorizationCodeData, Maybe } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


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

    @Property({fieldName: "codechallenge"})
    codeChallenge?: Maybe<string> | undefined;

    @Property({fieldName: "codechallengemethod"})
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