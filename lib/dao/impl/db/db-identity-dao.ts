import { User, UserTenantRel, UserCredential, UserMfaRel, Fido2Challenge, UserAuthenticationState, UserRegistrationState, UserFailedLogin, UserTermsAndConditionsAccepted, UserRecoveryEmail, ProfileEmailChangeState } from "@/graphql/generated/graphql-types";
import IdentityDao, { UserLookupType } from "../../identity-dao";
import { MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, VERIFICATION_TOKEN_TYPE_PASSWORD_RESET, VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL } from "@/utils/consts";
import { UserFido2CounterRel } from "@/lib/entities/user-fido2-counter-rel-entity";
import RDBDriver from "@/lib/data-sources/rdb";
import { UserEmailRecovery } from "@/lib/entities/user-email-recovery-entity";
import { LessThan } from "typeorm";
import { UserDuressCredential } from "@/lib/entities/user-duress-credential";
import { UserAuthenticationHistory } from "@/lib/entities/user-authentication-history-entity";

class DBIdentityDao extends IdentityDao {

    
    public async saveFIDOKey(userMfaRel: UserMfaRel): Promise<void> {
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        await userMfaRelRepo.insert(userMfaRel);
        return Promise.resolve();
    }
    
    public async getFIDOKey(userId: string): Promise<UserMfaRel | null> {
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        const entity = await userMfaRelRepo.findOne({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_FIDO2
            }
        });
        return entity;
    }
    
    public async deleteFIDOKey(userId: string): Promise<void> {
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        await userMfaRelRepo.delete({
            userId: userId,
            mfaType: MFA_AUTH_TYPE_FIDO2
        });
        return Promise.resolve();
    }
    

    public async saveTOTP(userMfaRel: UserMfaRel): Promise<void> {     
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();    
        await userMfaRelRepo.insert(userMfaRel);
        return Promise.resolve();
    }


    public async deleteTOTP(userId: string): Promise<void>{
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        await userMfaRelRepo.delete({
            userId: userId,
            mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
        });
        return Promise.resolve();
    }

    public async getUserMFARels(userId: string): Promise<Array<UserMfaRel>> {
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        const arr = await userMfaRelRepo.find({
            where: {
                userId: userId
            }
        });
        return arr;
    }

    public async getTOTP(userId: string): Promise<UserMfaRel | null>{
        const userMfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        const entity = await userMfaRelRepo.findOne({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
            }
        });
        return entity;
    }

    public async  getFIDO2Challenge(userId: string): Promise<Fido2Challenge | null> {
        const fido2ChallengeRepo = await RDBDriver.getInstance().getUserFido2ChallengeRepository();
        const e = await fido2ChallengeRepo.findOne({
            where: {
                userId: userId
            }
        });
        return e;
    }

    public async  saveFIDO2Challenge(fido2Challenge: Fido2Challenge): Promise<void> {
        const fido2ChallengeRepo = await RDBDriver.getInstance().getUserFido2ChallengeRepository();
        await fido2ChallengeRepo.insert(fido2Challenge);
    }

    public async deleteFIDO2Challenge(userId: string): Promise<void> {
        const fido2ChallengeRepo = await RDBDriver.getInstance().getUserFido2ChallengeRepository();
        await fido2ChallengeRepo.delete({
            userId: userId
        });
        return Promise.resolve();
    }

    public async getFido2Count(userId: string): Promise<number | null> {
        const fido2CountRepo = await RDBDriver.getInstance().getUserFido2CounterRelRepository();
        const e: UserFido2CounterRel | null = await fido2CountRepo.findOne({
            where: {
                userId: userId
            }
        });
        return e ? Promise.resolve(e.fido2Counter) : Promise.resolve(null);
    }

    public async updateFido2Count(userId: string, count: number): Promise<void> {
        const fido2CountRepo = await RDBDriver.getInstance().getUserFido2CounterRelRepository();
        await fido2CountRepo.update(
            {
                userId: userId
            },
            {
                userId: userId,
                fido2Counter: count
            }
            
        )
        return Promise.resolve();
    }

    public async initFidoCount(userId: string, count: number): Promise<void> {
        const fido2CountRepo = await RDBDriver.getInstance().getUserFido2CounterRelRepository();
        await fido2CountRepo.insert(
            {
                userId: userId,
                fido2Counter: count
            }
        )
        return Promise.resolve();
    }

    public async deleteFido2Count(userId: string): Promise<void> {
        const fido2CountRepo = await RDBDriver.getInstance().getUserFido2CounterRelRepository();
        await fido2CountRepo.delete({
            userId: userId
        });
        return Promise.resolve();
    }

    public async getUserCredentials(userId: string): Promise<Array<UserCredential>>{
        const userCredentialRepo = await RDBDriver.getInstance().getUserCredentialRepository();
        const arrUserCredential: Array<UserCredential> = await userCredentialRepo.find({
            where: {
                userId: userId
            },
            order: {
                dateCreatedMs: "DESC"
            }            
        });
        return arrUserCredential;
    }

    public async getUserCredentialForAuthentication(userId: string): Promise<UserCredential | null> {
        const userCredentialRepo = await RDBDriver.getInstance().getUserCredentialRepository();
        const userCredential: UserCredential | null = await userCredentialRepo.findOne({
            where: {
                userId: userId
            },
            order: {
                dateCreatedMs: "DESC"
            } 
        });
        return userCredential;
    }

    public async getFailedLogins(userId: string): Promise<Array<UserFailedLogin>> {
        const userFailedLoginRepo = await RDBDriver.getInstance().getUserFailedLoginRepository();
        const entities = await userFailedLoginRepo.find({
            where: {userId: userId},
            order: {
                failureAtMs: "ASC"
            }
        });

        if(!entities){
            return [];
        }
        return entities;
    }

    public async addFailedLogin(userFailedLogins: UserFailedLogin): Promise<void> {
        const userFailedLoginRepo = await RDBDriver.getInstance().getUserFailedLoginRepository();
        await userFailedLoginRepo.insert(userFailedLogins);            
        return Promise.resolve();
    }

    public async removeFailedLogin(userId: string, failureAtMs: number): Promise<void>{
        const userFailedLoginRepo = await RDBDriver.getInstance().getUserFailedLoginRepository();
        await userFailedLoginRepo.delete({
            userId: userId,
            failureAtMs: failureAtMs
        });        
        return Promise.resolve();
    }

    public async resetFailedLoginAttempts(userId: string): Promise<void> {
        const userFailedLoginRepo = await RDBDriver.getInstance().getUserFailedLoginRepository();
        await userFailedLoginRepo.delete({
            userId: userId
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
        
        const userRepo = await RDBDriver.getInstance().getUserRepository();
        let u: User | null = await userRepo.findOne({
            where: where
        });

        // For email lookups, we can try the recovery email table too
        if(u === null && userLookupType === "email"){
            const userEmailRecoverRepo = await RDBDriver.getInstance().getUserEmailRecoveryRepository();
            const entity: UserEmailRecovery | null = await userEmailRecoverRepo.findOne({
                where: {
                    email: value
                }
            });
            if(entity){
                const userId = entity.userId;
                u = await userRepo.findOne({
                    where: {
                        userId: userId
                    }
                });
            }
        }
        return u;
    }



    public async savePasswordResetToken(userId: string, token: string): Promise<void> {
        const passwordResetTokenRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        await passwordResetTokenRepo.insert({
            expiresAtMS: Date.now() + 600000,  // allow 10 minutes
            issuedAtMS:  Date.now(),
            userId: userId,
            token: token,
            verificationType: VERIFICATION_TOKEN_TYPE_PASSWORD_RESET
        });        
        
        return Promise.resolve();
    }

    public async getUserByPasswordResetToken(token: string): Promise<User | null> {
        const passwordResetTokenRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        const tokenEntity = await passwordResetTokenRepo.findOne({
            where: {
                token: token
            }
        }); 
        if(!tokenEntity){
            return Promise.resolve(null);
        }
        // If the token has expired, then delete it
        if(tokenEntity.expiresAtMS < Date.now()){
            this.deletePasswordResetToken(token);
            return Promise.resolve(null);
        }
        const user = await this.getUserBy("id", tokenEntity.userId);        
        return user;
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        const passwordResetTokenRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        await passwordResetTokenRepo.delete({
            token: token
        });
        return Promise.resolve();
    }

    
    public async saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        const passwordResetTokenRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        await passwordResetTokenRepo.insert({
            expiresAtMS: Date.now() + (60 * 60 * 1000),  // allow 60 minutes
            issuedAtMS:  Date.now(),
            userId: userId,
            token: token,
            verificationType: VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL
        });        
        
        return Promise.resolve();
    }

    public async getUserByEmailConfirmationToken(token: string): Promise<User | null> {
        const passwordResetTokenRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        const tokenEntity = await passwordResetTokenRepo.findOne({
            where: {
                token: token
            }
        }); 
        if(!tokenEntity){
            return Promise.resolve(null);
        }
        // If the token has expired, then delete it
        if(tokenEntity.expiresAtMS < Date.now()){
            this.deletePasswordResetToken(token);
            return Promise.resolve(null);
        }
        const user: User | null = await this.getUserBy("id", tokenEntity.userId)
        return user;
    }
    
    public async deleteEmailConfirmationToken(token: string): Promise<void> {
        const passwordResetTokenRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        await passwordResetTokenRepo.delete({
            token: token
        })
        return Promise.resolve();
    }

    // prohibitedPasswords
    public async passwordProhibited(password: string): Promise<boolean> {
        const prohibitedPasswordRepo = await RDBDriver.getInstance().getProhibitedPasswordRepository();        
        const entity = await prohibitedPasswordRepo.findOne({
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
        const userCredentialRepo = await RDBDriver.getInstance().getUserCredentialRepository();
        await userCredentialRepo.insert(userCredential);        
        return Promise.resolve();
    }

    public async deleteUserCredential(userId: string, dateCreatedMs?: number): Promise<void> {
        const userCredentialRepo = await RDBDriver.getInstance().getUserCredentialRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {
            userId: userId
        };
        if(dateCreatedMs){
            queryParams.dateCreatedMs = dateCreatedMs
        }
        if(dateCreatedMs){
            await userCredentialRepo.delete({
                userId: userId,
                dateCreatedMs: dateCreatedMs
            })
        }
        else{            
            await userCredentialRepo.delete({
                userId: userId                
            });
        }
        return Promise.resolve();
    }

    public async createUser(user: User): Promise<User> {
        const userRepo = await RDBDriver.getInstance().getUserRepository();
        await userRepo.insert(user);
        return Promise.resolve(user);
    }

    public async updateUser(user: User): Promise<User> {
        const userRepo = await RDBDriver.getInstance().getUserRepository();
        await userRepo.update(
            {
                userId: user.userId
            }, 
            user
        );
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
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        await userTenantRelRepo.delete({
            userId: userId
        });

        const userTermsAndConditionRepo = await RDBDriver.getInstance().getUserTermsAndConditionsAcceptedRepository()
        await userTermsAndConditionRepo.delete({
            userId: userId
        });

        const userAuthnGroupRelRepo = await RDBDriver.getInstance().getAuthenticationGroupUserRelRepository();
        await userAuthnGroupRelRepo.delete({
            userId: userId
        });

        const userAuthzGroupRelRepo = await RDBDriver.getInstance().getAuthorizationGroupUserRelRepository();
        await userAuthzGroupRelRepo.delete({
            userId: userId
        });

        const userCredentialRepo = await RDBDriver.getInstance().getUserCredentialRepository();
        await userCredentialRepo.delete({
            userId: userId
        });

        const userScopeRelRepo = await RDBDriver.getInstance().getUserScopeRelRepository();
        await userScopeRelRepo.delete({
            userId: userId
        });

        const authCodeDataRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        await authCodeDataRepo.delete({
            userId: userId
        });

        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        await refreshDataRepo.delete({
            userId: userId
        });

        const federatedOIDCAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await federatedOIDCAuthRelRepo.delete({
            userId: userId
        });

        await this.resetFailedLoginAttempts(userId);
        
        const userVerificationRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        await userVerificationRepo.delete({
            userId: userId
        });

        const mfaRelRepo = await RDBDriver.getInstance().getUserMfaRelRepository();
        await mfaRelRepo.delete({
            userId: userId
        });

        await this.deleteFido2Count(userId);
        await this.deleteFIDO2Challenge(userId);

        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        await userAuthStateRepo.delete({
            userId: userId
        });

        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        await userRegistrationStateRepo.delete({
            userId: userId
        });

        const userDuressRepo = await RDBDriver.getInstance().getUserDuressCredentialRepository();
        await userDuressRepo.delete({
            userId: userId
        });

        const userEmailRecoveryRepo = await RDBDriver.getInstance().getUserEmailRecoveryRepository();
        await userEmailRecoveryRepo.delete({
            userId: userId
        });

        const changeEmailStateRepo = await RDBDriver.getInstance().getUserProfileChangeEmailStateRepository();
        await changeEmailStateRepo.delete({
            userId: userId
        });
        
        const userAuthHistoryRepo = await RDBDriver.getInstance().getUserAuthenticationHistoryRepository();
        await userAuthHistoryRepo.delete({
            userId: userId
        });

        const userRepo = await RDBDriver.getInstance().getUserRepository()
        await userRepo.delete({
            userId: userId
        });
        return Promise.resolve();
    }

    
    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        const model: UserTenantRel = {
            userId: userId,
            tenantId: tenantId,
            relType: relType,
            enabled: true
        };
        await userTenantRelRepo.insert(model);
        return model;
    }

    public async updateUserTenantRel(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        const model: UserTenantRel = {
            userId: userId,
            tenantId: tenantId,
            relType: relType,
            enabled: true
        };
        await userTenantRelRepo.update(
            {
                userId: userId,
                tenantId: tenantId
            },
            model
        );
        return model;
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        await userTenantRelRepo.delete({
            tenantId: tenantId,
            userId: userId
        });
        return Promise.resolve();
    }

    public async getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null> {
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        const entity: UserTenantRel | null = await userTenantRelRepo.findOne({
            where: {
                tenantId: tenantId,
                userId: userId
            }
        });        
        return entity;
    }

    public async getUserTenantRelsByUserId(userId: string): Promise<Array<UserTenantRel>> {
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        const list = await userTenantRelRepo.find({
            where: {
                userId: userId
            }
        });
        return list;
    }

    public async createUserAuthenticationStates(arrUserAuthenticationState: Array<UserAuthenticationState>): Promise<Array<UserAuthenticationState>> {
        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        for(let i = 0; i < arrUserAuthenticationState.length; i++){
            await userAuthStateRepo.insert(arrUserAuthenticationState[i]);
        }
        return arrUserAuthenticationState;
    }

    public async getUserAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        const arr: Array<UserAuthenticationState> = await userAuthStateRepo.find({
            where: {
                authenticationSessionToken: authenticationSessionToken
            }
        });
        return arr;
    }

    public async updateUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        await userAuthStateRepo.update(
            {
                userId: userAuthenticationState.userId,
                authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                authenticationState: userAuthenticationState.authenticationState
            },
             userAuthenticationState
        );
        return userAuthenticationState;
    }

    public async deleteUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        await userAuthStateRepo.delete({
            userId: userAuthenticationState.userId,
            authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
            authenticationState: userAuthenticationState.authenticationState
        });
        return userAuthenticationState;
    }

    public async createUserRegistrationStates(arrRegistrationState: Array<UserRegistrationState>): Promise<Array<UserRegistrationState>> {
        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        for(let i = 0; i < arrRegistrationState.length; i++){
            await userRegistrationStateRepo.insert(arrRegistrationState[i]);
        }
        return arrRegistrationState;
    }

    public async getUserRegistrationStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>> {
        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        const arr: Array<UserRegistrationState> = await userRegistrationStateRepo.find({
            where: {
                registrationSessionToken: registrationSessionToken
            }
        });
        return arr;
    }

    public async getUserRegistrationStatesByEmail(email: string): Promise<Array<UserRegistrationState>>{
        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        const arr: Array<UserRegistrationState> = await userRegistrationStateRepo.find({
            where: {
                email: email
            }
        });
        return arr;
    }

    public async updateUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        await userRegistrationStateRepo.update(
            {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                registrationState: userRegistrationState.registrationState
            },
            userRegistrationState
        );
        return userRegistrationState;
    }

    public async deleteUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        await userRegistrationStateRepo.delete({
            userId: userRegistrationState.userId,
            registrationSessionToken: userRegistrationState.registrationSessionToken,
            registrationState: userRegistrationState.registrationState
        });
        return userRegistrationState;
    }

    public async addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted): Promise<UserTermsAndConditionsAccepted>{
        const userTermsAndConditionsRepo = await RDBDriver.getInstance().getUserTermsAndConditionsAcceptedRepository();
        await userTermsAndConditionsRepo.insert(userTermsAndConditionsAccepted);
        return Promise.resolve(userTermsAndConditionsAccepted);
    }
    
    public async getUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<UserTermsAndConditionsAccepted | null>{
        const userTermsAndConditionsRepo = await RDBDriver.getInstance().getUserTermsAndConditionsAcceptedRepository();
        const entity: UserTermsAndConditionsAccepted | null = await userTermsAndConditionsRepo.findOne({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return entity;
    }
    
    public async deleteUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<void>{
        const userTermsAndConditionsRepo = await RDBDriver.getInstance().getUserTermsAndConditionsAcceptedRepository();
        await userTermsAndConditionsRepo.delete({
            userId: userId,
            tenantId: tenantId
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void> {
        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository(); 
        await userRegistrationStateRepo.delete({
            expiresAtMs: LessThan(Date.now())            
        });

        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        await userAuthStateRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });

        const userFido2ChallengeRepo = await RDBDriver.getInstance().getUserFido2ChallengeRepository();
        await userFido2ChallengeRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });

        const userVerificationRepo = await RDBDriver.getInstance().getUserVerificationTokenRepository();
        await userVerificationRepo.delete({
            expiresAtMS: LessThan(Date.now())
        });
        
        const userProfileEmailChangeRepo = await RDBDriver.getInstance().getUserProfileChangeEmailStateRepository();
        await userProfileEmailChangeRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });
        
    }

    public async getUserRecoveryEmail(userId: string): Promise<UserRecoveryEmail | null>{
        const userEmailRecoveryRepo = await RDBDriver.getInstance().getUserEmailRecoveryRepository();
        const entity: UserEmailRecovery | null = await userEmailRecoveryRepo.findOne({
            where: {
                userId: userId
            }
        });
        return entity;
    }

    public async addRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>{
        const userEmailRecoveryRepo = await RDBDriver.getInstance().getUserEmailRecoveryRepository();
        await userEmailRecoveryRepo.insert(userRecoveryEmail);
        return Promise.resolve(userRecoveryEmail);
    }

    public async updateRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>{
        const userEmailRecoveryRepo = await RDBDriver.getInstance().getUserEmailRecoveryRepository();
        await userEmailRecoveryRepo.update(
            {
                userId: userRecoveryEmail.userId
            },
            userRecoveryEmail
        );
        return Promise.resolve(userRecoveryEmail);
    }

    public async deleteRecoveryEmail(userId: string): Promise<void>{
        const userEmailRecoveryRepo = await RDBDriver.getInstance().getUserEmailRecoveryRepository();
        await userEmailRecoveryRepo.delete({
            userId: userId
        });
    }

    public async addUserDuressCredential(userCredential: UserCredential): Promise<void>{
        const userDuressRepo = await RDBDriver.getInstance().getUserDuressCredentialRepository();
        await userDuressRepo.insert(userCredential);
        return Promise.resolve();
    }

    public async getUserDuressCredential(userId: string): Promise<UserCredential | null> {
        const userDuressRepo = await RDBDriver.getInstance().getUserDuressCredentialRepository();
        const entity: UserDuressCredential | null = await userDuressRepo.findOne({
            where: {
                userId: userId
            }
        });
        return entity;
    }

    public async deleteUserDuressCredential(userId: string): Promise<void> {
        const userDuressRepo = await RDBDriver.getInstance().getUserDuressCredentialRepository();
        await userDuressRepo.delete({
            userId: userId
        });
        return Promise.resolve();
    }

    public async getProfileEmailChangeStates(changeStateToken: string): Promise<Array<ProfileEmailChangeState>>{
        const profileEmailChangeStateRepo = await RDBDriver.getInstance().getUserProfileChangeEmailStateRepository();
        const arr: Array<ProfileEmailChangeState> = await profileEmailChangeStateRepo.find({
            where: {
                changeEmailSessionToken: changeStateToken
            }
        });
        return arr;
    }
    
    public async createProfileEmailChangeStates(arrEmailChangeStates: Array<ProfileEmailChangeState>): Promise<Array<ProfileEmailChangeState>>{
        const profileEmailChangeStateRepo = await RDBDriver.getInstance().getUserProfileChangeEmailStateRepository();
        for(let i = 0; i < arrEmailChangeStates.length; i++){
            await profileEmailChangeStateRepo.insert(arrEmailChangeStates[i]);
        }
        return arrEmailChangeStates;
    }
    
    public async updateProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<ProfileEmailChangeState>{
        const profileEmailChangeStateRepo = await RDBDriver.getInstance().getUserProfileChangeEmailStateRepository();
        await profileEmailChangeStateRepo.update(
            {
                userId: profileEmailChangeState.userId,
                emailChangeState: profileEmailChangeState.emailChangeState,
                changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
            },
            profileEmailChangeState,
        );
        return profileEmailChangeState;
    }

    public async deleteProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<void>{
        const profileEmailChangeStateRepo = await RDBDriver.getInstance().getUserProfileChangeEmailStateRepository();
        await profileEmailChangeStateRepo.delete({
            userId: profileEmailChangeState.userId,
            emailChangeState: profileEmailChangeState.emailChangeState,
            changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
        });
        return Promise.resolve();
    }

    public async addUserAuthenticationHistory(userId: string, authenticatedAtMs: number): Promise<void>{
        const userAuthHistoryRepo = await RDBDriver.getInstance().getUserAuthenticationHistoryRepository()
        const userAuthHistory: UserAuthenticationHistory = {
            lastAuthenticationAtMs: authenticatedAtMs,
            userId: userId
        }
        await userAuthHistoryRepo.insert(userAuthHistory);
        return Promise.resolve();        
    }

}

export default DBIdentityDao;