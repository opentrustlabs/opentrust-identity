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
            allowMfa
            mfaTypesAllowed
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