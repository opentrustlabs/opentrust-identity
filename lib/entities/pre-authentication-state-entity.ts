import { Maybe, PreAuthenticationState } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class PreAuthenticationStateEntity implements PreAuthenticationState {
    
    constructor(m?: PreAuthenticationState){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "PreAuthenticationState" | undefined;
    

    @PrimaryKey({fieldName: "token"})
    token: string;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "clientid"})
    clientId: string;

    @Property({fieldName: "codechallenge"})
    codeChallenge?: Maybe<string> | undefined;

    @Property({fieldName: "codechallengemethod"})
    codeChallengeMethod?: Maybe<string> | undefined;

    @Property({fieldName: "expiresatms"})
    expiresAtMs: number;

    @Property({fieldName: "redirecturi"})
    redirectUri: string;

    @Property({fieldName: "responsemode"})
    responseMode: string;

    @Property({fieldName: "responsetype"})
    responseType: string;

    @Property({fieldName: "scope"})
    scope: string;

    @Property({fieldName: "state"})
    state?: Maybe<string> | undefined;
  
}

export default PreAuthenticationStateEntity;