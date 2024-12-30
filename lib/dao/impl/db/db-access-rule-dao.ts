import { AccessRule } from "@/graphql/generated/graphql-types";
import AccessRuleDao from "../../access-rule-dao";


class DBAccessRuleDao extends AccessRuleDao {

    getAccessRules(tenant?: string): Promise<Array<AccessRule>> {
        return Promise.resolve([]);
    }

    getAccessRuleById(accessRuleId: string): Promise<AccessRule | null> {
        return Promise.resolve(null);
        
    }
    createAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        throw new Error("Method not implemented.");
    }
    updateAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        throw new Error("Method not implemented.");
    }
    deleteAccessRule(accessRuleId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}

export default DBAccessRuleDao;