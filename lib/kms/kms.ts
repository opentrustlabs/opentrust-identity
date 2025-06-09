import { AES_GCM_CIPHER, AES_KEY_LENGTH, AUTH_TAG_LENGTH, IV_LENGTH_IN_BYTES } from "@/utils/consts";
import { generateKeySync, createCipheriv, randomBytes, KeyObject, CipherGCM, createDecipheriv, DecipherGCM } from "node:crypto";

abstract class Kms {

    abstract encrypt(data: string, aad?: string): Promise<string | null>;

    abstract encryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null>;

    abstract decrypt(data: string, aad?: string): Promise<string | null>;

    abstract decryptBuffer(data: Buffer, aad?: string): Promise<Buffer | null>;

    /**
     * 
     * @param buffer 
     * @param aad 
     * @returns 
     */
    public async encryptBufferWithKeyWrapping(buffer: Buffer, aad?: string): Promise<Buffer | null>{

        const aesKey: KeyObject = generateKeySync("aes", {length: AES_KEY_LENGTH});
        const iv: Buffer = randomBytes(IV_LENGTH_IN_BYTES);
        const cipher: CipherGCM = createCipheriv(AES_GCM_CIPHER, aesKey, iv, {authTagLength: AUTH_TAG_LENGTH});
        
        if(aad){
            cipher.setAAD(Buffer.from(aad));
        }
        // utf-8 is the input encoding
        let encrypted: Buffer = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const authTag: Buffer = cipher.getAuthTag();

        // Encrypt the key using the implementation-dependent encryption routine or service.        
        const encryptedKeyBuffer: Buffer | null = await this.encryptBuffer(aesKey.export(), aad);
        if(!encryptedKeyBuffer){
            return Promise.resolve(null);
        }

        // Save the metadata and the encrypted key as a byte array in front
        // of the encrypted data and authentication tag
        // The format will be:
        // 1. iv length (stored in 2 bytes)
        // 2. iv buffer
        // 3. encryption algorithm buffer length (stored in 2 bytes)
        // 4. encryption algorithm as buffer (for example: Buffer.from("aes-256-gcm"))
        // 5. encrypted key length (stored in 2 bytes)
        // 6. encrypted key
        // 7. auth tag length
        // 8. auth tag
        // 9. encrypted data

        // Not nice that NodeJS Buffers cannot just be appended to one another (?because
        // they are of a fixed size and cannot be expanded?)
        const buffer1: Buffer = Buffer.alloc(2);
        buffer1.writeUInt16BE(IV_LENGTH_IN_BYTES, 0);
        
        const buffer2: Buffer = Buffer.alloc(2);
        const cipherAlgBuffer = Buffer.from(AES_GCM_CIPHER);
        buffer2.writeUint16BE(cipherAlgBuffer.length);

        const buffer3: Buffer = Buffer.alloc(2);
        buffer3.writeUint16BE(encryptedKeyBuffer.length);

        const buffer4: Buffer = Buffer.alloc(2);
        buffer4.writeUint16BE(authTag.length);

        const encryptedData = Buffer.concat([
            buffer1,
            iv,
            buffer2,
            cipherAlgBuffer,
            buffer3,
            encryptedKeyBuffer,
            buffer4,
            authTag,
            encrypted
        ]);
        
        return Promise.resolve(encryptedData);
    }

    /**
     * 
     * @param data UTF-8 encoded string
     * @param aad 
     * @returns 
     */
    public async encryptWithKeyWrapping(data: string, aad?: string): Promise<string | null>{

        const encryptedData: Buffer | null = await this.encryptBufferWithKeyWrapping(Buffer.from(data, "utf-8"), aad);
        if(!encryptedData){
            return Promise.resolve(null);
        }
        const ret: string = encryptedData.toString("base64")
        return Promise.resolve(ret);
    }

    public async decryptBufferWithKeyWrapping(buffer: Buffer, aad?: string): Promise<Buffer | null>{

        // The format of the buffer will be:
        // 1. iv length (stored in 2 bytes)
        // 2. iv buffer
        // 3. encryption algorithm buffer length (stored in 2 bytes)
        // 4. encryption algorithm as buffer (for example: Buffer.from("aes-256-gcm"))
        // 5. encrypted key length (stored in 2 bytes)
        // 6. encrypted key
        // 7. auth tag length
        // 8. auth tag
        // 9. encrypted data

        try{
            
            const ivLength: number = buffer.readUInt16BE(0);
            const iv: Buffer = buffer.subarray(2, 2 + ivLength);
            
            const algorithmLength: number = buffer.readUint16BE(2 + ivLength);
            const algorithm: Buffer = buffer.subarray(
                2 + ivLength + 2, 
                2 + ivLength + 2 + algorithmLength            
            );
            if(algorithm.toString() !== AES_GCM_CIPHER){                
                return Promise.resolve(null);
            }
            
            const keyLength: number = buffer.readUint16BE(2 + ivLength + 2 + algorithmLength);
            const keyBuffer: Buffer = buffer.subarray(
                2 + ivLength + 2 + algorithmLength + 2, 
                2 + ivLength + 2 + algorithmLength + 2 + keyLength
            );
    
            const authTagLength: number = buffer.readUInt16BE(2 + ivLength + 2 + algorithmLength + 2 + keyLength);
            const authTag: Buffer = buffer.subarray(
                2 + ivLength + 2 + algorithmLength + 2 + keyLength + 2,
                2 + ivLength + 2 + algorithmLength + 2 + keyLength + 2 + authTagLength
            )

            const encryptedData: Buffer = buffer.subarray(2 + ivLength + 2 + algorithmLength + 2 + keyLength + 2 + authTagLength);

            // Decrypt the key using the implementation-dependent decryption routine or service, then
            // decrypt the encrypted data making sure to add in any additoinal authentication data.
            const key: Buffer | null = await this.decryptBuffer(keyBuffer, aad);
            if(!key){
                return Promise.resolve(null);
            }

            const deCipher: DecipherGCM = createDecipheriv(AES_GCM_CIPHER, key, iv, {authTagLength: AUTH_TAG_LENGTH});
            if(aad){
                deCipher.setAAD(Buffer.from(aad));
            }
            deCipher.setAuthTag(authTag);

            let outputBuffer: Buffer = deCipher.update(encryptedData);
            outputBuffer = Buffer.concat([
                outputBuffer,
                deCipher.final()
            ]);

            //const ret: string = outputBuffer.toString("utf-8");
            return Promise.resolve(outputBuffer);
        }
        catch(error){
            console.log(error);
            return Promise.resolve(null);
        }
    }
    /**
     * 
     * @param data Base64 encoded data previously encrypted by the method encryptWithKeyWrapping method
     * @param aad 
     * @returns UTF-8 encoded string
     */
    public async decryptWithKeyWrapping(data: string, aad?: string): Promise<string | null>{

        const decryptedBuffer: Buffer | null = await this.decryptBufferWithKeyWrapping(Buffer.from(data, "base64"), aad);
        if(!decryptedBuffer){
            return Promise.resolve(null);
        }

        return Promise.resolve(decryptedBuffer.toString("utf-8"));

    }

}

export default Kms;