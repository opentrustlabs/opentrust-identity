import { readFileSync } from "node:fs";
import axios, { AxiosProxyConfig, AxiosResponse } from "axios";
import { Agent } from "https";
import { Jwks, WellknownConfig } from "@/lib/models/wellknown-config";
import NodeCache from "node-cache";
import { LegacyUserAuthenticationPayload, LegacyUserProfile, OIDCUserInfo } from "../models/principal";
import { SecurityEvent, SecurityEventType } from "../models/security-event";
import { OIDCContext } from "@/graphql/graphql-context";
import { PortalUserProfile, TenantLookAndFeel, User } from "@/graphql/generated/graphql-types";
import { logWithDetails } from "../logging/logger";
import { randomUUID } from "node:crypto";
import { CustomKmsDecryptionResponseBody, CustomKmsEncryptionResponseBody, CustomKmsRequestBody } from "../kms/custom-kms";
import { CLIENT_ASSERTION_TYPE_JWT_BEARER, DEFAULT_HTTP_TIMEOUT_MS, GRANT_TYPE_AUTHORIZATION_CODE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST } from "@/utils/consts";
import { RecaptchaResponse } from "../models/recaptcha";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import SMTPPool from "nodemailer/lib/smtp-pool";
import { render } from "@react-email/render";
import React from "react";
import { VerifyRegistration } from "@/components/email-templates/verify-registration-template";
import { SecretShare } from "@/components/email-templates/secret-share-template";
import { OIDCTokenResponse } from "../models/token-response";
import { base64Encode } from "@/utils/dao-utils";
import JwtServiceUtils from "./jwt-service-utils";
import { SmsMessageBody } from "../models/sms";

const {
    HTTP_TIMEOUT_MS,
    MTLS_USE_PKI_IDENTITY,
    MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE,
    MTLS_PKI_IDENTITY_CERTIFICATE_FILE,
    MTLS_PKI_IDENTITY_PRIVATE_KEY_PASSWORD,
    TRUST_STORE_FILE,
    HTTP_CLIENT_USE_PROXY,
    HTTP_PROXY_PROTOCOL,
    HTTP_PROXY_HOST,
    HTTP_PROXY_PORT,
    HTTP_PROXY_USE_AUTHENTICATION,
    HTTP_PROXY_USERNAME,
    HTTP_PROXY_PASSWORD,
    SECURITY_EVENT_CALLBACK_URI,
    SMTP_ENABLED,
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    EMAIL_SERVER_USERNAME,
    EMAIL_SERVER_PASSWORD,
    EMAIL_SERVER_USE_CONNECTION_POOL,
    EMAIL_SERVER_PROXY,
    EMAIL_SERVER_USE_SECURE,
    EMAIL_SERVER_REQUIRE_TLS,
    EMAIL_CLIENT_LOG_TO_CONSOLE,
    EMAIL_CLIENT_DEBUG_LOG,
    SMS_SERVICE_WRAPPER_URI
} = process.env;

declare global {
    // eslint-disable-next-line no-var
    var emailTransporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | undefined;
}


// Thanks to ChatGPT for helping with configuration of nodemailer, which
// is a great library, but very very difficult to configure with all of
// the options you want.
type TransportOptions = (SMTPTransport.Options | SMTPPool.Options) & {
  proxy?: string; // add proxy explicitly (typing not always included)
};



function getEmailTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | undefined {
    if(SMTP_ENABLED === "true"){
        if(!global.emailTransporter){
            const transportOptions: TransportOptions = {
                host: EMAIL_SERVER_HOST,
                port: parseInt(EMAIL_SERVER_PORT || "587"),
                auth: {
                    user: EMAIL_SERVER_USERNAME,
                    pass: EMAIL_SERVER_PASSWORD
                },
                secure: EMAIL_SERVER_USE_SECURE === "true",
                requireTLS: EMAIL_SERVER_REQUIRE_TLS === "true",
                debug: EMAIL_CLIENT_DEBUG_LOG === "true",
                logger: EMAIL_CLIENT_LOG_TO_CONSOLE === "true"
            }

            if(EMAIL_SERVER_PROXY){
                transportOptions.proxy = EMAIL_SERVER_PROXY;
            }

            if(EMAIL_SERVER_USE_CONNECTION_POOL && EMAIL_SERVER_USE_CONNECTION_POOL === "true"){
                Object.assign(
                    transportOptions, 
                    {
                        pool: true,
                        maxConnections: 5,
                        maxMessages: 100
                    } satisfies SMTPPool.Options
                );
            };
            global.emailTransporter = nodemailer.createTransport(transportOptions);
        }
        return global.emailTransporter;
    }
    return undefined;
}

