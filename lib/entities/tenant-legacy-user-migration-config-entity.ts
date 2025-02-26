import type { TenantLegacyUserMigrationConfig } from "@/graphql/generated/graphql-types";


import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_legacy_user_migration_config"
})
class TenantLegacyUserMigrationConfigEntity implements TenantLegacyUserMigrationConfig {

    constructor(tenantLegacyUserMigrationConfig?: TenantLegacyUserMigrationConfig){
        if(tenantLegacyUserMigrationConfig){
            Object.assign(this, tenantLegacyUserMigrationConfig);
        }
    }

    __typename?: "TenantLegacyUserMigrationConfig";
    
    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "authenticationuri"})
    authenticationUri: string;
    
    @Property({fieldName: "userprofileuri"})
    userProfileUri: string;

    @Property({fieldName: "usernamecheckuri"})
    usernameCheckUri: string;

}

export default TenantLegacyUserMigrationConfigEntity;