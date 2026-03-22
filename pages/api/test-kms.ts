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

    const encryptedGoogleData: string | null = await googleKms.encrypt(googleData);
    const encryptedAwsData: string | null = await awsKms.encrypt(awsData);
    const encryptedAzureData: string | null = await azureKms.encrypt(azureData);

    let decryptedGoogle: string | null = "google encrypt failed";
    let decryptedAws: string | null = "aws encrypt failed";
    let decryptedAzure: string | null = "azure encrypt failed";

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
        decryptedAzure
    });

}