const proxy: AxiosProxyConfig | undefined = HTTP_CLIENT_USE_PROXY === "true" ? 
    {
        protocol: HTTP_PROXY_PROTOCOL,
        host: HTTP_PROXY_HOST || "",
        port: parseInt(HTTP_PROXY_PORT || "0"),
        auth: HTTP_PROXY_USE_AUTHENTICATION ? {
                username: HTTP_PROXY_USERNAME || "",
                password: HTTP_PROXY_PASSWORD || ""
            } : 
            undefined
    } :
    undefined;

const agent: Agent | null = MTLS_USE_PKI_IDENTITY === "true" ? 
    new Agent(
        {
            key: MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE ? readFileSync(MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE) : "",
            cert: MTLS_PKI_IDENTITY_CERTIFICATE_FILE ? readFileSync(MTLS_PKI_IDENTITY_CERTIFICATE_FILE) : "",
            ca: TRUST_STORE_FILE ? readFileSync(TRUST_STORE_FILE) : undefined,
            passphrase: MTLS_PKI_IDENTITY_PRIVATE_KEY_PASSWORD,            
            rejectUnauthorized: true,
            timeout: HTTP_TIMEOUT_MS ? parseInt(HTTP_TIMEOUT_MS) : DEFAULT_HTTP_TIMEOUT_MS
        }
    ) :     
    new Agent({        
        timeout: HTTP_TIMEOUT_MS ? parseInt(HTTP_TIMEOUT_MS) : DEFAULT_HTTP_TIMEOUT_MS,
        ca: TRUST_STORE_FILE ? readFileSync(TRUST_STORE_FILE) : undefined,
        rejectUnauthorized: true
    });


const axiosInstance = axios.create({
    httpsAgent: agent,
    proxy: proxy,
    timeout: HTTP_TIMEOUT_MS ? parseInt(HTTP_TIMEOUT_MS) : DEFAULT_HTTP_TIMEOUT_MS
})

const oidcWellknowCache = new NodeCache(
    {
        stdTTL: 43200, // 12 hours
        useClones: false,
        checkperiod: 1800, 
    }
);

const oidcJwksCache = new NodeCache(
    {
        stdTTL: 14400, // 2 hours
        useClones: false,
        checkperiod: 1800, 
    }
);

