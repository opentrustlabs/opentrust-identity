import { AccessRule } from "@/graphql/generated/graphql-types";

abstract class AccessRuleDao {

    abstract getAccessRules(tenant?: string): Promise<Array<AccessRule>>;

    abstract getAccessRuleById(accessRuleId: string): Promise<AccessRule | null>;

    abstract createAccessRule(accessRule: AccessRule): Promise<AccessRule>;

    abstract updateAccessRule(accessRule: AccessRule): Promise<AccessRule>;

    abstract deleteAccessRule(accessRuleId: string): Promise<void>;

}

export default AccessRuleDao;