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

export const CREATE_CLIENT_MUTATION = gql(`
    mutation createClient($clientInput: ClientCreateInput!) {
        createClient(clientInput: $clientInput) {
            clientId
            clientSecret
            clientName
        }
    }
`);

export const UPDATE_CLIENT_MUTATION = gql(`
    mutation updateClient($clientInput: ClientUpdateInput!) {
        updateClient(clientInput: $clientInput){
            clientId
            clientName
            clientDescription
        }
    }
`);