import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import Kms, { KeyWrappedEncryptedData } from "./kms";
import { KeyClient, CryptographyClient, KeyVaultKey, WrapResult } from "@azure/keyvault-keys";
import { DefaultAzureCredential,  } from "@azure/identity";
import { logWithDetails } from "../logging/logger";


// This will be used for serializing the data and metadata for
// encryption operations for Azure KMS, since Azure KMS does not
// prefix any metadata such as key version, iv, or algorithm or anything
// else, to the returned cipher text. So we will have to keep track outselves.
// This will be serialized as json.toString() => based64 encoded.
interface CryptoEnvelope {
  version: string | null,        // In case the getKey() service returns sufficient metadata with the version included
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
        throw new Error("Method not implemented.");
    }

    public async decryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {
        throw new Error("Method not implemented.");
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

                
        const key: KeyVaultKey = await keyClient.getKey(AZURE_KMS_KEY_NAME || "");
        if(!key.id){
            logWithDetails("error", "Cannot determine key ID for Azure KMS");
            return null;
        }

        let version = key.properties.version;
        if(!version){
            version = key.id.split("/").pop();
        }
        if(!version){
            logWithDetails("error", "Cannot determine key version for Azure KMS.")
        }

        const cryptoClient: CryptographyClient = new CryptographyClient(key.id, defaultCredential);
        const keyWrappedEncryptedData: KeyWrappedEncryptedData = this.generateKeyWrappedData(buffer, aad);

        const wrappedDek: WrapResult = await cryptoClient.wrapKey(
            "A256KW",
            keyWrappedEncryptedData.aesKey.export()
        );

        if(!wrappedDek.result){
            return null;
        }

        const cryptoEnvelope: CryptoEnvelope = {
            aad: aad || null,
            authTag: keyWrappedEncryptedData.authTag.toString("base64"),
            cipherText: keyWrappedEncryptedData.cipherText.toString("base64"),
            encryptedDek: Buffer.from(wrappedDek.result).toString("base64"),
            iv: keyWrappedEncryptedData.iv.toString("base64"),
            keyId: key.id,
            keyWrapAlg: "A256KW",
            version: version || ""
        };

        const b: Buffer = Buffer.from(JSON.stringify(cryptoEnvelope));
        return b;
        
    }

}

export default AzureKms;