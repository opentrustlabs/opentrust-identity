import { AccessRule } from "@/graphql/generated/graphql-types";
import AccessRuleDao from "../../access-rule-dao";
import connection  from "@/lib/data-sources/db";
import AccessRuleEntity from "@/lib/entities/access-rule-entity";

class DBAccessRuleDao extends AccessRuleDao {

    public async getAccessRules(tenant?: string): Promise<Array<AccessRule>> {
        const em = connection.em.fork();
        const arr: Array<AccessRuleEntity> = await em.findAll(AccessRuleEntity);
        return Promise.resolve(arr.map(a => a.toModel()));
    }

    public async getAccessRuleById(accessRuleId: string): Promise<AccessRule | null> {
        const em = connection.em.fork();
        const entity: AccessRuleEntity | null = await em.findOne(AccessRuleEntity, {accessRuleId: accessRuleId});
        if(!entity){
            return Promise.resolve(null);
        }
        return Promise.resolve(entity.toModel());        
    }

    public async createAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        const em = connection.em.fork();
        const entity: AccessRuleEntity = new AccessRuleEntity(accessRule);
        await em.persistAndFlush(entity);
        return Promise.resolve(accessRule);
    }

    public async updateAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        const em = connection.em.fork();
        const entity: AccessRuleEntity = new AccessRuleEntity(accessRule);
        await em.upsert(entity);
        await em.flush();
        return Promise.resolve(accessRule);
    }

    public async deleteAccessRule(accessRuleId: string): Promise<void> {
        // TODO
        // DELETE RELATIONSHIPS
        throw new Error("Method not implemented.");
    }
    
}

export default DBAccessRuleDao;