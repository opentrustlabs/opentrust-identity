import { logWithDetails } from "../logging/logger";
import Kms from "./kms";
import { KMSClient, EncryptCommand, DecryptCommand, EncryptCommandOutput, DecryptCommandOutput} from "@aws-sdk/client-kms";

const {
    AWS_KMS_REGION,
    AWS_KMS_KEY_ID,
    AWS_KMS_USE_ACCESS_KEYS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
    AWSK_KMS_USE_FIPS_ENDPOINT,
    MAX_PLAIN_TEXT_LENGTH
} = process.env;

const maxLength = MAX_PLAIN_TEXT_LENGTH ? parseInt(MAX_PLAIN_TEXT_LENGTH) : 4096;

const credentials = AWS_KMS_USE_ACCESS_KEYS && AWS_KMS_USE_ACCESS_KEYS === "true" ?
    {
        accessKeyId: AWS_ACCESS_KEY_ID || "",
        secretAccessKey: AWS_SECRET_ACCESS_KEY || "",
        sessionToken: AWS_SESSION_TOKEN
    } 
    :
    undefined;

const kmsClient = new KMSClient({
    region: AWS_KMS_REGION,
    credentials: credentials,
    maxAttempts: 3,
    useFipsEndpoint: AWSK_KMS_USE_FIPS_ENDPOINT && AWSK_KMS_USE_FIPS_ENDPOINT === "true" ? true : false
});


class AWSKms extends Kms {

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
        const encryptCommand: EncryptCommand = new EncryptCommand({
            KeyId: AWS_KMS_KEY_ID,
            Plaintext: data,
            EncryptionContext: aad ? {"aad": aad} : undefined
        });

        const encryptResponse: EncryptCommandOutput = await kmsClient.send(encryptCommand);
        if(encryptResponse.$metadata.httpStatusCode && encryptResponse.$metadata.httpStatusCode !== 200){            
            logWithDetails("error", "Error encrypting with AWS KMS: HTTP error response.", {...encryptResponse.$metadata});
            return null;
        }
        if(encryptResponse.CiphertextBlob){
            return Buffer.from(encryptResponse.CiphertextBlob);
        }
        else{
            logWithDetails("error", "Error encrypting with AWS KMS: No cipher text returned");
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
        const decryptCommand: DecryptCommand = new DecryptCommand({
            KeyId: AWS_KMS_KEY_ID,
            CiphertextBlob: data,
            EncryptionContext: aad ? {"aad": aad} : undefined
        });

        const decryptResponse: DecryptCommandOutput = await kmsClient.send(decryptCommand);
        if(decryptResponse.$metadata.httpStatusCode && decryptResponse.$metadata.httpStatusCode !== 200){
            logWithDetails("error", "Error decrypting with AWS KMS: HTTP error response.", {...decryptResponse.$metadata});
            return null;
        }
        if(decryptResponse.Plaintext){
            return Buffer.from(decryptResponse.Plaintext);
        }
        else{
            logWithDetails("error", "Error decrypting with AWS KMS: No plain text returned");
            return null;
        }
    }
    
}

export default AWSKms;