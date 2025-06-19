import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql(`
    mutation login($password: String!, $username: String!) {
        login(password: $password, username: $username) {
            errorActionHandler {
                errorCode
                errorMessage
            }
            secondFactorType
            status
            successConfig {
                code
                redirectUri
                responseMode
                state
            }
        }
    }        
`);

export const TENANT_CREATE_MUTATION = gql(`
    mutation createTenant($tenantInput: TenantCreateInput!) {
        createTenant(tenantInput: $tenantInput) {
            tenantId
            tenantName
            tenantDescription
        }
    }     
`);

export const TENANT_UPDATE_MUTATION = gql(`
    mutation updateTenant($tenantInput: TenantUpdateInput!) {
        updateTenant(tenantInput: $tenantInput){
            tenantId
            tenantName
            tenantDescription
        }
   }
`);

export const LOGIN_FAILURE_POLICY_CONFIGURATION_MUTATION = gql(`
    mutation updateLoginFailurePolicy($loginFailurePolicyInput: LoginFailurePolicyInput!) {
        updateLoginFailurePolicy(loginFailurePolicyInput: $loginFailurePolicyInput) {
            tenantId
            loginFailurePolicyType
            loginfailurepolicytypeid
            failureThreshold
            pauseDurationMinutes
            numberOfPauseCyclesBeforeLocking
            initBackoffDurationMinutes
            numberOfBackoffCyclesBeforeLocking
        }
    }
`);

export const PASSWORD_CONFIGURATION_MUTATION = gql(`
    mutation setTenantPasswordConfig($passwordConfigInput: PasswordConfigInput!){
        setTenantPasswordConfig(passwordConfigInput: $passwordConfigInput){
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
        }
    }
`);

export const LEGACY_USER_MIGRATION_CONFIGURATION_MUTATION = gql(`
    mutation setTenantLegacyUserMigrationConfig($tenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput!) {
        setTenantLegacyUserMigrationConfig(tenantLegacyUserMigrationConfigInput: $tenantLegacyUserMigrationConfigInput) {
            tenantId
            authenticationUri
            userProfileUri
            usernameCheckUri
        }
   }
`);

export const TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION = gql(`
    mutation setTenantAnonymousUserConfig($tenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput!) {
        setTenantAnonymousUserConfig(tenantAnonymousUserConfigInput: $tenantAnonymousUserConfigInput) {
            tenantId
            defaultcountrycode
            defaultlangugecode 
            tokenttlseconds
        }
    }
`);

export const TENANT_LOOK_AND_FEEL_MUTATION = gql(`
    mutation setTenantLookAndFeel($tenantLookAndFeelInput: TenantLookAndFeelInput!) {
        setTenantLookAndFeel(tenantLookAndFeelInput: $tenantLookAndFeelInput) {
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

export const TENANT_DOMAIN_MANAGEMENT_REL_ADD_MUTATION = gql(`
    mutation addDomainToTenantManagement($tenantId: String!, $domain: String!) {
        addDomainToTenantManagement(tenantId: $tenantId, domain: $domain) {
            tenantId
            domain
        }
    }
`);

export const TENANT_DOMAIN_MANAGEMENT_REL_REMOVE_MUTATION = gql(`
    mutation removeDomainFromTenantManagement($tenantId: String!, $domain: String!) {
        removeDomainFromTenantManagement(tenantId: $tenantId, domain: $domain) 
    }
`);

export const TENANT_RESTRICTED_DOMAIN_REL_ADD_MUTATION = gql(`
    mutation addDomainToTenantRestrictedAuthentication($tenantId: String!, $domain: String!) {
        addDomainToTenantRestrictedAuthentication(tenantId: $tenantId, domain: $domain) {
            tenantId
            domain
        }
    }
`);

export const TENANT_RESTRICTED_DOMAIN_REL_REMOVE_MUTATION = gql(`
    mutation removeDomainFromTenantRestrictedAuthentication($tenantId: String!, $domain: String!) {
        removeDomainFromTenantRestrictedAuthentication(tenantId: $tenantId, domain: $domain) 
    }
`);

export const ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION = gql(`
    mutation assignFederatedOIDCProviderToTenant($federatedOIDCProviderId: String!, $tenantId: String!) {
        assignFederatedOIDCProviderToTenant(federatedOIDCProviderId: $federatedOIDCProviderId, tenantId: $tenantId) {
            federatedOIDCProviderId
            tenantId
        }
    }
`);

export const REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION = gql(`
    mutation removeFederatedOIDCProviderFromTenant($federatedOIDCProviderId: String!, $tenantId: String!) {
        removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId: $federatedOIDCProviderId, tenantId: $tenantId) {
            federatedOIDCProviderId
            tenantId
        }
    }
