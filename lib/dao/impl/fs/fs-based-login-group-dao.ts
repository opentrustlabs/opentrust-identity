import LoginGroupsDao from "../../login-group-dao";
import { Tenant, Client, Group, LoginGroup,LoginGroupClientRel, UserGroupRel, ClientType, LoginGroupUserRel } from "@/graphql/generated/graphql-types";
import TenantDAO from "../../tenant-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from 'crypto'; 
import { GraphQLError } from "graphql";
import { GROUP_FILE, LOGIN_GROUP_CLIENT_REL_FILE, LOGIN_GROUP_FILE, ROOT_TENANT_FILE, TENANT_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);


class FSBasedLoginGroupDao extends LoginGroupsDao {

    // LOGIN GROUPS METHODS
    public async getLoginGroups(tenantId?: string): Promise<Array<LoginGroup>> {
        const loginGroups: Array<LoginGroup> = JSON.parse(getFileContents(`${dataDir}/${LOGIN_GROUP_FILE}`, "[]"));
        if (tenantId) {
            return Promise.resolve(
                loginGroups.filter(
                    (l: LoginGroup) => l.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(loginGroups);
    }

    public async getLoginGroupById(loginGroupId: string): Promise<LoginGroup | null> {
        const loginGroups: Array<LoginGroup> = await this.getLoginGroups();
        const loginGroup = loginGroups.find(
            (l: LoginGroup) => l.loginGroupId === loginGroupId
        )
        return loginGroup === undefined ? Promise.resolve(null) : Promise.resolve(loginGroup);
    }

    public async createLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        const a: Array<LoginGroup> = await this.getLoginGroups();
        a.push(loginGroup);
        writeFileSync(`${dataDir}/${LOGIN_GROUP_FILE}`, JSON.stringify(a), { encoding: "utf-8" });
        return Promise.resolve(loginGroup);
    }

    public async updateLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        const a: Array<LoginGroup> = await this.getLoginGroups();
        const existingLoginGroup = a.find(
            (l: LoginGroup) => l.loginGroupId === loginGroup.loginGroupId
        )
        if (!existingLoginGroup) {
            throw new GraphQLError("ERROR_CANNOT_FIND_LOGIN_GROUP_FOR_UPDATE");
        }
        existingLoginGroup.loginGroupDescription = loginGroup.loginGroupDescription;
        existingLoginGroup.loginGroupName = loginGroup.loginGroupName;
        writeFileSync(`${dataDir}/${LOGIN_GROUP_FILE}`, JSON.stringify(a), { encoding: "utf-8" });
        return Promise.resolve(existingLoginGroup);
    }

    public async deleteLoginGroup(loginGroupId: string): Promise<void> {
        let a: Array<LoginGroup> = await this.getLoginGroups();
        a = a.filter(
            (l: LoginGroup) => l.loginGroupId !== loginGroupId
        )
        writeFileSync(`${dataDir}/${LOGIN_GROUP_FILE}`, JSON.stringify(a), { encoding: "utf-8" });
    }


    public async assignLoginGroupToClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel> {
        
        const rels: Array<LoginGroupClientRel> = JSON.parse(getFileContents(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`));
        const existingRel = rels.find(
            (r: LoginGroupClientRel) => r.clientId === clientId && r.loginGroupId === loginGroupId
        )
        if (existingRel) {
            return Promise.resolve(existingRel);
        }
        const newRel: LoginGroupClientRel = {
            loginGroupId: loginGroupId,
            clientId: clientId
        }
        rels.push(newRel);
        writeFileSync(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`, JSON.stringify(rels), { encoding: "utf-8" });
        return Promise.resolve(newRel);
    }
    public async removeLoginGroupFromClient(loginGroupId: string, clientId: string): Promise<void> {
        let rels: Array<LoginGroupClientRel> = JSON.parse(getFileContents(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`));
        rels = rels.filter(
            (r: LoginGroupClientRel) => !(r.clientId === clientId && r.loginGroupId === loginGroupId)
        )
        writeFileSync(`${dataDir}/${LOGIN_GROUP_CLIENT_REL_FILE}`, JSON.stringify(rels), { encoding: "utf-8" });
    }

    public async assignUserToLoginGroup(userId: string, loginGroupId: string): Promise<LoginGroupUserRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromLoginGroup(userId: string, loginGroupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default FSBasedLoginGroupDao;