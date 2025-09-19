import { SecretShare } from "@/graphql/generated/graphql-types";
import SecretShareDao, { SecretShareLookupType } from "../../secret-share-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";
import SecretShareEntity from "@/lib/entities/secret-share-entity";


class DBSecretShareDao extends SecretShareDao {

    public async getSecretShareBy(value: string, type: SecretShareLookupType): Promise<SecretShare | null> {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereParams: any = type === "id" ? {sharedSecretId: value} : {otp: value};
        const entity: SecretShareEntity | null = await (await DBDriver.getInstance().getSecretShareEntity()).findOne({
            where: whereParams
        });
        return entity ? entity.dataValues : null;
        
    }

    public async createSecretShare(secretShare: SecretShare): Promise<SecretShare> {
        await (await DBDriver.getInstance().getSecretShareEntity()).create(secretShare);
        return secretShare;
    }

    public async deleteSecretShare(secretShareId: string): Promise<void> {
        await (await DBDriver.getInstance().getSecretShareEntity()).destroy({
            where: {
                secretShareId: secretShareId
            }
        });
        return;
    }

    public async deleteExpiredData(): Promise<void>{
        await (await DBDriver.getInstance().getSecretShareEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        return;
    }

}

export default DBSecretShareDao;