
export interface WellknownConfig {
    issuer: string,
    authorization_endpoint: string,
    token_endpoint: string,
    revocation_endpoint: string,
    userinfo_endpoint: string,
    jwks_uri: string,
    token_endpoint_auth_methods_supported: Array<string>,
    response_modes_supported: Array<string>,
    token_endpoint_auth_signing_alg_values_supported: Array<string>,
    claims_supported: Array<string>,
    claims_parameter_supported: boolean,
    scopes_supported: Array<string>,
    response_types_supported: Array<string>,
    subject_types_supported: Array<string>,
    id_token_signing_alg_values_supported: Array<string>,
    request_object_signing_alg_values_supported: Array<string>,
    claim_types_supported: Array<string>,
    grant_types_supported: Array<string>,
    code_challenge_methods_supported: Array<string>
};

export interface JwtKey {
    kty: string,
    use: string,
    kid: string,
    x5t: string,
    n: string,
    e: string,
    x5c: Array<string>
};

export interface Jwks {
    keys: Array<JwtKey>
}