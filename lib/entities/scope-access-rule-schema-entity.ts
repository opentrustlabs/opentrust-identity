import type { ScopeAccessRuleSchema } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "scope_access_rule_schema"
})
class ScopeAccessRuleSchemaEntity {

    constructor(scopeAccessRuleSchema?: ScopeAccessRuleSchema){
        if(scopeAccessRuleSchema){
            this.schemaVersion = scopeAccessRuleSchema.schemaVersion;
            this.scopeId = scopeAccessRuleSchema.scopeId;
            this.scopeAccessRuleSchemaId = scopeAccessRuleSchema.scopeAccessRuleSchemaId;
            this.scopeAccessRuleSchema = Buffer.from(scopeAccessRuleSchema.scopeAccessRuleSchema);
        }

    }
    __typename?: "ScopeAccessRuleSchema" | undefined;
    
    @PrimaryKey({fieldName: "scopeaccessruleschemaid"})
    scopeAccessRuleSchemaId: string;
    
    @Property({fieldName: "schemaversion"})
    schemaVersion: number;
    
    @Property({fieldName: "scopeid"})
    scopeId: string;
    
    @Property({fieldName: "scopeaccessruleschema"})
    scopeAccessRuleSchema: Buffer;

    public toModel(): ScopeAccessRuleSchema {
        const m: ScopeAccessRuleSchema = {
            __typename: "ScopeAccessRuleSchema",
            schemaVersion: this.schemaVersion,
            scopeAccessRuleSchemaId: this.scopeAccessRuleSchemaId,
            scopeId: this.scopeId,
            scopeAccessRuleSchema: this.scopeAccessRuleSchema.toString("utf-8"),
            
        }
        return m;
    }
    
}

export default ScopeAccessRuleSchemaEntity;