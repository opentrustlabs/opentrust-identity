import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantLegacyUserMigrationConfigEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantLegacyUserMigrationConfigEntity {
        return TenantLegacyUserMigrationConfigEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            authenticationUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "authenticationuri"
            },
            userProfileUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "userprofileuri"
            },
            usernameCheckUri: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "usernamecheckuri"
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