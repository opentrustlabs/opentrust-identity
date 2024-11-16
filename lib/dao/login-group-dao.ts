import { LoginGroup, LoginGroupClientRel, LoginGroupUserRel } from "@/graphql/generated/graphql-types";


abstract class LoginGroupsDao {

        /////////////////   LOGIN GROUPS   ///////////////////////
        abstract getLoginGroups(tenantId?: string): Promise<Array<LoginGroup>>;

        abstract getLoginGroupById(loginGroupId: string): Promise<LoginGroup | null>;
    
        abstract createLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup>;
    
        abstract updateLoginGroup(loginGroup: LoginGroup): Promise<LoginGroup>;
    
        abstract deleteLoginGroup(loginGroupId: string): Promise<void>;
    
        abstract assignLoginGroupToClient(loginGroupId: string, clientId: string): Promise<LoginGroupClientRel>;
    
        abstract removeLoginGroupFromClient(loginGroupId: string, clientId: string): Promise<void>;

        abstract assignUserToLoginGroup(userId: string, loginGroupId: string): Promise<LoginGroupUserRel>;
    
        abstract removeUserFromLoginGroup(userId: string, loginGroupId: string): Promise<void>;

}

export default LoginGroupsDao;