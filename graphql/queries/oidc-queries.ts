import { gql } from "@apollo/client";

export const TENANTS_QUERY = gql(`
    query getTenants($tenantIds: [String!], $federatedOIDCProviderId: String, $scopeId: String) {
        getTenants(tenantIds: $tenantIds, federatedOIDCProviderId: $federatedOIDCProviderId, scopeId: $scopeId) {
            tenantId
            tenantName
            tenantDescription
            enabled
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
            defaultRateLimit
            defaultRateLimitPeriodMinutes            
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
            userId
        }
    }
`);

export const AUTHORIZATION_GROUPS_QUERY = gql(`
    query getAuthorizationGroups($tenantId: String) {
        getAuthorizationGroups(tenantId: $tenantId) {
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
            defaultRateLimit
            defaultRateLimitPeriodMinutes   
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
            oidcEnabled
            pkceEnabled
            clientType
            clienttypeid
            userTokenTTLSeconds
            clientTokenTTLSeconds
            maxRefreshTokenCount
            markForDelete
        }
    }
`);

export const AUTHORIZATION_GROUP_DETAIL_QUERY = gql(`
    query getAuthorizationGroupById($groupId: String!) {
        getAuthorizationGroupById(groupId: $groupId) {
            groupId
            groupName
            groupDescription
            tenantId
            allowForAnonymousUsers
            default
            markForDelete
        }
    }
`);


export const SEARCH_QUERY = gql(`
    query search($searchInput: SearchInput!){
        search(searchInput: $searchInput) {
            starttime
            endtime
            took
            page
            perpage
            total
            resultlist {
                description
                email
                enabled
                name
                objectid
                objecttype
                owningclientid
                owningtenantid
                subtype
                subtypekey
            }
        }
    }
`);

export const REL_SEARCH_QUERY = gql(`
    query relSearch($relSearchInput: RelSearchInput!) {
        relSearch(relSearchInput: $relSearchInput) {
            starttime
            endtime
            took
            page
            perpage
            total
            resultlist {
                owningtenantid
                parentid
                parenttype
                childid
                childtype
                childname
                childdescription
            }            
        }
    }
`);

export const LOOKAHEAD_SEARCH_QUERY = gql(`
    query lookahead($term: String!) {
        lookahead(term: $term) {
            category
            resultList {
                displayValue
                id
            }
        }
    }    
`);

export const TENANT_RATE_LIMIT_REL_VIEW_QUERY = gql(`
    query getRateLimitTenantRelViews($rateLimitServiceGroupId: String, $tenantId: String) {
        getRateLimitTenantRelViews(rateLimitServiceGroupId: $rateLimitServiceGroupId, tenantId: $tenantId) {
            tenantId
            tenantName
            servicegroupid
            servicegroupname
            allowUnlimitedRate
            rateLimit
            rateLimitPeriodMinutes           
        }
    }    
`);

// getRateLimitTenantRels(tenantId: String, rateLimitServiceGroupId: String)
export const TENANT_RATE_LIMIT_REL_QUERY = gql(`
    query getRateLimitTenantRels($tenantId: String, $rateLimitServiceGroupId: String) {
        getRateLimitTenantRels(tenantId: $tenantId, rateLimitServiceGroupId: $rateLimitServiceGroupId) {
            tenantId
            servicegroupid
            allowUnlimitedRate
            rateLimit
            rateLimitPeriodMinutes           
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
            addressLine1
            city
            stateRegionProvince
            postalCode
            countryCode
            preferredLanguageCode
            locked
            enabled
            nameOrder
            markForDelete
        }
    }    
`);

export const AUTHENTICATION_GROUPS_QUERY = gql(`
    query getAuthenticationGroups($tenantId: String, $clientId: String, $userId: String) {
        getAuthenticationGroups(tenantId: $tenantId, clientId: $clientId, userId: $userId) {
            tenantId
            authenticationGroupId
            authenticationGroupName
            authenticationGroupDescription
            defaultGroup
        }
    }
`);

export const AUTHENTICATION_GROUP_DETAIL_QUERY = gql(`
    query getAuthenticationGroupById($authenticationGroupId: String!) {
        getAuthenticationGroupById(authenticationGroupId: $authenticationGroupId) {
            tenantId
            authenticationGroupId
            authenticationGroupName
            authenticationGroupDescription
            defaultGroup
            markForDelete
        }
    }
`);


