import { Model, DataTypes, Sequelize } from 'sequelize';

class AuthorizationCodeDataEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationCodeDataEntity {
        return AuthorizationCodeDataEntity.init({
            code: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "code"
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
            codeChallenge: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "codechallenge"
            },
            codeChallengeMethod: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "codechallengemethod"
            },
            expiresAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            },
            redirectUri: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "redirecturi"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scope"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "userid"
            }
        }, 
        {
            sequelize,
            tableName: "authorization_code_data",
            modelName: "authorizationCodeData",
            timestamps: false
        });
    }
}


export default AuthorizationCodeDataEntity;