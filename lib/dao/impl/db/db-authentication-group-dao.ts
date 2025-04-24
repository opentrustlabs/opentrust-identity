import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
// import connection  from "@/lib/data-sources/db";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import AuthenticationGroupClientRelEntity from "@/lib/entities/authentication-group-client-rel-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
import { QueryOrder } from "@mikro-orm/core";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";


class DBAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        const sequelize: Sequelize = await DBDriver.getConnection();        
        
        if(tenantId){
            const authnGroups: Array<AuthenticationGroupEntity> = await sequelize.models.authenticationGroup.findAll(
                {
                    where: {
                        tenantId: tenantId
                    },
                    order: [
                        ["authenticationGroupName", "ASC"]
                    ],
                    raw: true
                }                
            );
            return Promise.resolve(authnGroups as any as Array<AuthenticationGroup>);
        }
        else if(clientId){
            const rels: Array<AuthenticationGroupClientRelEntity> = await this.getAuthenticationGroupClientRels(clientId);
            const inValues: Array<string> = rels.map((r: AuthenticationGroupClientRelEntity) => r.getDataValue("authenticationGroupId"));

            const filter: any = {};
            filter.authenticationGroupId = { [Op.in]: inValues};
            const authnGroups = await sequelize.models.authenticationGroup.findAll(
                {
                    where: filter,
                    order: [
                        ["authenticationGroupName", "ASC"]
                    ],
                    raw: true
                }                
            )
            return Promise.resolve(authnGroups as any as Array<AuthenticationGroup>);
        }
        else if(userId){
            const rels: Array<AuthenticationGroupUserRel> = await this.getAuthenticationGroupUserRels(userId);
            const inValues: Array<string> = rels.map( (r: AuthenticationGroupUserRel) => r.authenticationGroupId);
            const filter: any = {};
            filter.authenticationGroupId = { [Op.in]: inValues};
            const authnGroups = await sequelize.models.authenticationGroup.findAll(
                {
                    where: filter,
                    order: [
                        ["authenticationGroupName", "ASC"]
                    ],
                    raw: true
                }                
            );
            return Promise.resolve(authnGroups as any as Array<AuthenticationGroup>);
        }
        else {
            return [];
        }
    }

    // authenticationGroupClientRel
    protected async getAuthenticationGroupClientRels(clientId: string): Promise<Array<AuthenticationGroupClientRelEntity>> {
        const sequelize: Sequelize = await DBDriver.getConnection();    
        const results: Array<AuthenticationGroupClientRelEntity> = await sequelize.models.authenticationGroupClientRel.findAll({
            where: {
                clientId: clientId
            },
            raw: true
        });
        return results && results.length > 0 ? Promise.resolve(results) : Promise.resolve([]);
    }
    
    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();   
        const entity: AuthenticationGroupEntity | null = await sequelize.models.authenticationGroup.findOne({
                where: {
                    authenticationGroupId: authenticationGroupId
                },
                raw: true
            }
        );
        return Promise.resolve(entity as any as AuthenticationGroup);
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const sequelize: Sequelize = await DBDriver.getConnection();   
        await sequelize.models.authenticationGroup.create(authenticationGroup);        
        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authenticationGroup.update(authenticationGroup, {
            where: {
                authenticationGroupId: authenticationGroup.authenticationGroupId
            }
        });
        return Promise.resolve(authenticationGroup);
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        
        // TODO
        // DELETE ALL OF THE RELATIONSHIP VALUES

        return Promise.resolve();
    }

    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const model: AuthenticationGroupClientRel = {
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
        };
        await sequelize.models.authenticationGroupClientRel.create(model);
        return Promise.resolve(model);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authenticationGroupClientRel.destroy({
            where: {
                clientId: clientId,
                authenticationGroupId: authenticationGroupId
            }
        });
        return Promise.resolve();
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const model: AuthenticationGroupUserRel = {
            userId: userId,
            authenticationGroupId: authenticationGroupId
        };

        await sequelize.models.authenticationGroupUserRel.create(model);
        return Promise.resolve(model);
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authenticationGroupUserRel.destroy({
            where: {
                userId: userId,
                authenticationGroupId: authenticationGroupId
            }
        });
        return Promise.resolve();
    }

    protected async getAuthenticationGroupUserRels(userId: string): Promise<Array<AuthenticationGroupUserRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();


        const res: Array<AuthenticationGroupUserRelEntity> = await sequelize.models.authenticationGroupUserRel.findAll({
            where: {
                userId: userId
            },
            raw: true
        });
        return res as any as Array<AuthenticationGroupUserRel>;
    }

}

export default DBAuthenticationGroupDao;