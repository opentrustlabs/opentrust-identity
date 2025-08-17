import { AuthenticationGroup, User, AuthorizationGroup, UserFailedLogin, UserTenantRel, UserCredential, UserMfaRel, Fido2Challenge, UserRegistrationState, UserAuthenticationState, UserTermsAndConditionsAccepted, UserRecoveryEmail, ProfileEmailChangeState } from "@/graphql/generated/graphql-types";

export type UserLookupType = "id" | "email" | "phone";
abstract class IdentityDao {

    
    abstract getUserGroups(userId: string): Promise<Array<AuthorizationGroup>>;

    abstract getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>>;

    abstract getFailedLogins(userId: string): Promise<Array<UserFailedLogin>>;

    abstract addFailedLogin(userFailedLogins: UserFailedLogin): Promise<void>;

    abstract removeFailedLogin(userId: string, failureAtMs: number): Promise<void>;

    abstract resetFailedLoginAttempts(userId: string): Promise<void>;

    abstract saveTOTP(userMfaRel: UserMfaRel): Promise<void>;

    abstract deleteTOTP(userId: string): Promise<void>;

    abstract getTOTP(userId: string): Promise<UserMfaRel | null>;
    
    abstract saveFIDOKey(userMfaRel: UserMfaRel): Promise<void>;

    abstract getFIDOKey(userId: string): Promise<UserMfaRel | null>;

    abstract deleteFIDOKey(userId: string): Promise<void>;

    abstract getFIDO2Challenge(userId: string): Promise<Fido2Challenge | null>;

    abstract saveFIDO2Challenge(fido2Challenge: Fido2Challenge): Promise<void>;

    abstract deleteFIDO2Challenge(userId: string): Promise<void>;

    abstract getUserMFARels(userId: string): Promise<Array<UserMfaRel>>;

    abstract getFido2Count(userId: string): Promise<number | null>;

    abstract updateFido2Count(userId: string, count: number): Promise<void>;

    abstract initFidoCount(userId: string, count: number): Promise<void>;

    abstract deleteFido2Count(userId: string): Promise<void>;

    abstract getUserBy(userLookupType: UserLookupType, value: string): Promise<User | null>;

    abstract savePasswordResetToken(userId: string, token: string): Promise<void>;

    abstract getUserByPasswordResetToken(token: string): Promise<User | null>;

    abstract deletePasswordResetToken(token: string): Promise<void>;

    abstract saveEmailConfirmationToken(userId: string, token: string): Promise<void>;

    abstract getUserByEmailConfirmationToken(token: string): Promise<User | null>;

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

    abstract getUserCredentials(userId: string): Promise<Array<UserCredential>>;

    abstract getUserCredentialForAuthentication(userId: string): Promise<UserCredential | null>;

    abstract addUserCredential(userCredential: UserCredential): Promise<void>;

    abstract deleteUserCredential(userId: string, dateCreated?: Date): Promise<void>;

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

    abstract createUserAuthenticationStates(arrUserAuthenticationState: Array<UserAuthenticationState>): Promise<Array<UserAuthenticationState>>;

    abstract getUserAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>>;

    abstract updateUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState>;

    abstract deleteUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState>;

    abstract createUserRegistrationStates(arrRegistrationState: Array<UserRegistrationState>): Promise<Array<UserRegistrationState>>;

    abstract getUserRegistrationStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>>;

    abstract getUserRegistrationStatesByEmail(email: string): Promise<Array<UserRegistrationState>>;

    abstract updateUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState>;

    abstract deleteUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState>;

    abstract getProfileEmailChangeStates(changeStateToken: string): Promise<Array<ProfileEmailChangeState>>;

    abstract createProfileEmailChangeStates(arrEmailChangeStates: Array<ProfileEmailChangeState>): Promise<Array<ProfileEmailChangeState>>;
    
    abstract updateProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<ProfileEmailChangeState>;

    abstract deleteProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<void>;

    abstract deleteExpiredData(): Promise<void>;

    abstract addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted): Promise<UserTermsAndConditionsAccepted>;

    abstract getUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<UserTermsAndConditionsAccepted | null>;

    abstract deleteUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<void>;

    abstract getUserRecoveryEmail(userId: string): Promise<UserRecoveryEmail | null>;

    abstract addRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>;

    abstract updateRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>;

    abstract deleteRecoveryEmail(userId: string): Promise<void>;

    abstract addUserDuressCredential(userCredential: UserCredential): Promise<void>;

    abstract getUserDuressCredential(userId: string): Promise<UserCredential | null>;

    abstract deleteUserDuressCredential(userId: string): Promise<void>;

    abstract addUserAuthenticationHistory(userId: string, authenticatedAtMs: number): Promise<void>;
    
}

export default IdentityDao;