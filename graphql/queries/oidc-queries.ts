import { gql } from "@apollo/client";

export const TENANTS_QUERY = gql(`
    query getTenants {
        getTenants {
            tenantId
            tenantName
            tenantDescription
            tenantType
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

export const CLIENTS_QUERY = gql(`
    query getClients ($tenantId: String) {
        getClients (tenantId: $tenantId){
            tenantId
            clientId            
            clientName
            clientDescription
            enabled            
            clientType
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

export const ME_QUERY = gql(`
    query me {
        me {
            address
            countryCode
            domain
            email
            emailVerified
            enabled
            federatedOIDCProviderSubjectId
            firstName
            lastName
            locked
            managementAccessTenantId
            middleName
            nameOrder
            phoneNumber
            preferredLanguageCode
            scope {
                scopeDescription
                scopeId
                scopeName
            }
            tenantId
            tenantName
            twoFactorAuthType
            userId
        }
    }
`);

export const AUTHORIZATION_GROUPS_QUERY = gql(`
    query getAuthorizationGroups {
        getAuthorizationGroups {
            tenantId
            groupId
            groupName
            default
        }
    }    
`);

export const TENANT_DETAIL_QUERY = gql(`
    query tenantDetailQuery($tenantId: String!){
        getTenantById(tenantId: $tenantId) {
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
`);
/*
getLoginFailurePolicy {        
            loginFailurePolicyType
            loginfailurepolicytypeid
            failureThreshold
            pauseDurationMinutes
            numberOfPauseCyclesBeforeLocking
            initBackoffDurationMinutes
            numberOfBackoffCyclesBeforeLocking
        }
*/