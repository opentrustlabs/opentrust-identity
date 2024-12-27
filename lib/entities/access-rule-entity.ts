import { AccessRule } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";

class AccessRuleEntity {

    constructor(accessRule?: AccessRule){
        if(accessRule){
            this.accessRuleId = accessRule.accessRuleId;
            this.scopeId = accessRule.scopeId;
            this.accessrulename = accessRule.accessrulename;
            this.scopeConstraintSchemaId = accessRule.scopeConstraintSchemaId;
            this.accessRuleDefinition = Buffer.from(accessRule.accessRuleDefinition);
        }
    }
    __typename?: "AccessRule" | undefined;
    
    @PrimaryKey({fieldName: "accessruleid"})
    accessRuleId: string;

    @Property({fieldName: "scopeid"})
    scopeId: string;

    @Property({fieldName: "accessrulename"})
    accessrulename: string;

    @Property({fieldName: "scopeconstraintschemaid"})
    scopeConstraintSchemaId: string;

    @Property({fieldName: "accessruledefinition"})
    accessRuleDefinition: Buffer;
    
    public toModel(): AccessRule {
        const m: AccessRule = {
            accessRuleDefinition: this.accessRuleDefinition.toString("utf-8"),
            accessRuleId: this.accessRuleId,
            accessrulename: this.accessrulename,
            scopeConstraintSchemaId: this.scopeConstraintSchemaId,
            scopeId: this.scopeId,
            __typename: "AccessRule"
        }
        return m;
    }
        
}

export default AccessRuleEntity;