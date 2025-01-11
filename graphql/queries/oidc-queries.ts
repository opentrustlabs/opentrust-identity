import { gql } from "@apollo/client";

export const TENANTS_QUERY = gql(`
    query getTenants {
        getTenants {
            tenantId
            tenantName
            tenantDescription
            enabled
            claimsSupported
            allowUnlimitedRate
            allowUserSelfRegistration
            allowSocialLogin
            allowAnonymousUsers
            verifyEmailOnSelfRegistration
            federatedAuthenticationConstraint
        }
    }    
`);

export const TENANT_META_DATA_QUERY = gql(`
    query getTenantMetaData($tenantId: String!) {
        getTenantMetaData(tenantId: $tenantId) {
            tenantLookAndFeel {
                tenantid
                adminheaderbackgroundcolor
                adminheadertextcolor
                adminlogo
                adminheadertext
                authenticationheaderbackgroundcolor
                authenticationheadertextcolor
                authenticationlogo
                authenticationheadertext
            }
            tenant {
                tenantId
                tenantName
                tenantDescription
                enabled
                claimsSupported
                allowUnlimitedRate
                allowUserSelfRegistration
                allowSocialLogin
                allowAnonymousUsers
                verifyEmailOnSelfRegistration
                federatedAuthenticationConstraint
                federatedauthenticationconstraintid
                markForDelete
                tenantType
                tenanttypeid
                migrateLegacyUsers
                allowLoginByPhoneNumber
                allowForgotPassword            
            }
        }
    }
`);