`);

export const ADD_CONTACT_MUTATION = gql(`
    mutation addContact($contactCreateInput: ContactCreateInput!) {
        addContact(contactCreateInput: $contactCreateInput){
            contactid
            objectid
            objecttype
            email
            name
            userid
        }
    }
`);

export const REMOVE_CONTACT_MUTATION = gql(`
    mutation removeContact($contactId: String!) {
        removeContact(contactId: $contactId) 
    }
`);

export const CLIENT_CREATE_MUTATION = gql(`
    mutation createClient($clientInput: ClientCreateInput!) {
        createClient(clientInput: $clientInput) {
            clientId
            clientSecret
            clientName
        }
    }
`);

export const CLIENT_UPDATE_MUTATION = gql(`
    mutation updateClient($clientInput: ClientUpdateInput!) {
        updateClient(clientInput: $clientInput){
            clientId
            clientName
            clientDescription
        }
    }
`);

export const ADD_REDIRECT_URI_MUTATION = gql(`
    mutation addRedirectURI($clientId: String!, $uri: String!) {
        addRedirectURI(clientId: $clientId, uri: $uri)
    }
`);

export const REMOVE_REDIRECT_URI_MUTATION = gql(`
    mutation removeRedirectURI($clientId: String!, $uri: String!) {
        removeRedirectURI(clientId: $clientId, uri: $uri)
    }
`);

export const ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION = gql(`
    mutation assignAuthenticationGroupToClient($authenticationGroupId: String!, $clientId: String!) {
        assignAuthenticationGroupToClient(authenticationGroupId: $authenticationGroupId, clientId: $clientId) {
            clientId
            authenticationGroupId
        }
    }
`);

export const REMOVE_AUTHENTICATION_GROUP_FROM_CLIENT_MUTATION = gql(`
    mutation removeAuthenticationGroupFromClient($authenticationGroupId: String!, $clientId: String!) {
        removeAuthenticationGroupFromClient(authenticationGroupId: $authenticationGroupId, clientId: $clientId) 
    }
`);

export const FEDERATED_OIDC_PROVIDER_CREATE_MUTATION = gql(`
    mutation createFederatedOIDCProvider($oidcProviderInput: FederatedOIDCProviderCreateInput!) {
        createFederatedOIDCProvider(oidcProviderInput: $oidcProviderInput) {
            federatedOIDCProviderId
            federatedOIDCProviderName

        }
    }
`);

export const FEDERATED_OIDC_PROVIDER_UPDATE_MUTATION = gql(`
    mutation updateFederatedOIDCProvider($oidcProviderInput: FederatedOIDCProviderUpdateInput!) {
        updateFederatedOIDCProvider(oidcProviderInput: $oidcProviderInput) {
            federatedOIDCProviderId
            federatedOIDCProviderName
        }
    }
`);

export const ASSIGN_FEDERATED_OIDC_PROVIDER_TO_TENANT_MUTATION = gql(`
    mutation assignFederatedOIDCProviderToTenant($federatedOIDCProviderId: String!, $tenantId: String!) {
        assignFederatedOIDCProviderToTenant(federatedOIDCProviderId: $federatedOIDCProviderId, tenantId: $tenantId){
            tenantId
            federatedOIDCProviderId
        }
    }
`);

export const REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION = gql(`
    mutation removeFederatedOIDCProviderFromTenant($federatedOIDCProviderId: String!, $tenantId: String!) {
        removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId: $federatedOIDCProviderId, tenantId: $tenantId){
            tenantId
            federatedOIDCProviderId
        }
    }
`);

export const ASSIGN_DOMAIN_TO_FEDERATED_OIDC_PROVIDER_MUTATION = gql(`
    mutation assignFederatedOIDCProviderToDomain($federatedOIDCProviderId: String!, $domain: String!){
        assignFederatedOIDCProviderToDomain(federatedOIDCProviderId: $federatedOIDCProviderId, domain: $domain){
            federatedOIDCProviderId
            domain
        }
    }
`);

export const REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION = gql(`
    mutation removeFederatedOIDCProviderFromDomain($federatedOIDCProviderId: String!, $domain: String!) {
        removeFederatedOIDCProviderFromDomain(federatedOIDCProviderId: $federatedOIDCProviderId, domain: $domain) {
            federatedOIDCProviderId
            domain
        }
    }
