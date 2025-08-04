import { Model, DataTypes, Sequelize } from 'sequelize';

class UserAuthenticationStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserAuthenticationStateEntity {
        return UserAuthenticationStateEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            authenticationSessionToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "authenticationsessiontoken"
            },
            authenticationState: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "authenticationstate"
            },
            authenticationStateOrder: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "authenticationstateorder"
            },
            authenticationStateStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "authenticationstatestatus"
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
            returnToUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "returntouri"
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
            tableName: "user_authentication_state",
            modelName: "userAuthenticationState",
            timestamps: false
        });
    }
}


export default UserAuthenticationStateEntity;