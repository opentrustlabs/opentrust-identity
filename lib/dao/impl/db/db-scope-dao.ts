import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";
import ScopeEntity from "@/lib/entities/scope-entity";
import TenantAvailableScopeEntity from "@/lib/entities/tenant-available-scope-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";

class DBScopeDao extends ScopeDao {

    public async getTenantAvailableScope(tenantId?: String): Promise<Array<TenantAvailableScope>> {
        throw new Error("Method not implemented.");
    }
    public async getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        throw new Error("Method not implemented.");
    }
    public async getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>> {
        throw new Error("Method not implemented.");
    }
    public async assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel> {
        throw new Error("Method not implemented.");
    }
    public async removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public async getUserScopeRels(userId: string): Promise<Array<UserScopeRel>> {
        throw new Error("Method not implemented.");
    }
    public async assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel> {
        throw new Error("Method not implemented.");
    }
    public async removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getScope(tenantId?: string): Promise<Array<Scope>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        if(tenantId){
            const queryParams: any = {};
            const rels = await this.getTenantScopeRel(tenantId);
            const scopeIds = rels.map(r => r.scopeId);
            const resultList: Array<ScopeEntity> = await sequelize.models.scope.findAll({
                where: {
                    scopeId: {[Op.in]: scopeIds}
                }
            });
            return resultList.map(e => e.dataValues);
        }
        else{
            const resultList: Array<ScopeEntity> = await sequelize.models.scope.findAll();
            return resultList.map(e => e.dataValues);
        }
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: ScopeEntity | null = await sequelize.models.scope.findOne({
            where: {scopeId: scopeId}
        });

        return entity ? Promise.resolve(entity.dataValues as Scope) : Promise.resolve(null);
    }

    public async getScopeByScopeName(scopeName: string): Promise<Scope | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: ScopeEntity | null = await sequelize.models.scope.findOne({
            where: {scopeName: scopeName}
        });

        return entity ? Promise.resolve(entity.dataValues as Scope) : Promise.resolve(null);
    }

    public async createScope(scope: Scope): Promise<Scope> {
        const sequelize: Sequelize = await DBDriver.getConnection();        
        await sequelize.models.scope.create(scope);
        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.scope.update(scope, {
            where: {
                scopeId: scope.scopeId
            }
        });
        return Promise.resolve(scope);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        
        // TODO
        // REMOVE OTHER RELATINSHIPS
        return Promise.resolve();
    }

    public async getTenantScopeRel(tenantId?: string): Promise<Array<TenantAvailableScope>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        
        if(tenantId){
            const entities: Array<TenantAvailableScopeEntity> = await sequelize.models.tenantAvailableScope.findAll({
                where: {tenantId: tenantId}
            });
            return entities.map(e => e.dataValues);
        }
        else{
            const entities: Array<TenantAvailableScopeEntity> = await sequelize.models.tenantAvailableScope.findAll({
                
            });
            return entities.map(e => e.dataValues);
        }
    }

    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        const model: TenantAvailableScope = {tenantId, scopeId, accessRuleId };
        await sequelize.models.tenantAvailableScope.create(model);
        return Promise.resolve(model);
    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantAvailableScope.destroy({
            where: {
                tenantId: tenantId,
                scopeId: scopeId
            }
        });
        
        return Promise.resolve();
    }

    // clientScopeRel
    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();      

        const model: ClientScopeRel ={
            tenantId: tenantId,
            scopeId: scopeId,
            clientId: clientId
        };
        await sequelize.models.clientScopeRel.create(model);
        return Promise.resolve(model);
    }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        
        await sequelize.models.clientScopeRel.destroy({
            where: {
                tenantId: tenantId,
                clientId: clientId,
                scopeId: scopeId
            }
        });
        return Promise.resolve();
    }

}

export default DBScopeDao;