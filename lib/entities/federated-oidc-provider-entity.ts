import type { FederatedOidcProvider } from '@/graphql/generated/graphql-types';
import { BlobType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
    tableName: "federated_oidc_provider"
})
export class FederatedOIDCProviderEntity {

    constructor(federatedOidcProvider?: FederatedOidcProvider){
        if(federatedOidcProvider){
            this.clientauthtype = federatedOidcProvider.clientAuthType;
            this.federatedoidcproviderclientid = federatedOidcProvider.federatedOIDCProviderClientId;
            this.federatedoidcproviderid = federatedOidcProvider.federatedOIDCProviderId;
            this.federatedoidcprovidername = federatedOidcProvider.federatedOIDCProviderName;
            this.federatedoidcprovidertype = federatedOidcProvider.federatedOIDCProviderType;
            this.federatedoidcproviderwellknownuri = federatedOidcProvider.federatedOIDCProviderWellKnownUri;
            this.refreshtokenallowed = federatedOidcProvider.refreshTokenAllowed;
            this.scopes = federatedOidcProvider.scopes ? federatedOidcProvider.scopes.join(",") : "";
            this.usepkce = federatedOidcProvider.usePkce
            this.federatedoidcproviderclientsecret = federatedOidcProvider.federatedOIDCProviderClientSecret ? federatedOidcProvider.federatedOIDCProviderClientSecret : "";
            this.federatedoidcproviderdescription = federatedOidcProvider.federatedOIDCProviderDescription || "";
            this.federatedoidcprovidertenantid = federatedOidcProvider.federatedOIDCProviderTenantId || "";
            this.sociallogindisplayname = federatedOidcProvider.socialLoginDisplayName || "";
            this.socialloginicon = federatedOidcProvider.socialLoginIcon ? Buffer.from(federatedOidcProvider.socialLoginIcon) : null;
        }
    }

    @PrimaryKey()
    federatedoidcproviderid: string;

    @Property()
    federatedoidcprovidername: string;

    @Property()
    federatedoidcproviderdescription: string | null;
    
    @Property()
    federatedoidcprovidertenantid: string | null;
    
    @Property()
    federatedoidcproviderclientid: string;
    
    @Property()
    federatedoidcproviderclientsecret: string | null;

    @Property()
    federatedoidcproviderwellknownuri: string

    @Property()
    refreshtokenallowed: boolean;

    @Property()
    scopes: string | null;

    @Property()
    usepkce: boolean;

    @Property()
    clientauthtype: string;

    @Property()
    federatedoidcprovidertype: string;

    @Property({ type: BlobType, nullable: true })
    socialloginicon: Buffer | null;

    @Property()
    sociallogindisplayname: string | null;

    public toModel(): FederatedOidcProvider {
        const f: FederatedOidcProvider = {
            clientAuthType: this.clientauthtype,
            federatedOIDCProviderClientId: this.federatedoidcproviderclientid,
            federatedOIDCProviderId: this.federatedoidcproviderid,
            federatedOIDCProviderName: this.federatedoidcprovidername,
            federatedOIDCProviderType: this.federatedoidcprovidertype,
            federatedOIDCProviderWellKnownUri: this.federatedoidcproviderwellknownuri,
            refreshTokenAllowed: this.refreshtokenallowed,
            scopes: this.scopes ? this.scopes.split(",") : [],
            usePkce: this.usepkce,
            federatedOIDCProviderClientSecret: "",
            federatedOIDCProviderDescription: this.federatedoidcproviderdescription,
            federatedOIDCProviderTenantId: this.federatedoidcprovidertenantid, 
            socialLoginDisplayName: this.sociallogindisplayname,
            socialLoginIcon: this.socialloginicon ? this.socialloginicon.toString() : "",
        }
        return f;

    }
}