import { readFileSync } from "node:fs";
import axios, { AxiosInstance, AxiosProxyConfig } from "axios";
import { Agent } from "https";
import { DEFAULT_HTTP_TIMEOUT_MS } from "@/utils/consts";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import SMTPPool from "nodemailer/lib/smtp-pool";

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
    EMAIL_CLIENT_DEBUG_LOG
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
});


class ServiceClientConfig {

    public getAxiosInstance(): AxiosInstance {
        return axiosInstance;
    }

    public getEmailTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | undefined {
        if (SMTP_ENABLED === "true") {
            if (!global.emailTransporter) {
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

                if (EMAIL_SERVER_PROXY) {
                    transportOptions.proxy = EMAIL_SERVER_PROXY;
                }

                if (EMAIL_SERVER_USE_CONNECTION_POOL && EMAIL_SERVER_USE_CONNECTION_POOL === "true") {
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

}

export default ServiceClientConfig