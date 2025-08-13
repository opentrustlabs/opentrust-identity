

export interface ProfileScope {
    scopeName: string,
    scopeId: string,
    scopeDescription: string
};

export interface ProfileAuthorizationGroup {
    groupId: string,
    groupName: string
}

export interface OIDCUserProfile {
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
    address: string,
    updated_at: string,
    email: string,
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


