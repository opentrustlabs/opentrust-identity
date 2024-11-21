import { Client, LoginGroup, LoginGroupClientRel, LoginGroupUserRel, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getClientDaoImpl, getLoginGroupDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import ClientDao from "../dao/client-dao";
import LoginGroupsDao from "../dao/login-group-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 

const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();
const loginGroupDao: LoginGroupsDao = getLoginGroupDaoImpl();


class LoginGroupService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getLoginGroups(tenantId?: string): Promise<Array<LoginGroup>> {
        return loginGroupDao.getLoginGroups(tenantId);
    }

    public async getLoginGroupById(loginGroupId: string): Promise<LoginGroup | null> {
        return loginGroupDao.getLoginGroupById(loginGroupId);
    }

    public async createLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        const tenant: Tenant | null = await tenantDao.getTenantById(loginGroup.tenantId);
        if (!tenant) {
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST_FOR_LOGIN_GROUP");
        }
        loginGroup.loginGroupId = randomUUID().toString();
        return loginGroupDao.createLoginGroup(loginGroup);
    }

    public async updateLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup> {
        
        const existingLoginGroup = await loginGroupDao.getLoginGroupById(loginGroup.loginGroupId);
        if (!existingLoginGroup) {
            throw new GraphQLError("ERROR_CANNOT_FIND_LOGIN_GROUP_FOR_UPDATE");
        }
        existingLoginGroup.loginGroupDescription = loginGroup.loginGroupDescription;
        existingLoginGroup.loginGroupName = loginGroup.loginGroupName;
        return loginGroupDao.updateLoginGroup(loginGroup);
    }

    public async deleteLoginGroup(loginGroupId: string): Promise<void> {
        return loginGroupDao.deleteLoginGroup(loginGroupId);
    }


    public async assignLoginGroupToClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if (!client) {
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_EXIST_FOR_LOGIN_GROUP_ASSIGNMENT");
        }
        const loginGroup = await this.getLoginGroupById(loginGroupId);
        if (!loginGroup) {
            throw new GraphQLError("ERROR_LOGIN_GROUP_DOES_NOT_EXIST_FOR_CLIENT_ASSIGNMENT");
        }
        // Do the tenants match?
        if (loginGroup.tenantId !== client.tenantId) {
            throw new GraphQLError("ERROR_CANNOT_ASSIGN_LOGIN_GROUP_TO_CLIENT")
        }
        const newRel = await loginGroupDao.assignLoginGroupToClient(loginGroupId, clientId);        
        return Promise.resolve(newRel);
    }
    public async removeLoginGroupFromClient(loginGroupId: string, clientId: string): Promise<void> {
        return loginGroupDao.removeLoginGroupFromClient(loginGroupId, clientId);
    }

    public async assignUserToLoginGroup(userId: string, loginGroupId: string): Promise<LoginGroupUserRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromLoginGroup(userId: string, loginGroupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default LoginGroupService;