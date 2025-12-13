import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "userecaptchav3",
            transformer: BooleanTransformer
        },
        useEnterpriseCaptcha: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "useenterprisecaptcha",
            transformer: BooleanTransformer
        }
    },

    tableName: "captcha_config",
    name: "captchaConfig",

});


export default CaptchaConfigEntity;
