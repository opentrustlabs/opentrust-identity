import { FederatedOidcAuthorizationRel, Maybe } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class FederatedOIDCAuthorizationRelEntity implements FederatedOidcAuthorizationRel {

    constructor(m?: FederatedOidcAuthorizationRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "FederatedOIDCAuthorizationRel" | undefined;
    
    @PrimaryKey({fieldName: "state"})
    state: string;

    @Property({fieldName: "codeverifier"})
    codeVerifier?: Maybe<string> | undefined;

    @Property({fieldName: "codechallengemethod"})
    codechallengemethod?: Maybe<string> | undefined;

    @Property({fieldName: "expiresatms"})
    expiresAtMs: number;

    @Property({fieldName: "federatedoidcproviderid"})
    federatedOIDCProviderId: string;

    @Property({fieldName: "initclientid"})
    initClientId: string;

    @Property({fieldName: "initcodechallenge"})
    initCodeChallenge?: Maybe<string> | undefined;

    @Property({fieldName: "initcodechallengemethod"})
    initCodeChallengeMethod?: Maybe<string> | undefined;

    @Property({fieldName: "initredirecturi"})
    initRedirectUri: string;

    @Property({fieldName: "initresponsemode"})
    initResponseMode: string;

    @Property({fieldName: "initresponsetype"})
    initResponseType: string;

    @Property({fieldName: "initscope"})
    initScope: string;

    @Property({fieldName: "initstate"})
    initState: string;

    @Property({fieldName: "inittenantid"})
    initTenantId: string;
  
 
}

export default FederatedOIDCAuthorizationRelEntity;