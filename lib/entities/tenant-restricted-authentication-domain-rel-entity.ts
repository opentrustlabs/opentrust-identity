import { EntitySchema } from 'typeorm';

const TenantRestrictedAuthenticationDomainRelEntity = new EntitySchema({


    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        domain: {
            type: String,
            primary: true,
            name: "domain"
        }
    },

    tableName: "tenant_restricted_authentication_domain_rel",
    name: "tenantRestrictedAuthenticationDomainRel",

});



export default TenantRestrictedAuthenticationDomainRelEntity;
