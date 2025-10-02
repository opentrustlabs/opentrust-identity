import { Model, DataTypes, Sequelize } from "@sequelize/core";

class SystemSettingsEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SystemSettingsEntity {
        return SystemSettingsEntity.init({
            systemId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "systemid"
            },
            allowRecoveryEmail: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowrecoveryemail"
            },
            allowDuressPassword: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowduresspassword"
            },
            rootClientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "rootclientid"
            },
            enablePortalAsLegacyIdp: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "enableportalaslegacyidp"
            },
            auditRecordRetentionPeriodDays: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "auditrecordretentionperioddays"
            },
            noReplyEmail: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "noreplyemail"
            },
            contactEmail: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "contactemail"
            },
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