import { getFileContents } from "@/utils/dao-utils";
import ScopeDao from "../../scope-dao";
import { CLIENT_TENANT_SCOPE_REL_FILE, SCOPE_FILE, TENANT_SCOPE_REL_FILE } from "@/utils/consts";
import { ClientTenantScopeRel, Scope, TenantScopeRel } from "@/graphql/generated/graphql-types";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { GraphQLError } from "graphql/error/GraphQLError";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedScopeDao extends ScopeDao {
    
    
    public async getScope(tenantId?: string): Promise<Array<Scope>> {
        let scopes: Array<Scope> = JSON.parse(getFileContents(`${dataDir}/${SCOPE_FILE}`, "[]"));
        if(tenantId){
            const rels: Array<TenantScopeRel> = await this.getTenantScopeRel(tenantId);
            scopes = scopes.filter(
                (s: Scope) => rels.find(
                    (r: TenantScopeRel) => r.tenantId === tenantId
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
        

    public async getTenantScopeRel(tenantId?: String): Promise<Array<TenantScopeRel>> {
        const tenantScopeRels: Array<TenantScopeRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                tenantScopeRels.filter(
                    (t: TenantScopeRel) => t.tenantId === tenantId
                )
            );
        }
        else {
            return Promise.resolve(tenantScopeRels);
        }
    }
    
    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantScopeRel> {
        
        const a: Array<TenantScopeRel> = await this.getTenantScopeRel();
        const existingRel = a.find(
            (r: TenantScopeRel) => r.tenantId === tenantId && r.scopeId === scopeId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const rel: TenantScopeRel = {
            tenantId: tenantId,
            scopeId: scopeId
        }
        a.push(rel);
        writeFileSync(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(rel);

    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        let a: Array<TenantScopeRel> = await this.getTenantScopeRel();
        a = a.filter(
            (rel: TenantScopeRel) => !(rel.tenantId === tenantId && rel.scopeId === scopeId)
        );
        writeFileSync(`${dataDir}/${TENANT_SCOPE_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel> {
        
        const clientTenantScopeRels: Array<ClientTenantScopeRel> = getFileContents(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, "[]");
        const existingRel = clientTenantScopeRels.find(
            (r: ClientTenantScopeRel) => r.tenantId === tenantId && r.clientId === clientId && r.scopeId === scopeId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const newRel: ClientTenantScopeRel = {
            tenantId: tenantId,
            clientId: clientId,
            scopeId: scopeId
        }
        clientTenantScopeRels.push(newRel);
        writeFileSync(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, JSON.stringify(clientTenantScopeRels), {encoding: "utf-8"});
        return Promise.resolve(newRel);

    }
    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        let clientTenantScopeRels: Array<ClientTenantScopeRel> = getFileContents(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, "[]");
        clientTenantScopeRels = clientTenantScopeRels.filter(
            (r: ClientTenantScopeRel) => !(r.tenantId === tenantId && r.clientId === clientId && r.scopeId === scopeId)
        )
        writeFileSync(`${dataDir}/${CLIENT_TENANT_SCOPE_REL_FILE}`, JSON.stringify(clientTenantScopeRels), {encoding: "utf-8"});
    }
}

export default FSBasedScopeDao;