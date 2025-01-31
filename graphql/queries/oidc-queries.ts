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

export const CLIENT_DETAIL_QUERY = gql(`
    query clientDetailQuery($clientId: String!){
        getClientById(clientId: $clientId){
            tenantId
            clientId
            clientSecret
            clientName
            clientDescription
            enabled
            redirectUris
            oidcEnabled
            pkceEnabled
            clientType
            clienttypeid
            userTokenTTLSeconds
            clientTokenTTLSeconds
            maxRefreshTokenCount
        }
    }
`);

export const AUTHORIZATION_GROUP_DETAIL_QUERY = gql(`
    query getAuthorizationGroupById($groupId: String!) {
        getAuthorizationGroupById(groupId: $groupId) {
            groupId
            groupName
            default
        }
    }
`);


export const USER_SEARCH_QUERY = gql(`
    query search($searchInput: SearchInput!){
        search(searchInput: $searchInput) {
            startTime
            endTime
            took
            page
            perPage
            total
            resultList {
                objectId
                objectType
                name
                description
                enabled
            }
        }
    }
`);

export const USER_DETAIL_QUERY = gql(`
    query getUserById($userId: String!) {
        getUserById(userId: $userId) {
            userId
            federatedOIDCProviderSubjectId
            email
            emailVerified
            domain
            firstName
            lastName
            middleName
            phoneNumber
            address
            countryCode
            preferredLanguageCode
            twoFactorAuthType
            locked
            enabled
            nameOrder
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