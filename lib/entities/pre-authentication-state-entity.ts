import { Model, DataTypes, Sequelize } from "@sequelize/core";

class PreAuthenticationStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof PreAuthenticationStateEntity {
        return PreAuthenticationStateEntity.init({
            token: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "token"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientid"
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
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "redirecturi"
            },
            responseMode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "responsemode"
            },
            responseType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "responsetype"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scope"
            },
            state: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "state"
            }

        }, 
        {
            sequelize,
            tableName: "pre_authentication_state",
            modelName: "preAuthenticationState",
            timestamps: false
        });
    }
}


export default PreAuthenticationStateEntity;