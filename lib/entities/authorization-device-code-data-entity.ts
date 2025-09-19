import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthorizationDeviceCodeDataEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationDeviceCodeDataEntity {
        return AuthorizationDeviceCodeDataEntity.init({
            deviceCodeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                columnName: "devicecodeid"
            },
            deviceCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "devicecode"
            },            
            userCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "usercode"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scope"
            },
            authorizationStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "authorizationstatus"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "userid"
            }
        }, 
        {
            sequelize,
            tableName: "authorization_device_code_data",
            modelName: "authorizationDeviceCodeData",
            timestamps: false
        });
    }
}


export default AuthorizationDeviceCodeDataEntity;