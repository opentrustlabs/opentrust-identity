import { Group, UserGroupRel } from "@/graphql/generated/graphql-types";


abstract class GroupDao {
        
        abstract getGroups(tenantId?: string): Promise<Array<Group>>;
    
        abstract getGroupById(groupId: string): Promise<Group | null>;
    
        abstract createGroup(group: Group): Promise<Group>;
    
        abstract updateGroup(group: Group): Promise<Group>;
    
        abstract deleteGroup(groupId: string): Promise<void>;
    
        abstract addUserToGroup(userId: string, groupId: string): Promise<UserGroupRel>;
    
        abstract removeUserFromGroup(userId: string, groupId: string): Promise<void>;

}

export default GroupDao;