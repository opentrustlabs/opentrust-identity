import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";
import ScopeEntity from "@/lib/entities/scope-entity";
import TenantAvailableScopeEntity from "@/lib/entities/tenant-available-scope-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";
import AuthorizationGroupScopeRelEntity from "@/lib/entities/authorization-group-scope-rel-entity";
import UserScopeRelEntity from "@/lib/entities/user-scope-rel-entity";
import ClientScopeRelEntity from "@/lib/entities/client-scope-rel-entity";

class DBScopeDao extends ScopeDao {

    public async getTenantAvailableScope(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        return this.getTenantScopeRel(tenantId, scopeId);
    }

    public async getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<ClientScopeRelEntity> = await sequelize.models.clientScopeRel.findAll({
            where: {
                clientId: clientId
            }
        });
        return arr.map(
            (e: ClientScopeRelEntity) => e.dataValues
        )
    }

    public async getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<AuthorizationGroupScopeRelEntity> = await sequelize.models.authorizationGroupScopeRel.findAll({
            where: {
                groupId: authorizationGroupId
            }
        });
        return arr.map(
            (e: AuthorizationGroupScopeRelEntity) => e.dataValues
        );
    }
    public async assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const authorizationGroupScopeRel: AuthorizationGroupScopeRel = {
            groupId: authorizationGroupId,
            scopeId: scopeId,
            tenantId: tenantId
        }
        await sequelize.models.authorizationGroupScopeRel.create(authorizationGroupScopeRel);
        return authorizationGroupScopeRel;
    }

    public async removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationGroupScopeRel.destroy({
            where: {
                groupId: authorizationGroupId,
                scopeId: scopeId,
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async getUserScopeRels(userId: string, tenantId: string): Promise<Array<UserScopeRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<UserScopeRelEntity> = await sequelize.models.userScopeRel.findAll({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return arr.map(
            (e: UserScopeRelEntity) => e.dataValues
        )        
    }


    public async assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const userScopeRel: UserScopeRel = {
            scopeId: scopeId,
            tenantId: tenantId,
            userId: userId
        }
        await sequelize.models.userScopeRel.create(userScopeRel);
        return userScopeRel;
        
    }
    public async removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userScopeRel.destroy({
            where: {
                userId: userId,
                tenantId: tenantId,
                scopeId: scopeId
            }
        });

        return Promise.resolve();
    }

    public async getScope(tenantId?: string, scopeIds?: Array<string>): Promise<Array<Scope>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        if(tenantId){            
            const rels = await this.getTenantScopeRel(tenantId);
            const scopeIds = rels.map(r => r.scopeId);
            const resultList: Array<ScopeEntity> = await sequelize.models.scope.findAll({
                where: {
                    scopeId: {[Op.in]: scopeIds}
                },
                order: [
                    ["scopeName", "ASC"]
                ]
            });
            return resultList.map(e => e.dataValues);
        }
        else if(scopeIds){
            const resultList: Array<ScopeEntity> = await sequelize.models.scope.findAll({
                where: {
                    scopeId: {[Op.in]: scopeIds}
                },
                order: [
                    ["scopeName", "ASC"]
                ]
            });
            return resultList.map(e => e.dataValues);
        }
        else{
            const resultList: Array<ScopeEntity> = await sequelize.models.scope.findAll({
                order: [
                    ["scopeName", "ASC"]
                ]
            });
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

    public async getTenantScopeRel(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const params: any = {};
        if(tenantId){
            params.tenantId = tenantId;
        }
        if(scopeId){
            params.scopeId = scopeId;
        }
        if(tenantId || scopeId){
            const entities: Array<TenantAvailableScopeEntity> = await sequelize.models.tenantAvailableScope.findAll({
                where: params
            });
            return entities.map(e => e.dataValues);
        }
        else{
            const entities: Array<TenantAvailableScopeEntity> = await sequelize.models.tenantAvailableScope.findAll();
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

        // Need to remove all of the scope from the users, clients, and authz groups too                
        await sequelize.models.clientScopeRel.destroy({
            where: {
                tenantId: tenantId,
                scopeId: scopeId
            }
        });

        await sequelize.models.authorizationGroupScopeRel.destroy({
            where: {        
                scopeId: scopeId,
                tenantId: tenantId
            }
        });

        await sequelize.models.userScopeRel.destroy({
            where: {
                tenantId: tenantId,
                scopeId: scopeId
            }
        });	

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