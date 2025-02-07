import { Scope, TenantScopeRel, ClientScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";
import connection  from "@/lib/data-sources/db";
import ScopeEntity from "@/lib/entities/scope-entity";
import TenantScopeRelEntity from "@/lib/entities/tenant-scope-rel-entity";
import ClientScopeRelEntity from "@/lib/entities/client-tenant-scope-rel-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBScopeDao extends ScopeDao {

    public async getScope(tenantId?: string): Promise<Array<Scope>> {
        const em = connection.em.fork();
        if(tenantId){
            const queryParams: any = {};
            const rels = await this.getTenantScopeRel(tenantId);
            queryParams.inClause = rels.map(r => r.scopeId);
            return em.find(ScopeEntity, {
                scopeId: queryParams.inClause
            });
        }
        else{
            return em.findAll(ScopeEntity, {orderBy: {scopeName: QueryOrder.ASC}});
        }
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const em = connection.em.fork();
        const entity: ScopeEntity | null = await em.findOne(ScopeEntity, {scopeId: scopeId});
        return Promise.resolve(entity);
    }

    public async createScope(scope: Scope): Promise<Scope> {
        const em = connection.em.fork();
        const entity: ScopeEntity = new ScopeEntity(scope);
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        const em = connection.em.fork();
        const entity: ScopeEntity = new ScopeEntity(scope);
        await em.upsert(entity);
        await em.flush();
        return Promise.resolve(entity);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        const em = connection.em.fork();
        // TODO
        // REMOVE OTHER RELATINSHIPS
        return Promise.resolve();
    }

    public async getTenantScopeRel(tenantId?: string): Promise<Array<TenantScopeRel>> {
        const em = connection.em.fork();
        if(tenantId){
            return em.find(TenantScopeRelEntity, {tenantId: tenantId});
        }
        else{
            return em.findAll(TenantScopeRelEntity);
        }
    }

    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId: string | null): Promise<TenantScopeRel> {
        const em = connection.em.fork();
        const entity: TenantScopeRelEntity = new TenantScopeRelEntity({tenantId, scopeId, accessRuleId: accessRuleId});
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantScopeRelEntity, {
            tenantId: tenantId,
            scopeId: scopeId
        });
        return Promise.resolve();
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        const em = connection.em.fork();
        const entity: ClientScopeRelEntity = new ClientScopeRelEntity({
            tenantId: tenantId,
            scopeId: scopeId,
            clientId: clientId        
        });
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(ClientScopeRelEntity, {
            tenantId: tenantId,
            clientId: clientId,
            scopeId: scopeId
        });
        return Promise.resolve();
    }

}

export default DBScopeDao;