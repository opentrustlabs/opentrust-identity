import Kms from "./kms";
import { KeyManagementServiceClient } from "@google-cloud/kms";
import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import { logWithDetails } from "../logging/logger";


const {
    GOOGLE_KMS_PROJECT_ID,
    GOOGLE_KMS_LOCATION_ID,
    GOOGLE_KMS_KEY_RING_ID,
    GOOGLE_KMS_KEY_ID,
    MAX_PLAIN_TEXT_LENGTH
} = process.env;

const client = new KeyManagementServiceClient();
const keyName = client.cryptoKeyPath(GOOGLE_KMS_PROJECT_ID || "", GOOGLE_KMS_LOCATION_ID || "", GOOGLE_KMS_KEY_RING_ID || "", GOOGLE_KMS_KEY_ID || "");
const maxLength = MAX_PLAIN_TEXT_LENGTH ? parseInt(MAX_PLAIN_TEXT_LENGTH) : MAX_ENCRYPTION_LENGTH;
const crc32c = require("fast-crc32c");
class GoogleKMS extends Kms {

    public async encrypt(data: string, aad?: string): Promise<string | null> {
        if(data.length > maxLength){
            return Promise.resolve(null);
        }
        const encryptedData: Buffer | null = await this.encryptBuffer(Buffer.from(data, "utf-8"), aad);
        if(!encryptedData){
            return Promise.resolve(null);
        }
        return Promise.resolve(encryptedData.toString("base64"));

    }

    public async encryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {
        if(data.length > maxLength){
            return null;
        }

        try{
            const plaintextCrc32c = crc32c.calculate(data);
            const [encryptResponse] = await client.encrypt({
                name: keyName,
                plaintext: data,
                additionalAuthenticatedData: aad,
                plaintextCrc32c: {
                    value: plaintextCrc32c
                }
            });

            if(!encryptResponse.verifiedPlaintextCrc32c){
                logWithDetails("error", "Error encrypting with Google KMS: CRC check failed.");
                return null;
            }
            if(encryptResponse.ciphertext){
                return Buffer.from(encryptResponse.ciphertext);
            }
            else{
                logWithDetails("error", "Error encrypting with Google KMS: No cipher text returned.");
                return null;
            }
        }

        catch(error: unknown){
            const e = error as Error;
            logWithDetails("error", `Error encrypting with Google KMS: ${e.message}`, {e});
            return null;
        }
    }

    public async decrypt(data: string, aad?: string): Promise<string | null> {
        const decryptedData: Buffer | null = await this.decryptBuffer(Buffer.from(data, "base64"), aad);
        if(!decryptedData){
            return Promise.resolve(null);
        }
        return Promise.resolve(decryptedData.toString("utf-8"));
    }

    public async decryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {
        try{
            const ciphertextCrc32c = crc32c.calculate(data);
            const [decryptResponse ] = await client.decrypt({
                name: keyName,
                ciphertext: data,
                additionalAuthenticatedData: aad,
                ciphertextCrc32c: {
                    value: ciphertextCrc32c
                }
            });
            
            if(decryptResponse.plaintext){
                if(crc32c.calculate(decryptResponse.plaintext) !== Number(decryptResponse.plaintextCrc32c?.value)){
                    logWithDetails("error", "Error decrypting with Google KMS: CRC checked failed.");
                    return null;
                }
                return Buffer.from(decryptResponse.plaintext);
            }
            else{
                logWithDetails("error", "Error decrypting with Google KMS: No plain text returned.");
                return null;
            }
        
        }
        catch(error: unknown){
            const e = error as Error;
            logWithDetails("error", `Error decrypting with Google KMS: ${e.message}`, {e});
            return null;
        }
    }

}

export default GoogleKMS;