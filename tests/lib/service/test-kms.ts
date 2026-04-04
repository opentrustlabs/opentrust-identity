import AWSKms from '@/lib/kms/aws-kms';
import AzureKms from '@/lib/kms/azure-kms';
import GoogleKms from '@/lib/kms/google-kms';
import TencentKms from '@/lib/kms/tencent-kms';
import Kms from '@/lib/kms/kms';

const googleKms: Kms = new GoogleKms();
const awsKms: Kms = new AWSKms();
const azureKms: Kms = new AzureKms();
const tencentKms: Kms = new TencentKms();

export default class TestKms {

    public async test() {

        const googleData = "google data";
        const awsData = "aws data";
        const azureData = "azure data";
        const tencentData = "tencent data";

        const googleDataForKeyWrapping = "google data for key wrapping";
        const awsDataForKeyWrapping = "aws data for key wrapping";
        const azureDataForKeyWrapping = "auzre data for key wrapping";
        const tencentDataForKeyWrapping = "tencent data for key wrapping";

        const encryptedGoogleData: string | null = await googleKms.encrypt(googleData);
        const encryptedAwsData: string | null = await awsKms.encrypt(awsData);
        const encryptedAzureData: string | null = await azureKms.encrypt(azureData);
        const encryptedTencentData: string | null = await tencentKms.encrypt(tencentData);

        const encryptedGoogleKeyWrapping: string | null = await googleKms.encryptWithKeyWrapping(googleDataForKeyWrapping);
        const encryptedAwsKeyWrapping: string | null = await awsKms.encryptWithKeyWrapping(awsDataForKeyWrapping);
        const encryptedAzureKeyWrapping: string | null = await azureKms.encryptWithKeyWrapping(azureDataForKeyWrapping);
        const encryptedTencentKeyWrapping: string | null = await tencentKms.encryptWithKeyWrapping(tencentDataForKeyWrapping);

        let decryptedGoogle: string | null = "google encrypt failed";
        let decryptedAws: string | null = "aws encrypt failed";
        let decryptedAzure: string | null = "azure encrypt failed";
        let decryptedTencent: string | null = "tencent encrypt failed";

        let decryptedKeyWrappingGoogle: string | null = "google encrypt key wrapping failed";
        let decryptedKeyWrappingAws: string | null = "aws encrypt key wrapping failed";
        let decryptedKeyWrappingAzure: string | null = "azure encrypt key wrapping failed";
        let decryptedKeyWrappingTencent: string | null = "tencent encrypt key wrapping failed";

        if (encryptedGoogleData) {
            decryptedGoogle = await googleKms.decrypt(encryptedGoogleData);
            if (!decryptedGoogle) {
                decryptedGoogle = "google decrypt failed";
            }
        }

        if (encryptedAwsData) {
            decryptedAws = await awsKms.decrypt(encryptedAwsData);
            if (!decryptedAws) {
                decryptedAws = "aws decrypt failed";
            }
        }

        if (encryptedAzureData) {
            decryptedAzure = await azureKms.decrypt(encryptedAzureData);
            if (!decryptedAzure) {
                decryptedAzure = "azure decrypt failed";
            }
        }

        if (encryptedTencentData) {
            decryptedTencent = await tencentKms.decrypt(encryptedTencentData);
            if (!decryptedTencent) {
                decryptedTencent = "tencent decrypt failed";
            }
        }

        if (encryptedGoogleKeyWrapping) {
            decryptedKeyWrappingGoogle = await googleKms.decryptWithKeyWrapping(encryptedGoogleKeyWrapping);
            if (!decryptedKeyWrappingGoogle) {
                decryptedKeyWrappingGoogle = "google decrypt with key wrapping failed";
            }
        }

        if (encryptedAwsKeyWrapping) {
            decryptedKeyWrappingAws = await awsKms.decryptWithKeyWrapping(encryptedAwsKeyWrapping);
            if (!decryptedKeyWrappingAws) {
                decryptedKeyWrappingAws = "aws decrypt with key wrapping failed";
            }
        }

        if (encryptedAzureKeyWrapping) {
            decryptedKeyWrappingAzure = await azureKms.decryptWithKeyWrapping(encryptedAzureKeyWrapping);
            if (!decryptedKeyWrappingAzure) {
                decryptedKeyWrappingAzure = "azure decrypt with key wrapping failed";
            }
        }

        if (encryptedTencentKeyWrapping) {
            decryptedKeyWrappingTencent = await tencentKms.decryptWithKeyWrapping(encryptedTencentKeyWrapping);
            if (!decryptedKeyWrappingTencent) {
                decryptedKeyWrappingTencent = "tencent decrypt with key wrapping failed";
            }
        }

        const buff: Buffer = Buffer.from("presumably large amount of data in a buffer");
        const encBuffer: Buffer | null = await azureKms.encryptBuffer(buff);
        console.log("encrypted buffer from azure: ", encBuffer?.toString());
        if (encBuffer) {
            const decBuff: Buffer | null = await azureKms.decryptBuffer(encBuffer);
            console.log("decBuffer: ", decBuff?.toString());
        }
        else {
            console.log("failed to encrypt buffer with azure");
        }

        return {
            googleData,
            awsData,
            azureData,
            tencentData,
            encryptedGoogleData,
            encryptedAwsData,
            encryptedAzureData,
            encryptedTencentData,
            decryptedGoogle,
            decryptedAws,
            decryptedAzure,
            decryptedTencent,
            encryptedGoogleKeyWrapping,
            decryptedKeyWrappingGoogle,
            encryptedAwsKeyWrapping,
            encryptedTencentKeyWrapping,
            decryptedKeyWrappingAws,
            encryptedAzureKeyWrapping,
            decryptedKeyWrappingAzure,
            decryptedKeyWrappingTencent
        };

    }
}

