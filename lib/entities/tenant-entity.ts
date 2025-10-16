import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export const TenantEntity = new EntitySchema({
    tableName: "tenant",
    name: "tenant",

    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        tenantName: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantname"
        },
        tenantDescription: {
            type: String,
            primary: false,
            nullable: true,
            name: "tenantdescription"
        },
        enabled: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            transformer: BooleanTransformer
        },
        allowUnlimitedRate: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowunlimitedrate",
            transformer: BooleanTransformer
        },
        allowUserSelfRegistration: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowuserselfregistration",
            transformer: BooleanTransformer
        },
        allowAnonymousUsers: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowanonymoususers",
            transformer: BooleanTransformer
        },
        allowSocialLogin: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowsociallogin"
        },
        verifyEmailOnSelfRegistration: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "verifyemailonselfregistration",
            transformer: BooleanTransformer
        },
        federatedAuthenticationConstraint: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedauthenticationconstraint"
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        },
        tenantType: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenanttype"
        },
        migrateLegacyUsers: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "migratelegacyusers",
            transformer: BooleanTransformer
        },
        allowLoginByPhoneNumber: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowloginbyphonenumber",
            transformer: BooleanTransformer
        },
        allowForgotPassword: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowforgotpassword",
            transformer: BooleanTransformer
        },
        defaultRateLimit: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "defaultratelimit"
        },
        defaultRateLimitPeriodMinutes: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "defaultratelimitperiodminutes"
        },
        registrationRequireCaptcha: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "registrationrequirecaptcha",
            transformer: BooleanTransformer
        },
        registrationRequireTermsAndConditions: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "registrationrequiretermsandconditions",
            transformer: BooleanTransformer
        },
        termsAndConditionsUri: {
            type: String,
            primary: false,
            nullable: true,
            name: "termsandconditionsuri"
        }
    },


});

export default TenantEntity;

