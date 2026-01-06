import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import Kms from "./kms";
import { base64Encode } from "@/utils/dao-utils";
import ServiceClientConfig from "../service/service-client-config";
import { logWithDetails } from "../logging/logger";
import { randomUUID } from "node:crypto";

const serviceClientConfig: ServiceClientConfig = new ServiceClientConfig();


/**
 * The custom encryption implementation are for those clients who are not using 
 * a commercial KMS service such as Google, Azure, AWS, Tencent, etc... but who 
 * have implemented a value such as Hashicorp and have developed (or will need
 * to develop) a web-service wrapper around it. The reason for the service
 * wrapper is that the IAM tool cannot necessarily accomodate ALL of the possible
 * implementations of a custom vault, so customers will need to provide a common
 * request handler for both encryption and decryption requests.
 * 
 * In addition to the environment variable KMS_STRATEGY=custom, there are 2 additional
 * values which need to be populated:
 * 
 * CUSTOM_KMS_ENCRYPTION_ENDPOINT=https://....
 * CUSTOM_KMS_DECRYPTION_ENDPOINT=https://....
 * 
 * The root client making the encryption and decryption request SHOULD have a scope 
 * of "custom.encryptdecrypt" assigned to it and the service SHOULD check the scope
 * of the client for access-control purposes
 * 
 * Request details:
 * ===============
 * 
 * Method: POST
 * Content-Type: application/json
 * Authorization: Bearer <JWT generated for the Root client>
 * **** In addition, if mTLS is configured for the custom KMS xerver, the http client will use the
 * **** configured values in the .env file for the connection.
 * 
 * BODY
 * {
 *      "value": "value to encrypt/decrypt"
 *      "aad": "optional value if using AES with GCM or other mode with authentication tag"
 * }
 * 
 * Response details
 * ================
 * 
 * Response codes: 200 for success, 403 for not allowed (missing scope), 401 for requires authorization (i.e. missing Authorization header)
 * Content-Type: application/json
 * 
 * BODY (for successful encryption responses)
 * {
 *      "encrypted": "encrypted value base64 encoded"
 * }
 * 
 * BODY (for successful decryption response)
 * {
 *      "decrypted": "decrypted value base64 encoded"
 * }
 * 
 */

const {
    CUSTOM_KMS_ENCRYPTION_ENDPOINT,
    CUSTOM_KMS_DECRYPTION_ENDPOINT,
    CUSTOM_KMS_USE_PKI_IDENTITY,
    CUSTOM_KMS_USERNAME,
    CUSTOM_KMS_PASSWORD
} = process.env;


export interface CustomKmsRequestBody {
    value: string,
    aad?: string
}

export interface CustomKmsEncryptionResponseBody {
    encrypted: string
}

export interface CustomKmsDecryptionResponseBody {
    decrypted: string
}

const BASIC_AUTH_TOKEN = CUSTOM_KMS_USE_PKI_IDENTITY && CUSTOM_KMS_USE_PKI_IDENTITY === "true" ? base64Encode(`${CUSTOM_KMS_USERNAME}:${CUSTOM_KMS_PASSWORD}`) : "";


class CustomKms extends Kms {


    /**
     * 
     * @param data Max length of data is 64K
     * @param aad 
     * @returns 
     */
    public async encryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {

        if (data.length > MAX_ENCRYPTION_LENGTH) {
            return Promise.resolve(null);
        }

        const encryptedValue = await this.customEncrypt(
            CUSTOM_KMS_ENCRYPTION_ENDPOINT || "",
            data.toString("base64"),
            BASIC_AUTH_TOKEN || "",
            CUSTOM_KMS_USE_PKI_IDENTITY && CUSTOM_KMS_USE_PKI_IDENTITY === "true" ? true : false,
            aad
        );

        if (encryptedValue) {
            return Buffer.from(encryptedValue, "base64");
        }
        else {
            return null;
        }
    }


    /**
     * 
     * @param data Max length of data is 64K
     * @param aad 
     * @returns 
     */
    public async encrypt(data: string, aad?: string): Promise<string | null> {

        if (data.length > MAX_ENCRYPTION_LENGTH) {
            return Promise.resolve(null);
        }

        const encryptedValue = await this.customEncrypt(
            CUSTOM_KMS_ENCRYPTION_ENDPOINT || "",
            Buffer.from(data, "utf-8").toString("base64"),
            BASIC_AUTH_TOKEN || "",
            CUSTOM_KMS_USE_PKI_IDENTITY && CUSTOM_KMS_USE_PKI_IDENTITY === "true" ? true : false,
            aad
        );

        return encryptedValue;

    }

    /**
     * 
     * @param data The buffer previously encrypted with the call to encryptBuffer
     * @param aad 
     * @returns 
     */
    public async decryptBuffer(buffer: Buffer, aad?: string): Promise<Buffer | null> {

        const decryptedValue = await this.customDecrypt(
            CUSTOM_KMS_DECRYPTION_ENDPOINT || "",
            buffer.toString("base64"),
            BASIC_AUTH_TOKEN || "",
            CUSTOM_KMS_USE_PKI_IDENTITY && CUSTOM_KMS_USE_PKI_IDENTITY === "true" ? true : false,
            aad
        );

        if (decryptedValue) {
            return Buffer.from(decryptedValue, "base64");
        }
        else {
            return null;
        }

    }

    /**
     * 
     * @param data Base64 encoded data previous encrypted by the encrypt() method
     * @param aad 
     * @returns 
     */
    public async decrypt(data: string, aad?: string): Promise<string | null> {

        const decryptedValue = await this.customDecrypt(
            CUSTOM_KMS_DECRYPTION_ENDPOINT || "",
            data,
            BASIC_AUTH_TOKEN || "",
            CUSTOM_KMS_USE_PKI_IDENTITY && CUSTOM_KMS_USE_PKI_IDENTITY === "true" ? true : false,
            aad
        );

        if (!decryptedValue) {
            return Promise.resolve(null);
        }
        return Promise.resolve(Buffer.from(decryptedValue, "base64").toString("utf-8"));

    }

    protected async customEncrypt(customEncryptUri: string, value: string, basicAuthToken: string, usePkiIdentity: boolean, aad?: string): Promise<string | null> {

        const body: CustomKmsRequestBody = {
            value: value,
            aad: aad
        }
        const response = await serviceClientConfig.getAxiosInstance().post(
            customEncryptUri,
            body,
            {
                headers: {
                    "Authorization": usePkiIdentity ? undefined : `Basic ${basicAuthToken}`,
                    "Content-Type": "application/json"
                },
                responseType: "json"
            }
        );
        if (response.status !== 200) {
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

    protected async customDecrypt(customDecryptUri: string, value: string, basicAuthToken: string, usePkiIdentity: boolean, aad?: string): Promise<string | null> {
        const body: CustomKmsRequestBody = {
            value: value,
            aad: aad
        }
        const response = await serviceClientConfig.getAxiosInstance().post(
            customDecryptUri,
            body,
            {
                headers: {
                    "Authorization": usePkiIdentity ? undefined : `Basic ${basicAuthToken}`,
                    "Content-Type": "application/json"
                },
                responseType: "json"
            }
        );
        if (response.status !== 200) {
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

}

export default CustomKms;