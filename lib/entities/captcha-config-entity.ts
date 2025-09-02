import { Model, DataTypes, Sequelize } from 'sequelize';

class CaptchaConfigEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof CaptchaConfigEntity {
        return CaptchaConfigEntity.init({
            alias: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "alias"
            },
            projectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "projectid"
            },
            siteKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "sitekey"
            },
            apiKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "apikey"
            },
            minScoreThreshold: {
                type: DataTypes.FLOAT,
                primaryKey: false,
                allowNull: true,
                field: "minscorethreshold"
            },
            useCaptchaV3: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "userecaptchav3"
            },
            useEnterpriseCaptcha: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "useenterprisecaptcha"
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