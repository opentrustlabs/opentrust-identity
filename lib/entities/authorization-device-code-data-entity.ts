import { Model, DataTypes, Sequelize } from 'sequelize';

class AuthorizationDeviceCodeDataEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationDeviceCodeDataEntity {
        return AuthorizationDeviceCodeDataEntity.init({
            deviceCodeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                field: "devicecodeid"
            },
            deviceCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "devicecode"
            },            
            userCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "usercode"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            expiresAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scope"
            },
            authorizationStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "authorizationstatus"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "userid"
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