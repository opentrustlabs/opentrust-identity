import { getFileContents } from "@/utils/dao-utils";
import ScopeDao from "../../scope-dao";
import { CLIENT_TENANT_SCOPE_REL_FILE, SCOPE_FILE, TENANT_SCOPE_REL_FILE } from "@/utils/consts";
import { AuthorizationGroupScopeRel, ClientScopeRel, Scope, TenantAvailableScope, UserScopeRel } from "@/graphql/generated/graphql-types";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { GraphQLError } from "graphql/error/GraphQLError";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedScopeDao extends ScopeDao {

    getTenantAvailableScope(tenantId?: String): Promise<Array<TenantAvailableScope>> {
        throw new Error("Method not implemented.");
    }
    getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        throw new Error("Method not implemented.");
    }
    getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>> {
        throw new Error("Method not implemented.");
    }
    assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel> {
        throw new Error("Method not implemented.");
    }
    removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getUserScopeRels(userId: string): Promise<Array<UserScopeRel>> {
        throw new Error("Method not implemented.");
    }
    assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel> {
        throw new Error("Method not implemented.");
    }
    removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    
    public async getScope(tenantId?: string): Promise<Array<Scope>> {
        let scopes: Array<Scope> = JSON.parse(getFileContents(`${dataDir}/${SCOPE_FILE}`, "[]"));
        if(tenantId){
            const rels: Array<TenantAvailableScope> = await this.getTenantScopeRel(tenantId);
            scopes = scopes.filter(
                (s: Scope) => rels.find(
                    (r: TenantAvailableScope) => r.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(scopes);
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const scopes: Array<Scope> = await this.getScope();
        const scope: Scope | undefined = scopes.find(
            (s: Scope) => s.scopeId === scopeId
        )
        return scope === undefined ? Promise.resolve(null) : Promise.resolve(scope);
    }

    public async createScope(scope: Scope): Promise<Scope> {
        const scopes: Array<Scope> = await this.getScope();
        scopes.push(scope);
        writeFileSync(`${dataDir}/${SCOPE_FILE}`, JSON.stringify(scopes), {encoding: "utf-8"});
        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        const scopes: Array<Scope> = await this.getScope();
        const existingScope = scopes.find(
            (s: Scope) => s.scopeId === scope.scopeId
        )
        if(!existingScope){
            throw new GraphQLError("ERROR_SCOPE_NOT_FOUND");
        }
        existingScope.scopeDescription = scope.scopeDescription;
        existingScope.scopeName = scope.scopeName;
        writeFileSync(`${dataDir}/${SCOPE_FILE}`, JSON.stringify(scopes), {encoding: "utf-8"});
        return Promise.resolve(existingScope);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        let scopes: Array<Scope> = await this.getScope();
        scopes = scopes.filter(
            (s: Scope) => s.scopeId !== scopeId
        )
        writeFileSync(`${dataDir}/${SCOPE_FILE}`, JSON.stringify(scopes), {encoding: "utf-8"});
    }
        

    public async getTenantScopeRel(tenantId?: String): Promise<Array<TenantAvailableScope>> {
        const tenantScopeRels: Array<TenantAvailableScope> = JSON.parse(getFileContents(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                tenantScopeRels.filter(
                    (t: TenantAvailableScope) => t.tenantId === tenantId
                )
            );
        }
        else {
            return Promise.resolve(tenantScopeRels);
        }
    }
    
    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope> {
    // public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId: string | null): Promise<TenantAvailableScope> {
        
        const a: Array<TenantAvailableScope> = await this.getTenantScopeRel();
        const existingRel = a.find(
            (r: TenantAvailableScope) => r.tenantId === tenantId && r.scopeId === scopeId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const rel: TenantAvailableScope = {
            tenantId: tenantId,
            scopeId: scopeId
        }
        a.push(rel);
        writeFileSync(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(rel);

    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        let a: Array<TenantAvailableScope> = await this.getTenantScopeRel();
        a = a.filter(
            (rel: TenantAvailableScope) => !(rel.tenantId === tenantId && rel.scopeId === scopeId)
        );
        writeFileSync(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        
        const clientTenantScopeRels: Array<ClientScopeRel> = getFileContents(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, "[]");
        const existingRel = clientTenantScopeRels.find(
            (r: ClientScopeRel) => r.tenantId === tenantId && r.clientId === clientId && r.scopeId === scopeId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const newRel: ClientScopeRel = {
            tenantId: tenantId,
            clientId: clientId,
            scopeId: scopeId
        }
        clientTenantScopeRels.push(newRel);
        writeFileSync(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, JSON.stringify(clientTenantScopeRels), {encoding: "utf-8"});
        return Promise.resolve(newRel);

    }
    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        let clientTenantScopeRels: Array<ClientScopeRel> = getFileContents(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, "[]");
        clientTenantScopeRels = clientTenantScopeRels.filter(
            (r: ClientScopeRel) => !(r.tenantId === tenantId && r.clientId === clientId && r.scopeId === scopeId)
        )
        writeFileSync(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, JSON.stringify(clientTenantScopeRels), {encoding: "utf-8"});
    }
}

export default FSBasedScopeDao;