
/**
 * 
 *  SECURITY EVENTS CALLBACK URI
 *  For events such as failed logins, successful logins, logins with
 *  duress passwords, reset passwords, and many more to come. This 
 *  is a placeholder implementation until the OpenID Shared Signals
 *  framework is finalized. The Shared Signals framework will eventually
 *  supercede this implementation.
 *  The request body is defined in this file. The callback URI is defined in the
 *   .env file as:
 * 
 *  SECURITY_EVENT_CALLBACK_URI=https://<domain>/path/to/security-events/handler
 */


export type SecurityEventType = "user_registered" | "account_locked" | "account_unlocked" | "duress_authentication" | 
                                "successful_authentication" | "reset_password" | "backup_email_authentication" | 
                                "logout" | "device_registered" | "auth_code_exchanged" | "secret_viewed" | "secret_share_link_generated";

export interface SecurityEvent {
    securityEventType: SecurityEventType,
    userId: string | null,
    email: string | null,
    phoneNumber: string | null,
    address: string | null,
    city: string | null,
    stateRegionProvince: string | null,
    countryCode: string | null,
    postalCode: string | null,
    jti: string | null,
    ipAddress: string | null,
    geoLocation: string | null,
    /**
     * deviceFingerprint - Future enhancement. Finger print libraries are either 
     * commercial, have restricted opensource licenses, may not be very mature,
     * or may be abandoned projects on github. Adding it now as a placeholder
     * in case this changes.
     */
    deviceFingerprint: string | null
}