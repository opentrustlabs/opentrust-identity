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