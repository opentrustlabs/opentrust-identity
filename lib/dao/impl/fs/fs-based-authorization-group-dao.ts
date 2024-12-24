import GroupDao from "../../authorization-group-dao";
import { AuthorizationGroup, UserAuthorizationGroupRel } from "@/graphql/generated/graphql-types";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { GraphQLError } from "graphql";
import { GROUP_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";
import AuthorizationGroupDao from "../../authorization-group-dao";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedAuthorizationGroupDao extends AuthorizationGroupDao {
    
    
    public async getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>> {
        const groups: Array<AuthorizationGroup> = JSON.parse(getFileContents(`${dataDir}/${GROUP_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                groups.filter(
                    (g: AuthorizationGroup) => g.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(groups);
    }

    public async getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup> {
        const groups: Array<AuthorizationGroup> = await this.getAuthorizationGroups();
        const group: AuthorizationGroup | undefined = groups.find(
            (g: AuthorizationGroup) => g.groupId === groupId
        )
        if(!group){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        return Promise.resolve(group);        
    }

    public async createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const groups: Array<AuthorizationGroup> = await this.getAuthorizationGroups();
        groups.push(group);
        writeFileSync(`${dataDir}/${GROUP_FILE}`, JSON.stringify(groups), {encoding: "utf-8"});
        return Promise.resolve(group);
    }

    public async updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup> {
        const groups: Array<AuthorizationGroup> = await this.getAuthorizationGroups();
        const existingGroup: AuthorizationGroup | undefined = groups.find(
            (g: AuthorizationGroup) => g.groupId === group.groupId
        )
        if(!existingGroup){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }        
        writeFileSync(`${dataDir}/${GROUP_FILE}`, JSON.stringify(groups), {encoding: "utf-8"});
        return Promise.resolve(existingGroup);  
    }

    public async deleteAuthorizationGroup(groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserToAuthorizationGroup(userId: string, groupId: string): Promise<UserAuthorizationGroupRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void> {
        throw new Error("Method not implemented.");

    }

    public async getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>>{
        throw new Error("Method not implemented.");
    }
}

export default FSBasedAuthorizationGroupDao;