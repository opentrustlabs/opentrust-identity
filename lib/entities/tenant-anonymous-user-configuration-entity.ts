import { EntitySchema } from 'typeorm';

const TenantAnonymousUserConfigurationEntity = new EntitySchema({

    tableName: "tenant_anonymous_user_configuration",
    name: "tenantAnonymousUserConfiguration",
    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        defaultcountrycode: {
            type: String,
            primary: false,
            nullable: true,
            name: "defaultcountrycode"
        },
        defaultlanguagecode: {
            type: String,
            primary: false,
            nullable: true,
            name: "defaultlanguagecode"
        },
        tokenttlseconds: {
            type: "int",
            primary: false,
            nullable: true,
            name: "tokenttlseconds"
        }
    }
});


export default TenantAnonymousUserConfigurationEntity;
