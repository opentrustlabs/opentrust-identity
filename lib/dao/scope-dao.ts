import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";



abstract class ScopeDao {

        abstract getScope(tenantId?: string, scopeIds?: Array<string>): Promise<Array<Scope>>;

        abstract getScopeById(scopeId: string): Promise<Scope | null>;

        /**
         * Scope names must be globally unique. 
         * @param scopeName 
         */
        abstract getScopeByScopeName(scopeName: string): Promise<Scope | null>;
    
        abstract createScope(scope: Scope): Promise<Scope>;
    
        abstract updateScope(scope: Scope): Promise<Scope>;
    
        abstract deleteScope(scopeId: string): Promise<void>;
    
        abstract getTenantAvailableScope(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>>;
        
        // TODO
        // This should take a list of access rules that have previously been created and assigned to
        // the scope itself. There should be one level of rules for the root tenant (specifically designated
        // for the root), and rules that can be applied to any tenant
        abstract assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope>;
    
        abstract removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void>;
    
        abstract getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>>;

        abstract assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel>;
    
        abstract removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void>;

        abstract getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>>;

        abstract assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel>;

        abstract removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void>;

        abstract getUserScopeRels(userId: string, tenantId: string): Promise<Array<UserScopeRel>>;

        abstract assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel>;

        abstract removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void>;
        
}

export default ScopeDao