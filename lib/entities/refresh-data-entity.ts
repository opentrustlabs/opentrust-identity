import { Model, DataTypes, Sequelize } from "@sequelize/core";

class RefreshDataEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof RefreshDataEntity {
        return RefreshDataEntity.init({
            refreshToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "refreshtoken"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "userid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				columnName: "clientid"
            },
            redirecturi: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "redirecturi"
            },
            refreshCount: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "refreshcount"
            },
            refreshTokenClientType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "refreshtokenclienttype"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scope"
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
            }
        }, {
            sequelize,
            tableName: "refresh_data",
            modelName: "refreshData",
            timestamps: false
        });
    }
}

export default RefreshDataEntity