import { SecretShare } from "@/graphql/generated/graphql-types";
import SecretShareDao, { SecretShareLookupType } from "../../secret-share-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";


class CassandraSecretShareDao extends SecretShareDao {

    /*
    "secretshareid": "secretShareId",
			"objectid": "objectId",
			"objectype": "secretShareObjectType",
			"otp": "otp",
			"expiresatms": "expiresAtMs"
        }
    */

    public async getSecretShareBy(value: string, type: SecretShareLookupType): Promise<SecretShare | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("secret_share");
        if(type === "id"){
            return mapper.get({
                secretShareId: value
            })
        }
        else {
            return mapper.get({
                otp: value
            })
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
                secretShareId: secretShareId,
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