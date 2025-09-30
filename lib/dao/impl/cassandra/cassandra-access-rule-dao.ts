import { AccessRule } from "@/graphql/generated/graphql-types";
import AccessRuleDao from "../../access-rule-dao";


class CassandraAccessRuleDao extends AccessRuleDao {

    public async getAccessRules(tenant?: string): Promise<Array<AccessRule>> {
        if(tenant){
            console.log(tenant);
        }
        return [];
    }

    public async getAccessRuleById(accessRuleId: string): Promise<AccessRule | null> {
        console.log(accessRuleId);
        return null;
    }

    public async createAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        return accessRule;
    }

    public async updateAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        return accessRule;
    }

    public async deleteAccessRule(accessRuleId: string): Promise<void> {
        console.log(accessRuleId);
    }

}

export default CassandraAccessRuleDao;