`);

export const SIGNING_KEY_CREATE_MUTATION = gql(`
    mutation createSigningKey($keyInput: SigningKeyCreateInput!) {
        createSigningKey(keyInput: $keyInput) {
            keyId
            tenantId
            keyName
        }
    }
`);

export const SIGNING_KEY_UPDATE_MUTATION = gql(`
    mutation updateSigningKey($keyInput: SigningKeyUpdateInput!) {
        updateSigningKey(keyInput: $keyInput) {
            keyId
            keyName
            keyType
            status
        }
    }
`);

export const AUTHENTICATION_GROUP_CREATE_MUTATION = gql(`
    mutation createAuthenticationGroup($authenticationGroupInput: AuthenticationGroupCreateInput!) {
        createAuthenticationGroup(authenticationGroupInput: $authenticationGroupInput) {
            tenantId
            authenticationGroupId
        }
    }
`);

export const AUTHENTICATION_GROUP_UPDATE_MUTATION = gql(`
    mutation updateAuthenticationGroup($authenticationGroupInput: AuthenticationGroupUpdateInput!) {
        updateAuthenticationGroup(authenticationGroupInput: $authenticationGroupInput) {
            tenantId
            authenticationGroupId
            authenticationGroupName
            authenticationGroupDescription
            defaultGroup
        }
    }
`);

export const AUTHENTICATION_GROUP_USER_ADD_MUTATION = gql(`
    mutation addUserToAuthenticationGroup($authenticationGroupId: String!, $userId: String!) {
        addUserToAuthenticationGroup(authenticationGroupId: $authenticationGroupId, userId: $userId){
            userId
            authenticationGroupId
        }
    }
`);

export const AUTHENTICATION_GROUP_USER_REMOVE_MUTATION = gql(`
    mutation removeUserFromAuthenticationGroup($authenticationGroupId: String!, $userId: String!) {
        removeUserFromAuthenticationGroup(authenticationGroupId: $authenticationGroupId, userId: $userId)
    }
`);

export const AUTHORIZATION_GROUP_CREATE_MUTATION = gql(`
    mutation createAuthorizationGroup($groupInput: AuthorizationGroupCreateInput!) {
        createAuthorizationGroup(groupInput: $groupInput) {
            tenantId
            groupId
            groupName
        }
    }
`);

export const AUTHORIZATION_GROUP_UPDATE_MUTATION = gql(`
    mutation updateAuthorizationGroup($groupInput: AuthorizationGroupUpdateInput!) {
        updateAuthorizationGroup(groupInput: $groupInput) {
            tenantId
            groupId
            groupName
            groupDescription
            default
            allowForAnonymousUsers
        }
    }
`);

export const AUTHORIZATION_GROUP_USER_ADD_MUTATION = gql(`
    mutation addUserToAuthorizationGroup($groupId: String!, $userId: String!) {
        addUserToAuthorizationGroup(groupId: $groupId, userId: $userId){
            userId
            groupId
        }
    }
`);

export const AUTHORIZATION_GROUP_USER_REMOVE_MUTATION = gql(`
    mutation removeUserFromAuthorizationGroup($groupId: String!, $userId: String!) {
        removeUserFromAuthorizationGroup(groupId: $groupId, userId: $userId)
    }
`);

export const USER_UPDATE_MUTATION = gql(`
    mutation updateUser($userInput: UserUpdateInput!) {
        updateUser(userInput: $userInput) {
            userId
            firstName
            lastName
        }
    }
`);

export const USER_TENANT_REL_UPDATE_MUTATION = gql(`
    mutation updateUserTenantRel($tenantId: String!, $userId: String!, $relType: String!) {
        updateUserTenantRel(tenantId: $tenantId, userId: $userId, relType: $relType) {
            userId
            tenantId
            relType
        }
    }
`);

export const USER_TENANT_REL_REMOVE_MUTATION = gql(`
    mutation removeUserFromTenant($tenantId: String!, $userId: String!) {
        removeUserFromTenant(tenantId: $tenantId, userId: $userId)
    }
`);

export const RATE_LIMIT_SERVICE_GROUP_CREATE_MUTATION = gql(`
    mutation createRateLimitServiceGroup($rateLimitServiceGroupInput: RateLimitServiceGroupCreateInput!) {
        createRateLimitServiceGroup(rateLimitServiceGroupInput: $rateLimitServiceGroupInput) {
            servicegroupid
            servicegroupname
            servicegroupdescription
        }
    }
