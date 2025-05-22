import { AuthenticationGroup, User, AuthorizationGroup, SuccessfulLoginResponse, UserFailedLoginAttempts, UserTenantRel, UserCredential, UserMfaRel } from "@/graphql/generated/graphql-types";

export type UserLookupType = "id" | "email" | "phone";
abstract class IdentityDao {

    
    abstract getUserGroups(userId: string): Promise<Array<AuthorizationGroup>>;

    abstract getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>>;

    abstract loginUser(username: string, password: string): Promise<SuccessfulLoginResponse | Error>;

    abstract getLoginAttempts(userId: string): Promise<Array<UserFailedLoginAttempts>>;

    abstract incrementLoginAttempts(userId: string): Promise<void>;

    abstract resetLoginAttempts(userId: string): Promise<void>;

    // challengeType could be email (as for registration of new users), sms, time-based-otp, or security key
    abstract validateOTP(userId: string, challenge: string, challengeId: string, challengeType: string): Promise<boolean>;

    abstract saveTOTP(userMfaRel: UserMfaRel): Promise<void>;

    abstract deleteTOTP(userId: string): Promise<void>;

    abstract getTOTP(userId: string): Promise<UserMfaRel | null>;

    abstract getUserMFARels(userId: string): Promise<Array<UserMfaRel>>;

    abstract getUserBy(userLookupType: UserLookupType, value: string): Promise<User | null>;

    abstract savePasswordResetToken(userId: string, token: string): Promise<void>;

    abstract getUserByPasswordResetToken(userId: string): Promise<User | null>;

    abstract deletePasswordResetToken(token: string): Promise<void>;

    abstract saveEmailConfirmationToken(userId: string, token: string): Promise<void>;

    abstract getUserByEmailConfirmationToken(userId: string): Promise<User | null>;

    abstract deleteEmailConfirmationToken(token: string): Promise<void>;




    /**
     * Creates a user (if they user does not already exist based on email or phone number) 
     * and assigns the user to the tenant as the PRIMARY tenant. This is for
     * cases where the tenant may be using SSO with an external OIDC provider and so no
     * password is necessary, or for when the user is registering and needs to supply
     * a password. 
     * 
     * @param user 
     */
    abstract createUser(user: User): Promise<User>;

    abstract addUserCredential(userCredential: UserCredential): Promise<void>;

    abstract updateUser(user: User): Promise<User>;

    abstract unlockUser(userId: string): Promise<void>;

    abstract deleteUser(userId: string): Promise<void>;    

    abstract passwordProhibited(password: string): Promise<boolean>;

    /**
     * Assigns the user to the tenant with the given relationship type, which can either
     * be "PRIMARY" or "GUEST". A user must be in at-most exactly ONE primary tenant
     * They can be guests in many different tenants, if the tenants allow for it.
     * 
     * @param tenantId 
     * @param userId 
     * @param relType 
     */
    abstract assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel>;

    /**
     * Used for changing the assignment of the relationship type to an existing user-tenant-rel record
     * @param tenantId 
     * @param userId 
     * @param relType 
     */
    abstract updateUserTenantRel(tenantId: string, userId: string, relType: string): Promise<UserTenantRel>;

    /**
     * Cannot remove a user from their PRIMARY tenant. If necessary, a user can be assigned a
     * GUEST relationship type to the tenant, then assigned a PRIMARY relationship to another
     * tenant
     * 
     * @param tenantId 
     * @param userId 
     */
    abstract removeUserFromTenant(tenantId: string, userId: string): Promise<void>;

    abstract getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null>;

    abstract getUserTenantRelsByUserId(userId: string): Promise<Array<UserTenantRel>>;

}

export default IdentityDao;