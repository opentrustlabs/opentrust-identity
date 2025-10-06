import { EntitySchema } from 'typeorm';

const CaptchaConfigEntity = new EntitySchema({

    columns: {
        alias: {
            type: String,
            primary: true,
            name: "alias"
        },
        projectId: {
            type: String,
            primary: false,
            nullable: true,
            name: "projectid"
        },
        siteKey: {
            type: String,
            primary: false,
            nullable: false,
            name: "sitekey"
        },
        apiKey: {
            type: String,
            primary: false,
            nullable: false,
            name: "apikey"
        },
        minScoreThreshold: {
            type: "float",
            primary: false,
            nullable: true,
            name: "minscorethreshold"
        },
        useCaptchaV3: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "userecaptchav3"
        },
        useEnterpriseCaptcha: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "useenterprisecaptcha"
        }
    },

    tableName: "captcha_config",
    name: "captchaConfig",

});


export default CaptchaConfigEntity;
