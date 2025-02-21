import { Client } from "@opensearch-project/opensearch";
import fs from "node:fs";


const {
    OPENSEARCH_HOST,
    OPENSEARCH_PORT,
    OPENSEARCH_PROTOCOL,
    OPENSEARCH_BASIC_AUTH_USERNAME,
    OPENSEARCH_BASIC_AUTH_PASSWORD,
    TRUST_STORE_PATH,
    REJECT_UNAUTHORIZED
} = process.env;


let client: Client | null = null;

export function getOpenSearchClient(): Client {
    if(client){
        console.log("client exists");
        return client;
    }
    console.log("will generate new client");
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
            ca: fs.readFileSync(TRUST_STORE_PATH || ""),
            // cert: fs.readFileSync(CERT_FILE_PATH),
            // key: fs.readFileSync(KEY_FILE_PATH),
            // passphrase: KEY_PASSPHRASE,
            rejectUnauthorized: REJECT_UNAUTHORIZED === "true" ? true : false
        }
    });
    return client;
}