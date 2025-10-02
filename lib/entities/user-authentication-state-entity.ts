import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserAuthenticationStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserAuthenticationStateEntity {
        return UserAuthenticationStateEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            authenticationSessionToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "authenticationsessiontoken"
            },
            authenticationState: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "authenticationstate"
            },
            authenticationStateOrder: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "authenticationstateorder"
            },
            authenticationStateStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "authenticationstatestatus"
            },
            preAuthToken: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "preauthtoken"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
            },
            returnToUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "returntouri"
            },
            deviceCodeId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "devicecodeid"
            }
        }, 
        {
            sequelize,
            tableName: "user_authentication_state",
            modelName: "userAuthenticationState",
            timestamps: false
        });
    }
}


export default UserAuthenticationStateEntity;