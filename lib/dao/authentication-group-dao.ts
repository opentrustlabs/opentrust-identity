import { AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";


abstract class AuthenticationGroupDao {

        /////////////////   AUTHENTICATION GROUPS   ///////////////////////
        abstract getAuthenticationGroups(tenantId?: string, clientId?: string, userId?: string): Promise<Array<AuthenticationGroup>>;

        abstract getDefaultAuthenticationGroups(tenantId: string): Promise<Array<AuthenticationGroup>>;

        abstract getAuthenticationGroupById(authenticationGroupId: string): Promise<AuthenticationGroup | null>;
    
        abstract createAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup>;
    
        abstract updateAuthenticationGroup(authenticationGroup: AuthenticationGroup): Promise<AuthenticationGroup>;
    
        abstract deleteAuthenticationGroup(authenticationGroupId: string): Promise<void>;
    
        abstract assignAuthenticationGroupToClient(authenticationGroupId: string, clientId: string): Promise<AuthenticationGroupClientRel>;
    
        abstract removeAuthenticationGroupFromClient(authenticationGroupId: string, clientId: string): Promise<void>;

        abstract assignUserToAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<AuthenticationGroupUserRel>;
    
        abstract removeUserFromAuthenticationGroup(userId: string, authenticationGroupId: string): Promise<void>;

}

export default AuthenticationGroupDao;