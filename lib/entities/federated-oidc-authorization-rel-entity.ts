import type { FederatedOidcAuthorizationRel, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "federated_oidc_authorization_rel"
})
class FederatedOIDCAuthorizationRelEntity implements FederatedOidcAuthorizationRel {

    constructor(m?: FederatedOidcAuthorizationRel){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "FederatedOIDCAuthorizationRel" | undefined;
    
    @PrimaryKey({fieldName: "state"})
    state: string;

    @Property({fieldName: "codeverifier", nullable: true})
    codeVerifier?: Maybe<string> | undefined;

    @Property({fieldName: "codechallengemethod", nullable: true})
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