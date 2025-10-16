import { AuthorizationGroup, AuthorizationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthorizationGroupDao from "../../authorization-group-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { Brackets, In } from "typeorm";

class DBAuthorizationGroupDao extends AuthorizationGroupDao {

    public async getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();        
        if(tenantId){
            const results = await authzGroupRepo.find({
                where: {
                    tenantId: tenantId
                }
            });
            return results;
        }
        else{
            const results = await authzGroupRepo.find();
            return results;
        }
    }  

    public async getDefaultAuthorizationGroups(tenantId: string): Promise<Array<AuthorizationGroup>>{
        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();
        const results = await authzGroupRepo.find({
            where: {
                tenantId: tenantId,
                default: true
            }
        });
        return results;
    }

    public async getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup | null> {
        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();
        const result = authzGroupRepo.findOne({
            where: {
                groupId: groupId
            }
        });
        return result;
    }

    public async createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();
        await authzGroupRepo.insert(group);
        return Promise.resolve(group);
    }


    public async updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();
        await authzGroupRepo.update(
            {
                groupId: group.groupId
            },
            group
        );
        return Promise.resolve(group);
    }

    public async deleteAuthorizationGroup(groupId: string): Promise<void> {

        const authzGroupScopeRelRepo = await RDBDriver.getInstance().getAuthorizationGroupScopeRelRepository();
        await authzGroupScopeRelRepo.delete({
            groupId: groupId
        });

        
        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        const authzGroupUserRelRepo = await RDBDriver.getInstance().getAuthorizationGroupUserRelRepository();
        while(hasMoreRecords){            
            const userRels: Array<AuthorizationGroupUserRel> = await authzGroupUserRelRepo.find({
                where: {
                    groupId: groupId
                },
                take: 1000
            });
            if(userRels.length === 0){
                hasMoreRecords = false;
                break;
            }

            const conditions = userRels.map(
                (rel: AuthorizationGroupUserRel) => {
                    return {
                        userId: rel.userId,
                        groupId: rel.groupId
                    }
                }
            );

            await authzGroupUserRelRepo
                .createQueryBuilder()
                .delete()                
                .from("authorizationGroupUserRel")
                .where(
                    new Brackets(
                        qb => {
                            conditions.forEach(
                                (condition, index) => {
                                    if(index === 0) {
                                        qb.where(
                                            "userId = :userId_0 AND groupId = :groupId_0",
                                            {
                                                ["userId_0"]: condition.userId,
                                                ["groupId_0"]: condition.groupId
                                            }
                                        )
                                    }
                                    else{
                                        qb.orWhere(
                                            `userId = :userId_${index} AND groupId = :groupId_${index}`,
                                            {
                                                [`userId_${index}`]: condition.userId,
                                                [`groupId_${index}`]: condition.groupId
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    )
                )
                .execute();            
        }
        
        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();
        await authzGroupRepo.delete({
            groupId: groupId
        });
        
    }

    
    public async addUserToAuthorizationGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel> {
        const authzGroupUserRelRepo = await RDBDriver.getInstance().getAuthorizationGroupUserRelRepository();
        const model: AuthorizationGroupUserRel = {
            userId: userId,
            groupId: groupId
        };
        await authzGroupUserRelRepo.insert(model);
        return Promise.resolve(model);
    }

    public async removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void> {
        const authzGroupUserRelRepo = await RDBDriver.getInstance().getAuthorizationGroupUserRelRepository();
        await authzGroupUserRelRepo.delete({
            userId: userId,
            groupId: groupId
        });
        return Promise.resolve();
    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        const authzGroupUserRelRepo = await RDBDriver.getInstance().getAuthorizationGroupUserRelRepository();
        const rels = await authzGroupUserRelRepo.find({
            where: {
                userId: userId
            }
        });        

        const inValues = rels.map(
            (r: AuthorizationGroupUserRel) => {
                return r.groupId;
            }
        );

        const authzGroupRepo = await RDBDriver.getInstance().getAuthorizationGroupRepository();
        const results = await authzGroupRepo.find({
            where: {
                groupId: In(inValues)
            },
            order: {
                groupName: "ASC"
            }
        });
        return results;
        
    }
    
}

export default DBAuthorizationGroupDao;