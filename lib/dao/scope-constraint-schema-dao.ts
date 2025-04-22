//import { ScopeConstraintSchema } from "@/graphql/generated/graphql-types";

abstract class ScopeConstraintSchemaDao {

    // abstract getScopeConstraintSchemas() : Promise<Array<ScopeConstraintSchema>>;

    // abstract getScopeConstraintSchemaById(scopeConstraintSchemaId: string): Promise<ScopeConstraintSchema | null>;

    // abstract createScopeConstraintSchema(scopeConstraintSchema: ScopeConstraintSchema): Promise<ScopeConstraintSchema>;

    // abstract updateScopeConstraintSchema(scopeConstraintSchema: ScopeConstraintSchema): Promise<ScopeConstraintSchema>;

    abstract deleteScopeConstraintSchema(scopeConstraintSchemaId: string): Promise<void>;
    
}

export default ScopeConstraintSchemaDao;