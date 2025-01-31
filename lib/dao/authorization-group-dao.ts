import { AuthorizationGroup, AuthorizationGroupUserRel } from "@/graphql/generated/graphql-types";


abstract class AuthorizationGroupDao {
        
        abstract getAuthorizationGroups(tenantId?: string): Promise<Array<AuthorizationGroup>>;
    
        abstract getAuthorizationGroupById(groupId: string): Promise<AuthorizationGroup | null>;
    
        abstract createAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup>;
    
        abstract updateAuthorizationGroup(group: AuthorizationGroup): Promise<AuthorizationGroup>;
    
        abstract deleteAuthorizationGroup(groupId: string): Promise<void>;
    
        abstract addUserToAuthorizationGroup(userId: string, groupId: string): Promise<AuthorizationGroupUserRel>;
    
        abstract removeUserFromAuthorizationGroup(userId: string, groupId: string): Promise<void>;

        abstract getUserAuthorizationGroups(userId: string): Promise<Array<AuthorizationGroup>>;

}

export default AuthorizationGroupDao;