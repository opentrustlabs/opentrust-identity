import { UserFailedLogin, UserMfaRel, Fido2Challenge, User, UserCredential, UserTenantRel, UserAuthenticationState, UserRegistrationState, ProfileEmailChangeState, UserTermsAndConditionsAccepted, UserRecoveryEmail, AuthenticationGroupUserRel, AuthorizationGroupUserRel, UserScopeRel } from "@/graphql/generated/graphql-types";
import IdentityDao, { UserLookupType } from "../../identity-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { types } from "cassandra-driver";
import { MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, VERIFICATION_TOKEN_TYPE_PASSWORD_RESET, VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL } from "@/utils/consts";



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
            userId: types.Uuid.fromString(userId),
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
                    userId: types.Uuid.fromString(userId),
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
            userId: types.Uuid.fromString(userId),
            mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
        });
        return;
    }

    public async getTOTP(userId: string): Promise<UserMfaRel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        return mapper.get({
            userId: types.Uuid.fromString(userId),
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
            userId: types.Uuid.fromString(userId),
            mfaType: MFA_AUTH_TYPE_FIDO2
        });
    }

    public async deleteFIDOKey(userId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_mfa_rel");
        await mapper.remove({
            userId: types.Uuid.fromString(userId),
            mfaType: MFA_AUTH_TYPE_FIDO2
        });
        return;
    }

    public async getFIDO2Challenge(userId: string): Promise<Fido2Challenge | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_fido2_challenge");
        return mapper.get({
            userId: types.Uuid.fromString(userId)
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
            userId: types.Uuid.fromString(userId)
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
        const result: {userId: string, fido2Counter: number} | null = await mapper.get({userId: types.Uuid.fromString(userId)});
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
            userId: types.Uuid.fromString(userId)
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
            const mapper = await CassandraDriver.getInstance().getModelMapper("users");            
            return mapper.get({
                userId: types.Uuid.fromString(value)
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
        await this.saveUserVerificationToken(userId, token, VERIFICATION_TOKEN_TYPE_PASSWORD_RESET, 10);
        return; 
    }

    public async getUserByPasswordResetToken(token: string): Promise<User | null> {
        return this.getUserByUserVerificationToken(token);
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        await this.deleteUserVerificationToken(token);
    }

    public async saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        await this.saveUserVerificationToken(userId, token, VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL, 60);
        return;
    }

    public async getUserByEmailConfirmationToken(token: string): Promise<User | null> {
        return this.getUserByUserVerificationToken(token);
    }

    public async deleteEmailConfirmationToken(token: string): Promise<void> {
        await this.deleteUserVerificationToken(token);
    }

    
    public async createUser(user: User): Promise<User> {
        const userMapper = await CassandraDriver.getInstance().getModelMapper("users");
        await userMapper.insert(user);
        const userByEmailMapper = await CassandraDriver.getInstance().getModelMapper("users_by_email");
        await userByEmailMapper.insert(user);
        if(user.phoneNumber && user.phoneNumber.length > 0){
            const userByPhoneMapper = await CassandraDriver.getInstance().getModelMapper("users_by_phone_number");
            await userByPhoneMapper.insert(user);                
        }
        if(user.federatedOIDCProviderSubjectId && user.federatedOIDCProviderSubjectId.length > 0){
            const usersByOidcMapper = await CassandraDriver.getInstance().getModelMapper("users_by_federated_oidc_id");
            await usersByOidcMapper.insert(user);
        }
        return user;
    }

    /**
     * Note that data in the user_credential table is stored with the column datecreatedatms ordered
     * descending
     * @param userId 
     * @returns 
     */
    public async getUserCredentials(userId: string): Promise<Array<UserCredential>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_credential");
        const results = await mapper.find({
            userId: userId
        });
        return results.toArray();
    }

    /**
     * Note that data in the user_credential table is stored with the column datecreatedatms ordered
     * descending.
     * @param userId 
     * @returns 
     */
    public async getUserCredentialForAuthentication(userId: string): Promise<UserCredential | null> {
        const arr: Array<UserCredential> = await this.getUserCredentials(userId);
        if(arr.length > 0){
            return arr[0];
        }
        else{
            return null;
        }
    }

    public async addUserCredential(userCredential: UserCredential): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_credential");
        await mapper.insert(userCredential);
        return;
    }

    public async deleteUserCredential(userId: string, dateCreatedMs?: number): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_credential");
        if(dateCreatedMs){
            await mapper.remove({
                userId: types.Uuid.fromString(userId),
                dateCreatedMs: dateCreatedMs
            });
        }
        else{
            const arr: Array<UserCredential> = await this.getUserCredentials(userId);
            for(let i = 0; i < arr.length; i++){
                await mapper.remove({
                    userId: types.Uuid.fromString(userId),
                    dateCreatedMs: arr[i].dateCreatedMs
                });
            }
        }
        return;
    }

    public async updateUser(user: User): Promise<User> {

        const userMapper = await CassandraDriver.getInstance().getModelMapper("users");
        const existingUser: User | null = await this.getUserBy("id", user.userId);
        if(existingUser === null){
            return user;
        }
        
        await userMapper.update(user);
        
        const userByEmailMapper = await CassandraDriver.getInstance().getModelMapper("users_by_email");
        // Did the user's email change? If so, delete the old record and insert a new one
        if(existingUser.email !== user.email){
            await userByEmailMapper.remove({
                email: existingUser.email
            });
            await userByEmailMapper.insert(user);
        }
        else {
            await userByEmailMapper.update(user);
        }

        const userByPhoneMapper = await CassandraDriver.getInstance().getModelMapper("users_by_phone_number");
        // Did the user's phone number change? If so, delete the old record and insert a new one
        if(user.phoneNumber && user.phoneNumber.length > 0){
             if(existingUser.phoneNumber && existingUser.phoneNumber.length > 0 && user.phoneNumber !== existingUser.phoneNumber){
                await userByPhoneMapper.remove({
                    phoneNumber: existingUser.phoneNumber
                });
                await userByPhoneMapper.insert(user);
             }
             else{
                await userByPhoneMapper.update(user);
             }
        }

        const usersByOidcMapper = await CassandraDriver.getInstance().getModelMapper("users_by_federated_oidc_id");
        // Did the user's federated oidc provider change? If so, delete the old record and insert a new one
        if(user.federatedOIDCProviderSubjectId && user.federatedOIDCProviderSubjectId.length > 0){
            if(existingUser.federatedOIDCProviderSubjectId && existingUser.federatedOIDCProviderSubjectId.length > 0 && user.federatedOIDCProviderSubjectId !== existingUser.federatedOIDCProviderSubjectId){
                await usersByOidcMapper.remove({
                    federatedOIDCProviderSubjectId: existingUser.federatedOIDCProviderSubjectId
                });
                await usersByOidcMapper.insert(user);
            }
            else {
                await usersByOidcMapper.update(user);
            }
        }
        return user;
    }

    public async unlockUser(userId: string): Promise<void> {
        const user: User | null = await this.getUserBy("id", userId);
        if(user){
            user.locked = false;
            await this.updateUser(user);
        }
        return;
    }

    public async deleteUser(userId: string): Promise<void> {

        const user: User | null = await this.getUserBy("id", userId);
        if(user === null){
            return;
        }

        const tenantRels: Array<UserTenantRel> = await this.getUserTenantRelsByUserId(userId);
        for(let i = 0; i < tenantRels.length; i++){
            await this.removeUserFromTenant(tenantRels[i].tenantId, userId);
        }

        const userUuid = types.Uuid.fromString(userId);
        const termsMapper =  await CassandraDriver.getInstance().getModelMapper("user_terms_and_conditions_accepted");        
        const termsAccepted: Array<UserTermsAndConditionsAccepted> = (await termsMapper.find({userId: userId})).toArray();
        for(let i = 0; i < termsAccepted.length; i++){
            await termsMapper.remove({
                userId: userUuid,
                tenantId: types.Uuid.fromString(termsAccepted[i].tenantId)
            });
        }

        const authnGroupsMapper = await CassandraDriver.getInstance().getModelMapper("authentication_group_user_rel");
        const authnGroups: Array<AuthenticationGroupUserRel> = (await authnGroupsMapper.find({userId: userId})).toArray();
        for(let i = 0; i < authnGroups.length; i++){
            await authnGroupsMapper.remove({
                userId: userUuid,
                authenticationGroupId: types.Uuid.fromString(authnGroups[i].authenticationGroupId)
            });
        }

        const authzGroupsMapper = await CassandraDriver.getInstance().getModelMapper("authorization_group_user_rel");
        const authzGroups: Array<AuthorizationGroupUserRel> = (await authzGroupsMapper.find({userId: userId})).toArray();
        for(let i = 0; i < authzGroups.length; i++){
            await authzGroupsMapper.remove({
                userId: userUuid,
                groupId: types.Uuid.fromString(authzGroups[i].groupId)
            });
        }

        const userCredentials: Array<UserCredential> = await this.getUserCredentials(userId);
        const userCredMapper = await CassandraDriver.getInstance().getModelMapper("user_credential");
        for(let i = 0; i < userCredentials.length; i++){
            await userCredMapper.remove({
                userId: userUuid,
                dateCreatedMs: userCredentials[i].dateCreatedMs
            });
        }
       
        const userScopeMapper = await CassandraDriver.getInstance().getModelMapper("user_scope_rel");
        const userScopes: Array<UserScopeRel> = (await userScopeMapper.find({userId: userId})).toArray();
        for(let i = 0; i < userScopes.length; i++){
            await userScopeMapper.remove({
                userId: userUuid,
                tenantId: types.Uuid.fromString(userScopes[i].tenantId),
                scopeId: types.Uuid.fromString(userScopes[i].scopeId)
            });
        }

        const cassandraClient = await CassandraDriver.getClient();
        await cassandraClient.execute(
            "DELETE FROM user_authentication_history WHERE userid = ?",
            [userUuid],
            {prepare: true}
        );
                
        await this.deleteTOTP(userId);
        await this.deleteFIDOKey(userId);
        await this.deleteFido2Count(userId);
        await this.deleteUserDuressCredential(userId);
        await this.resetFailedLoginAttempts(userId);
        await this.deleteRecoveryEmail(userId);

        const userMapper = await CassandraDriver.getInstance().getModelMapper("users");
        await userMapper.remove({
            userId: userUuid
        });

        const userByEmailMapper = await CassandraDriver.getInstance().getModelMapper("users_by_email");
        await userByEmailMapper.remove({
            email: user.email
        });

        if(user.federatedOIDCProviderSubjectId){
            const userByOidcIdMapper = await CassandraDriver.getInstance().getModelMapper("users_by_federated_oidc_id");
            await userByOidcIdMapper.remove({
                federatedOIDCProviderSubjectId: user.federatedOIDCProviderSubjectId
            });
        }
        if(user.phoneNumber){
            const userByPhoneMapper = await CassandraDriver.getInstance().getModelMapper("users_by_phone_number");
            await userByPhoneMapper.remove({
                phoneNumber: user.phoneNumber
            });
        }
      

    }

    public async passwordProhibited(password: string): Promise<boolean> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("prohibited_passwords");
        const result = await mapper.get({
            password: password
        });
        if(result){
            return true;
        }
        else{
            return false;
        }
    }

    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_tenant_rel");
        const userTenantRel: UserTenantRel = {
            enabled: true,
            relType: relType,
            tenantId: tenantId,
            userId: userId
        }
        await mapper.insert(userTenantRel);
        return userTenantRel;
    }

    public async updateUserTenantRel(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_tenant_rel");
        const userTenantRel: UserTenantRel = {
            enabled: true,
            relType: relType,
            tenantId: tenantId,
            userId: userId
        }
        await mapper.update(userTenantRel);
        return userTenantRel;
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_tenant_rel");
        await mapper.remove({
            tenantId: types.Uuid.fromString(tenantId),
            userId: types.Uuid.fromString(userId)
        });
        return;
    }

    public async getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_tenant_rel");
        return mapper.get({
            tenantId: types.Uuid.fromString(tenantId),
            userId: types.Uuid.fromString(userId)
        });        
    }

    public async getUserTenantRelsByUserId(userId: string): Promise<Array<UserTenantRel>> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_tenant_rel");
        const results = await mapper.find({
            userId: userId
        });
        return results.toArray();
    }

    public async createUserAuthenticationStates(arrUserAuthenticationState: Array<UserAuthenticationState>): Promise<Array<UserAuthenticationState>> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_authentication_state");
        const ttlSeconds = Math.floor( (arrUserAuthenticationState[0].expiresAtMs - Date.now()) / 1000);
        for(let i = 0; i < arrUserAuthenticationState.length; i++){
            await mapper.insert(arrUserAuthenticationState[i], {ttl: ttlSeconds});
        }
        return arrUserAuthenticationState;
    }

  
    public async getUserAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_authentication_state");
        const results = await mapper.find({
            authenticationSessionToken: authenticationSessionToken
        });
        return results.toArray();
    }

    public async updateUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_authentication_state");
        const ttlSeconds = Math.floor( (userAuthenticationState.expiresAtMs - Date.now()) / 1000);
        await mapper.update(userAuthenticationState, {ttl: ttlSeconds});
        return userAuthenticationState;
    }

    public async deleteUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_authentication_state");
        await mapper.remove({
            authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
            authenticationState: userAuthenticationState.authenticationState
        });
        return userAuthenticationState;
    }

    public async createUserRegistrationStates(arrRegistrationState: Array<UserRegistrationState>): Promise<Array<UserRegistrationState>> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_registration_state");
        const ttlSeconds = Math.floor( (arrRegistrationState[0].expiresAtMs - Date.now()) / 1000);
        for(let i = 0; i < arrRegistrationState.length; i++){
            await mapper.insert(arrRegistrationState[i], {ttl: ttlSeconds});
        }
        return arrRegistrationState;
    }

    public async getUserRegistrationStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_registration_state");
        const results = await mapper.find({
            registrationSessionToken: registrationSessionToken
        });
        return results.toArray();
    }

    public async getUserRegistrationStatesByEmail(email: string): Promise<Array<UserRegistrationState>> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_registration_state");
        const results = await mapper.find({
            email: email
        });
        return results.toArray();
    }

    public async updateUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_registration_state");
        const ttlSeconds = Math.floor( (userRegistrationState.expiresAtMs - Date.now()) / 1000);
        await mapper.update(userRegistrationState, {ttl: ttlSeconds});
        return userRegistrationState;
    }

    public async deleteUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_registration_state");
        await mapper.remove({
            email: userRegistrationState.email,
            registrationSessionToken: userRegistrationState.registrationSessionToken,
            registrationState: userRegistrationState.registrationState
        });
        return userRegistrationState;
    }

    public async getProfileEmailChangeStates(changeStateToken: string): Promise<Array<ProfileEmailChangeState>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_profile_email_change_state");
        const results: Array<ProfileEmailChangeState> = (await mapper.find({changeEmailSessionToken: changeStateToken})).toArray();
        return results;
    }

    public async createProfileEmailChangeStates(arrEmailChangeStates: Array<ProfileEmailChangeState>): Promise<Array<ProfileEmailChangeState>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_profile_email_change_state");

        const ttlSeconds = arrEmailChangeStates.length > 0 ? 
                            Math.floor ( (arrEmailChangeStates[0].expiresAtMs - Date.now()) / 1000 ) :
                            300;

        for(let i = 0; i < arrEmailChangeStates.length; i++){
            await mapper.insert(arrEmailChangeStates[i], {ttl: ttlSeconds});
        }
        return arrEmailChangeStates
    }

    public async updateProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<ProfileEmailChangeState> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_profile_email_change_state");
        const ttlSeconds = Math.floor ( (profileEmailChangeState.expiresAtMs - Date.now()) / 1000 );
        await mapper.update(profileEmailChangeState, {ttl: ttlSeconds});
        return profileEmailChangeState;
    }

    public async deleteProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_profile_email_change_state");
        await mapper.remove({
            changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken,
            emailChangeState: profileEmailChangeState.emailChangeState
        });
        return;
    }

    public async deleteExpiredData(): Promise<void> {
        // NO OP
        // All data with an expiration is inserted and updated with a TTL value.
    }

    public async addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted): Promise<UserTermsAndConditionsAccepted> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_terms_and_conditions_accepted");
        await mapper.insert(userTermsAndConditionsAccepted);
        return userTermsAndConditionsAccepted;
    }

    public async getUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<UserTermsAndConditionsAccepted | null> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_terms_and_conditions_accepted");
        return mapper.get({
            tenantId: types.Uuid.fromString(tenantId),
            userId: types.Uuid.fromString(userId)
        });
    }

    public async deleteUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<void> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_terms_and_conditions_accepted");
        await mapper.remove({
            tenantId: types.Uuid.fromString(tenantId),
            userId: types.Uuid.fromString(userId)
        });
        return;
    }

    public async getUserRecoveryEmail(userId: string): Promise<UserRecoveryEmail | null> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_email_recovery");
        const results = await mapper.find({
            userId: userId
        });
        const arr: Array<UserRecoveryEmail> = results.toArray();
        if(arr.length > 0){
            return arr[0];
        }
        else{
            return null;
        }
    }

    public async addRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_email_recovery");
        await mapper.insert(userRecoveryEmail);
        return userRecoveryEmail;
    }

    public async updateRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_email_recovery");
        await mapper.update(userRecoveryEmail);
        return userRecoveryEmail;
    }

    public async deleteRecoveryEmail(userId: string): Promise<void> {
        const userRecoveryEmail: UserRecoveryEmail | null = await this.getUserRecoveryEmail(userId);
        if(userRecoveryEmail){
            const mapper =  await CassandraDriver.getInstance().getModelMapper("user_email_recovery");
            await mapper.remove({
                userId: types.Uuid.fromString(userId),
                email: userRecoveryEmail.email
            });
        }
        return;
    }

    public async addUserDuressCredential(userCredential: UserCredential): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_duress_credential");
        await mapper.insert(userCredential);
        return;
    }

    public async getUserDuressCredential(userId: string): Promise<UserCredential | null> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_duress_credential");
        return mapper.get({
            userId: types.Uuid.fromString(userId)
        })
    }

    public async deleteUserDuressCredential(userId: string): Promise<void> {
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_duress_credential");
        await mapper.remove({
            userId: types.Uuid.fromString(userId)
        })
    }

    public async addUserAuthenticationHistory(userId: string, authenticatedAtMs: number): Promise<void> {        
        const mapper =  await CassandraDriver.getInstance().getModelMapper("user_authentication_history");
        await mapper.insert({
            userId: userId,
            lastAuthenticationAtMs: authenticatedAtMs
        });
        return;
    }



    protected async saveUserVerificationToken(userId: string, token: string, verificationType: string, ttlMinutes: number): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_verification_token"); 
        
        // Token TTL: 10 minutes
        const expiresAtMs = Date.now() + (ttlMinutes * 60 * 1000);
        const ttlSeconds = ttlMinutes * 60; 
        await mapper.insert(
            {
                expiresAtMS: expiresAtMs,
                issuedAtMS:  Date.now(),
                userId: userId,
                token: token,
                verificationType: verificationType
            },
            {
                ttl: ttlSeconds
            }
        );
        return; 
    }

    protected async getUserByUserVerificationToken(token: string): Promise<User | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_verification_token");
        const result = await mapper.get({
            token: token
        });
        if(result){
            const userId: string = result.userId;
            const userMapper = await CassandraDriver.getInstance().getModelMapper("users");
            const user: User | null = await userMapper.get({
                userId: types.Uuid.fromString(userId)
            });
            return user;
        }
        else{
            return null;
        }
    }

    protected async deleteUserVerificationToken(token: string){
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_verification_token");
        await mapper.remove({
            token: token
        });
        return;
    }

}

export default CassandraIdentityDao;