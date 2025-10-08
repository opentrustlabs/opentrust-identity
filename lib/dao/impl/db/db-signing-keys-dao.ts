import { SigningKey } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import { SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import RDBDriver from "@/lib/data-sources/rdb";

class DBSigningKeysDao extends SigningKeysDao {

    
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantId = tenantId;
        }
        
        const signingKeysRepo = await RDBDriver.getInstance().getSigningKeyRepository();
        const results = await signingKeysRepo.find({
            where: queryParams,
            order: {
                keyName: "ASC"
            }
        });
        return results;
    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const signingKeysRepo = await RDBDriver.getInstance().getSigningKeyRepository();
        const result = await signingKeysRepo.findOne({
            where: {
                keyId: keyId
            }
        });
        return result;
    }
 

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        const signingKeysRepo = await RDBDriver.getInstance().getSigningKeyRepository();
        await signingKeysRepo.insert(key);
        return Promise.resolve(key);
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey>{
        const signingKeysRepo = await RDBDriver.getInstance().getSigningKeyRepository();
        // Do not update the certificate, private key, public key 
        await signingKeysRepo.update(
            {
                keyId: key.keyId
            },
            {
                keyName: key.keyName,
                markForDelete: key.markForDelete,
                keyStatus: key.keyStatus
            }
        );
        return Promise.resolve(key);
    }

    public async revokeSigningKey(keyId: string): Promise<void> {
        
        const key: SigningKey | null = await this.getSigningKeyById(keyId);
        if(key){
            key.keyStatus = SIGNING_KEY_STATUS_REVOKED;
            const signingKeysRepo = await RDBDriver.getInstance().getSigningKeyRepository();
            await signingKeysRepo.update(
                {
                    keyId: key.keyId
                },
                key
            );
        }
        return Promise.resolve();
    }

    public async deleteSigningKey(keyId: string): Promise<void> {        
        
        const contactRepo = await RDBDriver.getInstance().getContactRepository();
        await contactRepo.delete({
            objectid: keyId
        });

        const signingKeysRepo = await RDBDriver.getInstance().getSigningKeyRepository();
        await signingKeysRepo.delete({
            keyId: keyId
        });
        return Promise.resolve();
    }

    
}

export default DBSigningKeysDao;