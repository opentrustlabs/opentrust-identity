import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "refreshtokenallowed",
            transformer: BooleanTransformer
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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "usepkce",
            transformer: BooleanTransformer
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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        },
        federatedOIDCProviderResponseType: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcproviderresponsetype"
        },
        federatedOIDCProviderSubjectType: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedoidcprovidersubjecttype"
        }
    },



});

export default FederatedOIDCProviderEntity;
