import { SigningKey } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import SigningKeyEntity from "@/lib/entities/signing-key-entity";
import { SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Sequelize } from "sequelize";

class DBSigningKeysDao extends SigningKeysDao {

    
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
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
        const models = entities.map(
            e => e.dataValues
        );
        return Promise.resolve(models);
    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: SigningKeyEntity | null = await sequelize.models.signingKey.findOne({
            where: {
                keyId: keyId
            }
        });
        return entity ? Promise.resolve(entity.dataValues) : Promise.resolve(null);
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
        await sequelize.models.signingKey.destroy({
            where: {
                keyId: keyId
            }
        });
        return Promise.resolve();
    }

    
}

export default DBSigningKeysDao;