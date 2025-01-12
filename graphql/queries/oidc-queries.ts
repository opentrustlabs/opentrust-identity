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

export const LOGIN_USERNAME_HANDLER_QUERY = gql(`
    query getLoginUserNameHandler($username: String!, $tenantId: String, $preauthToken: String) {
        getLoginUserNameHandler (username: $username, tenantId: $tenantId, preauthToken: $preauthToken) {
            action
            oidcRedirectActionHandlerConfig {
                redirectUri
                state
                clientId
                codeChallenge
                codeChallengeMethod
                scope
                responseType
                responseMode
            }
            errorActionHandler {
                errorCode
                errorMessage
            }
        }
    }
`);
