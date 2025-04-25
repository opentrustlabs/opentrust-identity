import { SigningKey, Contact } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import connection  from "@/lib/data-sources/db";
import SigningKeyEntity from "@/lib/entities/signing-key-entity";
import ContactEntity from "@/lib/entities/contact-entity";
import { CONTACT_TYPE_FOR_SIGNING_KEY, SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import { QueryOrder } from "@mikro-orm/core";

class DBSigningKeysDao extends SigningKeysDao {

    
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        const em = connection.em.fork();
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantid = tenantId;
        }
        const entities: Array<SigningKeyEntity> = await em.find(
            SigningKeyEntity, 
            queryParams,
            {
                orderBy: {
                    keyName: QueryOrder.ASC
                }
            }
        );
        const models = entities.map(
            e => e.toModel()
        );
        return Promise.resolve(models);
    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const em = connection.em.fork();
        const entity: SigningKeyEntity | null = await em.findOne(
            SigningKeyEntity, {
                keyId: keyId
            }
        );
        return entity ? Promise.resolve(entity.toModel()) : Promise.resolve(null);
    }

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        const em = connection.em.fork();
        const entity: SigningKeyEntity = new SigningKeyEntity(key);
        await em.persistAndFlush(entity);
        return Promise.resolve(key);
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey>{
        const em = connection.em.fork();
        const entity: SigningKeyEntity = new SigningKeyEntity(key);
        await em.upsert(entity);
        return Promise.resolve(key);
    }

    public async revokeSigningKey(keyId: string): Promise<void> {
        const key: SigningKey | null = await this.getSigningKeyById(keyId);
        if(key){
            key.status = SIGNING_KEY_STATUS_REVOKED;
            const em = connection.em.fork();
            const entity: SigningKeyEntity = new SigningKeyEntity(key);
            await em.upsert(entity);
            await em.flush()
        }
        return Promise.resolve();
    }

    public async deleteSigningKey(keyId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(SigningKeyEntity, {keyId: keyId});
        em.flush();
        return Promise.resolve();
    }

    
}

export default DBSigningKeysDao;