import { SecretShare } from "@/graphql/generated/graphql-types";
import SecretShareDao, { SecretShareLookupType } from "../../secret-share-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { LessThan } from "typeorm";

class DBSecretShareDao extends SecretShareDao {

    public async getSecretShareBy(value: string, type: SecretShareLookupType): Promise<SecretShare | null> {
        
        const secretShareRepo = await RDBDriver.getInstance().getSecretShareRepository();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereParams: any = type === "id" ? {sharedSecretId: value} : {otp: value};
        const entity = await secretShareRepo.findOne({
            where: whereParams
        });
        return entity;
        
    }

    public async createSecretShare(secretShare: SecretShare): Promise<SecretShare> {
        const secretShareRepo = await RDBDriver.getInstance().getSecretShareRepository();
        await secretShareRepo.insert(secretShare);
        return secretShare;
    }

    public async deleteSecretShare(secretShareId: string): Promise<void> {
        const secretShareRepo = await RDBDriver.getInstance().getSecretShareRepository();
        await secretShareRepo.delete({
            secretShareId: secretShareId
        });
        return;
    }

    public async deleteExpiredData(): Promise<void>{
        const secretShareRepo = await RDBDriver.getInstance().getSecretShareRepository();
        await secretShareRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });
        return;
    }

}

export default DBSecretShareDao;