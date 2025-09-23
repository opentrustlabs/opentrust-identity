import cassandra from "cassandra-driver";


export const TENANT_MODEL_NAME = "tenant";
export const TENANT_MODEL_OPTIONS: {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant": {
        tables: ["tenant"],
        columns: {
            "tenantid": "tenantId",
            "tenantname": "tenantName",
            "tenantdescription": "tenantDescription",
            "enabled": "enabled",
            "allowunlimitedrate": "allowUnlimitedRate",
            "allowuserselfregistration": "allowUserSelfRegistration",
            "allowsociallogin": "allowSocialLogin",
            "allowanonymoususers": "allowAnonymousUsers",
            "verifyemailonselfregistration": "verifyEmailOnSelfRegistration",
            "federatedauthenticationconstraint": "federatedAuthenticationConstraint",
            "markfordelete": "markForDelete",
            "tenanttype": "tenantType",
            "migratelegacyusers": "migrateLegacyUsers",
            "allowloginbyphonenumber": "allowLoginByPhoneNumber",
            "allowforgotpassword": "allowForgotPassword",
            "defaultratelimit": "defaultRateLimit",
            "defaultratelimitperiodminutes": "defaultRateLimitPeriodMinutes",
            "registrationrequiretermsandconditions": "registrationRequireTermsAndConditions",
            "termsandconditionsuri": "termsAndConditionsUri",
            "registrationrequirecaptcha": "registrationRequireCaptcha"
        }
    }
}

