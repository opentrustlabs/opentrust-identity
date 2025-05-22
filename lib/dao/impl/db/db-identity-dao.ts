import { User, AuthenticationGroup, AuthorizationGroup, SuccessfulLoginResponse, UserFailedLoginAttempts, UserTenantRel, UserCredential, UserMfaRel } from "@/graphql/generated/graphql-types";
import IdentityDao, { UserLookupType } from "../../identity-dao";
import UserAuthorizationGroupRelEntity from "@/lib/entities/authorization-group-user-rel-entity";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import UserEntity from "@/lib/entities/user-entity";
import UserCredentialEntity from "@/lib/entities/user-credential-entity";
import { MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, PASSWORD_HASH_ITERATION_128K, PASSWORD_HASH_ITERATION_256K, PASSWORD_HASH_ITERATION_32K, PASSWORD_HASH_ITERATION_64K, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, SEARCH_INDEX_OBJECT_SEARCH, VERIFICATION_TOKEN_TYPE_PASSWORD_RESET } from "@/utils/consts";
import { bcryptValidatePassword, generateRandomToken, pbkdf2HashPassword, scryptHashPassword, sha256HashPassword } from "@/utils/dao-utils";
import UserMfaRelEntity from "@/lib/entities/user-mfa-rel-entity";
import UserTenantRelEntity from "@/lib/entities/user-tenant-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { FindOptions, IncrementDecrementOptionsWithBy, InstanceDestroyOptions, InstanceRestoreOptions, InstanceUpdateOptions, Model, Op, SaveOptions, Sequelize, SetOptions } from "sequelize";
import { SequelizeHooks } from "sequelize/lib/hooks";
import { ValidationOptions } from "sequelize/lib/instance-validator";

class DBIdentityDao extends IdentityDao {
    

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

        return Promise.resolve(groups as any as Array<AuthorizationGroup>);
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
        
        return Promise.resolve(authnGroups as any as Array<AuthenticationGroup>);
    }

    public async loginUser(username: string, password: string): Promise<SuccessfulLoginResponse | Error> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const userEntity: UserEntity | null = await sequelize.models.user.findOne({
            where:{email: username}
        });

        if(!userEntity){
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
        const user: User = userEntity.dataValues as User;
        const userCredentialEntity: UserCredentialEntity | null = await sequelize.models.userCredential.findOne({
            where: {
                userId: user.userId
            },
            order: [
                ["dateCreated", "DESC"]
            ]
        })
        if(!userCredentialEntity){
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }

        const userCredential: UserCredential = userCredentialEntity.dataValues as UserCredential;
        // Note that the bcrypt hashing algorithm CAN automatically generate a random salt
        // and save both the salt value and the iteration value as part of the hashed password,
        // so we do NOT need to pass both those pieces of information to the validation
        // function.
        let valid: boolean = false;
        if(
            userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS ||
            userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS ||
            userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS
        ){
            valid = bcryptValidatePassword(password, userCredential.hashedPassword)
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS){
            const hashedPassword = sha256HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_64K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
            const hashedPassword = sha256HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_128K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){
            const hashedPassword = pbkdf2HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_128K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){
            const hashedPassword = pbkdf2HashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_256K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS){
            const hashedPassword = scryptHashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_32K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS){
            const hashedPassword = scryptHashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_64K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS){
            const hashedPassword = scryptHashPassword(password, userCredential.salt, PASSWORD_HASH_ITERATION_128K);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else{
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }

        if(!valid){
            throw new Error("ERROR_AUTHENTICATING_USER");
        }
        // Does the user have any second-factor authentication enabled? userMfaRel
        const mfaEntities: Array<UserMfaRelEntity> = await sequelize.models.userMfaRel.findAll({
            where:{
                userId: user.userId
            }
        })
        //em.find(UserMfaRelEntity, {userId: user.userId});
        if(mfaEntities && mfaEntities.length > 0){
            
            let mfa: UserMfaRelEntity | undefined;
            if(mfaEntities.length === 1){
                mfa = mfaEntities[0];
            }
            else{
                // find the primary factor and use it, the others are there for backup
                // in case, for example, the user has lost their security key or their
                // phone with an authenticator app on it.
                mfa = mfaEntities.find(
                    (e: UserMfaRelEntity) => e.getDataValue("primaryMfa") === true
                )
                // If not have been defined as primary, throw an error (although
                // this should never happen in real life...)
                if(!mfa){
                    throw new Error("ERROR_UNABLE_TO_FIND_PRIMARY_MULTIFACTOR_AUTHENTICATION_TYPE")
                }                
            }
            let successfulLoginResponse: SuccessfulLoginResponse = {
                mfaEnabled: true,
                userId: user.userId,
                mfaType: mfa.getDataValue("mfaType")
            };
            if(mfa.getDataValue("mfaType") === MFA_AUTH_TYPE_FIDO2){
                // create the challenge and save it for the next step
                const challenge: string = generateRandomToken(32, "base64url");
                successfulLoginResponse.challenge = challenge;

                await sequelize.models.userFido2Challenge.create({
                    userId: user.userId,
                    challenge:challenge,
                    issuedAtMS: Date.now(),
                    expiresAtMS: Date.now() + 120000
                })
            }
            return Promise.resolve(successfulLoginResponse);
        }
        
        return Promise.resolve({
            userId: user.userId,
            challenge: "",
            mfaEnabled: false,
            mfaType: ""
        });
    }

    // userFailedLoginAttempts
    public async getLoginAttempts(userId: string): Promise<Array<UserFailedLoginAttempts>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entities = await sequelize.models.userFailedLoginAttempts.findAll({
            where: {userId: userId}
        });

        if(!entities){
            return [];
        }
        return entities.map(e => e.dataValues);
    }

    public async incrementLoginAttempts(userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFailedLoginAttempts.create(
            {
                userId: userId,
                failureAtMS: Date.now()
            }
        );
        return Promise.resolve();
    }

    public async resetLoginAttempts(userId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userFailedLoginAttempts.destroy({
            where: {
                userId: userId
            }
        });        
        return Promise.resolve();
    }


    public async getUserBy(userLookupType: UserLookupType, value: string): Promise<User | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
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
        const u: UserEntity | null = await sequelize.models.user.findOne({
            where: where
        });

        return u ? Promise.resolve(u as any as User) : Promise.resolve(null);
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
        return user ? Promise.resolve(user as any as User) : Promise.resolve(null);
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.userVerificationToken.destroy({
            where: {
                token: token
            }
        })
        return Promise.resolve();
    }

    
    public async saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserByEmailConfirmationToken(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    
    public async deleteEmailConfirmationToken(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    
    public async validateOTP(userId: string, challenge: string, challengeId: string, challengeType: string): Promise<boolean> {
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
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

}

export default DBIdentityDao;