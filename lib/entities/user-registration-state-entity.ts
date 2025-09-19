import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserRegistrationStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserRegistrationStateEntity {
        return UserRegistrationStateEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "email"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            registrationSessionToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "registrationsessiontoken"
            },
            registrationState: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "registrationstate"
            },
            registrationStateOrder: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "registrationstateorder"
            },
            registrationStateStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "registrationstatestatus"
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
            deviceCodeId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "devicecodeid"
            }
        }, 
        {
            sequelize,
            tableName: "user_registration_state",
            modelName: "userRegistrationState",
            timestamps: false
        });
    }
}


export default UserRegistrationStateEntity;