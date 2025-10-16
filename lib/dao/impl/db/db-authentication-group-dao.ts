import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import AuthenticationGroupDao from "../../authentication-group-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { Brackets, In } from "typeorm";

class DBAuthenticationGroupDao extends AuthenticationGroupDao {

    public async getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>> {
        
        const authnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupRepository();

        if(tenantId){
            const authnGroups = await authnGroupRepo.find(
                {
                    where: {
                        tenantId: tenantId
                    },
                    order: {
                        authenticationGroupName: "ASC"
                    }
                }
            )
            return authnGroups;
        }
        else if(clientId){
            const rels: Array<AuthenticationGroupClientRel> = await this.getAuthenticationGroupClientRels(clientId);
            
            const inValues: Array<string> = rels.map(
                (r: AuthenticationGroupClientRel) => {              
                    return r.authenticationGroupId
                }
            );            
            const authnGroups = await authnGroupRepo.find({
                where: {
                    authenticationGroupId: In(inValues)
                },
                order: {
                    authenticationGroupName: "ASC"
                }
            });
            return authnGroups;
        }
        else if(userId){
            const rels: Array<AuthenticationGroupUserRel> = await this.getAuthenticationGroupUserRels(userId);
            const inValues: Array<string> = rels.map( (r: AuthenticationGroupUserRel) => r.authenticationGroupId);
            const authnGroups = await authnGroupRepo.find({
                where: {
                    authenticationGroupId: In(inValues)
                },
                order: {
                    authenticationGroupName: "ASC"
                }
            });
            return authnGroups;
        }
        else {
            return [];
        }
    }

    public async getDefaultAuthenticationGroups(tenantId: string): Promise<Array<AuthenticationGroup>>{
        const authnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupRepository();
        const authnGroups = await authnGroupRepo.find({
            where: {
                tenantId: tenantId,
                defaultGroup: true
            },
            order: {
                authenticationGroupName: "ASC"
            }
        });
        return authnGroups;
    }

    protected async getAuthenticationGroupClientRels(clientId: string): Promise<Array<AuthenticationGroupClientRel>> {
        const authnGroupClientRelRepo = await RDBDriver.getInstance().getAuthenticationGroupClientRelRepository();
        const results = await authnGroupClientRelRepo.find({
            where: {
                clientId: clientId
            }
        });        
        return results && results.length > 0 ? Promise.resolve(results) : Promise.resolve([]);
    }
    
    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const authnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupRepository();
        const result = await authnGroupRepo.findOne({
            where: {
                authenticationGroupId: authenticationGroupId
            }
        })
        return result;
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const authnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupRepository();
        await authnGroupRepo.insert(authenticationGroup);
        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const authnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupRepository();
        await authnGroupRepo.update(
            {
                authenticationGroupId: authenticationGroup.authenticationGroupId
            },
            authenticationGroup
        );
        return Promise.resolve(authenticationGroup);
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        
        const authnGroupClientRelRepo = await RDBDriver.getInstance().getAuthenticationGroupClientRelRepository();
        await authnGroupClientRelRepo.delete({
            authenticationGroupId: authenticationGroupId
        });
        
        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids   
        const authnGroupUserRelRepo = await RDBDriver.getInstance().getAuthenticationGroupUserRelRepository();     
        let hasMoreRecords = true;
        while(hasMoreRecords){            
            const userRels = await authnGroupUserRelRepo.find({
                where: {
                    authenticationGroupId: authenticationGroupId
                },
                take: 1000
            });
            if(userRels.length === 0){
                hasMoreRecords = false;
                break;
            } 
            const conditions = userRels.map(
                (rel: AuthenticationGroupUserRel) => {
                    return {
                        userId: rel.userId,
                        authenticationGroupId: rel.authenticationGroupId
                    }
                }
            );

            await authnGroupUserRelRepo
                .createQueryBuilder()
                .delete()
                .from("authenticationGroupUserRel")
                .where(
                    new Brackets(
                        qb => {
                            conditions.forEach(
                                (condition, index) => {
                                    if(index === 0) {
                                        qb.where(
                                            "userId = :userId_0 AND authenticationGroupId = :authenticationGroupId_0",
                                            {
                                                ["userId_0"]: condition.userId,
                                                ["authenticationGroupId_0"]: condition.authenticationGroupId
                                            }
                                        )
                                    }
                                    else{
                                        qb.orWhere(
                                            `userId = :userId_${index} AND authenticationGroupId = :authenticationGroupId_${index}`,
                                            {
                                                [`userId_${index}`]: condition.userId,
                                                [`authenticationGroupId_${index}`]: condition.authenticationGroupId
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

        const authnGroupRepo = await RDBDriver.getInstance().getAuthenticationGroupRepository();
        await authnGroupRepo.delete({
            authenticationGroupId: authenticationGroupId
        });
                
    }

    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        const authnGroupClientRelRepo = await RDBDriver.getInstance().getAuthenticationGroupClientRelRepository();
        const model: AuthenticationGroupClientRel = {
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
        };
        await authnGroupClientRelRepo.insert(model);
        return Promise.resolve(model);
    }

    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        const authnGroupClientRelRepo = await RDBDriver.getInstance().getAuthenticationGroupClientRelRepository();
        await authnGroupClientRelRepo.delete({
            clientId: clientId,
            authenticationGroupId: authenticationGroupId
        });        
        return Promise.resolve();
    }

    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        const authnGroupUserRelRepo = await RDBDriver.getInstance().getAuthenticationGroupUserRelRepository();
        const model: AuthenticationGroupUserRel = {
            userId: userId,
            authenticationGroupId: authenticationGroupId
        };
        await authnGroupUserRelRepo.insert(model);
        return Promise.resolve(model);
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        const authnGroupUserRelRepo = await RDBDriver.getInstance().getAuthenticationGroupUserRelRepository();
        await authnGroupUserRelRepo.delete({
            userId: userId,
            authenticationGroupId: authenticationGroupId            
        });
        return Promise.resolve();
    }

    protected async getAuthenticationGroupUserRels(userId: string): Promise<Array<AuthenticationGroupUserRel>> {
        const authnGroupUserRelRepo = await RDBDriver.getInstance().getAuthenticationGroupUserRelRepository();
        const results = await authnGroupUserRelRepo.find({
            where: {
                userId: userId
            }
        })
        return results;
        
    }

}

export default DBAuthenticationGroupDao;