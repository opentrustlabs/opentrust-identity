import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";

class CassandraAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        throw new Error("Method not implemented.");
    }

    public async getDefaultAuthenticationGroups(tenantId: string): Promise<Array<AuthenticationGroup>> {
        const groups = await this.getAuthenticationGroups(tenantId, undefined, undefined);
        return groups.filter(
            (group: AuthenticationGroup) => group.defaultGroup === true
        )
    }

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authentication_group");
        return mapper.get({authenticationGroupId: authenticationGroupId});
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
        throw new Error("Method not implemented.");
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
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
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
            userId: userId, 
            authenticationGroupId: authenticationGroupId
        });
        return;
    }

}

export default CassandraAuthenticationGroupDao;