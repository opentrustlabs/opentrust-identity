import GroupDao from "../../group-dao";
import { Group, UserGroupRel } from "@/graphql/generated/graphql-types";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { GraphQLError } from "graphql";
import { GROUP_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedGroupDao extends GroupDao {

    
    public async getGroups(tenantId?: string): Promise<Array<Group>> {
        const groups: Array<Group> = JSON.parse(getFileContents(`${dataDir}/${GROUP_FILE}`, "[]"));
        if(tenantId){
            return Promise.resolve(
                groups.filter(
                    (g: Group) => g.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(groups);
    }

    public async getGroupById(groupId: string): Promise<Group> {
        const groups: Array<Group> = await this.getGroups();
        const group: Group | undefined = groups.find(
            (g: Group) => g.groupId === groupId
        )
        if(!group){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }
        return Promise.resolve(group);        
    }

    public async createGroup(group: Group): Promise<Group> {
        const groups: Array<Group> = await this.getGroups();
        groups.push(group);
        writeFileSync(`${dataDir}/${GROUP_FILE}`, JSON.stringify(groups), {encoding: "utf-8"});
        return Promise.resolve(group);
    }

    public async updateGroup(group: Group): Promise<Group> {
        const groups: Array<Group> = await this.getGroups();
        const existingGroup: Group | undefined = groups.find(
            (g: Group) => g.groupId === group.groupId
        )
        if(!existingGroup){
            throw new GraphQLError("ERROR_GROUP_NOT_FOUND");
        }        
        writeFileSync(`${dataDir}/${GROUP_FILE}`, JSON.stringify(groups), {encoding: "utf-8"});
        return Promise.resolve(existingGroup);  
    }

    public async deleteGroup(groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserToGroup(userId: string, groupId: string): Promise<UserGroupRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default FSBasedGroupDao;