import ScopeConstraintSchemaDao from "@/lib/dao/scope-constraint-schema-dao";


class DBScopeConstraintSchemaDao extends ScopeConstraintSchemaDao {

    // public async getScopeConstraintSchemas(): Promise<Array<ScopeConstraintSchema>> {
    //     const em = connection.em.fork();
    //     const arr = await em.findAll(ScopeConstraintSchemaEntity);
    //     return Promise.resolve(arr.map(e => e.toModel()));
    // }

    // public async getScopeConstraintSchemaById(scopeConstraintSchemaId: string): Promise<ScopeConstraintSchema | null> {
    //     const em = connection.em.fork();
    //     const entity: ScopeConstraintSchemaEntity | null = await em.findOne(ScopeConstraintSchemaEntity, {scopeConstraintSchemaId: scopeConstraintSchemaId});
    //     return entity ? Promise.resolve(entity.toModel()) : Promise.resolve(null);
    // }

    // public async createScopeConstraintSchema(scopeConstraintSchema: ScopeConstraintSchema): Promise<ScopeConstraintSchema> {
    //     const em = connection.em.fork();
    //     const entity: ScopeConstraintSchemaEntity = new ScopeConstraintSchemaEntity(scopeConstraintSchema);
    //     await em.persistAndFlush(entity);
    //     return Promise.resolve(scopeConstraintSchema);
    // }

    // public async updateScopeConstraintSchema(scopeConstraintSchema: ScopeConstraintSchema): Promise<ScopeConstraintSchema> {
    //     const em = connection.em.fork();
    //     const entity: ScopeConstraintSchemaEntity = new ScopeConstraintSchemaEntity(scopeConstraintSchema);
    //     await em.upsert(entity);
    //     await em.flush();
    //     return Promise.resolve(scopeConstraintSchema);
    // }

    public async deleteScopeConstraintSchema(scopeConstraintSchemaId: string): Promise<void> {
        // TODO
        // REMOVE RELATIONSHIPS
        throw new Error("Method not implemented.");
    }

}

export default DBScopeConstraintSchemaDao;