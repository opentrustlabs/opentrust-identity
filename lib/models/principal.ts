

export interface ProfileScope {
    scopeName: string,
    scopeId: string,
    scopeDescription: string
};

export interface ProfileAuthorizationGroup {
    groupId: string,
    groupName: string
}

/**
 * MyUserProfile is the profile used external for clients who are calling
 * the /user/me endpoint. It contains most of the standard JWT claims set
 * (in camel-case properties) plus scope and authorization groups if requested
 * via http query parameters.
 */
export interface MyUserProfile {
    userId: string,
    federatedOIDCProviderSubjectId: string | null,
    email: string,
    emailVerified: boolean,
    domain: string,
    firstName: string,
    lastName: string,
    middleName: string | null,
    phoneNumber: string | null,
    address: string | null,
    addressLine1: string | null,
    city: string | null,
    postalCode: string | null,
    stateRegionProvince: string | null,
    countryCode: string,
    preferredLanguageCode: string,
    locked: boolean,
    enabled: boolean,
    nameOrder: string,
    scope: Array<ProfileScope>,
    tenantId: string,
    tenantName: string,
    clientId: string,
    clientName: string,
    expiresAtMs: number,
    authorizationGroups: Array<ProfileAuthorizationGroup>,
    principalType: string
};


/**
 * JWTPrincipal is the object that is used to sign JWTs and the object which is
 * returned for the OIDC user infor endpoint. It contains the basic
 * JWT claims set plus some additional information about the tenant and c.ient.
 */
export interface JWTPrincipal {
    sub: string,
    iss: string,
    aud: string,
    iat: number,
    exp: number,
    at_hash: string,
    name: string,
    given_name: string,
    family_name: string,
    middle_name: string,
    nickname: string,
    preferred_username: string,
    profile: string,
    phone_number: string,
    address: OIDCUserInfoAddress | null,
    updated_at: string,
    email: string,
    email_verified: boolean,
    country_code: string,
    language_code: string,
    jwt_id: string,
    tenant_id: string,
    tenant_name: string,
    client_id: string,
    client_name: string,
    client_type: string
    principal_type: string
}

/**
 * For deployments which have an legacy or existing IAM or other authentication mechanism,
 * this is the profile object that is retrieved after successful authentication.
 */
export interface LegacyUserProfile {
    email: string
    emailVerified: boolean,
    firstName: string
    lastName: string
    middleName: string | null
    phoneNumber: string | null
    address: string,
    addressLine1: string | null,
    city: string,
    postalCode: string,
    stateRegionProvince: string | null,
    countryCode: string
    preferredLanguageCode: string,    
    nameOrder: string
}

export interface LegacyUserAuthenticationPayload {
    email: string,
    password: string
}

/**
 * For federated OIDC providers, the IAM tool will call the user profile endpoint
 * with the recently-issued auth token. This is just about the bare minimum that 
 * should be returned. There are a few other fields such as birthdate, website,
 * zoneinfo, and gender, which this IAM tool does not support.
 */
export interface FederatedOIDCUserInfo {
    sub: string,
    iss: string,
    aud: string,
    iat: number,
    exp: number,
    at_hash: string,
    name: string,
    given_name: string,
    family_name: string,
    middle_name: string,
    nickname: string,
    preferred_username: string,
    profile: string,
    phone_number: string,
    address: OIDCUserInfoAddress | null,
    updated_at: string,
    email: string,
    email_verified: boolean,
    locale: string | null    
}

// street address is the full street address possibly separated by newlines
// locality is city
// region is region or state or province
export interface OIDCUserInfoAddress {
    formatted: string | null,
    street_address: string | null,
    locality: string | null,
    region: string | null,
    postal_code: string | null,
    country: string | null
}
