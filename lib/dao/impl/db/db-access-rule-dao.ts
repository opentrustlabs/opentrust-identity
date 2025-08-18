import { AccessRule } from "@/graphql/generated/graphql-types";
import AccessRuleDao from "../../access-rule-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Sequelize } from "sequelize";
import AccessRuleEntity from "@/lib/entities/access-rule-entity";

class DBAccessRuleDao extends AccessRuleDao {

    public async getAccessRules(tenantId?: string): Promise<Array<AccessRule>> {

        const sequelize: Sequelize = await DBDriver.getConnection();
        // @typescript-eslint/no-explicit-any
        const whereParams: any = {};
        if(tenantId){
            whereParams.tenantId = tenantId
        };

        const arr: Array<AccessRuleEntity> = await sequelize.models.accessRule.findAll({
            where: whereParams
        });

        return Promise.resolve(arr.map(
            (entity: AccessRuleEntity) => {
                return this.entityToModel(entity);
            }
        ));
    }

    public async getAccessRuleById(accessRuleId: string): Promise<AccessRule | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: AccessRuleEntity | null = await sequelize.models.accessRule.findOne({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.accessRule.create(accessRule);        
        return Promise.resolve(accessRule);
    }

    public async updateAccessRule(accessRule: AccessRule): Promise<AccessRule> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.accessRule.update(accessRule, {
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