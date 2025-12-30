import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import Kms from "./kms";
import OIDCServiceUtils from "../service/oidc-service-utils";
import JwtServiceUtils from "../service/jwt-service-utils";

// Lazy initialization to avoid circular dependency with jwt-service-utils
let oidcServiceUtils: OIDCServiceUtils | null = null;
let jwtServiceUtils: JwtServiceUtils | null = null;

function getOidcServiceUtils(): OIDCServiceUtils {
    if (!oidcServiceUtils) {
        oidcServiceUtils = new OIDCServiceUtils();
    }
    return oidcServiceUtils;
}

function getJwtServiceUtils(): JwtServiceUtils {
    if (!jwtServiceUtils) {
        jwtServiceUtils = new JwtServiceUtils();
    }
    return jwtServiceUtils;
}


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
    CUSTOM_KMS_DECRYPTION_ENDPOINT
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

// TODO
// NEEDS REFACTORING (SEE ALSO DaoFactory) DUE TO CIRCULAR DEPENDENCY
// OF THIS CLASS AND JwtServiceUtils. NEED A WAY TO SIGN THE JWTs
// FOR THE ROOT CLIENT.
class CustomKms extends Kms {


    /**
     * 
     * @param data Max length of data is 64K
     * @param aad 
     * @returns 
     */
    public async encryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {

        if(data.length > MAX_ENCRYPTION_LENGTH){
            return Promise.resolve(null);
        }

        const jwtService = getJwtServiceUtils();
        const oidcService = getOidcServiceUtils();
        const authToken = await jwtService.getAuthTokenForOutboundCalls();
        const encryptedValue = await oidcService.customEncrypt(
            CUSTOM_KMS_ENCRYPTION_ENDPOINT || "",
            data.toString("base64"),
            authToken || "",
            aad
        );

        if(encryptedValue){
            return Buffer.from(encryptedValue, "base64");
        }
        else{
            return null;
        }
    }
    

    /**
     * 
     * @param data Max length of data is 64K
     * @param aad 
     * @returns 
     */
    public async encrypt(data: string, aad?: string): Promise<string | null>{

        if(data.length > MAX_ENCRYPTION_LENGTH){
            return Promise.resolve(null);
        }
        const encryptedData: Buffer | null = await this.encryptBuffer(Buffer.from(data, "utf-8"), aad);
        if(!encryptedData){
            return Promise.resolve(null);
        }
        return Promise.resolve(encryptedData.toString("base64"));
       
    }

    /**
     * 
     * @param data The buffer previously encrypted with the call to encryptBuffer
     * @param aad 
     * @returns 
     */
    public async decryptBuffer(buffer: Buffer, aad?: string): Promise<Buffer | null> {

        const jwtService = getJwtServiceUtils();
        const oidcService = getOidcServiceUtils();
        const authToken = await jwtService.getAuthTokenForOutboundCalls();
        const decryptedValue = await oidcService.customDecrypt(
            CUSTOM_KMS_DECRYPTION_ENDPOINT || "",
            buffer.toString("base64"),
            authToken || "",
            aad
        );

        if(decryptedValue){
            return Buffer.from(decryptedValue, "base64");
        }
        else{
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

        const decryptedData: Buffer | null = await this.decryptBuffer(Buffer.from(data, "base64"), aad);
        if(!decryptedData){
            return Promise.resolve(null);
        }
        return Promise.resolve(decryptedData.toString("utf-8"));

    }

}

export default CustomKms;