
export interface OIDCTokenResponse {
    access_token: string,
    token_type: string,
    refresh_token: string | null,
    expires_in: number,
    id_token: string
}

export interface OIDCDeviceAuthorizationResponse {
    device_code: string,
    user_code: string,
    verification_uri: string,
    expires_in: number,
    interval: number,
    message: string
}
