import { EntitySchema } from 'typeorm';
import { getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const TenantLoginFailurePolicyEntity = new EntitySchema({


    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        loginFailurePolicyType: {
            type: String,
            primary: false,
            nullable: false,
            name: "loginfailurepolicytype"
        },
        failureThreshold: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "failurethreshold"
        },
        pauseDurationMinutes: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "pausedurationminutes"
        },
        maximumLoginFailures: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "maximumloginfailures"
        }
    },
    tableName: "tenant_login_failure_policy",
    name: "tenantLoginFailurePolicy",

})


export default TenantLoginFailurePolicyEntity;
