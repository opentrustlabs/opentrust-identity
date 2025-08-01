import { Model, DataTypes, Sequelize } from 'sequelize';

class SystemSettingsEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SystemSettingsEntity {
        return SystemSettingsEntity.init({
            systemId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "systemid"
            },
            allowBackupEmail: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                field: "allowbackupemail"
            },
            allowDuressPassword: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowduresspassword"
            },
            rootClientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "rootclientid"
            },
            enablePortalAsLegacyIdp: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "enableportalaslegacyidp"
            }
        }, 
        {
            sequelize,
            tableName: "system_settings",
            modelName: "systemSettings",
            timestamps: false
        });
    }
}


export default SystemSettingsEntity;