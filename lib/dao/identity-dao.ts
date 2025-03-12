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

    abstract createUser(user: User): Promise<User>;

    abstract updateUser(user: User): Promise<User>;

    abstract deleteUser(userId: string): Promise<void>;

    abstract assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel>;

    abstract removeUserFromTenant(tenantId: string, userId: string): Promise<void>;

    abstract getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null>;

}

export default IdentityDao;