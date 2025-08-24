import Kms from "./kms";


/**
 * This is for databases which have their own way of performing column-level encryption
 * on data (by integrating with an HSM), or for use in a development environment 
 * where no key management service is available. 
 */
class NoOpKms  extends Kms {

    public async encrypt(data: string): Promise<string | null> {
        return data;
    }
    
    public async encryptBuffer(data: Buffer): Promise<Buffer | null> {
        return data;
    }

    public async decrypt(data: string): Promise<string | null> {
        return data;
    }

    public async decryptBuffer(data: Buffer): Promise<Buffer | null> {
        return data;
    }

}

export default NoOpKms;