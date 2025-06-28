import { Model, DataTypes, Sequelize } from 'sequelize';

class RefreshDataEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof RefreshDataEntity {
        return RefreshDataEntity.init({
            refreshToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "refreshtoken"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "userid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				field: "clientid"
            },
            redirecturi: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "redirecturi"
            },
            refreshCount: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "refreshcount"
            },
            refreshTokenClientType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "refreshtokenclienttype"
            },
            scope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scope"
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