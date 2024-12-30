import { Scope, TenantScopeRel, ClientTenantScopeRel } from "@/graphql/generated/graphql-types";



abstract class ScopeDao {

        abstract getScope(tenantId?: string): Promise<Array<Scope>>;

        abstract getScopeById(scopeId: string): Promise<Scope | null>;
    
        abstract createScope(scope: Scope): Promise<Scope>;
    
        abstract updateScope(scope: Scope): Promise<Scope>;
    
        abstract deleteScope(scopeId: string): Promise<void>;
    
        abstract getTenantScopeRel(tenantId?: String): Promise<Array<TenantScopeRel>>;
        
        abstract assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId: string | null): Promise<TenantScopeRel>;
    
        abstract removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void>;
    
        abstract assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel>;
    
        abstract removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void>;
        
}

export default ScopeDao