`);

export const RATE_LIMIT_SERVICE_GROUP_UPDATE_MUTATION = gql(`
    mutation updateRateLimitServiceGroup($rateLimitServiceGroupInput: RateLimitServiceGroupUpdateInput!) {
        updateRateLimitServiceGroup(rateLimitServiceGroupInput: $rateLimitServiceGroupInput) {
            servicegroupid
            servicegroupname
            servicegroupdescription
        }
    }    
`);

//  TODO
//  deleteRateLimitServiceGroup(serviceGroupId: String!): String

export const TENANT_RATE_LIMIT_ASSIGN_MUTATION = gql(`
    mutation assignRateLimitToTenant($tenantId: String!, $serviceGroupId: String!, $allowUnlimited: Boolean, $limit: Int, $rateLimitPeriodMinutes: Int) {
        assignRateLimitToTenant(tenantId: $tenantId, serviceGroupId: $serviceGroupId, allowUnlimited: $allowUnlimited, limit: $limit, rateLimitPeriodMinutes: $rateLimitPeriodMinutes) {
            tenantId,
            servicegroupid
        }
    }
`);

export const TENANT_RATE_LIMIT_UPDATE_MUTATION = gql(`
    mutation updateRateLimitForTenant($tenantId: String!, $serviceGroupId: String!, $allowUnlimited: Boolean, $limit: Int, $rateLimitPeriodMinutes: Int) {
        updateRateLimitForTenant(tenantId: $tenantId, serviceGroupId: $serviceGroupId, allowUnlimited: $allowUnlimited, limit: $limit, rateLimitPeriodMinutes: $rateLimitPeriodMinutes) {
            tenantId,
            servicegroupid
        }
    }
`);

export const TENANT_RATE_LIMIT_REMOVE_MUTATION = gql(`
    mutation removeRateLimitFromTenant($tenantId: String!, $serviceGroupId: String!) {
        removeRateLimitFromTenant(tenantId: $tenantId, serviceGroupId: $serviceGroupId)
    }
`);

export const SCOPE_CREATE_MUTATION = gql(`
    mutation createScope($scopeInput: ScopeCreateInput!) {
        createScope(scopeInput: $scopeInput) {
            scopeId
            scopeName
            scopeDescription
            scopeUse
        }
    }
`);

export const SCOPE_UPDATE_MUTATION = gql(`
    mutation updateScope($scopeInput: ScopeUpdateInput!) {
        updateScope(scopeInput: $scopeInput) {
            scopeId
            scopeName
            scopeDescription
            scopeUse
        }
    }
`);

export const SCOPE_DELETE_MUTATION = gql(`
    mutation deleteScope($scopeId: String!) {
        deleteScope(scopeId: $scopeId)
    }
`);

export const TENANT_SCOPE_ASSIGN_MUTATION = gql(`
    mutation assignScopeToTenant($tenantId: String!, $scopeId: String!, $accessRuleId: String) {
        assignScopeToTenant(tenantId: $tenantId, scopeId: $scopeId, accessRuleId: $accessRuleId) {
            tenantId
            scopeId
        }
    }
`);

export const TENANT_SCOPE_REMOVE_MUTATION = gql(`
    mutation removeScopeFromTenant($tenantId: String!, $scopeId: String!){
        removeScopeFromTenant(tenantId: $tenantId, scopeId: $scopeId)
    }
`);

export const MARK_FOR_DELETE_MUTATION = gql(`
    mutation markForDelete($markForDeleteInput: MarkForDeleteInput!) {
        markForDelete(markForDeleteInput: $markForDeleteInput) {
            markForDeleteId
            objectType
            objectId
            submittedBy
            submittedDate
            completedData
        }
    }  
`);

export const CLIENT_SCOPE_ASSIGN_MUTATION = gql(`
    mutation assignScopeToClient($clientId: String!, $tenantId: String!, $scopeId: String!){
        assignScopeToClient(clientId: $clientId, tenantId: $tenantId, scopeId: $scopeId){
            tenantId
            clientId
            scopeId            
        }
    }
`);

export const CLIENT_SCOPE_REMOVE_MUTATION = gql(`
    mutation removeScopeFromClient($clientId: String!, $tenantId: String!, $scopeId: String!){
        removeScopeFromClient(clientId: $clientId, tenantId: $tenantId, scopeId: $scopeId)
    }
