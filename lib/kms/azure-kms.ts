import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import CachingKms from "./caching-kms";
import { KeyWrappedEncryptedData } from "./kms";
import { KeyClient, CryptographyClient, KeyVaultKey, WrapResult, UnwrapResult, KeyWrapAlgorithm } from "@azure/keyvault-keys";
import { DefaultAzureCredential } from "@azure/identity";
import { logWithDetails } from "../logging/logger";


// Envelope for direct string encryption via Key Vault's native encrypt/decrypt APIs.
// Serialized as JSON → base64 and returned from encrypt().
interface DirectEncryptEnvelope {
    alg: string;        // "RSA-OAEP-256" | "A256GCM"
    keyId: string;      // Full Key Vault key ID (includes version)
    ct: string;         // base64 ciphertext
    aad: string | null;
    iv?: string;        // base64, AES-GCM only
    tag?: string;       // base64, AES-GCM only
}

// Envelope for buffer encryption using local AES-GCM + Key Vault key wrapping.
// Stored as raw UTF-8 JSON bytes in the Buffer returned from encryptBuffer().
interface KeyWrapEnvelope {
    keyId: string;
    keyWrapAlg: string;
    iv: string;
    authTag: string;
    encryptedDek: string;
    cipherText: string;
    aad: string | null;
}


const {
    MAX_PLAIN_TEXT_LENGTH,
    AZURE_KMS_VAULT_URL,
    AZURE_KMS_KEY_NAME,
    AZURE_KMS_KEY_TYPE
} = process.env;

const maxLength = MAX_PLAIN_TEXT_LENGTH ? parseInt(MAX_PLAIN_TEXT_LENGTH) : MAX_ENCRYPTION_LENGTH;

// "RSA" uses RSA-OAEP-256 for both direct encryption and key wrapping.
// "AES" uses A256GCM for direct encryption and A256KW for key wrapping (Managed HSM only).
const keyType = (AZURE_KMS_KEY_TYPE || "RSA").toUpperCase();
const wrapAlgorithm: KeyWrapAlgorithm = keyType === "AES" ? "A256KW" : "RSA-OAEP-256";

const defaultCredential = new DefaultAzureCredential();
const keyClient = new KeyClient(AZURE_KMS_VAULT_URL || "", defaultCredential);


class AzureKms extends CachingKms {

    // Directly encrypts the string via Key Vault's encrypt API.
    // RSA keys: RSA-OAEP-256, max plaintext ~190 bytes (2048-bit) or ~446 bytes (4096-bit).
    // AES keys: A256GCM, any size (Managed HSM only).
    public async encrypt(data: string, aad?: string): Promise<string | null> {
        if(data.length > maxLength){
            return null;
        }

        let key: KeyVaultKey | null = null;
        try {
            key = await keyClient.getKey(AZURE_KMS_KEY_NAME || "");
        }
        catch(error: unknown) {
            const err = error as Error;
            logWithDetails("error", `Cannot retrieve key for encryption with Azure KMS. ${err.message}`, {err});
            return null;
        }

        if(!key?.id) {
            logWithDetails("error", "Cannot determine key ID for encryption with Azure KMS");
            return null;
        }

        try {
            const cryptoClient = new CryptographyClient(key.id, defaultCredential);

            let ct: string;
            let iv: string | undefined;
            let tag: string | undefined;

            if(keyType === "AES") {
                const result = await cryptoClient.encrypt({
                    algorithm: "A256GCM",
                    plaintext: Buffer.from(data, "utf-8"),
                    additionalAuthenticatedData: aad ? Buffer.from(aad, "utf-8") : undefined
                });
                ct = Buffer.from(result.result).toString("base64");
                iv = result.iv ? Buffer.from(result.iv).toString("base64") : undefined;
                tag = result.authenticationTag ? Buffer.from(result.authenticationTag).toString("base64") : undefined;
            } else {
                const result = await cryptoClient.encrypt({
                    algorithm: "RSA-OAEP-256",
                    plaintext: Buffer.from(data, "utf-8")
                });
                ct = Buffer.from(result.result).toString("base64");
            }

            const envelope: DirectEncryptEnvelope = {
                alg: keyType === "AES" ? "A256GCM" : "RSA-OAEP-256",
                keyId: key.id,
                ct,
                aad: aad || null,
                iv,
                tag
            };

            return Buffer.from(JSON.stringify(envelope), "utf-8").toString("base64");
        }
        catch(error: unknown) {
            const err = error as Error;
            logWithDetails("error", `Error encrypting with Azure KMS: ${err.message}`, {err});
            return null;
        }
    }

    // Encrypts arbitrary-size buffers using local AES-GCM + Key Vault key wrapping.
    public async encryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {
        return this.encryptBufferWithKeyWrapping(data, aad);
    }

