import { EntitySchema } from 'typeorm';


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
            type: "int",
            primary: false,
            nullable: false,
            name: "failurethreshold"
        },
        pauseDurationMinutes: {
            type: "int",
            primary: false,
            nullable: true,
            name: "pausedurationminutes"
        },
        maximumLoginFailures: {
            type: "int",
            primary: false,
            nullable: true,
            name: "maximumloginfailures"
        }
    },
    tableName: "tenant_login_failure_policy",
    name: "tenantLoginFailurePolicy",

})


export default TenantLoginFailurePolicyEntity;
