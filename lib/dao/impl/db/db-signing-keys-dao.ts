import { SigningKey } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import SigningKeyEntity from "@/lib/entities/signing-key-entity";
import { SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Sequelize } from "sequelize";

class DBSigningKeysDao extends SigningKeysDao {

    
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantid = tenantId;
        }
        const entities: Array<SigningKeyEntity> = await sequelize.models.signingKey.findAll({
            where: queryParams,
            order: [
                ["keyName", "ASC"]
            ]
        });
        return Promise.resolve(entities.map(m => this.entityToModel(m)));
    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: SigningKeyEntity | null = await sequelize.models.signingKey.findOne({
            where: {
                keyId: keyId
            }
        });

        return entity ? Promise.resolve(this.entityToModel(entity)) : Promise.resolve(null);
    }
 
    protected entityToModel(entity: SigningKeyEntity): SigningKey {

        const key: SigningKey = {
            expiresAtMs: entity.getDataValue("expiresAtMs"),
            keyId: entity.getDataValue("keyId"),
            keyName: entity.getDataValue("keyName"),
            keyType: entity.getDataValue("keyType"),
            keyUse: entity.getDataValue("keyUse"),
            privateKeyPkcs8: Buffer.from(entity.getDataValue("privateKeyPkcs8") || "").toString("utf-8"),
            status: entity.getDataValue("status"),
            tenantId: entity.getDataValue("tenantId"),
            certificate: Buffer.from(entity.getDataValue("certificate") || "").toString("utf-8"),
            password: entity.getDataValue("password"),
            publicKey: Buffer.from(entity.getDataValue("publicKey") || "").toString("utf-8"),
            markForDelete: entity.getDataValue("markForDelete"),
            createdAtMs: entity.getDataValue("createdAtMs")
        }
        
        return key;
    }

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.signingKey.create(key);        
        return Promise.resolve(key);
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.signingKey.update(key, {
            where: {
                keyId: key.keyId
            }
        }); 
        return Promise.resolve(key);
    }

    public async revokeSigningKey(keyId: string): Promise<void> {
        const key: SigningKey | null = await this.getSigningKeyById(keyId);
        if(key){
            key.status = SIGNING_KEY_STATUS_REVOKED;
            const sequelize: Sequelize = await DBDriver.getConnection();
            await sequelize.models.signingKey.update(key, {
                where: {
                    keyId: key.keyId
                }
            }); 
        }
        return Promise.resolve();
    }

    public async deleteSigningKey(keyId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.contact.destroy({
            where: {
                objectid: keyId
            }
        });

        await sequelize.models.signingKey.destroy({
            where: {
                keyId: keyId
            }
        });
        return Promise.resolve();
    }

    
}

export default DBSigningKeysDao;