import { EntitySchema } from 'typeorm';
import { getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "tokenttlseconds"
        }
    }
});


export default TenantAnonymousUserConfigurationEntity;
