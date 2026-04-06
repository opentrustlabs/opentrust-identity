import { AxiosResponse } from "axios";
import { Jwks, WellknownConfig } from "@/lib/models/wellknown-config";
import NodeCache from "node-cache";
import { LegacyUserAuthenticationPayload, LegacyUserProfile, FederatedOIDCUserInfo } from "../models/principal";
import { SecurityEvent, SecurityEventType } from "../models/security-event";
import { OIDCContext } from "@/graphql/graphql-context";
import { PortalUserProfile, TenantLookAndFeel, User } from "@/graphql/generated/graphql-types";
import { logWithDetails } from "../logging/logger";
import { CLIENT_ASSERTION_TYPE_JWT_BEARER, GRANT_TYPE_AUTHORIZATION_CODE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST } from "@/utils/consts";
import { RecaptchaResponse } from "../models/recaptcha";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { render } from "@react-email/render";
import React from "react";
import { VerifyRegistration } from "@/components/email-templates/verify-registration-template";
import { SecretShare } from "@/components/email-templates/secret-share-template";
import { OIDCTokenResponse } from "../models/token-response";
import { base64Encode } from "@/utils/dao-utils";
import JwtServiceUtils from "./jwt-service-utils";
import { SmsCallbackRequest } from "../models/sms";
import ServiceClientConfig from "./service-client-config";

const {
    SECURITY_EVENT_CALLBACK_URI,
    SMS_SERVICE_WRAPPER_URI
} = process.env;



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

class OIDCServiceUtils extends ServiceClientConfig {

    
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
            const response: AxiosResponse = await this.getAxiosInstance().get<WellknownConfig>(wellKnownUri, {
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
            const jwtServiceUtils = new JwtServiceUtils()
            const token = await jwtServiceUtils.hmacSignClient(clientId, clientSecret, tokenEndpoint);
            params.set("client_assertion_type", CLIENT_ASSERTION_TYPE_JWT_BEARER);
            params.set("client_assertion", token)
        }

        const response = await this.getAxiosInstance().post(
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

    public async getFederatedOIDCUserInfo(userInfoEndpoint: string, authToken: string): Promise<FederatedOIDCUserInfo | null>{
        
        const response = await this.getAxiosInstance().get(
            userInfoEndpoint, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );        
        if(response.status !== 200){
            return null;
        }        
        return response.data as FederatedOIDCUserInfo;
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
        const response: AxiosResponse = await this.getAxiosInstance().get<Jwks>(jwksUri, {
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
        const response: AxiosResponse = await this.getAxiosInstance().head(`${uri}?email=${email}`, {
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

        const response: AxiosResponse = await this.getAxiosInstance().post(uri, payload, {
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

    public async sendSms(smsCallbackRequest: SmsCallbackRequest, authToken: string): Promise<void>{
        if(!SMS_SERVICE_WRAPPER_URI || SMS_SERVICE_WRAPPER_URI === ""){
            logWithDetails("error", "No SMS Service Wrapper URI was configured", {});
        }
        else{
            const response: AxiosResponse = await this.getAxiosInstance().post(SMS_SERVICE_WRAPPER_URI, smsCallbackRequest, {
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

        const response: AxiosResponse = await this.getAxiosInstance().get(`${uri}?email=${email}`, {
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
            this.getAxiosInstance().post(SECURITY_EVENT_CALLBACK_URI, securityEvent, {
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


    public async validateRecaptchaV3(apiKey: string, recaptchaToken: string): Promise<RecaptchaResponse>{
        
        let recaptchaResponse: RecaptchaResponse = {
            challenge_ts: "",
            score: 0,
            "error-codes": [],
            hostname: "",
            success: false
        }
        try{
            const response = await this.getAxiosInstance().post("https://www.google.com/recaptcha/api/siteverify", 
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
        const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | undefined = this.getEmailTransporter();
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