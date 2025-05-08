import { AES_GCM_CIPHER, AUTH_TAG_LENGTH, IV_LENGTH_IN_BYTES, MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import { createCipheriv, randomBytes, KeyObject, CipherGCM, createDecipheriv, DecipherGCM, createSecretKey,  } from "node:crypto";
import Kms from "./kms";
import path from "node:path";
import { KMS_KEYS_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

interface KmsKey {
    kid: number,
    key: string
}

const allKeys: Array<KmsKey> = JSON.parse(getFileContents(`${dataDir}/${KMS_KEYS_FILE}`, "[]"));

/**
 * Each key should be a 256 bit string, base64 encoded and
 * the key file should be formatted as follows, for example:
 * <pre>
 * [
 *       {
 *           "kid": 1,
 *           "key": "ptmwQK7r3fpCWI8hQjyQuI3CdGrmEJHXpAUGahF6wpw="
 *       },
 *       {
 *           "kid": 2,
 *           "key": "ptmwQK7r3fpCWI8hQjyQuI3CdGrmEJHXpAUGahF6wpw="
 *       }
 *   ]
 *   </pre>
 */
class FSBasedKms extends Kms {


    /**
     * 
     * @param data Max length of data is 64K
     * @param aad 
     * @returns 
     */
    public async  encryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null> {

        if(data.length > MAX_ENCRYPTION_LENGTH){
            return Promise.resolve(null);
        }

        // Always use the latest version of the key
        if(!allKeys || allKeys.length === 0){
            return Promise.resolve(null);
        }

        const kmsKey: KmsKey = allKeys[allKeys.length - 1];

        const aesKey: KeyObject = createSecretKey(kmsKey.key, "base64");
        
        const iv: Buffer = randomBytes(IV_LENGTH_IN_BYTES);
        const cipher: CipherGCM = createCipheriv(AES_GCM_CIPHER, aesKey, iv, {authTagLength: AUTH_TAG_LENGTH});
        if(aad){
            cipher.setAAD(Buffer.from(aad));
        }
        // utf-8 is the input encoding
        let encrypted: Buffer = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const authTag: Buffer = cipher.getAuthTag();

        // Save the metadata for the key id and the iv and authentication tag
        // The format will be:
        // 1. key id
        // 2. iv length (stored in 2 bytes)
        // 3. iv buffer
        // 4. encryption algorithm buffer length (stored in 2 bytes)
        // 5. encryption algorithm as buffer (for example: Buffer.from("aes-256-gcm"))
        // 6. auth tag length
        // 7. auth tag
        // 8. encrypted data

        // Not nice that NodeJS Buffers cannot just be appended to one another (?because
        // they are of a fixed size and cannot be expanded?)
        const buffer1: Buffer = Buffer.alloc(2);
        buffer1.writeUint16BE(kmsKey.kid);

        const buffer2: Buffer = Buffer.alloc(2);
        buffer2.writeUInt16BE(IV_LENGTH_IN_BYTES);
        
        const buffer3: Buffer = Buffer.alloc(2);
        const cipherAlgBuffer = Buffer.from(AES_GCM_CIPHER);
        buffer3.writeUint16BE(cipherAlgBuffer.length);

        const buffer4: Buffer = Buffer.alloc(2);
        buffer4.writeUint16BE(authTag.length);

        const encryptedData = Buffer.concat([
            buffer1,
            buffer2,
            iv,
            buffer3,
            cipherAlgBuffer,
            buffer4,
            authTag,
            encrypted
        ]);
        return Promise.resolve(encryptedData);
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

        // The format will be:
        // 1. key id - (stored in 2 bytes)
        // 2. iv length (stored in 2 bytes)
        // 3. iv buffer (the actual iv)
        // 4. encryption algorithm buffer length (stored in 2 bytes)
        // 5. encryption algorithm as buffer (for example: Buffer.from("aes-256-gcm"))
        // 6. auth tag length (stored in 2 bytes)
        // 7. auth tag (the actual auth tag)
        // 8. the encrypted data

        try{
            
            const kid: number = buffer.readUint16BE(0);
            const kmsKey: KmsKey | undefined = allKeys.find(
                (k: KmsKey) => k.kid === kid
            );
            if(!kmsKey){
                return Promise.resolve(null);
            }
            

            const ivLength: number = buffer.readUInt16BE(2);
            const iv: Buffer = buffer.subarray(2 + 2, 2 + 2 + ivLength);
            
            const algorithmLength: number = buffer.readUint16BE(2 + 2 + ivLength);
            const algorithm: Buffer = buffer.subarray(
                2 + 2 + ivLength + 2, 
                2 + 2 + ivLength + 2 + algorithmLength            
            );
            if(algorithm.toString() !== AES_GCM_CIPHER){
                return Promise.resolve(null);
            }            
            
            const authTagLength: number = buffer.readUInt16BE(2 + 2 + ivLength + 2 + algorithmLength);
            const authTag: Buffer = buffer.subarray(
                2 + 2 + ivLength + 2 + algorithmLength + 2,
                2 + 2 + ivLength + 2 + algorithmLength + 2 + authTagLength
            )
            
            const encryptedData: Buffer = buffer.subarray(2 + 2 + ivLength + 2 + algorithmLength + 2 + authTagLength);
            
            const aesKey: KeyObject = createSecretKey(kmsKey.key, "base64");
            const deCipher: DecipherGCM = createDecipheriv(AES_GCM_CIPHER, aesKey, iv, {authTagLength: AUTH_TAG_LENGTH});
            if(aad){
                deCipher.setAAD(Buffer.from(aad));
            }
            
            deCipher.setAuthTag(authTag);
            
            let outputBuffer: Buffer = deCipher.update(encryptedData);
            outputBuffer = Buffer.concat([
                outputBuffer,
                deCipher.final()
            ]);
            
            return Promise.resolve(outputBuffer);
        }
        catch(error){
            return Promise.resolve(null);
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

export default FSBasedKms;