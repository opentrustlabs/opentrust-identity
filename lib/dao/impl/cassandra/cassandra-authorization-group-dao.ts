import { AuthorizationGroup, AuthorizationGroupScopeRel, AuthorizationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthorizationGroupDao from "../../authorization-group-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";
import { types } from "cassandra-driver";

class CassandraAuthorizationGroupDao extends AuthorizationGroupDao {

    public async getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group");
        if(tenantId){
            const results = await mapper.find({
                tenantId: tenantId
            });
            return results.toArray();
        }
        else{
            const results = await mapper.findAll();
            return results.toArray();
        }
    }

    public async getDefaultAuthorizationGroups(tenantId: string): Promise<Array<AuthorizationGroup>> {
        const arr: Array<AuthorizationGroup> = await this.getAuthorizationGroups(tenantId);
        return arr.filter(
            (g: AuthorizationGroup) => g.default === true
        );
    }

    public async getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group");
        const results: Array<AuthorizationGroup> = (await mapper.find({groupId: groupId}, {limit: 1})).toArray();
        if(results && results.length > 0){
            return results[0];
        }
        else{
            return null;
        }
    }

    public async createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group");
        await mapper.insert(group);
        return group
    }

    public async updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group");
        await mapper.update(group);
        return group;
    }

    public async deleteAuthorizationGroup(groupId: string): Promise<void> {

        const authzGroupUuid = types.Uuid.fromString(groupId);

        const scopeMapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_scope_rel");
        const scopeResults: Array<AuthorizationGroupScopeRel> = (await scopeMapper.find({
            groupId: groupId
        })).toArray();

        for(let i = 0; i < scopeResults.length; i++){
            scopeMapper.remove({
                groupId: authzGroupUuid,
                tenantId: types.Uuid.fromString(scopeResults[i].tenantId),
                scopeId: types.Uuid.fromString(scopeResults[i].scopeId)
            });
        }

        const groupUserRelMapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_user_rel");
        let hasMore: boolean = true;
        while(hasMore){
            const results: Array<AuthorizationGroupUserRel> = (await groupUserRelMapper.find({groupId: groupId}, {limit: 1000})).toArray()
            for(let i = 0; i < results.length; i++){
                groupUserRelMapper.remove({
                    userId: types.Uuid.fromString(results[i].userId),
                    groupId: authzGroupUuid
                })
            }
            hasMore = results.length === 1000;
        }

        const groupMapper = await CassandraDriver.getInstance().getModelMapper("authorization_group");        

        const group: AuthorizationGroup | null = await this.getAuthorizationGroupById(groupId);
        if(group){
            groupMapper.remove({
                tenantId: types.Uuid.fromString(group.tenantId),
                groupId: authzGroupUuid
            });
        }       
        
    }

    public async addUserToAuthorizationGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_user_rel");
        const authorizationGroupUserRel: AuthorizationGroupUserRel = {
            userId: userId,
            groupId: groupId
        };
        await mapper.insert(authorizationGroupUserRel);
        return authorizationGroupUserRel;
    }

    public async removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_user_rel");
        await mapper.remove({
            userId: types.Uuid.fromString(userId),
            groupId: types.Uuid.fromString(groupId)
        })
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_user_rel");
        const results: Array<AuthorizationGroupUserRel> = (await mapper.find({userId: userId})).toArray();
        const ids = results.map(
            (rel: AuthorizationGroupUserRel) => rel.groupId
        );
        if(ids.length > 0){
            const groupMapper = await CassandraDriver.getInstance().getModelMapper("authorization_group");
            const groups = await groupMapper.find({
                groupId: cassandra.mapping.q.in_(ids)
            });
            return groups.toArray();
        }
        else{
            return [];
        }        
    }

}

export default CassandraAuthorizationGroupDao;