class OIDCServiceUtils extends JwtServiceUtils {

    
    /**
     * 
     * @param wellKnownUri 
     * @returns 
     */
    public async getWellKnownConfig(wellKnownUri: string): Promise<WellknownConfig | null> {
        let wellknownConfig: WellknownConfig | undefined = oidcWellknowCache.get(wellKnownUri);
        if (wellknownConfig) {
            return Promise.resolve(wellknownConfig);
        }
        try {
            const response: AxiosResponse = await axiosInstance.get<WellknownConfig>(wellKnownUri, {
                responseEncoding: "utf-8",
                responseType: "json"
            });
            if (response.status !== 200) {
                return Promise.resolve(null);
            }
            wellknownConfig = response.data;
            oidcWellknowCache.set(wellKnownUri, wellknownConfig);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error getting well-known URI: ${wellKnownUri}`, {...err});            
        }
        return wellknownConfig !== undefined ? Promise.resolve(wellknownConfig) : Promise.resolve(null);
    }

    
    public async redeemAuthorizationCode(tokenEndpoint: string, code: string, clientId: string, clientSecret: string | null, codeVerifier: string | null, redirectUri: string, scope: string, clientAuthType: string): Promise<OIDCTokenResponse | null> {
        const params: URLSearchParams = new URLSearchParams();
        params.set("grant_type", GRANT_TYPE_AUTHORIZATION_CODE);
        params.set("code", code);
        params.set("client_id", clientId);
        params.set("redirect_uri", redirectUri);
        params.set("scope", scope);
        if(clientSecret && clientAuthType === OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST){
            params.set("client_secret", clientSecret);
        }
        if(codeVerifier){
            params.set("code_verifier", codeVerifier);
        }
        let basicAuthHeader: string | null = null;
        if(clientAuthType === OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC && clientSecret !== null){
            basicAuthHeader = "Basic " + base64Encode(`${clientId}:${clientSecret}`);
        }
        if(clientAuthType === OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT && clientSecret !== null){
            const token = await this.hmacSignClient(clientId, clientSecret, tokenEndpoint);
            params.set("client_assertion_type", CLIENT_ASSERTION_TYPE_JWT_BEARER);
            params.set("client_assertion", token)
        }

        const response = await axiosInstance.post(
            tokenEndpoint,
            params.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": basicAuthHeader !== null ? basicAuthHeader : null
                }
            }
        );
        if(response.status !== 200){
            return null;
        }
        return response.data as OIDCTokenResponse;
    }

    public async getOIDCUserInfo(userInfoEndpoint: string, authToken: string): Promise<OIDCUserInfo | null>{
        const response = await axiosInstance.get(
            userInfoEndpoint, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
        )
        if(response.status !== 200){
            return null;
        }
        return response.data as OIDCUserInfo;
    }

    /**
     * 
     * @param jwksUri 
     * @returns 
     */
    public async getJwksKeys(jwksUri: string): Promise<Jwks | null>{
        let keys: Jwks | undefined = oidcJwksCache.get(jwksUri);
        if(keys){
            return Promise.resolve(keys);
        }
        const response: AxiosResponse = await axiosInstance.get<Jwks>(jwksUri, {
            responseEncoding: "utf-8",
            responseType: "json"
        });
        if(response.status !== 200){
            return Promise.resolve(null);
        }
        keys = response.data;
        oidcJwksCache.set(jwksUri, keys);
        return keys !== undefined ? Promise.resolve(keys) : Promise.resolve(null);
    }

    /**
     * Performs a HEAD request with the give URI (which should look like: http(s)://domain/path?email=)
     * and returns true if the service responded with 200, else false
     * @param uri 
     * @returns 
     */
    public async legacyUsernameCheck(uri: string, email: string, authToken: string): Promise<boolean> {
        const response: AxiosResponse = await axiosInstance.head(`${uri}?email=${email}`, {
            responseEncoding: "utf-8",
            headers: {                
                "Authorization": `Bearer ${authToken}`
            }
        });

        return response.status === 200;
    }

    /**
     * Authenticates the user against the legacy auth system. Success returns an
     * access token which will be used to query the user profile. See #legacyUserProfile()
     * 
     * @param uri 
     * @param email 
     * @param password 
     * @returns 
     */
    public async legacyUserAuthentication(uri: string, email: string, password: string, authToken: string): Promise<boolean>{

        const payload: LegacyUserAuthenticationPayload = {
            email: email,
            password: password
        }

        const response: AxiosResponse = await axiosInstance.post(uri, payload, {
            responseEncoding: "utf-8",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            responseType: "json"
        });

        if(response.status === 200){
            return true;
        }
        else{
            return false;
        }
    }

    public async sendSms(smsMessageBody: SmsMessageBody, authToken: string): Promise<void>{
        if(!SMS_SERVICE_WRAPPER_URI || SMS_SERVICE_WRAPPER_URI === ""){
            logWithDetails("error", "No SMS Service Wrapper URI was configured", {});
        }
        else{
            const response: AxiosResponse = await axiosInstance.post(SMS_SERVICE_WRAPPER_URI, smsMessageBody, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            });
            if(response.status !== 201){
                logWithDetails(
                    "error", 
                    "Error: SMS Service Wrapper returned a status code that was not 201", 
                    {status: response.status, statusText: response.statusText, data: response.data ? JSON.stringify(response.data) : null}
                )
            }
        }
    }

    /**
     * Invokes a GET request on the legacy user profile URI with the access token obtained
     * in the #legacyUserAuthentication() call
     * @param uri 
     * @param authToken 
     * @returns 
     */
    public async legacyUserProfile(uri: string, email: string, authToken: string): Promise<LegacyUserProfile | null>{

        const response: AxiosResponse = await axiosInstance.get(`${uri}?email=${email}`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            responseType: "json"
        });

        if(response.status === 200){
            return response.data as LegacyUserProfile;
        }
        else{
            return null;
        }
    }

    public async fireSecurityEvent(securityEventType: SecurityEventType, oidcContext: OIDCContext, user: User | PortalUserProfile | null, jti: string | null, authToken: string | null){
        const securityEvent: SecurityEvent = {
            securityEventType: securityEventType,
            userId: user?.userId || "unknown",
            email: user?.email || "unknown",
            phoneNumber: user?.phoneNumber || null,
            address: user?.address || null,
            city: user?.city || null,
            stateRegionProvince: user?.stateRegionProvince || null,
            countryCode: user?.countryCode || null,
            postalCode: user?.postalCode || null,
            jti: jti,
            ipAddress: oidcContext.ipAddress,
            geoLocation: oidcContext.geoLocation,
            deviceFingerprint: oidcContext.deviceFingerPrint    
        };
        this.invokeSecurityEventCallback(securityEvent, authToken);        
    }

    public async invokeSecurityEventCallback(securityEvent: SecurityEvent, authToken: string | null){
        // Fire asynchronously, but if there is an error, log the error.
        if(SECURITY_EVENT_CALLBACK_URI){
            axiosInstance.post(SECURITY_EVENT_CALLBACK_URI, securityEvent, {
                headers: {
                    "Authorization": authToken ? `Bearer ${authToken}` : "",
                    "Content-Type": "application/json"
                }
            })
            .catch(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error: any) => {                    
                    logWithDetails("error", `Error invoking the security event web hook. ${error.message}`, {...error, securityEvent});
                    logWithDetails("info", securityEvent.securityEventType, {securityEvent});
                }
            )
        }
        else{
            logWithDetails("info", securityEvent.securityEventType, {securityEvent});
        }        
    }

    public async customEncrypt(customEncryptUri: string, value: string, authToken: string, aad?: string): Promise<string | null> {

        const body: CustomKmsRequestBody = {
            value: value,
            aad: aad
        }
        const response = await axiosInstance.post(
            customEncryptUri, 
            body,
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                responseType: "json"
            }
        );
        if(response.status !== 200){
            logWithDetails("error", "Error: Encryption failed", {
                responseBody: response.data ? JSON.stringify(response.data) : "No response body from server", 
                traceId: randomUUID().toString(),
                statusTesnt: response.statusText,
                status: response.status
            });
            return null;
        }

        const encryptionResponse: CustomKmsEncryptionResponseBody = response.data;
        return encryptionResponse.encrypted;
    }

    public async customDecrypt(customDecryptUri: string, value: string, authToken: string, aad?: string): Promise<string | null> {
        const body: CustomKmsRequestBody = {
            value: value,
            aad: aad
        }
        const response = await axiosInstance.post(
            customDecryptUri, 
            body,
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                responseType: "json"
            }
        );
        if(response.status !== 200){
            logWithDetails("error", "Error: Decryption failed", {
                responseBody: response.data ? JSON.stringify(response.data) : "No response body from server", 
                traceId: randomUUID().toString(),
                statusTesnt: response.statusText,
                status: response.status
            });
            return null;
        }
        const decryptionResponse: CustomKmsDecryptionResponseBody = response.data;
        return decryptionResponse.decrypted;
    }

    public async validateRecaptchaV3(apiKey: string, recaptchaToken: string): Promise<RecaptchaResponse>{
        
        let recaptchaResponse: RecaptchaResponse = {
            challenge_ts: "",
            score: 0,
            "error-codes": [],
            hostname: "",
            success: false
        }
        try{
            const response = await axiosInstance.post("https://www.google.com/recaptcha/api/siteverify", 
                `secret=${apiKey}&response=${recaptchaToken}`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }                        
                }
            );
            recaptchaResponse = response.data;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any) {
            logWithDetails("error", `Error invoking Google recaptcha verification. ${error.message}`, {...error});            
        }
        return recaptchaResponse;
    }

    public async sendEmailVerificationEmail(from: string, to: string, name: string, token: string, tenantLookAndFeel: TenantLookAndFeel, languageCode: string, contactEmail?: string): Promise<void> {
        const html = await render(
            React.createElement(
                VerifyRegistration, 
                {
                    name: name, 
                    token: token, 
                    tenantLookAndFeel: tenantLookAndFeel, 
                    contactEmail: contactEmail,
                    languageCode: languageCode
                }
            )
        );

        this.sendEmail(from, to, "Verify Email", undefined, html);
    }

    public async sendSecretEntryEmail(from: string, to: string, url: string, tenantLookAndFeel: TenantLookAndFeel, languageCode: string): Promise<void>{
        const html = await render(
            React.createElement(
                SecretShare, 
                {
                    url: url,
                    tenantLookAndFeel: tenantLookAndFeel,
                    languageCode: languageCode
                }
            )
        );
        this.sendEmail(from, to, "Enter Secret", undefined, html);
    }


    public async sendEmail(from: string, to: string, subject: string, text?: string, html?: string): Promise<void> {
        const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | undefined = getEmailTransporter();
        if(transporter){
            await transporter.sendMail({
                from,
                to,
                subject,
                text,
                html
            });
        }        
    }
}

export default OIDCServiceUtils;