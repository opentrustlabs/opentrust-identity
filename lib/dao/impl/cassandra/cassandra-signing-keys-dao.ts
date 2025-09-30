import { SigningKey } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { types } from "cassandra-driver";

class CassandraSigningKeysDao extends SigningKeysDao {

    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("signing_key");
        if(tenantId){
            const results = await mapper.find({
                tenantId: tenantId
            });
            return results.toArray();
        }
        else{
            const results = await mapper.findAll();
            return results.toArray();
        }

    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("signing_key");
        const results: Array<SigningKey> = (await mapper.find({keyId: keyId}, {limit: 1})).toArray();
        if(results && results.length > 0){
            return results[0];
        }
        else{
            return null;
        }        
    }

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("signing_key");
        await mapper.insert(key);
        return key;
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("signing_key");
        await mapper.update(key);
        return key;
    }

    public async deleteSigningKey(keyId: string): Promise<void> {
        const key: SigningKey | null = await this.getSigningKeyById(keyId);
        if(key){
            const mapper = await CassandraDriver.getInstance().getModelMapper("signing_key");
            await mapper.remove({
                keyId: types.Uuid.fromString(key.keyId),
                tenantId: types.Uuid.fromString(key.tenantId)
            });
        }
        return;
    }

}

export default CassandraSigningKeysDao;