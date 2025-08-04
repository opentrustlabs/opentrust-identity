import { Model, DataTypes, Sequelize } from 'sequelize';

class UserRegistrationStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserRegistrationStateEntity {
        return UserRegistrationStateEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "email"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            registrationSessionToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "registrationsessiontoken"
            },
            registrationState: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "registrationstate"
            },
            registrationStateOrder: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "registrationstateorder"
            },
            registrationStateStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "registrationstatestatus"
            },
            preAuthToken: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "preauthtoken"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            },
            deviceCodeId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "devicecodeid"
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