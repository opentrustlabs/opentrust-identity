import { AuthorizationGroup, AuthorizationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthorizationGroupDao from "../../authorization-group-dao";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthorizationGroupUserRelEntity from "@/lib/entities/authorization-group-user-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";

class DBAuthorizationGroupDao extends AuthorizationGroupDao {

    public async getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        const sequelize: Sequelize = await DBDriver.getConnection(); 
        if(tenantId){
            const entities: Array<AuthorizationGroupEntity> = await sequelize.models.authorizationGroup.findAll({
                where: {
                    tenantId: tenantId
                }
            });
            return entities.map(e => e.dataValues);// as any as Array<AuthorizationGroup>;
        }
        else{
            const entities: Array<AuthorizationGroupEntity> = await sequelize.models.authorizationGroup.findAll();// as any as Array<AuthorizationGroup>;
            return entities.map(e => e.dataValues);
        }
    }  

    public async getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup | null> {
        const sequelize: Sequelize = await DBDriver.getConnection(); 

        const entity: AuthorizationGroupEntity | null = await sequelize.models.authorizationGroup.findOne({
            where: {
                groupId: groupId
            }
        })
        return entity ? Promise.resolve(entity.dataValues as AuthorizationGroup) : Promise.resolve(null);
    }

    public async createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationGroup.create(group);        
        return Promise.resolve(group);
    }


    public async updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationGroup.update(group, {
            where: {
                groupId: group.groupId
            }
        });
        return Promise.resolve(group);
    }

    public async deleteAuthorizationGroup(groupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        await sequelize.models.authorizationGroupScopeRel.destroy({
            where: {
                groupId: groupId
            }
        });

        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<AuthorizationGroupUserRelEntity> = await sequelize.models.authorizationGroupUserRel.findAll({
                where: {
                    groupId: groupId
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
                    (v: AuthorizationGroupUserRelEntity) => `(${sequelize.escape(v.getDataValue("groupId"))}, ${sequelize.escape(v.getDataValue("userId"))})`
                )
                .join(", ");
            const sql = `DELETE FROM authorization_group_user_rel WHERE (groupid, userid) IN (${tuples})`;
            await sequelize.query(sql);
        }
        
        await sequelize.models.authorizationGroup.destroy({
            where: {
                groupId: groupId
            }
        });
    }

    
    public async addUserToAuthorizationGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        const model: AuthorizationGroupUserRel = {
            userId: userId,
            groupId: groupId
        };

        await sequelize.models.authorizationGroupUserRel.create(model);
        return Promise.resolve(model);
    }

    public async removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        await sequelize.models.authorizationGroupUserRel.destroy({
            where: {
                userId: userId,
                groupId: groupId
            }
        });
        return Promise.resolve();
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        const rels = await sequelize.models.authorizationGroupUserRel.findAll({
            where: {
                userId: userId
            }
        });

        const inValues = rels.map(
            (r: AuthorizationGroupUserRelEntity) => {
                return r.getDataValue("groupId");
            }
        );

        const filter: any = {};
        filter.groupId = { [Op.in]: inValues};
        const authzGroups: Array<AuthorizationGroupEntity> = await sequelize.models.authorizationGroup.findAll(
            {
                where: filter,
                order: [
                    ["groupName", "ASC"]
                ]
            }                
        )
        return authzGroups.map(e => e.dataValues);
        
    }
    
}

export default DBAuthorizationGroupDao;