export const FEDERATED_OIDC_PROVIDERS_QUERY = gql(`
    query getFederatedOIDCProviders($tenantId: String){
        getFederatedOIDCProviders(tenantId: $tenantId) {
            federatedOIDCProviderId
            federatedOIDCProviderName
            federatedOIDCProviderDescription
            federatedOIDCProviderType
            socialLoginProvider
        }
    }
`)

export const FEDERATED_OIDC_PROVIDER_DETAIL_QUERY = gql(`
    query getFederatedOIDCProviderById($federatedOIDCProviderId: String!) {
        getFederatedOIDCProviderById(federatedOIDCProviderId: $federatedOIDCProviderId) {
            federatedOIDCProviderId
            federatedOIDCProviderName
            federatedOIDCProviderDescription
            federatedOIDCProviderType
            federatedOIDCProviderClientId
            federatedOIDCProviderClientSecret
            federatedOIDCProviderWellKnownUri
            refreshTokenAllowed
            scopes
            usePkce
            clientAuthType
            clientauthtypeid
            federatedOIDCProviderTenantId	
            federatedoidcprovidertypeid
            socialLoginProvider
            markForDelete
        }
    }
`);

export const SIGNING_KEYS_QUERY = gql(`
    query getSigningKeys($tenantId: String) {
        getSigningKeys(tenantId: $tenantId) {
            keyId
            tenantId
            keyType
            keyName
            keyUse
            expiresAtMs
            status
        }
    }
`);


export const SIGNING_KEY_DETAIL_QUERY = gql(`
    query getSigningKeyById($signingKeyId: String!){
        getSigningKeyById(signingKeyId: $signingKeyId){
            keyId
            tenantId
            keyType
            keyName
            keyTypeId
            keyUse
            privateKeyPkcs8
            password
            certificate
            publicKey
            expiresAtMs
            status
            statusId
            markForDelete
        }
    }
`);

export const SCOPE_QUERY = gql(`
    query getScope($tenantId: String!, $filterBy: ScopeFilterCriteria!) {
        getScope(tenantId: $tenantId, filterBy: $filterBy){
            scopeId
            scopeName
            scopeDescription
            scopeUse        
        }
    }
`);

export const SCOPE_DETAIL_QUERY = gql(`
    query getScopeById($scopeId: String!){
        getScopeById(scopeId: $scopeId) {
            scopeId
            scopeName
            scopeDescription
            scopeUse  
        }
    }
`);

export const RATE_LIMITS_QUERY = gql(`
    query getRateLimitServiceGroups($tenantId: String){
        getRateLimitServiceGroups(tenantId: $tenantId){
            servicegroupid
            servicegroupname
            servicegroupdescription
        }
    }
`);

export const RATE_LIMIT_BY_ID_QUERY = gql(`
    query getRateLimitServiceGroupById($serviceGroupId: String!) {
        getRateLimitServiceGroupById(serviceGroupId: $serviceGroupId) {
            servicegroupid
            servicegroupname
            servicegroupdescription
            markForDelete
        }
    }
`);

export const LOGIN_FAILURE_CONFIGURATION_QUERY = gql(`
    query getTenantLoginFailurePolicy($tenantId: String!){
        getTenantLoginFailurePolicy(tenantId: $tenantId) {
            tenantId
            loginFailurePolicyType
            failureThreshold
            pauseDurationMinutes
            maximumLoginFailures
        }
    }
`);

export const TENANT_PASSWORD_CONFIG_QUERY = gql(`
    query getTenantPasswordConfig($tenantId: String!) {
        getTenantPasswordConfig(tenantId: $tenantId) {
            tenantId
            passwordMinLength
            passwordMaxLength
            passwordHashingAlgorithm
            requireUpperCase
            requireLowerCase
            requireNumbers
            requireSpecialCharacters
            specialCharactersAllowed
            requireMfa
            mfaTypesRequired
            maxRepeatingCharacterLength
            passwordRotationPeriodDays
            passwordHistoryPeriod
        }
    }
`);

export const LEGACY_USER_MIGRATION_CONFIGURATION_QUERY = gql(`
    query getLegacyUserMigrationConfiguration($tenantId: String!) {
        getLegacyUserMigrationConfiguration(tenantId: $tenantId) {
            tenantId
            authenticationUri
            userProfileUri
            usernameCheckUri
        }
    }
`);

export const TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY = gql(`
    query getAnonymousUserConfiguration($tenantId: String!){
        getAnonymousUserConfiguration(tenantId: $tenantId){
            tenantId 
            defaultcountrycode
            defaultlangugecode
            tokenttlseconds
        }
    }
`);

