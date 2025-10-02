import { AccessRule } from "@/graphql/generated/graphql-types";
import AccessRuleDao from "../../access-rule-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import AccessRuleEntity from "@/lib/entities/access-rule-entity";

class DBAccessRuleDao extends AccessRuleDao {

    public async getAccessRules(tenantId?: string): Promise<Array<AccessRule>> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereParams: any = {};
        if(tenantId){
            whereParams.tenantId = tenantId
        };

        const arr: Array<AccessRuleEntity> = await (await DBDriver.getInstance().getAccessRuleEntity()).findAll({
            where: whereParams
        });

        return Promise.resolve(arr.map(
            (entity: AccessRuleEntity) => {
                return this.entityToModel(entity);
            }
        ));
    }

    public async getAccessRuleById(accessRuleId: string): Promise<AccessRule | null> {

        const entity: AccessRuleEntity | null = await (await DBDriver.getInstance().getAccessRuleEntity()).findOne({
            where: {
                accessRuleId: accessRuleId
            }
        })
        if(!entity){
            return Promise.resolve(null);
        }
        return Promise.resolve(this.entityToModel(entity));
    }

    public async createAccessRule(accessRule: AccessRule): Promise<AccessRule> {

        await (await DBDriver.getInstance().getAccessRuleEntity()).create(accessRule);        
        return Promise.resolve(accessRule);
    }

    public async updateAccessRule(accessRule: AccessRule): Promise<AccessRule> {

        await (await DBDriver.getInstance().getAccessRuleEntity()).update(accessRule, {
            where: {
                accessRuleId: accessRule.accessRuleId
            }
        });
        return Promise.resolve(accessRule);
    }

    public async deleteAccessRule(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected entityToModel(entity: AccessRuleEntity): AccessRule {
        const model: AccessRule = {
            accessRuleDefinition: Buffer.from(entity.getDataValue("accessRuleDefinition")).toString("utf-8"),
            accessRuleId: entity.getDataValue("accessRuleId"),
            accessRuleName: entity.getDataValue("accessRuleName"),
            scopeAccessRuleSchemaId: entity.getDataValue("scopeAccessRuleSchemaId")
        };
        return model;
    }
    
}

export default DBAccessRuleDao;