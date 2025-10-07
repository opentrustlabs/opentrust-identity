import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { In } from "typeorm";

class DBScopeDao extends ScopeDao {

    public async getTenantAvailableScope(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        return this.getTenantScopeRel(tenantId, scopeId);
    }

    public async getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        const clientScopeRelRepo = await RDBDriver.getInstance().getClientScopeRelRepository();
        const arr = await clientScopeRelRepo.find({
            where: {
                clientId: clientId
            }
        });
        return arr;
    }

    public async getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>> {
        const authzGroupScopeRelRepo = await RDBDriver.getInstance().getAuthorizationGroupScopeRelRepository();
        const arr = await authzGroupScopeRelRepo.find({
            where: {
                groupId: authorizationGroupId
            }
        });
        return arr;
    }

    public async assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel> {        
        const authorizationGroupScopeRel: AuthorizationGroupScopeRel = {
            groupId: authorizationGroupId,
            scopeId: scopeId,
            tenantId: tenantId
        }
        const authzGroupScopeRelRepo = await RDBDriver.getInstance().getAuthorizationGroupScopeRelRepository();
        await authzGroupScopeRelRepo.insert(authorizationGroupScopeRel);
        return authorizationGroupScopeRel;
    }

    public async removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void> {
        const authzGroupScopeRelRepo = await RDBDriver.getInstance().getAuthorizationGroupScopeRelRepository();
        await authzGroupScopeRelRepo.delete({
            groupId: authorizationGroupId,
            scopeId: scopeId,
            tenantId: tenantId
        });
        return Promise.resolve();
    }

    public async getUserScopeRels(userId: string, tenantId: string): Promise<Array<UserScopeRel>> {
        const userScopeRelRepo = await RDBDriver.getInstance().getUserScopeRelRepository();
        const arr = await userScopeRelRepo.find({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return arr;      
    }


    public async assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel> {
        const userScopeRel: UserScopeRel = {
            scopeId: scopeId,
            tenantId: tenantId,
            userId: userId
        }
        const userScopeRelRepo = await RDBDriver.getInstance().getUserScopeRelRepository();
        await userScopeRelRepo.insert(userScopeRel)
        return userScopeRel;
        
    }
    public async removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        const userScopeRelRepo = await RDBDriver.getInstance().getUserScopeRelRepository();
        await userScopeRelRepo.delete({
            userId: userId,
            tenantId: tenantId,
            scopeId: scopeId
        });

        return Promise.resolve();
    }

    public async getScope(tenantId?: string, scopeIds?: Array<string>): Promise<Array<Scope>> {   
        const scopeRepo = await RDBDriver.getInstance().getScopeRepository();

        if(tenantId){            
            const rels = await this.getTenantScopeRel(tenantId);
            const scopeIds = rels.map(r => r.scopeId);
            const resultList = await scopeRepo.find({
                where: {
                    scopeId: In(scopeIds)
                },
                order: {
                    scopeName: "ASC"
                }
            });
            return resultList;
        }
        else if(scopeIds){
            
            const resultList = await scopeRepo.find({
                where: {
                    scopeId: In(scopeIds)
                },
                order: {
                    scopeName: "ASC"
                }
            });
            return resultList
        }
        else{
            const resultList = await scopeRepo.find({
                order: {
                    scopeName: "ASC"
                }
            });
            return resultList
        }
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const scopeRepo = await RDBDriver.getInstance().getScopeRepository();
        return scopeRepo.findOne({
            where: {
                scopeId: scopeId
            }
        });
    }

    public async getScopeByScopeName(scopeName: string): Promise<Scope | null> {
        const scopeRepo = await RDBDriver.getInstance().getScopeRepository();
        const entity = await scopeRepo.findOne({
            where: {scopeName: scopeName}
        });
        return entity;
    }

    public async createScope(scope: Scope): Promise<Scope> {   
        const scopeRepo = await RDBDriver.getInstance().getScopeRepository();
        await scopeRepo.insert(scope);
        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        const scopeRepo = await RDBDriver.getInstance().getScopeRepository();
        await scopeRepo.update(
            {
                scopeId: scope.scopeId
            },
            scope
        );
        return Promise.resolve(scope);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        const arr: Array<TenantAvailableScope> = await this.getTenantScopeRel(undefined, scopeId);
        for(let i = 0; i < arr.length; i++){
            await this.removeScopeFromTenant(arr[i].tenantId, scopeId);
        }

        const scopeRepo = await RDBDriver.getInstance().getScopeRepository();
        await scopeRepo.delete({
            scopeId: scopeId
        });        
        return Promise.resolve();
    }

    public async getTenantScopeRel(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        
        const tenantAvailableScopeRelRepo = await RDBDriver.getInstance().getTenantAvailableScopeRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {};
        if(tenantId){
            params.tenantId = tenantId;
        }
        if(scopeId){
            params.scopeId = scopeId;
        }
        if(tenantId || scopeId){
            const results = await tenantAvailableScopeRelRepo.find({
                where: params
            });
            return results;
        }
        else{
            const results = await tenantAvailableScopeRelRepo.find();
            return results;
        }
    }

    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope> {
        const tenantAvailableScopeRelRepo = await RDBDriver.getInstance().getTenantAvailableScopeRepository();
        const model: TenantAvailableScope = {tenantId, scopeId, accessRuleId };
        await tenantAvailableScopeRelRepo.insert(model)
        return Promise.resolve(model);
    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {

        const clientScopeRelRepo = await RDBDriver.getInstance().getClientScopeRelRepository();
        await clientScopeRelRepo.delete({
            tenantId: tenantId,
            scopeId: scopeId
        })        
        
        const authzGroupScopeRelRepo = await RDBDriver.getInstance().getAuthorizationGroupScopeRelRepository();
        await authzGroupScopeRelRepo.delete({
            scopeId: scopeId,
            tenantId: tenantId
        });
        

        const userScopeRelRepo = await RDBDriver.getInstance().getUserScopeRelRepository();
        await userScopeRelRepo.delete({
            tenantId: tenantId,
            scopeId: scopeId
        });
        
        
        const tenantAvailableScopeRelRepo = await RDBDriver.getInstance().getTenantAvailableScopeRepository();
        await tenantAvailableScopeRelRepo.delete({
            tenantId: tenantId,
            scopeId: scopeId
        });
        
        return Promise.resolve();
    }

    // clientScopeRel
    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        const clientScopeRelRepo = await RDBDriver.getInstance().getClientScopeRelRepository();
        const model: ClientScopeRel = {
            tenantId: tenantId,
            scopeId: scopeId,
            clientId: clientId
        };
        await clientScopeRelRepo.insert(model);
        return Promise.resolve(model);
    }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        const clientScopeRelRepo = await RDBDriver.getInstance().getClientScopeRelRepository();
        await clientScopeRelRepo.delete({
            tenantId: tenantId,
            clientId: clientId,
            scopeId: scopeId
        });
        return Promise.resolve();
    }

}

export default DBScopeDao;