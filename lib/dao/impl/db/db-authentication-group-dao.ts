import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import AuthenticationGroupClientRelEntity from "@/lib/entities/authentication-group-client-rel-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
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
                    ]
                }                
            );
            return authnGroups.map(e => e.dataValues)
        }
        else if(clientId){
            const rels: Array<AuthenticationGroupClientRelEntity> = await this.getAuthenticationGroupClientRels(clientId);
            
            const inValues: Array<string> = rels.map(
                (r: AuthenticationGroupClientRelEntity) => {              
                    return r.getDataValue("authenticationGroupId");
                }
            );
            const filter: any = {};
            filter.authenticationGroupId = { [Op.in]: inValues};
            const authnGroups = await sequelize.models.authenticationGroup.findAll(
                {
                    where: filter,
                    order: [
                        ["authenticationGroupName", "ASC"]
                    ]
                }                
            )
            return authnGroups.map(e => e.dataValues)
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
                    ]
                }                
            );
            return authnGroups.map(e => e.dataValues);
        }
        else {
            return [];
        }
    }

    protected async getAuthenticationGroupClientRels(clientId: string): Promise<Array<AuthenticationGroupClientRelEntity>> {
        const sequelize: Sequelize = await DBDriver.getConnection();    
        const results: Array<AuthenticationGroupClientRelEntity> = await sequelize.models.authenticationGroupClientRel.findAll({
            where: {
                clientId: clientId
            }
        });
        return results && results.length > 0 ? Promise.resolve(results) : Promise.resolve([]);
    }
    
    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();   
        const entity: AuthenticationGroupEntity | null = await sequelize.models.authenticationGroup.findOne({
                where: {
                    authenticationGroupId: authenticationGroupId
                }
            }
        );
        return entity ? Promise.resolve(entity.dataValues as AuthenticationGroup) : Promise.resolve(null);
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        
        await sequelize.models.authenticationGroupClientRel.destroy({
            where: {
                authenticationGroupId: authenticationGroupId
            }
        });
        
        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<AuthenticationGroupUserRelEntity> = await sequelize.models.authenticationGroupUserRel.findAll({
                where: {
                    authenticationGroupId: authenticationGroupId
                },
                limit: 1000
            });
            if(arr.length === 0){
                hasMoreRecords = false;
                break;
            }
            // sequelize does not support deletion in bulk using composite keys, so must do this manually...
            const tuples = arr
                .map(
                    (v: AuthenticationGroupUserRelEntity) => `(${sequelize.escape(v.getDataValue("authenticationGroupId"))}, ${sequelize.escape(v.getDataValue("userId"))})`
                )
                .join(", ");
            const sql = `DELETE FROM authentication_group_user_rel WHERE (authenticationgroupid, userid) IN (${tuples})`;
            await sequelize.query(sql);
        }
        
        await sequelize.models.authenticationGroup.destroy({
            where: {
                authenticationGroupId: authenticationGroupId
            }
        });        
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