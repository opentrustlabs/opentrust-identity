import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import AuthenticationGroupClientRelEntity from "@/lib/entities/authentication-group-client-rel-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "@sequelize/core";


class DBAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        
        if(tenantId){
            const authnGroups: Array<AuthenticationGroupEntity> = await (await DBDriver.getInstance().getAuthenticationGroupEntity()).findAll(
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: any = {};
            filter.authenticationGroupId = { [Op.in]: inValues};
            const authnGroups = await (await DBDriver.getInstance().getAuthenticationGroupEntity()).findAll(
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: any = {};
            filter.authenticationGroupId = { [Op.in]: inValues};
            const authnGroups = await (await DBDriver.getInstance().getAuthenticationGroupEntity()).findAll(
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

    public async getDefaultAuthenticationGroups(tenantId: string): Promise<Array<AuthenticationGroup>>{
     
        const authnGroups: Array<AuthenticationGroupEntity> = await (await DBDriver.getInstance().getAuthenticationGroupEntity()).findAll(
            {
                where: {
                    tenantId: tenantId,
                    default: true
                },
                order: [
                    ["authenticationGroupName", "ASC"]
                ]
            }                
        );
        return authnGroups.map(e => e.dataValues);        
    }

    protected async getAuthenticationGroupClientRels(clientId: string): Promise<Array<AuthenticationGroupClientRelEntity>> {

        const results: Array<AuthenticationGroupClientRelEntity> = await (await DBDriver.getInstance().getAuthenticationGroupClientRelEntity()).findAll({
            where: {
                clientId: clientId
            }
        });
        return results && results.length > 0 ? Promise.resolve(results) : Promise.resolve([]);
    }
    
    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {

        const entity: AuthenticationGroupEntity | null = await (await DBDriver.getInstance().getAuthenticationGroupEntity()).findOne({
                where: {
                    authenticationGroupId: authenticationGroupId
                }
            }
        );
        return entity ? Promise.resolve(entity.dataValues as AuthenticationGroup) : Promise.resolve(null);
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
  
        await (await DBDriver.getInstance().getAuthenticationGroupEntity()).create(authenticationGroup);        
        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {

        await (await DBDriver.getInstance().getAuthenticationGroupEntity()).update(authenticationGroup, {
            where: {
                authenticationGroupId: authenticationGroup.authenticationGroupId
            }
        });
        return Promise.resolve(authenticationGroup);
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        
        await (await DBDriver.getInstance().getAuthenticationGroupClientRelEntity()).destroy({
            where: {
                authenticationGroupId: authenticationGroupId
            }
        });
        
        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<AuthenticationGroupUserRelEntity> = await (await DBDriver.getInstance().getAuthenticationGroupUserRelEntity()).findAll({
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
        
        await (await DBDriver.getInstance().getAuthenticationGroupEntity()).destroy({
            where: {
                authenticationGroupId: authenticationGroupId
            }
        });        
    }

    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {

        const model: AuthenticationGroupClientRel = {
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
        };
        await (await DBDriver.getInstance().getAuthenticationGroupClientRelEntity()).create(model);
        return Promise.resolve(model);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {

        await (await DBDriver.getInstance().getAuthenticationGroupClientRelEntity()).destroy({
            where: {
                clientId: clientId,
                authenticationGroupId: authenticationGroupId
            }
        });
        return Promise.resolve();
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {

        const model: AuthenticationGroupUserRel = {
            userId: userId,
            authenticationGroupId: authenticationGroupId
        };

        await (await DBDriver.getInstance().getAuthenticationGroupUserRelEntity()).create(model);
        return Promise.resolve(model);
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        
        await (await DBDriver.getInstance().getAuthenticationGroupUserRelEntity()).destroy({
            where: {
                userId: userId,
                authenticationGroupId: authenticationGroupId
            }
        });
        return Promise.resolve();
    }

    protected async getAuthenticationGroupUserRels(userId: string): Promise<Array<AuthenticationGroupUserRel>> {

        const res: Array<AuthenticationGroupUserRelEntity> = await (await DBDriver.getInstance().getAuthenticationGroupUserRelEntity()).findAll({
            where: {
                userId: userId
            }
        });
        return res.map((rel: AuthenticationGroupClientRelEntity) => rel.dataValues);
    }

}

export default DBAuthenticationGroupDao;