import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";

class CassandraScopeDao extends ScopeDao {

    public async getScope(tenantId?: string, scopeIds?: Array<string>): Promise<Array<Scope>> {
        throw new Error("Method not implemented.");
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        throw new Error("Method not implemented.");
    }

    public async getScopeByScopeName(scopeName: string): Promise<Scope | null> {
        throw new Error("Method not implemented.");
    }

    public async createScope(scope: Scope): Promise<Scope> {
        throw new Error("Method not implemented.");
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        throw new Error("Method not implemented.");
    }

    public async deleteScope(scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getTenantAvailableScope(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        throw new Error("Method not implemented.");
    }

    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope> {
        throw new Error("Method not implemented.");
    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        throw new Error("Method not implemented.");
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        throw new Error("Method not implemented.");
    }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
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

    public async getUserScopeRels(userId: string, tenantId: string): Promise<Array<UserScopeRel>> {
        throw new Error("Method not implemented.");
    }

    public async assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel> {
        throw new Error("Method not implemented.");
    }

    public async removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default CassandraScopeDao;