`);

export const USER_SCOPE_ASSIGN_MUTATION = gql(`
    mutation assignScopeToUser($userId: String!, $tenantId: String!, $scopeId: String!){
        assignScopeToUser(userId: $userId, tenantId: $tenantId, scopeId: $scopeId){
            tenantId
            userId
            scopeId            
        }
    }    
`);

export const USER_SCOPE_REMOVE_MUTATION = gql(`
    mutation removeScopeFromUser($userId: String!, $tenantId: String!, $scopeId: String!){
        removeScopeFromUser(userId: $userId, tenantId: $tenantId, scopeId: $scopeId)
    }
`);

export const AUTHORIZATION_GROUP_SCOPE_ASSIGN_MUTATION = gql(`
    mutation assignScopeToAuthorizationGroup($groupId: String!, $tenantId: String!, $scopeId: String!){
        assignScopeToAuthorizationGroup(groupId: $groupId, tenantId: $tenantId, scopeId: $scopeId){
            tenantId
            groupId
            scopeId            
        }
    }  
`);

export const AUTHORIZATION_GROUP_SCOPE_REMOVE_MUTATION = gql(`
    mutation removeScopeFromAuthorizationGroup($groupId: String!, $tenantId: String!, $scopeId: String!){
        removeScopeFromAuthorizationGroup(groupId: $groupId, tenantId: $tenantId, scopeId: $scopeId)
    }
`);

export const GENERATE_TOTP_MUTATION = gql(`
    mutation generateTOTP($userId: String!) {
        generateTOTP(userId: $userId) {
            uri
            userMFARel {
                userId
                mfaType
                primaryMfa
                totpSecret
                totpHashAlgorithm
                fido2PublicKey
                fido2CredentialId
                fido2PublicKeyAlgorithm
                fido2Transports
                fido2KeySupportsCounters
            }
        }
    }
`);

export const TOPT_DELETION_MUTATION = gql(`
    mutation deleteTOTP($userId: String!) {
        deleteTOTP(userId: $userId)
    }
`);

export const FIDO_KEY_DELETION_MUTATION = gql(`
    mutation deleteFIDOKey($userId: String!) {
        deleteFIDOKey(userId: $userId)
    }
`);

export const USER_SESSION_DELETE_MUTATION =gql(`
    mutation deleteUserSession($userId: String!, $clientId: String!, $tenantId: String!) {
        deleteUserSession(userId: $userId, clientId: $clientId, tenantId: $tenantId)
    }
`);

export const CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION = gql(`
    mutation createFido2RegistrationChallenge($userId: String!) {
        createFido2RegistrationChallenge(userId: $userId) {
            fido2Challenge {
                userId
                challenge
                issuedAtMs
                expiresAtMs
            }
            userName
            email
            rpName
            rpId
        }
    }
`);

export const CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION = gql(`
    mutation createFido2AuthenticationChallenge($userId: String!) {
        createFido2AuthenticationChallenge(userId: $userId) {
            fido2Challenge {
                userId
                challenge
                issuedAtMs
                expiresAtMs
            }
            rpId
            fido2AuthenticationChallengePasskeys {
                id
                transports
            }            
        }
    }
`);


export const USER_AUTHENTICATION_STATE_RESPONSE_FRAGMENT = gql(`
    fragment UserAuthenticationStateResponseFragment on UserAuthenticationStateResponse {
        userAuthenticationState {
            userId
            authenticationSessionToken
            tenantId
            authenticationState
            authenticationStateOrder
            authenticationStateStatus
            preAuthToken
            expiresAtMs
        }
        authenticationError {
            errorCode
            errorMessage  
        }
        availableTenants {
            tenantId
            tenantName
        }
        uri
        totpSecret
        accessToken
    }
`);


// Start here for refactoring authentication and registration flows
// Authentication flows
/*
    logout(userId: String): String
    authenticateUserNameInput(username: String!, tenantId: String, preAuthToken: String): UserAuthenticationStateResponse!
    authenticateUser(username: String!, password: String!, tenantId: String!, authenticationSessionToken: String!, preAuthToken: String): UserAuthenticationStateResponse!
    authenticateConfigureTOTP(userId: String!, authenticationSessionToken: String!, preAuthToken: String): UserAuthenticationStateResponse!
    authenticateValidateTOTP(userId: String!, totpTokenValue: String!, authenticationSessionToken: String!, preAuthToken: String): UserAuthenticationStateResponse!
    authenticateRegisterSecurityKey(userId: String!, fido2KeyRegistrationInput: Fido2KeyRegistrationInput!, authenticationSessionToken: String!, preAuthToken: String): UserAuthenticationStateResponse!
    authenticateValidateSecurityKey(userId: String!, fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput!, authenticationSessionToken: String!, preAuthToken: String): UserAuthenticationStateResponse!
*/
export const AUTHENTICATE_USERNAME_INPUT_MUTATION = gql`    
    mutation authenticateHandleUserNameInput($username: String!, $tenantId: String, $preAuthToken: String) {
        authenticateHandleUserNameInput(username: $username, tenantId: $tenantId, preAuthToken: $preAuthToken) {
            ...UserAuthenticationStateResponseFragment
        } 
    }

    ${USER_AUTHENTICATION_STATE_RESPONSE_FRAGMENT}
