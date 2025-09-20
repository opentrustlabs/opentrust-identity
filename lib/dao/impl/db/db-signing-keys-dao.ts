import { SigningKey } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import SigningKeyEntity from "@/lib/entities/signing-key-entity";
import { SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import DBDriver from "@/lib/data-sources/sequelize-db";

class DBSigningKeysDao extends SigningKeysDao {

    
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantid = tenantId;
        }
        // @ts-ignore
        const entities: Array<SigningKeyEntity> = await (await DBDriver.getInstance().getSigningKeyEntity()).findAll({
            where: queryParams,
            order: [
                ["keyName", "ASC"]
            ]
        });
        return Promise.resolve(entities.map(m => m.dataValues));
    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {

        const entity: SigningKeyEntity | null = await (await DBDriver.getInstance().getSigningKeyEntity()).findOne({
            where: {
                keyId: keyId
            }
        });

        return entity ? Promise.resolve(entity.dataValues) : Promise.resolve(null);
    }
 

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        
        await (await DBDriver.getInstance().getSigningKeyEntity()).create(key);
        return Promise.resolve(key);
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey>{

        // Do not update the certificate, private key, public key 
        await (await DBDriver.getInstance().getSigningKeyEntity()).update(
            {
                keyName: key.keyName,
                markForDelete: key.markForDelete,
                status: key.keyStatus
            },
            {
                where: {
                    keyId: key.keyId
                }
            }
        );
        return Promise.resolve(key);
    }

    public async revokeSigningKey(keyId: string): Promise<void> {
        const key: SigningKey | null = await this.getSigningKeyById(keyId);
        if(key){
            key.keyStatus = SIGNING_KEY_STATUS_REVOKED;
                        
            await (await DBDriver.getInstance().getSigningKeyEntity()).update(key, {
                where: {
                    keyId: key.keyId
                }
            }); 
        }
        return Promise.resolve();
    }

    public async deleteSigningKey(keyId: string): Promise<void> {        
        
        await (await DBDriver.getInstance().getContactEntity()).destroy({
            where: {
                objectid: keyId
            }
        });
        await (await DBDriver.getInstance().getSigningKeyEntity()).destroy({
            where: {
                keyId: keyId
            }
        });
        return Promise.resolve();
    }

    
}

export default DBSigningKeysDao;