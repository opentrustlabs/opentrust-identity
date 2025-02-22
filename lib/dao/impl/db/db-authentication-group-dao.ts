import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel, ObjectSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import connection  from "@/lib/data-sources/db";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import AuthenticationGroupClientRelEntity from "@/lib/entities/authentication-group-client-rel-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
import { SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";

const searchClient: Client = getOpenSearchClient();
class DBAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string): Promise<Array<AuthenticationGroup>> {
        const em = connection.em.fork();
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantid = tenantId;
        };
        const authnGroups: Array<AuthenticationGroupEntity> = await em.find(AuthenticationGroupEntity, queryParams);
        return Promise.resolve(authnGroups);
    }

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const em = connection.em.fork();
        const entity: AuthenticationGroupEntity | null = await em.findOne(
            AuthenticationGroupEntity, {
                authenticationGroupId: authenticationGroupId
            }
        );
        return Promise.resolve(entity);
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const em = connection.em.fork();
        const entity: AuthenticationGroupEntity = new AuthenticationGroupEntity(authenticationGroup);
        await em.persistAndFlush(entity);
        await this.updateSearchIndex(authenticationGroup);
        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const em = connection.em.fork();
        const entity: AuthenticationGroupEntity = new AuthenticationGroupEntity(authenticationGroup);
        em.upsert(entity);
        await em.flush();
        await this.updateSearchIndex(authenticationGroup);
        return Promise.resolve(authenticationGroup);
    }

    protected async updateSearchIndex(authenticationGroup: AuthenticationGroup): Promise<void> {
        const document: ObjectSearchResultItem = {
            name: authenticationGroup.authenticationGroupName,
            description: authenticationGroup.authenticationGroupDescription,
            objectid: authenticationGroup.authenticationGroupId,
            objecttype: SearchResultType.AuthenticationGroup,
            owningtenantid: authenticationGroup.tenantId,
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: "",
            subtypekey: ""            
        }
        
        await searchClient.index({
            id: authenticationGroup.authenticationGroupId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });        
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        const em = connection.em.fork();
        // TODO
        // DELETE ALL OF THE RELATIONSHIP VALUES

        return Promise.resolve();
    }

    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const em = connection.em.fork();
        const entity: AuthenticationGroupClientRelEntity = new AuthenticationGroupClientRelEntity({
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
        });
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(AuthenticationGroupClientRelEntity, {
            clientId: clientId,
            authenticationGroupId: authenticationGroupId
        });
        await em.flush();
        return Promise.resolve();
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        const em = connection.em.fork();
        const entity: AuthenticationGroupUserRelEntity = new AuthenticationGroupUserRelEntity({
            userId: userId,
            authenticationGroupId: authenticationGroupId
        });
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(AuthenticationGroupUserRelEntity, {
            userId: userId,
            authenticationGroupId: authenticationGroupId
        });
        await em.flush();
        return Promise.resolve();
    }

}

export default DBAuthenticationGroupDao;