import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import Kms, { KeyWrappedEncryptedData } from "./kms";
import { KeyClient, CryptographyClient, KeyVaultKey, WrapResult, UnwrapResult } from "@azure/keyvault-keys";
import { DefaultAzureCredential,  } from "@azure/identity";
import { logWithDetails } from "../logging/logger";


// This will be used for serializing the data and metadata for
// encryption operations for Azure KMS, since Azure KMS does not
// prefix any metadata such as key version, iv, or algorithm or anything
// else, to the returned cipher text. So we will have to keep track outselves.
// This will be serialized as json.toString() => based64 encoded.
interface CryptoEnvelope {
  keyId: string,                 // Full Key Vault key ID (includes version) from the getKey() service.
  keyWrapAlg: string,            // This will be A256KW 
  iv: string,
  authTag: string,
  encryptedDek: string,
  cipherText: string,
  aad: string | null
}


const {
    MAX_PLAIN_TEXT_LENGTH,
    AZURE_KMS_VAULT_URL,
    AZURE_KMS_KEY_NAME
} = process.env;

const maxLength = MAX_PLAIN_TEXT_LENGTH ? parseInt(MAX_PLAIN_TEXT_LENGTH) : MAX_ENCRYPTION_LENGTH;

const defaultCredential = new DefaultAzureCredential();

const keyClient = new KeyClient(AZURE_KMS_VAULT_URL || "", defaultCredential);

class AzureKms extends Kms {

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
        return this.encryptBufferWithKeyWrapping(data, aad);
        
    }

    public async decrypt(data: string, aad?: string): Promise<string | null> {
        const decryptedData: Buffer | null = await this.decryptBuffer(Buffer.from(data, "base64"), aad);
        if(!decryptedData){
            return Promise.resolve(null);
        }
        return Promise.resolve(decryptedData.toString("utf-8"));
    }

    public async decryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {
        return this.decryptBufferWithKeyWrapping(data, aad);
    }

    /**
     * Need to override the encrypt buffer with key wrapping because Azure KMS does
     * not prefix any metadata to the cipher text, unlike with Google and AWS. This
     * means that we have to keep track of the key versions and other metadata ourselves
     * and prefix those values to the cipher text.
     * @param buffer 
     * @param aad 
     */
    public async encryptBufferWithKeyWrapping(buffer: Buffer, aad?: string): Promise<Buffer | null> {

        let key: KeyVaultKey | null = null;
        try{     
            key = await keyClient.getKey(AZURE_KMS_KEY_NAME || "");
        }
        catch(error: unknown){
            const err: Error = error as Error;
            logWithDetails("error", `Cannot retrieve key with key name of ${AZURE_KMS_KEY_NAME} for encryption with Azure KMS. ${err.message}`, {err});
            return null;
        }

        if(!key || !key.id){
            logWithDetails("error", "Cannot determine key ID for encryption with Azure KMS");
            return null;
        }

        let version = key.properties.version;
        if(!version){
            version = key.id.split("/").pop();
        }
        if(!version){
            logWithDetails("error", "Cannot determine key version for encryption with Azure KMS.");
            return null;
        }

        const cryptoClient: CryptographyClient = new CryptographyClient(key.id, defaultCredential);
        const keyWrappedEncryptedData: KeyWrappedEncryptedData = this.generateKeyWrappedData(buffer, aad);

        let wrappedDek: WrapResult | null = null;
        try{
            wrappedDek = await cryptoClient.wrapKey(
                "A256KW",
                keyWrappedEncryptedData.aesKey.export()
            );
        }
        catch(error: unknown){
            const err: Error = error as Error;
            logWithDetails("error", `Cannot encrypt key for Azure KMS: ${err.message}`, {err});
            return null;
        }

        if(!wrappedDek || !wrappedDek.result){
            logWithDetails("error", "No wrapped key results was available for encryption with Azure KMS");
            return null;
        }

        const cryptoEnvelope: CryptoEnvelope = {
            aad: aad || null,
            authTag: keyWrappedEncryptedData.authTag.toString("base64"),
            cipherText: keyWrappedEncryptedData.cipherText.toString("base64"),
            encryptedDek: Buffer.from(wrappedDek.result).toString("base64"),
            iv: keyWrappedEncryptedData.iv.toString("base64"),
            keyId: key.id,
            keyWrapAlg: "A256KW"
        };

        const b: Buffer = Buffer.from(JSON.stringify(cryptoEnvelope), "utf-8");
        return b;        
    }

    public async decryptBufferWithKeyWrapping(buffer: Buffer, aad?: string): Promise<Buffer | null> {
        
        const s: string = buffer.toString("utf-8");        
        const cryptoEnvelope: CryptoEnvelope = JSON.parse(s);

        // Since we saved the key id previously, we need it to construct this
        // CryptographyClient rather than relying on the call to keyClient.getKey()
        const cryptoClient: CryptographyClient = new CryptographyClient(cryptoEnvelope.keyId, defaultCredential);
        let unwrappedDek: UnwrapResult | null = null;
        try{
            unwrappedDek = await cryptoClient.unwrapKey(
                "A256KW",
                Buffer.from(cryptoEnvelope.encryptedDek, "base64")
            );
        }
        catch(error: unknown){
            let err: Error = error as Error;
            logWithDetails("error", `Cannot decrypt key for Azure KMS: ${err.message}`, {err});
            return null;
        }
        const decryptedBuffer: Buffer = this.decryptKeyWrappedData(
            Buffer.from(cryptoEnvelope.cipherText, "base64"),
            Buffer.from(unwrappedDek.result),
            Buffer.from(cryptoEnvelope.iv, "base64"),
            Buffer.from(cryptoEnvelope.authTag, "base64"),
            aad ? aad : undefined
        );
        return decryptedBuffer;
    }

}

export default AzureKms;