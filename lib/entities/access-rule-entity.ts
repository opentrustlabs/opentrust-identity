import type { AccessRule } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "access_rule"
})
class AccessRuleEntity {

    constructor(accessRule?: AccessRule){
        if(accessRule){
            this.accessRuleId = accessRule.accessRuleId;
            this.accessRuleName = accessRule.accessRuleName;
            this.scopeAccessRuleSchemaId = accessRule.scopeAccessRuleSchemaId;
            this.accessRuleDefinition = Buffer.from(accessRule.accessRuleDefinition);
        }
    }
    __typename?: "AccessRule" | undefined;
    
    @PrimaryKey({fieldName: "accessruleid"})
    accessRuleId: string;

    @Property({fieldName: "accessrulename"})
    accessRuleName: string;

    @Property({fieldName: "scopeconstraintschemaid"})
    scopeAccessRuleSchemaId: string;

    @Property({fieldName: "accessruledefinition"})
    accessRuleDefinition: Buffer;
    
    public toModel(): AccessRule {
        const m: AccessRule = {
            accessRuleDefinition: this.accessRuleDefinition.toString("utf-8"),
            accessRuleId: this.accessRuleId,
            accessRuleName: this.accessRuleName,
            scopeAccessRuleSchemaId: this.scopeAccessRuleSchemaId,
            __typename: "AccessRule"
        }
        return m;
    }
        
}

export default AccessRuleEntity;