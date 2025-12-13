import { EntitySchema } from 'typeorm';

const TenantLegacyUserMigrationConfigEntity = new EntitySchema({

    tableName: "tenant_legacy_user_migration_config",
    name: "tenantLegacyUserMigrationConfig",
    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        authenticationUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "authenticationuri"
        },
        userProfileUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "userprofileuri"
        },
        usernameCheckUri: {
            type: String,
            primary: false,
            nullable: false,
            name: "usernamecheckuri"
        }
    }
});



export default TenantLegacyUserMigrationConfigEntity;
