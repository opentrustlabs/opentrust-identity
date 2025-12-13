import { EntitySchema } from 'typeorm';

const FederatedOIDCProviderDomainRelEntity = new EntitySchema({


    columns: {
        federatedOIDCProviderId: {
            type: String,
            primary: true,
            name: "federatedoidcproviderid"
        },
        domain: {
            type: String,
            primary: true,
            name: "domain"
        }
    },

    tableName: "federated_oidc_provider_domain_rel",
    name: "federatedOidcProviderDomainRel",

});

export default FederatedOIDCProviderDomainRelEntity;
