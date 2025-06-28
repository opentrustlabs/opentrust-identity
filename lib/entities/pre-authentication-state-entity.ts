import { Model, DataTypes, Sequelize } from 'sequelize';

class PreAuthenticationStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof PreAuthenticationStateEntity {
        return PreAuthenticationStateEntity.init({
            token: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "token"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientid"
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
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "redirecturi"
            },
            responseMode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "responsemode"
            },
            responseType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "responsetype"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scope"
            },
            state: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "state"
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