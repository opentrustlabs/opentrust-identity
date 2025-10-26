import { Client } from "@opensearch-project/opensearch";
import fs from "node:fs";


const {
    OPENSEARCH_HOST,
    OPENSEARCH_PORT,
    OPENSEARCH_PROTOCOL,
    OPENSEARCH_BASIC_AUTH_USERNAME,
    OPENSEARCH_BASIC_AUTH_PASSWORD,
    TRUST_STORE_FILE,
    REJECT_UNAUTHORIZED,
    MTLS_USE_PKI_IDENTITY,
    MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE,
    MTLS_PKI_IDENTITY_CERTIFICATE_FILE,
    MTLS_PKI_IDENTITY_PRIVATE_KEY_PASSWORD
} = process.env;


let client: Client | null = null;

export function getOpenSearchClient(): Client {
    if(client){
        return client;
    }

    client = new Client({
        pingTimeout: 15000,
        requestTimeout: 25000,
        maxRetries: 5,        
        auth: {
            username: OPENSEARCH_BASIC_AUTH_USERNAME || "",
            password: OPENSEARCH_BASIC_AUTH_PASSWORD || ""
        },
        node: `${OPENSEARCH_PROTOCOL}://${OPENSEARCH_HOST}:${OPENSEARCH_PORT}`,
        // For multiple nodes in a cluster use:
        // nodes: [],
        ssl: {
            ca: TRUST_STORE_FILE ? fs.readFileSync(TRUST_STORE_FILE) : undefined,
            cert: MTLS_USE_PKI_IDENTITY && MTLS_USE_PKI_IDENTITY === "true" ? fs.readFileSync(MTLS_PKI_IDENTITY_CERTIFICATE_FILE || "") : undefined,
            key: MTLS_USE_PKI_IDENTITY && MTLS_USE_PKI_IDENTITY === "true" ? fs.readFileSync(MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE || "") : undefined,
            passphrase: MTLS_USE_PKI_IDENTITY && MTLS_USE_PKI_IDENTITY === "true" ? MTLS_PKI_IDENTITY_PRIVATE_KEY_PASSWORD : undefined,
            rejectUnauthorized: REJECT_UNAUTHORIZED === "true" ? true : false
        }
    });
    return client;
}