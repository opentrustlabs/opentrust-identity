import { EntitySchema } from 'typeorm';

const FederatedOIDCProviderTenantRelEntity = new EntitySchema({


    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        federatedOIDCProviderId: {
            type: String,
            primary: true,
            name: "federatedoidcproviderid"
        }
    },

    tableName: "federated_oidc_provider_tenant_rel",
    name: "federatedOidcProviderTenantRel",

});



export default FederatedOIDCProviderTenantRelEntity;
