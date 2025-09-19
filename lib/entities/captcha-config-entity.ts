import { Model, DataTypes, Sequelize } from "@sequelize/core";

class CaptchaConfigEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof CaptchaConfigEntity {
        return CaptchaConfigEntity.init({
            alias: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "alias"
            },
            projectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "projectid"
            },
            siteKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "sitekey"
            },
            apiKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "apikey"
            },
            minScoreThreshold: {
                type: DataTypes.FLOAT,
                primaryKey: false,
                allowNull: true,
                columnName: "minscorethreshold"
            },
            useCaptchaV3: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "userecaptchav3"
            },
            useEnterpriseCaptcha: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "useenterprisecaptcha"
            }
        }, 
        {
            sequelize,
            tableName: "captcha_config",
            modelName: "captchaConfig",
            timestamps: false
        });
    }
}

export default CaptchaConfigEntity;