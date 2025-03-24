import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import connection  from "@/lib/data-sources/db";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import AuthenticationGroupClientRelEntity from "@/lib/entities/authentication-group-client-rel-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        const em = connection.em.fork();
        
        if(tenantId){
            const authnGroups: Array<AuthenticationGroupEntity> = await em.find(AuthenticationGroupEntity, 
                {
                    tenantId: tenantId
                },
                {
                    orderBy: {
                        authenticationGroupName: QueryOrder.ASC
                    }
                }
            );
            return Promise.resolve(authnGroups);
        }
        else if(clientId){
            const rels: Array<AuthenticationGroupClientRelEntity> = await this.getAuthenticationGroupClientRels(clientId);
            const inValues: Array<string> = rels.map((r: AuthenticationGroupClientRelEntity) => r.authenticationGroupId);
            const authnGroups = await em.find(AuthenticationGroupEntity, 
                {
                    authenticationGroupId: inValues
                },
                {
                    orderBy: {
                        authenticationGroupName: QueryOrder.ASC
                    }
                }
            )
            return Promise.resolve(authnGroups);
        }
        else if(userId){
            const rels: Array<AuthenticationGroupUserRel> = await this.getAuthenticationGroupUserRels(userId);
            const inValues: Array<string> = rels.map( (r: AuthenticationGroupUserRel) => r.authenticationGroupId);
            const authnGroups = await em.find(AuthenticationGroupEntity, 
                {
                    authenticationGroupId: inValues
                },
                {
                    orderBy: {
                        authenticationGroupName: QueryOrder.ASC
                    }
                }
            )
            return Promise.resolve(authnGroups);
        }
        else {
            return [];
        }
    }

    protected async getAuthenticationGroupClientRels(clientId: string): Promise<Array<AuthenticationGroupClientRelEntity>> {
        const em = connection.em.fork();
        const results: Array<AuthenticationGroupClientRelEntity> = await em.find(AuthenticationGroupClientRelEntity, {
            clientId: clientId
        });
        return results && results.length > 0 ? Promise.resolve(results) : Promise.resolve([]);
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
        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const em = connection.em.fork();
        const entity: AuthenticationGroupEntity = new AuthenticationGroupEntity(authenticationGroup);
        em.upsert(entity);
        await em.flush();
        return Promise.resolve(authenticationGroup);
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

    protected async getAuthenticationGroupUserRels(userId: string): Promise<Array<AuthenticationGroupUserRel>> {
        const em = connection.em.fork();
        const res: Array<AuthenticationGroupUserRelEntity> = await em.find(AuthenticationGroupUserRelEntity, {
            userId: userId
        });
        return res;
    }

}

export default DBAuthenticationGroupDao;