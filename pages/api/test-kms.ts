import AWSKms from '@/lib/kms/aws-kms';
import AzureKms from '@/lib/kms/azure-kms';
import GoogleKms from '@/lib/kms/google-kms'
import Kms from '@/lib/kms/kms';
import type { NextApiRequest, NextApiResponse } from 'next'

const googleKms: Kms = new GoogleKms();
const awsKms: Kms = new AWSKms();
const azureKms: Kms = new AzureKms();


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const googleData = "google data";
    const awsData = "aws data";
    const azureData = "azure data";

    const googleDataForKeyWrapping = "google data for key wrapping";
    const awsDataForKeyWrapping = "aws data for key wrapping";
    const azureDataForKeyWrapping = "auzre data for key wrapping";

    const encryptedGoogleData: string | null = await googleKms.encrypt(googleData);
    const encryptedAwsData: string | null = await awsKms.encrypt(awsData);
    const encryptedAzureData: string | null = await azureKms.encrypt(azureData);

    const encryptedGoogleKeyWrapping: string | null = await googleKms.encryptWithKeyWrapping(googleDataForKeyWrapping);
    const encryptedAwsKeyWrapping: string | null = await awsKms.encryptWithKeyWrapping(awsDataForKeyWrapping);
    const encryptedAzureKeyWrapping: string | null = await azureKms.encryptWithKeyWrapping(azureDataForKeyWrapping);

    let decryptedGoogle: string | null = "google encrypt failed";
    let decryptedAws: string | null = "aws encrypt failed";
    let decryptedAzure: string | null = "azure encrypt failed";

    let decryptedKeyWrappingGoogle: string | null = "google encrypt key wrapping failed";
    let decryptedKeyWrappingAws: string | null = "aws encrypt key wrapping failed";
    let decryptedKeyWrappingAzure: string | null = "azure encrypt key wrapping failed";

    if(encryptedGoogleData){
        decryptedGoogle = await googleKms.decrypt(encryptedGoogleData);
        if(!decryptedGoogle){
            decryptedGoogle = "google decrypt failed";
        }
    }

    if(encryptedAwsData){
        decryptedAws = await awsKms.decrypt(encryptedAwsData);
        if(!decryptedAws){
            decryptedAws = "aws decrypt failed";
        }
    }
    
    if(encryptedAzureData){
        decryptedAzure = await azureKms.decrypt(encryptedAzureData);
        if(!decryptedAzure){
            decryptedAzure = "azure decrypt failed";
        }
    }

    if(encryptedGoogleKeyWrapping){
        decryptedKeyWrappingGoogle = await googleKms.decryptWithKeyWrapping(encryptedGoogleKeyWrapping);
        if(!decryptedKeyWrappingGoogle){
            decryptedKeyWrappingGoogle = "google decrypt with key wrapping failed";
        }
    }

    if(encryptedAwsKeyWrapping){
        decryptedKeyWrappingAws = await awsKms.decryptWithKeyWrapping(encryptedAwsKeyWrapping);
        if(!decryptedKeyWrappingAws){
            decryptedKeyWrappingAws = "aws decrypt with key wrapping failed";
        }
    }

    if(encryptedAzureKeyWrapping){
        decryptedKeyWrappingAzure = await azureKms.decryptWithKeyWrapping(encryptedAzureKeyWrapping);
        if(!decryptedKeyWrappingAzure){
            decryptedKeyWrappingAzure = "azure decrypt with key wrapping failed";
        }
    }

    const buff: Buffer = Buffer.from("presumably large amount of data in a buffer");
    const encBuffer: Buffer | null = await azureKms.encryptBuffer(buff);
    console.log("encrypted buffer from azure: ", encBuffer?.toString());
    if(encBuffer){
        const decBuff: Buffer | null = await azureKms.decryptBuffer(encBuffer);
        console.log("decBuffer: ", decBuff?.toString());
    }
    else{
        console.log("failed to encrypt buffer with azure");
    }


    return res.json({
        googleData,
        awsData,
        azureData,
        encryptedGoogleData,
        encryptedAwsData,
        encryptedAzureData,
        decryptedGoogle,
        decryptedAws,
        decryptedAzure,
        encryptedGoogleKeyWrapping,
        decryptedKeyWrappingGoogle,
        encryptedAwsKeyWrapping,
        decryptedKeyWrappingAws,
        encryptedAzureKeyWrapping,
        decryptedKeyWrappingAzure
    });

}
