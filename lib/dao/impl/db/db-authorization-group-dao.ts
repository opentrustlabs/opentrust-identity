import { AuthorizationGroup, AuthorizationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthorizationGroupDao from "../../authorization-group-dao";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthorizationGroupUserRelEntity from "@/lib/entities/authorization-group-user-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "@sequelize/core";

class DBAuthorizationGroupDao extends AuthorizationGroupDao {

    public async getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        if(tenantId){
            const entities: Array<AuthorizationGroupEntity> = await (await DBDriver.getInstance().getAuthorizationGroupEntity()).findAll({
                where: {
                    tenantId: tenantId
                }
            });
            return entities.map(e => e.dataValues);
        }
        else{
            const entities: Array<AuthorizationGroupEntity> = await (await DBDriver.getInstance().getAuthorizationGroupEntity()).findAll();
            return entities.map(e => e.dataValues);
        }
    }  

    public async getDefaultAuthorizationGroups(tenantId: string): Promise<Array<AuthorizationGroup>>{
        const entities: Array<AuthorizationGroupEntity> = await (await DBDriver.getInstance().getAuthorizationGroupEntity()).findAll({
            where: {
                tenantId: tenantId,
                default: true
            }
        });
        return entities.map(e => e.dataValues);        
    }

    public async getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup | null> {
        const entity: AuthorizationGroupEntity | null = await (await DBDriver.getInstance().getAuthorizationGroupEntity()).findOne({
            where: {
                groupId: groupId
            }
        })
        return entity ? Promise.resolve(entity.dataValues as AuthorizationGroup) : Promise.resolve(null);
    }

    public async createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        await (await DBDriver.getInstance().getAuthorizationGroupEntity()).create(group);        
        return Promise.resolve(group);
    }


    public async updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        await (await DBDriver.getInstance().getAuthorizationGroupEntity()).update(group, {
            where: {
                groupId: group.groupId
            }
        });
        return Promise.resolve(group);
    }

    public async deleteAuthorizationGroup(groupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        await (await DBDriver.getInstance().getAuthorizationGroupScopeRelEntity()).destroy({
            where: {
                groupId: groupId
            }
        });

        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<AuthorizationGroupUserRelEntity> = await (await DBDriver.getInstance().getAuthorizationGroupUserRelEntity()).findAll({
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
        
        await (await DBDriver.getInstance().getAuthorizationGroupEntity()).destroy({
            where: {
                groupId: groupId
            }
        });
    }

    
    public async addUserToAuthorizationGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const model: AuthorizationGroupUserRel = {
            userId: userId,
            groupId: groupId
        };

        await (await DBDriver.getInstance().getAuthorizationGroupUserRelEntity()).create(model);
        return Promise.resolve(model);
    }

    public async removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void> {
        await (await DBDriver.getInstance().getAuthorizationGroupUserRelEntity()).destroy({
            where: {
                userId: userId,
                groupId: groupId
            }
        });
        return Promise.resolve();
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {

        const rels = await (await DBDriver.getInstance().getAuthorizationGroupUserRelEntity()).findAll({
            where: {
                userId: userId
            }
        });

        const inValues = rels.map(
            (r: AuthorizationGroupUserRelEntity) => {
                return r.getDataValue("groupId");
            }
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};
        filter.groupId = { [Op.in]: inValues};
        const authzGroups: Array<AuthorizationGroupEntity> = await (await DBDriver.getInstance().getAuthorizationGroupEntity()).findAll(
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