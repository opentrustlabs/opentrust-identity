import { UserFailedLogin, UserMfaRel, Fido2Challenge, User, UserCredential, UserTenantRel, UserAuthenticationState, UserRegistrationState, ProfileEmailChangeState, UserTermsAndConditionsAccepted, UserRecoveryEmail } from "@/graphql/generated/graphql-types";
import IdentityDao, { UserLookupType } from "../../identity-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP } from "@/utils/consts";


class CassandraIdentityDao extends IdentityDao {


    public async getFailedLogins(userId: string): Promise<Array<UserFailedLogin>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_failed_login");
        const results = await mapper.find({
            userId: userId
        });
        return results.toArray();
    }

    public async addFailedLogin(userFailedLogin: UserFailedLogin): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_failed_login");
        await mapper.insert(userFailedLogin);
        return;
    }

    public async removeFailedLogin(userId: string, failureAtMs: number): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_failed_login");
        await mapper.remove({
            userId: userId,
            failureAtMs: failureAtMs
        });
        return;
    }

    public async resetFailedLoginAttempts(userId: string): Promise<void> {
        const failedLogins: Array<UserFailedLogin> = await this.getFailedLogins(userId);
        if(failedLogins && failedLogins.length > 0){
            const mapper = await CassandraDriver.getInstance().getModelMapper("user_failed_login");
            for(let i = 0; i < failedLogins.length; i++){
                await mapper.remove({
                    userId: userId,
                    failureAtMs: failedLogins[i].failureAtMs
                })
            }
        }

    }

    public async saveTOTP(userMfaRel: UserMfaRel): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        await mapper.insert(userMfaRel);        
    }

    public async deleteTOTP(userId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        await mapper.remove({
            userId: userId,
            mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
        });
        return;
    }

    public async getTOTP(userId: string): Promise<UserMfaRel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        return mapper.get({
            userId: userId,
            mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
        });
    }

    public async saveFIDOKey(userMfaRel: UserMfaRel): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        await mapper.insert(userMfaRel); 
    }

    public async getFIDOKey(userId: string): Promise<UserMfaRel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        return mapper.get({
            userId: userId,
            mfaType: MFA_AUTH_TYPE_FIDO2
        });
    }

    public async deleteFIDOKey(userId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        await mapper.remove({
            userId: userId,
            mfaType: MFA_AUTH_TYPE_FIDO2
        });
        return;
    }

    public async getFIDO2Challenge(userId: string): Promise<Fido2Challenge | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_challenge");
        return mapper.get({
            userId: userId
        });
    }

    public async saveFIDO2Challenge(fido2Challenge: Fido2Challenge): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_challenge");
        const ttlSeconds = Math.floor( (fido2Challenge.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(fido2Challenge, {ttl: ttlSeconds});
        return;        
    }

    public async deleteFIDO2Challenge(userId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_challenge");
        await mapper.remove({
            userId: userId
        });
    }

    public async getUserMFARels(userId: string): Promise<Array<UserMfaRel>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        const results = await mapper.find({
            userId: userId
        });
        return results.toArray();
    }

    public async getFido2Count(userId: string): Promise<number | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_counter_rel");
        const result: {userId: string, fido2Counter: number} | null = await mapper.get({userId: userId});
        if(result){
            return result.fido2Counter;
        }
        else{
            return null;
        }        
    }

    public async updateFido2Count(userId: string, count: number): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_counter_rel");
        await mapper.update({
            userId: userId,
            fido2Counter: count
        });
        return;
    }

    public async initFidoCount(userId: string, count: number): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_counter_rel");
        await mapper.insert({
            userId: userId,
            fido2Counter: count
        });
        return;
    }

    public async deleteFido2Count(userId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_counter_rel");
        await mapper.remove({
            userId: userId
        });
        return;
    }

    public async getUserBy(userLookupType: UserLookupType, value: string): Promise<User | null> {
        if(userLookupType === "email"){
            const mapper = await CassandraDriver.getInstance().getModelMapper("users_by_email");            
            return mapper.get({
                email: value
            });
        }
        else if(userLookupType === "id"){
            const mapper = await CassandraDriver.getInstance().getModelMapper("users_by_email");            
            return mapper.get({
                userId: value
            });
        }
        else if(userLookupType === "federatedoidcproviderid"){
            const mapper = await CassandraDriver.getInstance().getModelMapper("users_by_federated_oidc_id");            
            return mapper.get({
                federatedOIDCProviderSubjectId: value
            });
        }
        else if(userLookupType === "phone"){
            const mapper = await CassandraDriver.getInstance().getModelMapper("users_by_phone_number");            
            return mapper.get({
                phoneNumber: value
            });
        }
        else{
            return null;
        }

    }

    public async savePasswordResetToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserByPasswordResetToken(token: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserByEmailConfirmationToken(token: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteEmailConfirmationToken(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async createUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async getUserCredentials(userId: string): Promise<Array<UserCredential>> {
        throw new Error("Method not implemented.");
    }

    public async getUserCredentialForAuthentication(userId: string): Promise<UserCredential | null> {
        throw new Error("Method not implemented.");
    }

    public async addUserCredential(userCredential: UserCredential): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserCredential(userId: string, dateCreatedMs?: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async updateUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async unlockUser(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteUser(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async passwordProhibited(password: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        throw new Error("Method not implemented.");
    }

    public async updateUserTenantRel(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        throw new Error("Method not implemented.");
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null> {
        throw new Error("Method not implemented.");
    }

    public async getUserTenantRelsByUserId(userId: string): Promise<Array<UserTenantRel>> {
        throw new Error("Method not implemented.");
    }

    public async createUserAuthenticationStates(arrUserAuthenticationState: Array<UserAuthenticationState>): Promise<Array<UserAuthenticationState>> {
        throw new Error("Method not implemented.");
    }

    public async getUserAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        throw new Error("Method not implemented.");
    }

    public async updateUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        throw new Error("Method not implemented.");
    }

    public async createUserRegistrationStates(arrRegistrationState: Array<UserRegistrationState>): Promise<Array<UserRegistrationState>> {
        throw new Error("Method not implemented.");
    }

    public async getUserRegistrationStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>> {
        throw new Error("Method not implemented.");
    }

    public async getUserRegistrationStatesByEmail(email: string): Promise<Array<UserRegistrationState>> {
        throw new Error("Method not implemented.");
    }

    public async updateUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        throw new Error("Method not implemented.");
    }

    public async getProfileEmailChangeStates(changeStateToken: string): Promise<Array<ProfileEmailChangeState>> {
        throw new Error("Method not implemented.");
    }

    public async createProfileEmailChangeStates(arrEmailChangeStates: Array<ProfileEmailChangeState>): Promise<Array<ProfileEmailChangeState>> {
        throw new Error("Method not implemented.");
    }

    public async updateProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<ProfileEmailChangeState> {
        throw new Error("Method not implemented.");
    }

    public async deleteProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteExpiredData(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted): Promise<UserTermsAndConditionsAccepted> {
        throw new Error("Method not implemented.");
    }

    public async getUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<UserTermsAndConditionsAccepted | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserRecoveryEmail(userId: string): Promise<UserRecoveryEmail | null> {
        throw new Error("Method not implemented.");
    }

    public async addRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail> {
        throw new Error("Method not implemented.");
    }

    public async updateRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail> {
        throw new Error("Method not implemented.");
    }

    public async deleteRecoveryEmail(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserDuressCredential(userCredential: UserCredential): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserDuressCredential(userId: string): Promise<UserCredential | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserDuressCredential(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async addUserAuthenticationHistory(userId: string, authenticatedAtMs: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default CassandraIdentityDao;