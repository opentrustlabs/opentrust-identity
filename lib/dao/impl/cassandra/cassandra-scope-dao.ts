import { Scope, TenantAvailableScope, ClientScopeRel, AuthorizationGroupScopeRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import ScopeDao from "../../scope-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";
import { types } from "cassandra-driver";

class CassandraScopeDao extends ScopeDao {


    public async getScope(tenantId?: string, scopeIds?: Array<string>): Promise<Array<Scope>> {
        let ids: Array<string> = [];
        
        if(tenantId){
            const availScope: Array<TenantAvailableScope> = await this.getTenantAvailableScope(tenantId);
            ids = availScope.map(
                (avl: TenantAvailableScope) => avl.scopeId
            )
        }
        else if(scopeIds){
            ids = scopeIds;
        }
        const mapper = await CassandraDriver.getInstance().getModelMapper("scope");
        if(ids.length > 0){
            const results = await mapper.find({
                scopeId: cassandra.mapping.q.in_(ids)
            });
            return results.toArray();
        }
        else{
            const results = await mapper.findAll();
            return results.toArray();
        }
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scope");
        const results: Array<Scope> = (await mapper.find({scopeId: scopeId}, {limit: 1})).toArray();
        if(results && results.length > 0){
            return results[0];
        }
        return null;        
    }

    public async getScopeByScopeName(scopeName: string): Promise<Scope | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scope");
        const results: Array<Scope> = (await mapper.find({scopeName: scopeName}, {limit: 1})).toArray();
        if(results && results.length > 0){
            return results[0];
        }
        return null;
    }

    public async createScope(scope: Scope): Promise<Scope> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scope");
        await mapper.insert(scope);
        return scope;
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scope");
        await mapper.update(scope);
        return scope;
    }

    public async deleteScope(scopeId: string): Promise<void> {
        const arrTenantScopeRel = await this.getTenantAvailableScope(undefined, scopeId);
        for(let i = 0; i < arrTenantScopeRel.length; i++){
            await this.removeScopeFromTenant(arrTenantScopeRel[i].tenantId, arrTenantScopeRel[i].scopeId);
        }

        const scope: Scope | null = await this.getScopeById(scopeId);
        if(scope){
            const mapper = await CassandraDriver.getInstance().getModelMapper("scope");
            await mapper.remove({
                scopeId: types.Uuid.fromString(scopeId),
                scopeName: scope.scopeName
            });
        }

    }

    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {

        // Need to remove all of the scope from the users, clients, and authz groups too
        const clientScopeMapper = await CassandraDriver.getInstance().getModelMapper("client_scope_rel");
        const clientScopeRelResults = await clientScopeMapper.find({
            tenantId: tenantId,
            scopeId: scopeId
        });
        const clientScopeRels: Array<ClientScopeRel> = clientScopeRelResults.toArray();

        const tenantUuid = types.Uuid.fromString(tenantId);
        const scopeUuid = types.Uuid.fromString(scopeId);

        for(let i = 0; i < clientScopeRels.length; i++){
            clientScopeMapper.remove({
                clientId: types.Uuid.fromString(clientScopeRels[i].clientId),
                tenantId: tenantUuid,
                scopeId: scopeUuid
            });
        }

        const authzScopeMapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_scope_rel");
        const authzScopeRelResults = await authzScopeMapper.find({
            tenantId: tenantId,
            scopeId: scopeId
        });
        const authzScopeRels: Array<AuthorizationGroupScopeRel> = authzScopeRelResults.toArray();
        for(let i = 0; i < authzScopeRels.length; i++){
            authzScopeMapper.remove({
                tenantId: tenantUuid,
                scopeId: scopeUuid,
                groupId: types.Uuid.fromString(authzScopeRels[i].groupId)
            });
        }
        
        const userScopeMapper = await CassandraDriver.getInstance().getModelMapper("user_scope_rel");
        const userScopeRelResults = await userScopeMapper.find({
            tenantId: tenantId,
            scopeId: scopeId
        });
        const userScopeRels: Array<UserScopeRel> = userScopeRelResults.toArray();
        for(let i = 0; i < userScopeRels.length; i++){
            userScopeMapper.remove({
                tenantId: tenantUuid,
                scopeId: scopeUuid,
                userId: types.Uuid.fromString(userScopeRels[i].userId)
            });
        }
        
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_available_scope");
        await mapper.remove({
            tenantId: tenantUuid,
            scopeId: scopeUuid
        });        
        
        return Promise.resolve();
    }

    public async getTenantAvailableScope(tenantId?: string, scopeId?: string): Promise<Array<TenantAvailableScope>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_available_scope");
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantId = tenantId
        }
        if(scopeId){
            queryParams.scopeId = scopeId
        }
        const results = await mapper.find(queryParams);
        return results.toArray();
    }

    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId?: string): Promise<TenantAvailableScope> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_available_scope");
        const tenantAvailableScope: TenantAvailableScope = {
            tenantId: tenantId,
            scopeId: scopeId,
            accessRuleId: accessRuleId
        };
        await mapper.insert(tenantAvailableScope);
        return tenantAvailableScope;
    }

      public async getClientScopeRels(clientId: string): Promise<Array<ClientScopeRel>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_scope_rel");
        const results = await mapper.find({
            clientId: clientId
        });
        return results.toArray();
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_scope_rel");
        const clientScopeRel: ClientScopeRel = {
            clientId: clientId,
            tenantId: tenantId,
            scopeId: scopeId
        };
        await mapper.insert(clientScopeRel);
        return clientScopeRel;
    }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("client_scope_rel");
        await mapper.remove({
            clientId: types.Uuid.fromString(clientId),
            tenantId: types.Uuid.fromString(tenantId),
            scopeId: types.Uuid.fromString(scopeId)
        });
        return;
    }

    public async getAuthorizationGroupScopeRels(authorizationGroupId: string): Promise<Array<AuthorizationGroupScopeRel>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_scope_rel");
        const results = await mapper.find({
            groupId: authorizationGroupId
        });
        return results.toArray();
    }

    public async assignScopeToAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<AuthorizationGroupScopeRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_scope_rel");
        const authorizationGroupScopeRel: AuthorizationGroupScopeRel = {
            groupId: authorizationGroupId,
            tenantId: tenantId,
            scopeId: scopeId
        };
        await mapper.insert(authorizationGroupScopeRel);
        return authorizationGroupScopeRel;

    }

    public async removeScopeFromAuthorizationGroup(tenantId: string, authorizationGroupId: string, scopeId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_scope_rel");
        await mapper.remove({
            groupId: types.Uuid.fromString(authorizationGroupId),
            tenantId: types.Uuid.fromString(tenantId),
            scopeId: types.Uuid.fromString(scopeId)
        });
        return;
    }

    public async getUserScopeRels(userId: string, tenantId: string): Promise<Array<UserScopeRel>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_scope_rel");
        const results = await mapper.find({
            userId: userId,
            tenantId: tenantId
        });
        return results.toArray();
    }

    public async assignScopeToUser(tenantId: string, userId: string, scopeId: string): Promise<UserScopeRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_scope_rel");
        const userScopeRel: UserScopeRel = {
            userId: userId,
            tenantId: tenantId,
            scopeId: scopeId
        };
        await mapper.insert(userScopeRel);
        return userScopeRel;
    }

    public async removeScopeFromUser(tenantId: string, userId: string, scopeId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_scope_rel");
        await mapper.remove({
            tenantId: types.Uuid.fromString(tenantId),
            userId: types.Uuid.fromString(userId),
            scopeId: types.Uuid.fromString(scopeId)
        });
        return;
    }

}

export default CassandraScopeDao;