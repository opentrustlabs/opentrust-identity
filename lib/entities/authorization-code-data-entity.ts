import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthorizationCodeDataEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationCodeDataEntity {
        return AuthorizationCodeDataEntity.init({
            code: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "code"
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
            codeChallenge: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "codechallenge"
            },
            codeChallengeMethod: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "codechallengemethod"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
            },
            redirectUri: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "redirecturi"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scope"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "userid"
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