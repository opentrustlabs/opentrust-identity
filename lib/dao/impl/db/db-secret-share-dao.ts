import { SecretShare } from "@/graphql/generated/graphql-types";
import SecretShareDao, { SecretShareLookupType } from "../../secret-share-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";
import SecretShareEntity from "@/lib/entities/secret-share-entity";


class DBSecretShareDao extends SecretShareDao {

    public async getSecretShareBy(value: string, type: SecretShareLookupType): Promise<SecretShare | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const whereParams: any = type === "id" ? {sharedSecretId: value} : {otp: value};
        const entity: SecretShareEntity | null = await sequelize.models.secretShare.findOne({
            where: whereParams
        });
        return entity ? entity.dataValues : null;
        
    }

    public async createSecretShare(secretShare: SecretShare): Promise<SecretShare> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.secretShare.create(secretShare);
        return secretShare;
    }

    public async deleteSecretShare(secretShareId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.secretShare.destroy({
            where: {
                secretShareId: secretShareId
            }
        });
        return;
    }

    public async deleteExpiredData(): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.secretShare.destroy({
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