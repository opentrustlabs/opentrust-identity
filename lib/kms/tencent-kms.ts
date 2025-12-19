import { MAX_ENCRYPTION_LENGTH } from "@/utils/consts";
import Kms from "./kms";
import { Client as KmsClient} from "tencentcloud-sdk-nodejs/tencentcloud/services/kms/v20190118/kms_client";
import type {
  EncryptRequest,
  EncryptResponse,
  DecryptRequest,
  DecryptResponse,
} from
  "tencentcloud-sdk-nodejs/tencentcloud/services/kms/v20190118/kms_models";



const {
    TENCENT_KMS_SECRET_ID,
    TENCENT_KMS_SECRET_KEY,
    TENCENT_KMS_REGION,
    TENCENT_KMS_KEY_ID,
    TENCENT_KMS_ENDPOINT_URI,
    MAX_PLAIN_TEXT_LENGTH,
} = process.env;


const maxLength = MAX_PLAIN_TEXT_LENGTH ? parseInt(MAX_PLAIN_TEXT_LENGTH) : MAX_ENCRYPTION_LENGTH;

const kmsClient: KmsClient = new KmsClient({
    credential: {
        secretId: TENCENT_KMS_SECRET_ID,
        secretKey: TENCENT_KMS_SECRET_KEY
    },
    region: TENCENT_KMS_REGION,
    profile: {
        httpProfile: {
            endpoint: TENCENT_KMS_ENDPOINT_URI
        }
    }
});

class TencentKms extends Kms {

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

        const encryptionContext = aad ? JSON.stringify({"aad": aad}) : undefined;
        const encryptRequest: EncryptRequest = {
            KeyId: TENCENT_KMS_KEY_ID || "",
            Plaintext: data.toString("base64"),
            EncryptionContext: encryptionContext
        }
        const response: EncryptResponse = await kmsClient.Encrypt(
            encryptRequest, 
            (error: string, resp: EncryptResponse) => {

            }
        );
        if(response.CiphertextBlob){
            return Buffer.from(response.CiphertextBlob, "base64");
        }
        else{
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
        const encryptionContext = aad ? JSON.stringify({"aad": aad}) : undefined;
        const decryptRequest: DecryptRequest = {
            CiphertextBlob: data.toString("base64"),
            EncryptionContext: encryptionContext
        }
        const resp: DecryptResponse = await kmsClient.Decrypt(decryptRequest);
        if(resp.Plaintext){
            return Buffer.from(resp.Plaintext, "base64");
        }
        else{
            return null;
        }

    }

}

export default TencentKms;