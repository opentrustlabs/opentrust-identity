import { Model, DataTypes, Sequelize } from "@sequelize/core";

class FederatedAuthTestEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedAuthTestEntity {
        return FederatedAuthTestEntity.init({
            authState: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "authstate"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientid"
            },
            clientSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "clientsecret"
            },
            usePkce: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "usepkce"
            },
            codeVerifier: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "codeverifier"
            },
            wellKnownUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "wellknownuri"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scope"
            },
            redirectUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "redirecturi"
            },
            clientAuthType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientauthtype"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
            }
        }, 
        {
            sequelize,
            tableName: "federated_auth_test",
            modelName: "federatedAuthTest",
            timestamps: false
        });
    }
}

export default FederatedAuthTestEntity;