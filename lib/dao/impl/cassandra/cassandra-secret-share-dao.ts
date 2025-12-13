import { SecretShare } from "@/graphql/generated/graphql-types";
import SecretShareDao, { SecretShareLookupType } from "../../secret-share-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { types } from "cassandra-driver";

class CassandraSecretShareDao extends SecretShareDao {

    public async getSecretShareBy(value: string, type: SecretShareLookupType): Promise<SecretShare | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("secret_share");
        if(type === "id"){
            const results = (await mapper.find({
                secretShareId: value
            })).toArray();
            if(results.length > 0){
                return results[0];
            }
            else{
                return null;
            }
        }
        else {
            const results = (await mapper.find({
                otp: value
            })).toArray();
            if(results.length > 0){
                return results[0];
            }
            else{
                return null;
            }
        }
    }

    public async createSecretShare(secretShare: SecretShare): Promise<SecretShare> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("secret_share");        
        const ttlSeconds = Math.floor( (secretShare.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(secretShare, {ttl: ttlSeconds});
        return secretShare;
    }

    public async deleteSecretShare(secretShareId: string): Promise<void> {
        const secretShare: SecretShare | null = await this.getSecretShareBy(secretShareId, "id");
        if(secretShare){
            const mapper = await CassandraDriver.getInstance().getModelMapper("secret_share");
            await mapper.remove({
                secretShareId: types.Uuid.fromString(secretShareId),
                otp: secretShare.otp
            });
        }
        return;
    }

    public async deleteExpiredData(): Promise<void> {
        // NO OP
        // Since the data is inserted with a TTL value
    }

}

export default CassandraSecretShareDao;