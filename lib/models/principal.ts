
export interface OIDCPrincipal {
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
    token_type: string
}

export interface LegacyUserProfile {
    email: string
    emailVerified: boolean,
    firstName: string
    lastName: string
    middleName: string | null
    phoneNumber: string | null
    address: string,
    addressLine1: string,
    city: string,
    postalCode: string,
    stateRegionProvince: string,
    countryCode: string
    preferredLanguageCode: string,    
    nameOrder: string
}

export interface LegacyUserAuthenticationPayload {
    email: string,
    password: string
}

export interface LegacyUserAuthenticationResponse {
    accessToken: string
}

