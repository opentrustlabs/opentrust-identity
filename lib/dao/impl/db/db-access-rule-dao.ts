import { AccessRule } from "@/graphql/generated/graphql-types";
import AccessRuleDao from "../../access-rule-dao";
import RDBDriver from "@/lib/data-sources/rdb";

class DBAccessRuleDao extends AccessRuleDao {

    public async getAccessRules(tenantId?: string): Promise<Array<AccessRule>> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereParams: any = {};
        if(tenantId){
            whereParams.tenantId = tenantId
        };

        const accessRuleRepo = await RDBDriver.getInstance().getAccessRuleRepository();
        const arr = await accessRuleRepo.find({
            where: whereParams
        });

        return arr;        
    }

    public async getAccessRuleById(accessRuleId: string): Promise<AccessRule | null> {
        const accessRuleRepo = await RDBDriver.getInstance().getAccessRuleRepository();
        const result = await accessRuleRepo.findOne({
            where: {
                accessRuleId: accessRuleId
            }
        });
        return result;
    }

    public async createAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        const accessRuleRepo = await RDBDriver.getInstance().getAccessRuleRepository();
        await accessRuleRepo.insert(accessRule);
        return Promise.resolve(accessRule);
    }

    public async updateAccessRule(accessRule: AccessRule): Promise<AccessRule> {

        const accessRuleRepo = await RDBDriver.getInstance().getAccessRuleRepository();
        await accessRuleRepo.update(
            {
                accessRuleId: accessRule.accessRuleId
            },
            accessRule
        );        
        return Promise.resolve(accessRule);
    }

    public async deleteAccessRule(): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    
}

export default DBAccessRuleDao;