export const TENANT_LOOK_AND_FEEL_QUERY = gql(`
    query getTenantLookAndFeel($tenantId: String!) {
        getTenantLookAndFeel(tenantId: $tenantId) {
            tenantid
            adminheaderbackgroundcolor
            adminheadertextcolor
            adminlogo
            adminheadertext
            authenticationheaderbackgroundcolor
            authenticationheadertextcolor
            authenticationlogo
            authenticationlogomimetype
            authenticationheadertext                      
        }
    }
`);

export const TENANT_DOMAIN_MANAGEMENT_REL_QUERY = gql(`
    query getDomainsForTenantManagement($tenantId: String!) {
        getDomainsForTenantManagement(tenantId: $tenantId) {
            tenantId
            domain
        }
    }
`);

export const TENANT_AUTHENTICATION_DOMAIN_REL_QUERY = gql(`
    query getDomainsForTenantAuthentication($tenantId: String!) {
        getDomainsForTenantAuthentication(tenantId: $tenantId) {
            tenantId
            domain
        }
    }
`);

export const CONTACTS_QUERY = gql(`
    query getContacts($objectId: String!){
        getContacts(objectId: $objectId) {
            contactid
            objectid
            objecttype
            email
            name
            userid
        }
    }
`);

export const REDIRECT_URIS_QUERY = gql(`
    query getRedirectURIs($clientId: String!){
        getRedirectURIs(clientId: $clientId)
    }
`);

export const FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY = gql(`
    query getFederatedOIDCProviderDomainRels($federatedOIDCProviderId: String, $domain: String) {
        getFederatedOIDCProviderDomainRels(federatedOIDCProviderId: $federatedOIDCProviderId, domain: $domain){
            federatedOIDCProviderId
            domain
        }
    }
`);

export const USER_TENANT_RELS_QUERY = gql(`
    query getUserTenantRels($userId: String!) {
        getUserTenantRels(userId: $userId) {
            userId
            tenantId
            tenantName
            relType
        }
    }
`);

export const USER_AUTHORIZATION_GROUP_QUERY = gql(`
    query getUserAuthorizationGroups($userId: String!) {
        getUserAuthorizationGroups(userId: $userId){
            tenantId
            groupId
            groupName
            groupDescription
            default
            allowForAnonymousUsers
        }
    }
`);

export const GET_SECRET_VALUE_QUERY = gql(`
    query getSecretValue($objectId: String!, $objectType: SecretObjectType!){
        getSecretValue(objectId: $objectId, objectType: $objectType)
    }
`);

export const VALIDATE_TOTP_TOKEN_QUERY = gql(`
    query validateTOTP($userId: String!, $totpValue: String!) {
        validateTOTP(userId: $userId, totpValue: $totpValue)
    }
`);

export const GET_CLIENT_SCOPE_QUERY = gql(`
    query getClientScopes($clientId: String!) {
        getClientScopes(clientId: $clientId) {
            scopeId
            scopeName
            scopeDescription
            scopeUse          
        }
    }    
`);

export const GET_AUTHORIZATION_GROUP_SCOPE_QUERY = gql(`
    query getAuthorizationGroupScopes($groupId: String!) {
        getAuthorizationGroupScopes(groupId: $groupId) {
            scopeId
            scopeName
            scopeDescription
            scopeUse          
        }
    }     
`);

export const GET_USER_SCOPE_QUERY = gql(`
    query getUserScopes($userId: String!, $tenantId: String!) {
        getUserScopes(userId: $userId, tenantId: $tenantId) {
            scopeId
            scopeName
            scopeDescription
            scopeUse          
        }
    }     
`);

export const USER_MFA_REL_QUERY = gql(`
    query getUserMFARels($userId: String!) {
        getUserMFARels(userId: $userId) {
            userId
            mfaType
            primaryMfa
        }
    }
`);

export const USER_SESSIONS_QUERY = gql(`
    query getUserSessions($userId: String!) {
        getUserSessions(userId: $userId) {
            tenantId
            clientId
            userId
            tenantName
            clientName
        }
    }
`);

export const STATE_PROVINCE_REGIONS_QUERY = gql(`
    query getStateProvinceRegions($countryCode: String!) {
        getStateProvinceRegions(countryCode: $countryCode) {
            isoCountryCode
            isoEntryCode
            isoEntryName
            isoSubsetType
        }
    }   
`);