    protected async decryptUncached(data: string, aad?: string): Promise<string | null> {
        try {
            const envelope: DirectEncryptEnvelope = JSON.parse(
                Buffer.from(data, "base64").toString("utf-8")
            );

            if(envelope.aad !== (aad || null)) {
                logWithDetails("error", "Error decrypting with Azure KMS: AAD mismatch.");
                return null;
            }

            const cryptoClient = new CryptographyClient(envelope.keyId, defaultCredential);

            if(envelope.alg === "A256GCM" || envelope.alg === "A192GCM" || envelope.alg === "A128GCM") {
                if(!envelope.iv || !envelope.tag) {
                    logWithDetails("error", "Error decrypting with Azure KMS: missing IV or auth tag for AES-GCM.");
                    return null;
                }
                const result = await cryptoClient.decrypt({
                    algorithm: envelope.alg,
                    ciphertext: Buffer.from(envelope.ct, "base64"),
                    iv: Buffer.from(envelope.iv, "base64"),
                    authenticationTag: Buffer.from(envelope.tag, "base64"),
                    additionalAuthenticatedData: aad ? Buffer.from(aad, "utf-8") : undefined
                });
                return Buffer.from(result.result).toString("utf-8");
            } else {
                // RSA-OAEP or RSA-OAEP-256
                const result = await cryptoClient.decrypt({
                    algorithm: envelope.alg as "RSA-OAEP" | "RSA-OAEP-256" | "RSA1_5",
                    ciphertext: Buffer.from(envelope.ct, "base64")
                });
                return Buffer.from(result.result).toString("utf-8");
            }
        }
        catch(error: unknown) {
            const err = error as Error;
            logWithDetails("error", `Error decrypting with Azure KMS: ${err.message}`, {err});
            return null;
        }
    }

    // Decrypts arbitrary-size buffers using Key Vault key unwrapping + local AES-GCM.
    public async decryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {
        return this.decryptBufferWithKeyWrapping(data, aad);
    }

    public async encryptBufferWithKeyWrapping(buffer: Buffer, aad?: string): Promise<Buffer | null> {

        let key: KeyVaultKey | null = null;
        try {
            key = await keyClient.getKey(AZURE_KMS_KEY_NAME || "");
        }
        catch(error: unknown) {
            const err = error as Error;
            logWithDetails("error", `Cannot retrieve key for buffer encryption with Azure KMS. ${err.message}`, {err});
            return null;
        }

        if(!key?.id) {
            logWithDetails("error", "Cannot determine key ID for buffer encryption with Azure KMS");
            return null;
        }

        let version = key.properties.version;
        if(!version) {
            version = key.id.split("/").pop();
        }
        if(!version) {
            logWithDetails("error", "Cannot determine key version for buffer encryption with Azure KMS.");
            return null;
        }

        const cryptoClient = new CryptographyClient(key.id, defaultCredential);
        const keyWrappedEncryptedData: KeyWrappedEncryptedData = this.generateKeyWrappedData(buffer, aad);

        let wrappedDek: WrapResult | null = null;
        try {
            wrappedDek = await cryptoClient.wrapKey(
                wrapAlgorithm,
                keyWrappedEncryptedData.aesKey.export()
            );
        }
        catch(error: unknown) {
            const err = error as Error;
            logWithDetails("error", `Cannot wrap key for Azure KMS: ${err.message}`, {err});
            return null;
        }

        if(!wrappedDek?.result) {
            logWithDetails("error", "No wrapped key result available for buffer encryption with Azure KMS");
            return null;
        }

        const envelope: KeyWrapEnvelope = {
            aad: aad || null,
            authTag: keyWrappedEncryptedData.authTag.toString("base64"),
            cipherText: keyWrappedEncryptedData.cipherText.toString("base64"),
            encryptedDek: Buffer.from(wrappedDek.result).toString("base64"),
            iv: keyWrappedEncryptedData.iv.toString("base64"),
            keyId: key.id,
            keyWrapAlg: wrapAlgorithm
        };

        return Buffer.from(JSON.stringify(envelope), "utf-8");
    }

    public async decryptBufferWithKeyWrapping(buffer: Buffer, aad?: string): Promise<Buffer | null> {

        try {
            const envelope: KeyWrapEnvelope = JSON.parse(buffer.toString("utf-8"));

            if(envelope.aad !== (aad || null)) {
                logWithDetails("error", "Error decrypting buffer with Azure KMS: AAD mismatch.");
                return null;
            }

            const cryptoClient = new CryptographyClient(envelope.keyId, defaultCredential);
            let unwrappedDek: UnwrapResult | null = null;
            try {
                unwrappedDek = await cryptoClient.unwrapKey(
                    envelope.keyWrapAlg as KeyWrapAlgorithm,
                    Buffer.from(envelope.encryptedDek, "base64")
                );
            }
            catch(error: unknown) {
                const err = error as Error;
                logWithDetails("error", `Cannot unwrap key for Azure KMS: ${err.message}`, {err});
                return null;
            }

            return this.decryptKeyWrappedData(
                Buffer.from(envelope.cipherText, "base64"),
                Buffer.from(unwrappedDek.result),
                Buffer.from(envelope.iv, "base64"),
                Buffer.from(envelope.authTag, "base64"),
                aad ?? undefined
            );
        }
        catch(error: unknown) {
            const err = error as Error;
            logWithDetails("error", `Error decrypting buffer with Azure KMS: ${err.message}`, {err});
            return null;
        }
    }

}

export default AzureKms;
