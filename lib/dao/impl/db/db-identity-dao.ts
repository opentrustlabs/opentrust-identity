import { User, AuthenticationGroup, AuthorizationGroup, UserTenantRel, UserCredential, UserMfaRel, Fido2Challenge, UserAuthenticationState, UserRegistrationState, UserFailedLogin, UserTermsAndConditionsAccepted, UserRecoveryEmail, ProfileEmailChangeState } from "@/graphql/generated/graphql-types";
import IdentityDao, { UserLookupType } from "../../identity-dao";
import UserAuthorizationGroupRelEntity from "@/lib/entities/authorization-group-user-rel-entity";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import UserEntity from "@/lib/entities/user-entity";
import UserCredentialEntity from "@/lib/entities/user-credential-entity";
import { MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, VERIFICATION_TOKEN_TYPE_PASSWORD_RESET, VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL } from "@/utils/consts";
import UserMfaRelEntity from "@/lib/entities/user-mfa-rel-entity";
import UserTenantRelEntity from "@/lib/entities/user-tenant-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";
import UserFido2ChallengeEntity from "@/lib/entities/user-fido2-challenge-entity";
import UserFido2CounterRelEntity from "@/lib/entities/user-fido2-counter-rel-entity";
import UserAuthenticationStateEntity from "@/lib/entities/user-authentication-state-entity";
import UserRegistrationStateEntity from "@/lib/entities/user-registration-state-entity";
import UserTermsAndConditionsAcceptedEntity from "@/lib/entities/user-terms-and-conditions-accepted-entity";
import UserEmailRecoveryEntity from "@/lib/entities/user-email-recovery-entity";
import UserDuressCredentialEntity from "@/lib/entities/user-duress-credential";
import UserProfileChangeEmailStateEntity from "@/lib/entities/user-profile-email-change-state-entity";


class DBIdentityDao extends IdentityDao {

    
    public async saveFIDOKey(userMfaRel: UserMfaRel): Promise<void> {
        await (await DBDriver.getInstance().getUserMfaRelEntity()).create(userMfaRel);
        return Promise.resolve();
    }
    