`;


export const REGISTER_FIDO2_KEY_MUTATION = gql(`
    mutation registerFIDO2Key($userId: String!, $fido2KeyRegistrationInput: Fido2KeyRegistrationInput!){
        registerFIDO2Key(userId: $userId, fido2KeyRegistrationInput: $fido2KeyRegistrationInput) {
            userId
            mfaType
            primaryMfa
            totpSecret
            totpHashAlgorithm
            fido2PublicKey
            fido2CredentialId
            fido2PublicKeyAlgorithm
            fido2Transports
            fido2KeySupportsCounters
        }
    }
`);

export const AUTHENTICATE_FIDO2_KEY_MUATATION = gql(`
    mutation authenticateFIDO2Key($userId: String!, $fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput!) {
        authenticateFIDO2Key(userId: $userId, fido2KeyAuthenticationInput: $fido2KeyAuthenticationInput)
    }
`);




// Registration flows
/*
    registerVerifyEmailAddress(userId: String!, token: String!, registrationSessionToken: String!, preAuthToken: String): UserRegistrationStateResponse!
    registerConfigureTOTP(userId: String!, registrationSessionToken: String!, preAuthToken: String): UserRegistrationStateResponse!
    registerSkipConfigureTOTP(userId: String, registrationSessionToken: String, preAuthToken: String): UserRegistrationStateResponse!
    registerValidateTOTP(userId: String, registrationSessionToken: String, totpTokenValue: String, preAuthToken: String): UserRegistrationStateResponse!
    registerConfigureSecurityKey(userId: String!, registrationSessionToken: String, fido2KeyRegistrationInput: Fido2KeyRegistrationInput!, preAuthToken: String): UserRegistrationStateResponse!
    registerSkipConfigureSecurityKey(userId: String!, registrationSessionToken: String!, preAuthToken: String): UserRegistrationStateResponse!
    registerValidateSecurityKey(userId: String!, registrationSessionToken: String!, fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput!, preAuthToken: String): UserRegistrationStateResponse!
    finishRegistration(userId: String!, registrationSessionToken: String!, preAuthToken: String): UserRegistrationStateResponse!
*/

export const USER_REGISTRATION_STATE_RESPONSE_FRAGMENT = gql(`
    fragment UserRegistrationStateResponseFragment on UserRegistrationStateResponse {
        userRegistrationState {
            userId
            email
            registrationSessionToken
            tenantId
            registrationState
            registrationStateOrder
            registrationStateStatus
            preAuthToken
            expiresAtMs
        }
        registrationError {
            errorCode
            errorMessage            
        }
        uri
        totpSecret
        accessToken
    }
`);

export const REGISTER_USER_MUTATION = gql`
    mutation registerUser($tenantId: String!, $userInput: UserCreateInput!, $preAuthToken: String) {
        registerUser(tenantId: $tenantId, userInput: $userInput, preAuthToken: $preAuthToken) {
            ...UserRegistrationStateResponseFragment
        }
    }

    ${USER_REGISTRATION_STATE_RESPONSE_FRAGMENT}
`;

export const VERIFY_REGISTRATION_TOKEN_MUTATION = gql`
    mutation registerVerifyEmailAddress($userId: String!, $token: String!, $registrationSessionToken: String!, $preAuthToken: String) {
        registerVerifyEmailAddress(userId: $userId, token: $token, registrationSessionToken: $registrationSessionToken, preAuthToken: $preAuthToken) {
            ...UserRegistrationStateResponseFragment
        }
    }

    ${USER_REGISTRATION_STATE_RESPONSE_FRAGMENT}
`;



export const GENERATE_AUTHORIZATION_RETURN_URI_MUTATION = gql(`
    mutation generateAuthorizationReturnUri($preAuthToken: String!) {
        generateAuthorizationReturnUri(preAuthToken: $preAuthToken) {
            uri
            code
            state
        }
    }
`);