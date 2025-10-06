import { EntitySchema } from 'typeorm';

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
            type: "boolean",
            primary: false,
            nullable: false
        },
        allowUnlimitedRate: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowunlimitedrate"
        },
        allowUserSelfRegistration: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowuserselfregistration"
        },
        allowAnonymousUsers: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowanonymoususers"
        },
        allowSocialLogin: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowsociallogin"
        },
        verifyEmailOnSelfRegistration: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "verifyemailonselfregistration"
        },
        federatedAuthenticationConstraint: {
            type: String,
            primary: false,
            nullable: false,
            name: "federatedauthenticationconstraint"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        },
        tenantType: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenanttype"
        },
        migrateLegacyUsers: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "migratelegacyusers"
        },
        allowLoginByPhoneNumber: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowloginbyphonenumber"
        },
        allowForgotPassword: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowforgotpassword"
        },
        defaultRateLimit: {
            type: "int",
            primary: false,
            nullable: true,
            name: "defaultratelimit"
        },
        defaultRateLimitPeriodMinutes: {
            type: "int",
            primary: false,
            nullable: true,
            name: "defaultratelimitperiodminutes"
        },
        registrationRequireCaptcha: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "registrationrequirecaptcha"
        },
        registrationRequireTermsAndConditions: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "registrationrequiretermsandconditions"
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

