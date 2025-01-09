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
