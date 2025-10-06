import { EntitySchema } from 'typeorm';

const TenantManagementDomainRelEntity = new EntitySchema({

    tableName: "tenant_management_domain_rel",
    name: "tenantManagementDomainRel",
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

    }
});

export default TenantManagementDomainRelEntity;
