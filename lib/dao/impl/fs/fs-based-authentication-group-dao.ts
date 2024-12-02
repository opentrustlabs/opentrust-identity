import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { GraphQLError } from "graphql";
import { AUTHENTICATION_GROUP_CLIENT_REL_FILE, AUTHENTICATION_GROUP_FILE} from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";
import AuthenticationGroupDao from "../../authentication-group-dao";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedAuthenticationGroupDao extends AuthenticationGroupDao {

    
    public async getAuthenticationGroups(tenantId?: string): Promise<Array<AuthenticationGroup>> {
        const loginGroups: Array<AuthenticationGroup> = JSON.parse(getFileContents(`${dataDir}/${AUTHENTICATION_GROUP_FILE}`, "[]"));
        if (tenantId) {
            return Promise.resolve(
                loginGroups.filter(
                    (l: AuthenticationGroup) => l.tenantId === tenantId
                )
            )
        }
        return Promise.resolve(loginGroups);
    }

    public async getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null> {
        const loginGroups: Array<AuthenticationGroup> = await this.getAuthenticationGroups();
        const loginGroup = loginGroups.find(
            (l: AuthenticationGroup) => l.authenticationGroupId === authenticationGroupId
        )
        return loginGroup === undefined ? Promise.resolve(null) : Promise.resolve(loginGroup);
    }

    public async createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const a: Array<AuthenticationGroup> = await this.getAuthenticationGroups();
        a.push(authenticationGroup);
        writeFileSync(`${dataDir}/${AUTHENTICATION_GROUP_FILE}`, JSON.stringify(a), { encoding: "utf-8" });
        return Promise.resolve(authenticationGroup);
    }

    public async updateAuthenticationGroup(loginGroup: AuthenticationGroup): Promise<AuthenticationGroup> {
        const a: Array<AuthenticationGroup> = await this.getAuthenticationGroups();
        const existingLoginGroup = a.find(
            (l: AuthenticationGroup) => l.authenticationGroupId === loginGroup.authenticationGroupId
        )
        if (!existingLoginGroup) {
            throw new GraphQLError("ERROR_CANNOT_FIND_LOGIN_GROUP_FOR_UPDATE");
        }
        existingLoginGroup.authenticationGroupDescription = loginGroup.authenticationGroupDescription;
        existingLoginGroup.authenticationGroupName = loginGroup.authenticationGroupName;
        writeFileSync(`${dataDir}/${AUTHENTICATION_GROUP_FILE}`, JSON.stringify(a), { encoding: "utf-8" });
        return Promise.resolve(existingLoginGroup);
    }

    public async deleteAuthenticationGroup(authenticationGroupId: string): Promise<void> {
        let a: Array<AuthenticationGroup> = await this.getAuthenticationGroups();
        a = a.filter(
            (l: AuthenticationGroup) => l.authenticationGroupId !== authenticationGroupId
        )
        writeFileSync(`${dataDir}/${AUTHENTICATION_GROUP_FILE}`, JSON.stringify(a), { encoding: "utf-8" });
    }


    public async assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel> {
        
        const rels: Array<AuthenticationGroupClientRel> = JSON.parse(getFileContents(`${dataDir}/${AUTHENTICATION_GROUP_CLIENT_REL_FILE}`));
        const existingRel = rels.find(
            (r: AuthenticationGroupClientRel) => r.clientId === clientId && r.authenticationGroupId === authenticationGroupId
        )
        if (existingRel) {
            return Promise.resolve(existingRel);
        }
        const newRel: AuthenticationGroupClientRel = {
            authenticationGroupId: authenticationGroupId,
            clientId: clientId
        }
        rels.push(newRel);
        writeFileSync(`${dataDir}/${AUTHENTICATION_GROUP_CLIENT_REL_FILE}`, JSON.stringify(rels), { encoding: "utf-8" });
        return Promise.resolve(newRel);
    }
    public async removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void> {
        let rels: Array<AuthenticationGroupClientRel> = JSON.parse(getFileContents(`${dataDir}/${AUTHENTICATION_GROUP_CLIENT_REL_FILE}`));
        rels = rels.filter(
            (r: AuthenticationGroupClientRel) => !(r.clientId === clientId && r.authenticationGroupId === authenticationGroupId)
        )
        writeFileSync(`${dataDir}/${AUTHENTICATION_GROUP_CLIENT_REL_FILE}`, JSON.stringify(rels), { encoding: "utf-8" });
    }


    public async assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default FSBasedAuthenticationGroupDao;