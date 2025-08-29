import { readFileSync } from "node:fs";
import axios, { AxiosProxyConfig, AxiosResponse } from "axios";
import { Agent } from "https";
import { Jwks, WellknownConfig } from "@/lib/models/wellknown-config";
import NodeCache from "node-cache";
import { LegacyUserAuthenticationPayload, LegacyUserProfile } from "../models/principal";
import { SecurityEvent, SecurityEventType } from "../models/security-event";
import { OIDCContext } from "@/graphql/graphql-context";
import { PortalUserProfile, User } from "@/graphql/generated/graphql-types";
import { logWithDetails } from "../logging/logger";
import { randomUUID } from "node:crypto";
import { CustomKmsDecryptionResponseBody, CustomKmsEncryptionResponseBody, CustomKmsRequestBody } from "../kms/custom-kms";
import { DEFAULT_HTTP_TIMEOUT_MS } from "@/utils/consts";
import { RecaptchaV3Response } from "../models/recaptcha";

const {
    HTTP_TIMEOUT_MS,
    MTLS_USE_PKI_IDENTITY,
    MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE,
    MTLS_PKI_IDENTITY_CERTIFICATE_FILE,
    MTLS_PKI_IDENTITY_PRIVATE_KEY_PASSWORD,
    MTLS_PKI_IDENTITY_TRUST_STORE_FILE,
    HTTP_CLIENT_USE_PROXY,
    HTTP_PROXY_PROTOCOL,
    HTTP_PROXY_HOST,
    HTTP_PROXY_PORT,
    HTTP_PROXY_USE_AUTHENTICATION,
    HTTP_PROXY_USERNAME,
    HTTP_PROXY_PASSWORD,
    SECURITY_EVENT_CALLBACK_URI
} = process.env;


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

const agent: Agent | null = MTLS_USE_PKI_IDENTITY === "true" ? new Agent(
        {
            key: MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE ? readFileSync(MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE) : "",
            cert: MTLS_PKI_IDENTITY_CERTIFICATE_FILE ? readFileSync(MTLS_PKI_IDENTITY_CERTIFICATE_FILE) : "",
            ca: MTLS_PKI_IDENTITY_TRUST_STORE_FILE ? readFileSync(MTLS_PKI_IDENTITY_TRUST_STORE_FILE) : undefined,
            passphrase: MTLS_PKI_IDENTITY_PRIVATE_KEY_PASSWORD,            
            rejectUnauthorized: true,
            timeout: HTTP_TIMEOUT_MS ? parseInt(HTTP_TIMEOUT_MS) : DEFAULT_HTTP_TIMEOUT_MS
        }
    ) :     
    new Agent({        
        timeout: HTTP_TIMEOUT_MS ? parseInt(HTTP_TIMEOUT_MS) : DEFAULT_HTTP_TIMEOUT_MS
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

class OIDCServiceUtils {

    
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

    public async fireSecurityEvent(securityEventType: SecurityEventType, oidcContext: OIDCContext, user: User | PortalUserProfile, jti: string | null, authToken: string | null){
        const securityEvent: SecurityEvent = {
            securityEventType: securityEventType,
            userId: user.userId,
            email: user.email,
            phoneNumber: user.phoneNumber || null,
            address: user.address || null,
            city: user.city || null,
            stateRegionProvince: user.stateRegionProvince || null,
            countryCode: user.countryCode || null,
            postalCode: user.postalCode || null,
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

    public async validateRecaptchaV3(apiKey: string, recaptchaToken: string): Promise<RecaptchaV3Response>{
        
        let recaptchaResponse: RecaptchaV3Response = {
            challenge_ts: "",
            score: 0,
            "error-codes": [],
            hostname: "",
            success: false
        }
        try{
            const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", 
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

}

export default OIDCServiceUtils;