    public async getFIDOKey(userId: string): Promise<UserMfaRel | null> {
        const entity: UserMfaRelEntity | null = await (await DBDriver.getInstance().getUserMfaRelEntity()).findOne({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_FIDO2
            }
        });
        if(entity){
            return entity.dataValues
        }
        else{
            return null;
        }
    }
    
    public async deleteFIDOKey(userId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserMfaRelEntity()).destroy({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_FIDO2
            }
        });
        return Promise.resolve();
    }
    

    public async saveTOTP(userMfaRel: UserMfaRel): Promise<void> {         
        await (await DBDriver.getInstance().getUserMfaRelEntity()).create(userMfaRel);
        return Promise.resolve();
    }


    public async deleteTOTP(userId: string): Promise<void>{
        await (await DBDriver.getInstance().getUserMfaRelEntity()).destroy({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
            }
        });
        return Promise.resolve();
    }

    public async getUserMFARels(userId: string): Promise<Array<UserMfaRel>> {
        const arr: Array<UserMfaRelEntity> = await (await DBDriver.getInstance().getUserMfaRelEntity()).findAll({
            where: {
                userId: userId
            }
        });
        return arr.map((
            (rel: UserMfaRelEntity) => rel.dataValues
        ));
    }

    public async getTOTP(userId: string): Promise<UserMfaRel | null>{
        const entity: UserMfaRelEntity | null = await (await DBDriver.getInstance().getUserMfaRelEntity()).findOne({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
            }
        });
        if(entity){
            return entity.dataValues
        }
        else{
            return null;
        }
    }

    public async  getFIDO2Challenge(userId: string): Promise<Fido2Challenge | null> {        
        const e: UserFido2ChallengeEntity | null = await (await DBDriver.getInstance().getUserFido2ChallengeEntity()).findOne({
            where: {
                userId: userId
            }
        });
        if(e){
            return e.dataValues;
        }
        else{
            return null;
        }

    }

    public async  saveFIDO2Challenge(fido2Challenge: Fido2Challenge): Promise<void> {
        await (await DBDriver.getInstance().getUserFido2ChallengeEntity()).create(fido2Challenge);
    }

    public async deleteFIDO2Challenge(userId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserFido2ChallengeEntity()).destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }

    public async getFido2Count(userId: string): Promise<number | null> {
        const e: UserFido2CounterRelEntity | null = await (await DBDriver.getInstance().getUserFido2CounterRelEntity()).findOne({
            where: {
                userId: userId
            }
        });
        return e ? Promise.resolve(e.getDataValue("fido2Counter")) : Promise.resolve(null);
    }

    public async updateFido2Count(userId: string, count: number): Promise<void> {

        await (await DBDriver.getInstance().getUserFido2CounterRelEntity()).update(
            {
                userId: userId,
                fido2Counter: count
            },
            {
                where: {
                    userId: userId
                }
            }
        )
        return Promise.resolve();
    }

    public async initFidoCount(userId: string, count: number): Promise<void> {

        await (await DBDriver.getInstance().getUserFido2CounterRelEntity()).create(
            {
                userId: userId,
                fido2Counter: count
            }
        )
        return Promise.resolve();
    }

    public async deleteFido2Count(userId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserFido2CounterRelEntity()).destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }
    
    public async getUserGroups(userId: string): Promise<Array<AuthorizationGroup>> {

        const rels: Array<UserAuthorizationGroupRelEntity> = await (await DBDriver.getInstance().getAuthorizationGroupUserRelEntity()).findAll({
            where: {
                userId: userId
            }
        });
        
        const groupIds = rels.map(r => r.getDataValue("groupId"));
        const groups: Array<AuthorizationGroupEntity> = await (await DBDriver.getInstance().getAuthorizationGroupEntity()).findAll({
            where: {
                groupId: { [Op.in]: groupIds}
            }
        });
        return groups.map((entity: AuthenticationGroupEntity) => entity.dataValues);
    }

    public async getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>> {

        const rels: Array<UserAuthorizationGroupRelEntity> = await (await DBDriver.getInstance().getAuthenticationGroupUserRelEntity()).findAll({
            where: {
                userId: userId
            }
        });

        const groupIds = rels.map(r => r.getDataValue("authenticationGroupId"));
        const authnGroups: Array<AuthenticationGroupEntity> = await (await DBDriver.getInstance().getAuthenticationGroupEntity()).findAll({
            where: {
                authenticationGroupId: {[Op.in]: groupIds}
            }
        });
        
        return authnGroups.map((entity: AuthenticationGroupEntity) => entity.dataValues);
    }

    public async getUserCredentials(userId: string): Promise<Array<UserCredential>>{

        const arrUserCredentialEntity: Array<UserCredentialEntity> = await (await DBDriver.getInstance().getUserCredentialEntity()).findAll({
            where: {
                userId: userId
            },
            order: [
                ["dateCreatedMs", "DESC"]
            ]
        });
        return arrUserCredentialEntity.map( (e: UserCredentialEntity) => e.dataValues);
    }

    public async getUserCredentialForAuthentication(userId: string): Promise<UserCredential | null> {

        const userCredentialEntity: UserCredentialEntity | null = await (await DBDriver.getInstance().getUserCredentialEntity()).findOne({
            where: {
                userId: userId
            },
            order: [
                ["dateCreatedMs", "DESC"]
            ]
        });
        return userCredentialEntity ? Promise.resolve(userCredentialEntity.dataValues) : Promise.resolve(null);
    }

    public async getFailedLogins(userId: string): Promise<Array<UserFailedLogin>> {

        const entities = await (await DBDriver.getInstance().getUserFailedLoginEntity()).findAll({
            where: {userId: userId},
            order: ["failureAtMs"]
        });

        if(!entities){
            return [];
        }
        return entities.map(e => e.dataValues);
    }

    public async addFailedLogin(userFailedLogins: UserFailedLogin): Promise<void> {

        await (await DBDriver.getInstance().getUserFailedLoginEntity()).create(userFailedLogins);            
        return Promise.resolve();
    }

    public async removeFailedLogin(userId: string, failureAtMs: number): Promise<void>{

        await (await DBDriver.getInstance().getUserFailedLoginEntity()).destroy({
            where: {
                userId: userId,
                failureAtMs: failureAtMs
            }
        });        
        return Promise.resolve();
    }

    public async resetFailedLoginAttempts(userId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserFailedLoginEntity()).destroy({
            where: {
                userId: userId
            }
        });        
        return Promise.resolve();
    }


    public async getUserBy(userLookupType: UserLookupType, value: string): Promise<User | null> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if(userLookupType === "email"){
            where.email = value;
        }
        else if(userLookupType === "id"){
            where.userId = value;
        }
        else if(userLookupType === "phone"){
            where.phoneNumber = value;
        }
        else if(userLookupType === "federatedoidcproviderid"){
            where.federatedOIDCProviderSubjectId = value;
        }
        
        let u: UserEntity | null = await (await DBDriver.getInstance().getUserEntity()).findOne({
            where: where
        });

        // For email lookups, we can try the recovery email table too
        if(u === null && userLookupType === "email"){
            const entity: UserEmailRecoveryEntity | null = await (await DBDriver.getInstance().getUserEmailRecoveryEntity()).findOne({
                where: {
                    email: value
                }
            });
            if(entity){
                const userId = entity.getDataValue("userId");
                u = await (await DBDriver.getInstance().getUserEntity()).findOne({
                    where: {
                        userId: userId
                    }
                });
            }
        }

        return u ? Promise.resolve(u.dataValues as User) : Promise.resolve(null);
    }



    public async savePasswordResetToken(userId: string, token: string): Promise<void> {

        await (await DBDriver.getInstance().getUserVerificationTokenEntity()).create({
            expiresAtMS: Date.now() + 600000,  // allow 10 minutes
            issuedAtMS:  Date.now(),
            userId: userId,
            token: token,
            verificationType: VERIFICATION_TOKEN_TYPE_PASSWORD_RESET
        });        
        
        return Promise.resolve();
    }

    public async getUserByPasswordResetToken(token: string): Promise<User | null> {
        
        const tokenEntity = await (await DBDriver.getInstance().getUserVerificationTokenEntity()).findOne({
            where: {
                token: token
            }
        }); 
        if(!tokenEntity){
            return Promise.resolve(null);
        }
        // If the token has expired, then delete it
        if(tokenEntity.getDataValue("expiresAtMS") < Date.now()){
            this.deletePasswordResetToken(token);
            return Promise.resolve(null);
        }
        const user: UserEntity | null = await (await DBDriver.getInstance().getUserEntity()).findOne({
            where: {userId: tokenEntity.getDataValue("userId")}
        });
        return user ? Promise.resolve(user.dataValues as User) : Promise.resolve(null);
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        
        await (await DBDriver.getInstance().getUserVerificationTokenEntity()).destroy({
            where: {
                token: token
            }
        });
        return Promise.resolve();
    }

    
    public async saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        
        await (await DBDriver.getInstance().getUserVerificationTokenEntity()).create({
            expiresAtMS: Date.now() + (60 * 60 * 1000),  // allow 60 minutes
            issuedAtMS:  Date.now(),
            userId: userId,
            token: token,
            verificationType: VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL
        });        
        
        return Promise.resolve();
    }

    public async getUserByEmailConfirmationToken(token: string): Promise<User | null> {
        
        const tokenEntity = await (await DBDriver.getInstance().getUserVerificationTokenEntity()).findOne({
            where: {
                token: token
            }
        }); 
        if(!tokenEntity){
            return Promise.resolve(null);
        }
        // If the token has expired, then delete it
        if(tokenEntity.getDataValue("expiresAtMS") < Date.now()){
            this.deletePasswordResetToken(token);
            return Promise.resolve(null);
        }
        const user: UserEntity | null = await (await DBDriver.getInstance().getUserEntity()).findOne({
            where: {userId: tokenEntity.getDataValue("userId")}
        });
        return user ? Promise.resolve(user.dataValues as User) : Promise.resolve(null);
    }
    
    public async deleteEmailConfirmationToken(token: string): Promise<void> {
        await (await DBDriver.getInstance().getUserVerificationTokenEntity()).destroy({
            where: {
                token: token
            }
        })
        return Promise.resolve();
    }

    // prohibitedPasswords
    public async passwordProhibited(password: string): Promise<boolean> {
        const entity = await (await DBDriver.getInstance().getProhibitedPasswordEntity()).findOne({
            where: {
                password: password
            }            
        });
        if(entity){
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
    
    public async addUserCredential(userCredential: UserCredential): Promise<void> {
        await (await DBDriver.getInstance().getUserCredentialEntity()).create(userCredential);        
        return Promise.resolve();
    }

    public async deleteUserCredential(userId: string, dateCreatedMs?: number): Promise<void> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {
            userId: userId
        };
        if(dateCreatedMs){
            queryParams.dateCreatedMs = dateCreatedMs
        }
        await (await DBDriver.getInstance().getUserCredentialEntity()).destroy({
            where: queryParams
        });
        return Promise.resolve();
    }

    public async createUser(user: User): Promise<User> {
        await (await DBDriver.getInstance().getUserEntity()).create(user);
        return Promise.resolve(user);
    }

    public async updateUser(user: User): Promise<User> {

        await (await DBDriver.getInstance().getUserEntity()).update(user, {
            where: {
                userId: user.userId
            }
        });
        return Promise.resolve(user);
    }

    public async unlockUser(userId: string): Promise<void> {
        const user: User | null = await this.getUserBy("id", userId);
        if(user){
            user.locked = false;
            this.updateUser(user);
        }
        return Promise.resolve();
    }

    public async deleteUser(userId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserTenantRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserTermsAndConditionsAcceptedEntity()).destroy({
            where: {
                userId: userId
            }
        });
        await (await DBDriver.getInstance().getAuthenticationGroupUserRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getAuthorizationGroupUserRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserCredentialEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserScopeRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getRefreshDataEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserFailedLoginEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserVerificationTokenEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserMfaRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserFido2CounterRelEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserFido2ChallengeEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserRegistrationStateEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserDuressCredentialEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserEmailRecoveryEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserProfileChangeEmailStateEntity()).destroy({
            where: {
                userId: userId
            }
        });
        
        await (await DBDriver.getInstance().getUserAuthenticationHistoryEntity()).destroy({
            where: {
                userId: userId
            }
        });

        await (await DBDriver.getInstance().getUserEntity()).destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }

    
    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        
        const model: UserTenantRel = {
            userId: userId,
            tenantId: tenantId,
            relType: relType,
            enabled: true
        };
        await (await DBDriver.getInstance().getUserTenantRelEntity()).create(model);        
        return model;
    }

    public async updateUserTenantRel(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        
        const model: UserTenantRel = {
            userId: userId,
            tenantId: tenantId,
            relType: relType,
            enabled: true
        };
        await (await DBDriver.getInstance().getUserTenantRelEntity()).update(model, {
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return model;
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        
        await (await DBDriver.getInstance().getUserTenantRelEntity()).destroy({
            where: {
                tenantId: tenantId,
                userId: userId
            }
        });
        return Promise.resolve();
    }

    public async getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null> {
        
        const entity: UserTenantRelEntity | null = await (await DBDriver.getInstance().getUserTenantRelEntity()).findOne({
            where: {
                tenantId: tenantId,
                userId: userId
            }
        });        
        return entity ? Promise.resolve(entity.dataValues as UserTenantRel) : Promise.resolve(null);
    }

    public async getUserTenantRelsByUserId(userId: string): Promise<Array<UserTenantRel>> {
        
        const list = await (await DBDriver.getInstance().getUserTenantRelEntity()).findAll({
            where: {
                userId: userId
            }
        });
        return list.map(e => e.dataValues);
    }

    public async createUserAuthenticationStates(arrUserAuthenticationState: Array<UserAuthenticationState>): Promise<Array<UserAuthenticationState>> {
        
        for(let i = 0; i < arrUserAuthenticationState.length; i++){
            await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).create(arrUserAuthenticationState[i]);
        }
        return arrUserAuthenticationState;
    }

    public async getUserAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        
        const arr: Array<UserAuthenticationStateEntity> = await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).findAll({
            where: {
                authenticationSessionToken: authenticationSessionToken
            }
        });
        return arr.map((entity: UserAuthenticationStateEntity) => entity.dataValues);
    }

    public async updateUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        
        await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).update(userAuthenticationState, {
            where: {
                userId: userAuthenticationState.userId,
                authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                authenticationState: userAuthenticationState.authenticationState
            }
        });
        return userAuthenticationState;
    }

    public async deleteUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        
        await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).destroy({
            where: {
                userId: userAuthenticationState.userId,
                authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                authenticationState: userAuthenticationState.authenticationState
            }
        });
        return userAuthenticationState;
    }

    public async createUserRegistrationStates(arrRegistrationState: Array<UserRegistrationState>): Promise<Array<UserRegistrationState>> {
        
        for(let i = 0; i < arrRegistrationState.length; i++){
            await (await DBDriver.getInstance().getUserRegistrationStateEntity()).create(arrRegistrationState[i]);
        }
        return arrRegistrationState;
    }

    public async getUserRegistrationStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>> {
        
        const arr: Array<UserRegistrationStateEntity> = await (await DBDriver.getInstance().getUserRegistrationStateEntity()).findAll({
            where: {
                registrationSessionToken: registrationSessionToken
            }
        });
        return arr.map((entity: UserRegistrationStateEntity) => entity.dataValues);
    }

    public async getUserRegistrationStatesByEmail(email: string): Promise<Array<UserRegistrationState>>{
        
        const arr: Array<UserRegistrationStateEntity> = await (await DBDriver.getInstance().getUserRegistrationStateEntity()).findAll({
            where: {
                email: email
            }
        });
        return arr.map((entity: UserRegistrationStateEntity) => entity.dataValues);
    }

    public async updateUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        
        await (await DBDriver.getInstance().getUserRegistrationStateEntity()).update(userRegistrationState, {
            where: {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                registrationState: userRegistrationState.registrationState
            }
        });
        return userRegistrationState;
    }

    public async deleteUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        
        await (await DBDriver.getInstance().getUserRegistrationStateEntity()).destroy({
            where: {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                registrationState: userRegistrationState.registrationState
            }
        });
        return userRegistrationState;
    }

    public async addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted): Promise<UserTermsAndConditionsAccepted>{
        
        await (await DBDriver.getInstance().getUserTermsAndConditionsAcceptedEntity()).create(userTermsAndConditionsAccepted);
        return Promise.resolve(userTermsAndConditionsAccepted);
    }
    
    public async getUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<UserTermsAndConditionsAccepted | null>{
        
        const entity: UserTermsAndConditionsAcceptedEntity | null = await (await DBDriver.getInstance().getUserTermsAndConditionsAcceptedEntity()).findOne({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return entity ? entity.dataValues : null;
    }
    
    public async deleteUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<void>{
        await (await DBDriver.getInstance().getUserTermsAndConditionsAcceptedEntity()).destroy({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void> {
        await (await DBDriver.getInstance().getUserRegistrationStateEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await (await DBDriver.getInstance().getUserFido2ChallengeEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await (await DBDriver.getInstance().getUserVerificationTokenEntity()).destroy({
            where: {
                expiresAtMS: {
                    [Op.lt]: Date.now()
                }
            }
        });
        
        await (await DBDriver.getInstance().getUserProfileChangeEmailStateEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        
    }

    public async getUserRecoveryEmail(userId: string): Promise<UserRecoveryEmail | null>{
        
        const entity: UserEmailRecoveryEntity | null = await (await DBDriver.getInstance().getUserEmailRecoveryEntity()).findOne({
            where: {
                userId: userId
            }
        });
        return entity ? entity.dataValues : null;
    }

    public async addRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>{
        await (await DBDriver.getInstance().getUserEmailRecoveryEntity()).create(userRecoveryEmail);
        return Promise.resolve(userRecoveryEmail);
    }

    public async updateRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>{
        await (await DBDriver.getInstance().getUserEmailRecoveryEntity()).update(userRecoveryEmail, {
                where: {
                    userId: userRecoveryEmail.userId
                }
            }
        );
        return Promise.resolve(userRecoveryEmail);
    }

    public async deleteRecoveryEmail(userId: string): Promise<void>{
        await (await DBDriver.getInstance().getUserEmailRecoveryEntity()).destroy({
            where: {
                userId: userId
            }
        });
    }

    public async addUserDuressCredential(userCredential: UserCredential): Promise<void>{
        await (await DBDriver.getInstance().getUserDuressCredentialEntity()).create(userCredential);
        return Promise.resolve();
    }

    public async getUserDuressCredential(userId: string): Promise<UserCredential | null> {
        const entity: UserDuressCredentialEntity | null = await (await DBDriver.getInstance().getUserDuressCredentialEntity()).findOne({
            where: {
                userId: userId
            }
        });
        return entity ? entity.dataValues : null;
    }

    public async deleteUserDuressCredential(userId: string): Promise<void> {
        await (await DBDriver.getInstance().getUserDuressCredentialEntity()).destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }

    public async getProfileEmailChangeStates(changeStateToken: string): Promise<Array<ProfileEmailChangeState>>{
        
        const arr: Array<UserProfileChangeEmailStateEntity> = await (await DBDriver.getInstance().getUserProfileChangeEmailStateEntity()).findAll({
            where: {
                changeEmailSessionToken: changeStateToken
            }
        });
        return arr.map((entity: UserProfileChangeEmailStateEntity) => entity.dataValues);
    }
    
    public async createProfileEmailChangeStates(arrEmailChangeStates: Array<ProfileEmailChangeState>): Promise<Array<ProfileEmailChangeState>>{
        
        for(let i = 0; i < arrEmailChangeStates.length; i++){
            await (await DBDriver.getInstance().getUserProfileChangeEmailStateEntity()).create(arrEmailChangeStates[i]);
        }
        return arrEmailChangeStates;
    }
    
    public async updateProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<ProfileEmailChangeState>{
        
        await (await DBDriver.getInstance().getUserProfileChangeEmailStateEntity()).update(profileEmailChangeState, {
            where: {
                userId: profileEmailChangeState.userId,
                emailChangeState: profileEmailChangeState.emailChangeState,
                changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
            }
        });
        return profileEmailChangeState;
    }

    public async deleteProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<void>{
        
        await (await DBDriver.getInstance().getUserProfileChangeEmailStateEntity()).destroy({
            where: {
                userId: profileEmailChangeState.userId,
                emailChangeState: profileEmailChangeState.emailChangeState,
                changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
            }
        });
        return Promise.resolve();
    }

    public async addUserAuthenticationHistory(userId: string, authenticatedAtMs: number): Promise<void>{
        
        await (await DBDriver.getInstance().getUserAuthenticationHistoryEntity()).create({
            userId: userId,
            lastAuthenticationAtMs: authenticatedAtMs
        });
        return Promise.resolve();        
    }

}

export default DBIdentityDao;