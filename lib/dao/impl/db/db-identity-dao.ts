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
import { Op, Sequelize } from "sequelize";
import UserFido2ChallengeEntity from "@/lib/entities/user-fido2-challenge-entity";
import UserFido2CounterRelEntity from "@/lib/entities/user-fido2-counter-rel-entity";
import UserAuthenticationStateEntity from "@/lib/entities/user-authentication-state-entity";
import UserRegistrationStateEntity from "@/lib/entities/user-registration-state-entity";
import UserTermsAndConditionsAcceptedEntity from "@/lib/entities/user-terms-and-conditions-accepted-entity";
import UserEmailRecoveryEntity from "@/lib/entities/user-email-recovery-entity";
import UserDuressCredentialEntity from "@/lib/entities/user-duress-credential";
import UserProfileChangeEmailStateEntity from "@/lib/entities/user-profile-email-change-state-entity";
import { group } from "console";


class DBIdentityDao extends IdentityDao {

    
    public async saveFIDOKey(userMfaRel: UserMfaRel): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userMfaRel.create(userMfaRel);
        return Promise.resolve();
    }
    
    public async getFIDOKey(userId: string): Promise<UserMfaRel | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: UserMfaRelEntity | null = await sequelize.models.userMfaRel.findOne({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userMfaRel.destroy({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_FIDO2
            }
        });
        return Promise.resolve();
    }
    

    public async saveTOTP(userMfaRel: UserMfaRel): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();             
        await sequelize.models.userMfaRel.create(userMfaRel);
        return Promise.resolve();
    }


    public async deleteTOTP(userId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userMfaRel.destroy({
            where: {
                userId: userId,
                mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP
            }
        });
        return Promise.resolve();
    }

    public async getUserMFARels(userId: string): Promise<Array<UserMfaRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<UserMfaRelEntity> = await sequelize.models.userMfaRel.findAll({
            where: {
                userId: userId
            }
        });
        return arr.map((
            (rel: UserMfaRelEntity) => rel.dataValues
        ));
    }

    public async getTOTP(userId: string): Promise<UserMfaRel | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: UserMfaRelEntity | null = await sequelize.models.userMfaRel.findOne({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        const e: UserFido2ChallengeEntity | null = await sequelize.models.userFido2Challenge.findOne({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFido2Challenge.create(fido2Challenge);
    }

    public async deleteFIDO2Challenge(userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFido2Challenge.destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }

    public async getFido2Count(userId: string): Promise<number | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const e: UserFido2CounterRelEntity | null = await sequelize.models.userFido2CountrerRel.findOne({
            where: {
                userId: userId
            }
        });
        return e ? Promise.resolve(e.getDataValue("fido2Counter")) : Promise.resolve(null);
    }

    public async updateFido2Count(userId: string, count: number): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFido2CountrerRel.update(
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFido2CountrerRel.create(
            {
                userId: userId,
                fido2Counter: count
            }
        )
        return Promise.resolve();
    }

    public async deleteFido2Count(userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFido2CountrerRel.destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }
    
    public async getUserGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const rels: Array<UserAuthorizationGroupRelEntity> = await sequelize.models.authorizationGroupUserRel.findAll({
            where: {
                userId: userId
            }
        });
        
        const groupIds = rels.map(r => r.getDataValue("groupId"));
        const groups: Array<AuthorizationGroupEntity> = await sequelize.models.authorizationGroup.findAll({
            where: {
                groupId: { [Op.in]: groupIds}
            }
        });
        return groups.map((entity: AuthenticationGroupEntity) => entity.dataValues);
    }

    public async getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const rels: Array<UserAuthorizationGroupRelEntity> = await sequelize.models.authenticationGroupUserRel.findAll({
            where: {
                userId: userId
            }
        });

        const groupIds = rels.map(r => r.getDataValue("authenticationGroupId"));
        const authnGroups: Array<AuthenticationGroupEntity> = await sequelize.models.authenticationGroup.findAll({
            where: {
                authenticationGroupId: {[Op.in]: groupIds}
            }
        });
        
        return authnGroups.map((entity: AuthenticationGroupEntity) => entity.dataValues);
    }

    public async getUserCredentials(userId: string): Promise<Array<UserCredential>>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arrUserCredentialEntity: Array<UserCredentialEntity> = await sequelize.models.userCredential.findAll({
            where: {
                userId: userId
            },
            order: [
                ["dateCreated", "DESC"]
            ]
        });
        return arrUserCredentialEntity.map( (e: UserCredentialEntity) => e.dataValues);
    }

    public async getUserCredentialForAuthentication(userId: string): Promise<UserCredential | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const userCredentialEntity: UserCredentialEntity | null = await sequelize.models.userCredential.findOne({
            where: {
                userId: userId
            },
            order: [
                ["dateCreated", "DESC"]
            ]
        });
        return userCredentialEntity ? Promise.resolve(userCredentialEntity.dataValues) : Promise.resolve(null);
    }

    public async getFailedLogins(userId: string): Promise<Array<UserFailedLogin>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entities = await sequelize.models.userFailedLogin.findAll({
            where: {userId: userId},
            order: ["failureAtMs"]
        });

        if(!entities){
            return [];
        }
        return entities.map(e => e.dataValues);
    }

    public async addFailedLogin(userFailedLogins: UserFailedLogin): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFailedLogin.create(userFailedLogins);            
        return Promise.resolve();
    }

    public async removeFailedLogin(userId: string, failureAtMs: number): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFailedLogin.destroy({
            where: {
                userId: userId,
                failureAtMs: failureAtMs
            }
        });        
        return Promise.resolve();
    }

    public async resetFailedLoginAttempts(userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFailedLogin.destroy({
            where: {
                userId: userId
            }
        });        
        return Promise.resolve();
    }


    public async getUserBy(userLookupType: UserLookupType, value: string): Promise<User | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        // @typescript-eslint/no-explicit-any
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
        let u: UserEntity | null = await sequelize.models.user.findOne({
            where: where
        });

        // For email lookups, we can try the recovery email table too
        if(u === null && userLookupType === "email"){
            const entity: UserEmailRecoveryEntity | null = await sequelize.models.userEmailRecovery.findOne({
                where: {
                    email: value
                }
            });
            if(entity){
                const userId = entity.getDataValue("userId");
                u = await sequelize.models.user.findOne({
                    where: {
                        userId: userId
                    }
                });
            }
        }

        return u ? Promise.resolve(u.dataValues as User) : Promise.resolve(null);
    }



    public async savePasswordResetToken(userId: string, token: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userVerificationToken.create({
            expiresAtMS: Date.now() + 600000,  // allow 10 minutes
            issuedAtMS:  Date.now(),
            userId: userId,
            token: token,
            verificationType: VERIFICATION_TOKEN_TYPE_PASSWORD_RESET
        });        
        
        return Promise.resolve();
    }

    public async getUserByPasswordResetToken(token: string): Promise<User | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tokenEntity = await sequelize.models.userVerificationToken.findOne({
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
        const user: UserEntity | null = await sequelize.models.user.findOne({
            where: {userId: tokenEntity.getDataValue("userId")}
        });
        return user ? Promise.resolve(user.dataValues as User) : Promise.resolve(null);
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userVerificationToken.destroy({
            where: {
                token: token
            }
        });
        return Promise.resolve();
    }

    
    public async saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userVerificationToken.create({
            expiresAtMS: Date.now() + (60 * 60 * 1000),  // allow 60 minutes
            issuedAtMS:  Date.now(),
            userId: userId,
            token: token,
            verificationType: VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL
        });        
        
        return Promise.resolve();
    }

    public async getUserByEmailConfirmationToken(token: string): Promise<User | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tokenEntity = await sequelize.models.userVerificationToken.findOne({
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
        const user: UserEntity | null = await sequelize.models.user.findOne({
            where: {userId: tokenEntity.getDataValue("userId")}
        });
        return user ? Promise.resolve(user.dataValues as User) : Promise.resolve(null);
    }
    
    public async deleteEmailConfirmationToken(token: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userVerificationToken.destroy({
            where: {
                token: token
            }
        })
        return Promise.resolve();
    }

    // prohibitedPasswords
    public async passwordProhibited(password: string): Promise<boolean> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity = await sequelize.models.prohibitedPasswords.findOne({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userCredential.create(userCredential);        
        return Promise.resolve();
    }

    public async deleteUserCredential(userId: string, dateCreated?: Date): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        // @typescript-eslint/no-explicit-any
        const queryParams: any = {
            userId: userId
        };
        if(dateCreated){
            queryParams.dateCreated = dateCreated
        }
        await sequelize.models.userCredential.destroy({
            where: queryParams
        });
        return Promise.resolve();
    }

    public async createUser(user: User): Promise<User> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.user.create(user);
        return Promise.resolve(user);
    }

    public async updateUser(user: User): Promise<User> {

        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.user.update(user, {
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userTenantRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userTermsAndConditionsAccepted.destroy({
            where: {
                userId: userId
            }
        });
        await sequelize.models.authenticationGroupUserRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.authorizationGroupUserRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userCredential.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userScopeRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.authorizationCodeData.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.refreshData.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.federatedOidcAuthorizationRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userFailedLogin.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userVerificationToken.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userMfaRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userFido2CountrerRel.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userFido2Challenge.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userAuthenticationState.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userRegistrationState.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userDuressCredential.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userEmailRecovery.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.userProfileEmailChangeState.destroy({
            where: {
                userId: userId
            }
        });
        
        await sequelize.models.userAuthenticationHistory.destroy({
            where: {
                userId: userId
            }
        });

        await sequelize.models.user.destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }

    // userTenantRel
    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const model: UserTenantRel = {
            userId: userId,
            tenantId: tenantId,
            relType: relType,
            enabled: true
        };
        await sequelize.models.userTenantRel.create(model);        
        return model;
    }

    public async updateUserTenantRel(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const model: UserTenantRel = {
            userId: userId,
            tenantId: tenantId,
            relType: relType,
            enabled: true
        };
        await sequelize.models.userTenantRel.update(model, {
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return model;
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userTenantRel.destroy({
            where: {
                tenantId: tenantId,
                userId: userId
            }
        });
        return Promise.resolve();
    }

    public async getUserTenantRel(tenantId: string, userId: string): Promise<UserTenantRel | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: UserTenantRelEntity | null = await sequelize.models.userTenantRel.findOne({
            where: {
                tenantId: tenantId,
                userId: userId
            }
        });        
        return entity ? Promise.resolve(entity.dataValues as UserTenantRel) : Promise.resolve(null);
    }

    public async getUserTenantRelsByUserId(userId: string): Promise<Array<UserTenantRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const list = await sequelize.models.userTenantRel.findAll({
            where: {
                userId: userId
            }
        });
        return list.map(e => e.dataValues);
    }

    public async createUserAuthenticationStates(arrUserAuthenticationState: Array<UserAuthenticationState>): Promise<Array<UserAuthenticationState>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        for(let i = 0; i < arrUserAuthenticationState.length; i++){
            await sequelize.models.userAuthenticationState.create(arrUserAuthenticationState[i]);
        }
        return arrUserAuthenticationState;
    }

    public async getUserAuthenticationStates(authenticationSessionToken: string): Promise<Array<UserAuthenticationState>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<UserAuthenticationStateEntity> = await sequelize.models.userAuthenticationState.findAll({
            where: {
                authenticationSessionToken: authenticationSessionToken
            }
        });
        return arr.map((entity: UserAuthenticationStateEntity) => entity.dataValues);
    }

    public async updateUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userAuthenticationState.update(userAuthenticationState, {
            where: {
                userId: userAuthenticationState.userId,
                authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                authenticationState: userAuthenticationState.authenticationState
            }
        });
        return userAuthenticationState;
    }

    public async deleteUserAuthenticationState(userAuthenticationState: UserAuthenticationState): Promise<UserAuthenticationState> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userAuthenticationState.destroy({
            where: {
                userId: userAuthenticationState.userId,
                authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                authenticationState: userAuthenticationState.authenticationState
            }
        });
        return userAuthenticationState;
    }

    public async createUserRegistrationStates(arrRegistrationState: Array<UserRegistrationState>): Promise<Array<UserRegistrationState>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        for(let i = 0; i < arrRegistrationState.length; i++){
            await sequelize.models.userRegistrationState.create(arrRegistrationState[i]);
        }
        return arrRegistrationState;
    }

    public async getUserRegistrationStates(registrationSessionToken: string): Promise<Array<UserRegistrationState>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<UserRegistrationStateEntity> = await sequelize.models.userRegistrationState.findAll({
            where: {
                registrationSessionToken: registrationSessionToken
            }
        });
        return arr.map((entity: UserRegistrationStateEntity) => entity.dataValues);
    }

    public async getUserRegistrationStatesByEmail(email: string): Promise<Array<UserRegistrationState>>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<UserRegistrationStateEntity> = await sequelize.models.userRegistrationState.findAll({
            where: {
                email: email
            }
        });
        return arr.map((entity: UserRegistrationStateEntity) => entity.dataValues);
    }

    public async updateUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userRegistrationState.update(userRegistrationState, {
            where: {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                registrationState: userRegistrationState.registrationState
            }
        });
        return userRegistrationState;
    }

    public async deleteUserRegistrationState(userRegistrationState: UserRegistrationState): Promise<UserRegistrationState> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userRegistrationState.destroy({
            where: {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                registrationState: userRegistrationState.registrationState
            }
        });
        return userRegistrationState;
    }

    public async addUserTermsAndConditionsAccepted(userTermsAndConditionsAccepted: UserTermsAndConditionsAccepted): Promise<UserTermsAndConditionsAccepted>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userTermsAndConditionsAccepted.create(userTermsAndConditionsAccepted);
        return Promise.resolve(userTermsAndConditionsAccepted);
    }
    
    public async getUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<UserTermsAndConditionsAccepted | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: UserTermsAndConditionsAcceptedEntity | null = await sequelize.models.userTermsAndConditionsAccepted.findOne({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return entity ? entity.dataValues : null;
    }
    
    public async deleteUserTermsAndConditionsAccepted(userId: string, tenantId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userTermsAndConditionsAccepted.destroy({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userRegistrationState.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await sequelize.models.userAuthenticationState.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await sequelize.models.userFido2Challenge.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await sequelize.models.userVerificationToken.destroy({
            where: {
                expiresAtMS: {
                    [Op.lt]: Date.now()
                }
            }
        });

        await sequelize.models.userProfileEmailChangeState.destroy({
            where: {
                expiresAtMS: {
                    [Op.lt]: Date.now()
                }
            }
        })

    }

    public async getUserRecoveryEmail(userId: string): Promise<UserRecoveryEmail | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: UserEmailRecoveryEntity | null = await sequelize.models.userEmailRecovery.findOne({
            where: {
                userId: userId
            }
        });
        return entity ? entity.dataValues : null;
    }

    public async addRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userEmailRecovery.create(userRecoveryEmail);
        return Promise.resolve(userRecoveryEmail);
    }

    public async updateRecoveryEmail(userRecoveryEmail: UserRecoveryEmail): Promise<UserRecoveryEmail>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userEmailRecovery.update(userRecoveryEmail, {
                where: {
                    userId: userRecoveryEmail.userId
                }
            }
        );
        return Promise.resolve(userRecoveryEmail);
    }

    public async deleteRecoveryEmail(userId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userEmailRecovery.destroy({
            where: {
                userId: userId
            }
        });
    }

    public async addUserDuressCredential(userCredential: UserCredential): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userDuressCredential.create(userCredential);
        return Promise.resolve();
    }

    public async getUserDuressCredential(userId: string): Promise<UserCredential | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: UserDuressCredentialEntity | null = await sequelize.models.userDuressCredential.findOne({
            where: {
                userId: userId
            }
        });
        return entity ? entity.dataValues : null;
    }

    public async deleteUserDuressCredential(userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userDuressCredential.destroy({
            where: {
                userId: userId
            }
        });
        return Promise.resolve();
    }

    public async getProfileEmailChangeStates(changeStateToken: string): Promise<Array<ProfileEmailChangeState>>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<UserProfileChangeEmailStateEntity> = await sequelize.models.userProfileEmailChangeState.findAll({
            where: {
                changeEmailSessionToken: changeStateToken
            }
        });
        return arr.map((entity: UserProfileChangeEmailStateEntity) => entity.dataValues);
    }
    
    public async createProfileEmailChangeStates(arrEmailChangeStates: Array<ProfileEmailChangeState>): Promise<Array<ProfileEmailChangeState>>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        for(let i = 0; i < arrEmailChangeStates.length; i++){
            await sequelize.models.userProfileEmailChangeState.create(arrEmailChangeStates[i]);
        }
        return arrEmailChangeStates;
    }
    
    public async updateProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<ProfileEmailChangeState>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userProfileEmailChangeState.update(profileEmailChangeState, {
            where: {
                userId: profileEmailChangeState.userId,
                emailChangeState: profileEmailChangeState.emailChangeState,
                changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
            }
        });
        return profileEmailChangeState;
    }

    public async deleteProfileEmailChangeState(profileEmailChangeState: ProfileEmailChangeState): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userProfileEmailChangeState.destroy({
            where: {
                userId: profileEmailChangeState.userId,
                emailChangeState: profileEmailChangeState.emailChangeState,
                changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
            }
        });
        return Promise.resolve();
    }

    public async addUserAuthenticationHistory(userId: string, authenticatedAtMs: number): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userAuthenticationHistory.create({
            userId: userId,
            lastAuthenticationAtMs: authenticatedAtMs
        });
        return Promise.resolve();        
    }

}

export default DBIdentityDao;