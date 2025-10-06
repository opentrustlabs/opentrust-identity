import { isArray } from '@apollo/client/utilities';
import { EntitySchema } from 'typeorm';

const FederatedOIDCProviderEntity = new EntitySchema({

    tableName: "federated_oidc_provider",
    name: "federatedOidcProvider",
    columns: {
        federatedOIDCProviderId: {
            type: String,
            primary: true,
            name: "federatedoidcproviderid"
        },
        federatedOIDCProviderName: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcprovidername"
        },
        federatedOIDCProviderDescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "federatedoidcproviderdescription"
        },
        federatedOIDCProviderTenantId: {
            type: String,
            primary: false,
            nullable: true,
            name: "federatedoidcprovidertenantid"
        },
        federatedOIDCProviderClientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcproviderclientid"
        },
        federatedOIDCProviderClientSecret: {
            type: String,
            primary: false,
            nullable: true,
            name: "federatedoidcproviderclientsecret"
        },
        federatedOIDCProviderWellKnownUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcproviderwellknownuri"
        },
        refreshTokenAllowed: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "refreshtokenallowed"
        },
        scopes: {
            type: String,
            primary: false,
            nullable: true,
            name: "scopes",
            transformer: {
                to(value) {
                    if (value) {
                        if (Array.isArray(value)) {
                            return value.join(",");
                        }
                        else {
                            return value;
                        }
                    }
                    else {
                        return ""
                    }
                },
                from(value) {
                    if (value && value.length > 0) {
                        return value.split(",");
                    }
                    else {
                        return value;
                    }
                },
            }
        },
        usePkce: {
            type: "boolean",
            primary: false,
            nullable: true,
            name: "usepkce"
        },
        clientAuthType: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientauthtype"
        },
        federatedOIDCProviderType: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcprovidertype"
        },
        socialLoginProvider: {
            type: String,
            primary: false,
            nullable: true,
            name: "socialloginprovider"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    },



});

export default FederatedOIDCProviderEntity;
