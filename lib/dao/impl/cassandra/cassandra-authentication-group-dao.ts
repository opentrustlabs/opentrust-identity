import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";
import { types } from "cassandra-driver";

class CassandraAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        if(tenantId){
             const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
             return (await mapper.find({tenantId: tenantId})).toArray();
        }
        else if(clientId){
            const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_client_rel");
            const arr: Array<AuthenticationGroupClientRel> = (await mapper.find({clientId: clientId})).toArray();
            const ids = arr.map((rel: AuthenticationGroupClientRel) => rel.authenticationGroupId);
            const clientMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
            const results = await clientMapper.find({
                clientId: cassandra.mapping.q.in_(ids)
            });
            return results.toArray();
        }
        else if(userId){
            const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_user_rel");
            const arr: Array<AuthenticationGroupUserRel> = (await mapper.find({userId: userId})).toArray();
            const ids = arr.map((rel: AuthenticationGroupUserRel) => rel.userId);
            const userMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
            const results = await userMapper.find({
                clientId: cassandra.mapping.q.in_(ids)
            });
            return results.toArray();
        }
        else {
            return [];
        }
    }

    public async getDefaultAuthenticationGroups(tenantId: string): Promise<Array<AuthenticationGroup>> {
        const groups = await this.getAuthenticationGroups(tenantId, undefined, undefined);
        return groups.filter(
            (group: AuthenticationGroup) => group.defaultGroup === true
        )
    }

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
        const results: Array<AuthenticationGroup> = (await mapper.find({authenticationGroupId: authenticationGroupId}, {limit: 1})).toArray();
        if(results && results.length > 0){
            return results[0];
        }
        else{
            return null;
        }        
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
        await mapper.insert(authenticationGroup);
        return authenticationGroup;
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
        await mapper.update(authenticationGroup);
        return authenticationGroup;
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        //  1.  Remove the client/authn group rel
        
        const authnGroupUuid = types.Uuid.fromString(authenticationGroupId);

        const authnGroupClientRelMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_client_rel");
        const rels: Array<AuthenticationGroupClientRel> = (await authnGroupClientRelMapper.find({authenticationGroupId: authenticationGroupId})).toArray();
        for(let i = 0; i < rels.length; i++){
            await authnGroupClientRelMapper.remove({
                authenticationGroupId: authnGroupUuid,
                clientId: types.Uuid.fromString(rels[i].clientId)
            });
        }        

        //  2.  Remove the authn/user rels, but in a loop of 1000 at a time
        let hasMoreRecords: boolean = true;
        const authnGroupUserRelMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_user_rel");
        while(hasMoreRecords){
            const results = await authnGroupUserRelMapper.findAll({limit: 1000});
            const arr: Array<AuthenticationGroupUserRel> = results.toArray();
            for(let i = 0; i < arr.length; i++){
                authnGroupUserRelMapper.remove({
                    userId: types.Uuid.fromString(arr[i].userId),
                    authenticationGroupId: authnGroupUuid
                });
            }
            hasMoreRecords = arr.length === 1000;
        }

        //  3.  Finally delete the group itself.
        
        const g: AuthenticationGroup | null = await this.getAuthenticationGroupById(authenticationGroupId);
        if(g){
            const authnGroupMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
            await authnGroupMapper.remove({
                authenticationGroupId: authnGroupUuid,
                tenantId: types.Uuid.fromString(g.tenantId)
            });
        }


    }

    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_client_rel");
        const authenticationGroupClientRel: AuthenticationGroupClientRel = {
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
        };
        await mapper.insert(authenticationGroupClientRel);
        return authenticationGroupClientRel;
        
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_client_rel");
        await mapper.remove({
            authenticationGroupId: types.Uuid.fromString(authenticationGroupId),
            clientId: types.Uuid.fromString(clientId)
        });
        return;
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_user_rel");
        const rel: AuthenticationGroupUserRel = {
            userId: userId, 
            authenticationGroupId: authenticationGroupId
        };
        await mapper.insert(rel);
        return rel;
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_user_rel");
        await mapper.remove({
            userId: types.Uuid.fromString(userId), 
            authenticationGroupId: types.Uuid.fromString(authenticationGroupId)
        });
        return;
    }

}

export default CassandraAuthenticationGroupDao;