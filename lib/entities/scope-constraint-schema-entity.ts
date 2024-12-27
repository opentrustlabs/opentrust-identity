import { ScopeConstraintSchema } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class ScopeConstraintSchemaEntity {

    constructor(scopeConstraintSchema?: ScopeConstraintSchema){
        if(scopeConstraintSchema){
            this.schemaVersion = scopeConstraintSchema.schemaVersion;
            this.scopeId = scopeConstraintSchema.scopeId;
            this.scopeConstraintSchemaId = scopeConstraintSchema.scopeConstraintSchemaId;
            this.scopeconstraintschemaname = scopeConstraintSchema.scopeconstraintschemaname;
            this.scopeconstraintschema = Buffer.from(scopeConstraintSchema.scopeconstraintschema);
        }

    }
    __typename?: "ScopeConstraintSchema" | undefined;
    
    @PrimaryKey({fieldName: "scopeconstraintschemaid"})
    scopeConstraintSchemaId: string;
    
    @Property({fieldName: "schemaversion"})
    schemaVersion: number;
    
    @Property({fieldName: "scopeconstraintschemaname"})
    scopeconstraintschemaname: string;
    
    @Property({fieldName: "scopeid"})
    scopeId: string;
    
    @Property({fieldName: "scopeconstraintschema"})
    scopeconstraintschema: Buffer;

    public toModel(): ScopeConstraintSchema{
        const m: ScopeConstraintSchema = {
            __typename: "ScopeConstraintSchema",
            schemaVersion: this.schemaVersion,
            scopeConstraintSchemaId: this.scopeConstraintSchemaId,
            scopeId: this.scopeId,
            scopeconstraintschema: this.scopeconstraintschema.toString("utf-8"),
            scopeconstraintschemaname: this.scopeconstraintschemaname
        }
        return m;
    }
    
}

export default ScopeConstraintSchemaEntity;