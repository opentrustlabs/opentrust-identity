import { AuthenticationGroup, User, AuthorizationGroup, SuccessfulLoginResponse, UserFailedLoginAttempts, UserTenantRel } from "@/graphql/generated/graphql-types";

abstract class IdentityDao {

    abstract getUsers(clientId: string): Promise<Array<User>>;

    abstract getUserGroups(userId: string): Promise<Array<AuthorizationGroup>>;

    abstract getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>>;

    abstract loginUser(username: string, password: string): Promise<SuccessfulLoginResponse | Error>;

    abstract getLoginAttempts(userId: string): Promise<Array<UserFailedLoginAttempts>>;

    abstract incrementLoginAttempts(userId: string): Promise<void>;

    abstract resetLoginAttempts(userId: string): Promise<void>;

    // challengeType could be email (as for registration of new users), sms, time-based-otp, or security key
    abstract validateOTP(userId: string, challenge: string, challengeId: string, challengeType: string): Promise<boolean>;

    abstract getUserById(userId: string): Promise<User | null>;

    abstract savePasswordResetToken(userId: string, token: string): Promise<void>;

    abstract getUserByPasswordResetToken(userId: string): Promise<User | null>;

    abstract deletePasswordResetToken(token: string): Promise<void>;

    abstract saveEmailConfirmationToken(userId: string, token: string): Promise<void>;

    abstract getUserByEmailConfirmationToken(userId: string): Promise<User | null>;

    abstract deleteEmailConfirmationToken(token: string): Promise<void>;


    /**
     * Creates a user (if they user does not already exist based on email or phone number) 
     * and hashed credentials from a registration page and assigns the 
     * user to the tenant as the PRIMARY tenant for the user.
     * 
     * @param user 
     * @param password 
     * @param tenantId 
     */
    abstract registerUser(user: User, password: string, tenantId: string): Promise<User>;

    /**
     * creates a user and assigns the user to the tenant as the PRIMARY tenant. This is for
     * cases where the tenant may be using SSO with an external OIDC provider and so no
     * password is necessary.
     * 
     * @param user 
     */
    abstract createUser(user: User, tenantId: string): Promise<User>;

    abstract updateUser(user: User): Promise<User>;

    abstract deleteUser(userId: string): Promise<void>;    


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
     * Cannot remove a user from their PRIMARY tenant. If necessary, a user can be assigned a
     * GUEST relationship type to the tenant, then assigned a PRIMARY relationship to another
     * tenant
     * 
     * @param tenantId 
     * @param userId 
     */
    abstract removeUserFromTenant(tenantId: string, userId: string): Promise<void>;

    abstract getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null>;

}

export default IdentityDao;