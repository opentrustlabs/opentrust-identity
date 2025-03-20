import { AuthorizationGroup, AuthorizationGroupUserRel, ObjectSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import AuthorizationGroupDao from "../../authorization-group-dao";
import connection  from "@/lib/data-sources/db";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthorizationGroupUserRelEntity from "@/lib/entities/authorization-group-user-rel-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBAuthorizationGroupDao extends AuthorizationGroupDao {

    public async getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        const em = connection.em.fork();
        if(tenantId){
            return em.find(AuthorizationGroupEntity, {tenantId: tenantId});
        }
        else{
            return em.findAll(AuthorizationGroupEntity);
        }
    }  

    public async getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup | null> {
        const em = connection.em.fork();
        const entity: AuthorizationGroupEntity | null = await em.findOne(AuthorizationGroupEntity, {
            groupId: groupId
        })
        return Promise.resolve(entity);
    }

    public async createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const em = connection.em.fork();
        const entity: AuthorizationGroupEntity = new AuthorizationGroupEntity(group);
        await em.persistAndFlush(entity);        
        return Promise.resolve(group);
    }


    public async updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const em = connection.em.fork();
        const entity: AuthorizationGroupEntity = new AuthorizationGroupEntity(group);
        await em.upsert(entity);
        await em.flush();

        return Promise.resolve(group);
    }

    public async deleteAuthorizationGroup(groupId: string): Promise<void> {
        const em = connection.em.fork();
        // TODO
        // DELETE THE RELATIONSHIPS
    }

    public async addUserToAuthorizationGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const em = connection.em.fork();
        const entity: AuthorizationGroupUserRel = new AuthorizationGroupUserRelEntity({
            userId: userId,
            groupId: groupId
        });
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);

    }

    public async removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(AuthorizationGroupUserRelEntity, {
            userId: userId,
            groupId: groupId
        });
        await em.flush();
        return Promise.resolve();
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        const em = connection.em.fork();
        const rels = await em.find(AuthorizationGroupUserRelEntity, {userId: userId});
        const inClause = rels.map(r => r.groupId);
        const entities = await em.find(AuthorizationGroupEntity, {groupId: inClause}, {orderBy: {groupName: QueryOrder.ASC}});
        return Promise.resolve(entities);
    }
    
}

export default DBAuthorizationGroupDao;