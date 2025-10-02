import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";
import ScopeEntity from "@/lib/entities/scope-entity";
import TenantAvailableScopeEntity from "@/lib/entities/tenant-available-scope-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";
import AuthorizationGroupScopeRelEntity from "@/lib/entities/authorization-group-scope-rel-entity";
import UserScopeRelEntity from "@/lib/entities/user-scope-rel-entity";
import ClientScopeRelEntity from "@/lib/entities/client-scope-rel-entity";

class DBScopeDao extends ScopeDao {

    public async getTenantAvailableScope(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        return this.getTenantScopeRel(tenantId, scopeId);
    }

    public async getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        
        const arr: Array<ClientScopeRelEntity> = await (await DBDriver.getInstance().getClientScopeRelEntity()).findAll({
            where: {
                clientId: clientId
            }
        });
        return arr.map(
            (e: ClientScopeRelEntity) => e.dataValues
        )
    }

    public async getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>> {
        const arr: Array<AuthorizationGroupScopeRelEntity> = await (await DBDriver.getInstance().getAuthorizationGroupScopeRelEntity()).findAll({
            where: {
                groupId: authorizationGroupId
            }
        });
        return arr.map(
            (e: AuthorizationGroupScopeRelEntity) => e.dataValues
        );
    }
    public async assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel> {        
        const authorizationGroupScopeRel: AuthorizationGroupScopeRel = {
            groupId: authorizationGroupId,
            scopeId: scopeId,
            tenantId: tenantId
        }
        await (await DBDriver.getInstance().getAuthorizationGroupScopeRelEntity()).create(authorizationGroupScopeRel);
        return authorizationGroupScopeRel;
    }

    public async removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void> {
        await (await DBDriver.getInstance().getAuthorizationGroupScopeRelEntity()).destroy({
            where: {
                groupId: authorizationGroupId,
                scopeId: scopeId,
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async getUserScopeRels(userId: string, tenantId: string): Promise<Array<UserScopeRel>> {
        const arr: Array<UserScopeRelEntity> = await (await DBDriver.getInstance().getUserScopeRelEntity()).findAll({
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
        const userScopeRel: UserScopeRel = {
            scopeId: scopeId,
            tenantId: tenantId,
            userId: userId
        }
        await (await DBDriver.getInstance().getUserScopeRelEntity()).create(userScopeRel);
        return userScopeRel;
        
    }
    public async removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserScopeRelEntity()).destroy({
            where: {
                userId: userId,
                tenantId: tenantId,
                scopeId: scopeId
            }
        });

        return Promise.resolve();
    }

    public async getScope(tenantId?: string, scopeIds?: Array<string>): Promise<Array<Scope>> {        
        if(tenantId){            
            const rels = await this.getTenantScopeRel(tenantId);
            const scopeIds = rels.map(r => r.scopeId);
            const resultList: Array<ScopeEntity> = await (await DBDriver.getInstance().getScopeEntity()).findAll({
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
            const resultList: Array<ScopeEntity> = await (await DBDriver.getInstance().getScopeEntity()).findAll({
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
            const resultList: Array<ScopeEntity> = await (await DBDriver.getInstance().getScopeEntity()).findAll({
                order: [
                    ["scopeName", "ASC"]
                ]
            });
            return resultList.map(e => e.dataValues);
        }
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const entity: ScopeEntity | null = await (await DBDriver.getInstance().getScopeEntity()).findOne({
            where: {scopeId: scopeId}
        });

        return entity ? Promise.resolve(entity.dataValues as Scope) : Promise.resolve(null);
    }

    public async getScopeByScopeName(scopeName: string): Promise<Scope | null> {
        const entity: ScopeEntity | null = await (await DBDriver.getInstance().getScopeEntity()).findOne({
            where: {scopeName: scopeName}
        });

        return entity ? Promise.resolve(entity.dataValues as Scope) : Promise.resolve(null);
    }

    public async createScope(scope: Scope): Promise<Scope> {      
        await (await DBDriver.getInstance().getScopeEntity()).create(scope);
        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        await (await DBDriver.getInstance().getScopeEntity()).update(scope, {
            where: {
                scopeId: scope.scopeId
            }
        });
        return Promise.resolve(scope);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        const arr: Array<TenantAvailableScope> = await this.getTenantScopeRel(undefined, scopeId);
        for(let i = 0; i < arr.length; i++){
            await this.removeScopeFromTenant(arr[i].tenantId, scopeId);
        }
        await (await DBDriver.getInstance().getScopeEntity()).destroy({
            where: {
                scopeId: scopeId
            }
        });
        
        return Promise.resolve();
    }

    public async getTenantScopeRel(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {};
        if(tenantId){
            params.tenantId = tenantId;
        }
        if(scopeId){
            params.scopeId = scopeId;
        }
        if(tenantId || scopeId){
            const entities: Array<TenantAvailableScopeEntity> = await (await DBDriver.getInstance().getTenantAvailableScopeEntity()).findAll({
                where: params
            });
            return entities.map(e => e.dataValues);
        }
        else{
            const entities: Array<TenantAvailableScopeEntity> = await (await DBDriver.getInstance().getTenantAvailableScopeEntity()).findAll();
            return entities.map(e => e.dataValues);
        }
    }

    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope> {
        const model: TenantAvailableScope = {tenantId, scopeId, accessRuleId };
        await (await DBDriver.getInstance().getTenantAvailableScopeEntity()).create(model);
        return Promise.resolve(model);
    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {

        // Need to remove all of the scope from the users, clients, and authz groups too                
        await (await DBDriver.getInstance().getClientScopeRelEntity()).destroy({
            where: {
                tenantId: tenantId,
                scopeId: scopeId
            }
        });

        await (await DBDriver.getInstance().getAuthorizationGroupScopeRelEntity()).destroy({
            where: {        
                scopeId: scopeId,
                tenantId: tenantId
            }
        });

        await (await DBDriver.getInstance().getUserScopeRelEntity()).destroy({
            where: {
                tenantId: tenantId,
                scopeId: scopeId
            }
        });	

        await (await DBDriver.getInstance().getTenantAvailableScopeEntity()).destroy({
            where: {
                tenantId: tenantId,
                scopeId: scopeId
            }
        });
        
        return Promise.resolve();
    }

    // clientScopeRel
    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {

        const model: ClientScopeRel ={
            tenantId: tenantId,
            scopeId: scopeId,
            clientId: clientId
        };
        await (await DBDriver.getInstance().getClientScopeRelEntity()).create(model);
        return Promise.resolve(model);
    }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        
        await (await DBDriver.getInstance().getClientScopeRelEntity()).destroy({
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