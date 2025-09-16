import { Model, DataTypes, Sequelize } from 'sequelize';

class FederatedAuthTestEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedAuthTestEntity {
        return FederatedAuthTestEntity.init({
            authState: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "authstate"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientid"
            },
            clientSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "clientsecret"
            },
            usePkce: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "usepkce"
            },
            codeVerifier: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "codeverifier"
            },
            wellKnownUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "wellknownuri"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scope"
            },
            redirectUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "redirecturi"
            },
            clientAuthType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientauthtype"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
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