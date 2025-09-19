import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantLegacyUserMigrationConfigEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantLegacyUserMigrationConfigEntity {
        return TenantLegacyUserMigrationConfigEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            authenticationUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "authenticationuri"
            },
            userProfileUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "userprofileuri"
            },
            usernameCheckUri: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "usernamecheckuri"
            }
        }, 
        {
            sequelize,
            tableName: "tenant_legacy_user_migration_config",
            modelName: "tenantLegacyUserMigrationConfig",
            timestamps: false
    });
}}


export default TenantLegacyUserMigrationConfigEntity;