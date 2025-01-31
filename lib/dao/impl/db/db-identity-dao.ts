import { User, AuthenticationGroup, AuthorizationGroup, AuthenticationGroupUserRel, SuccessfulLoginResponse, UserFailedLoginAttempts } from "@/graphql/generated/graphql-types";
import IdentityDao from "../../identity-dao";
import connection  from "@/lib/data-sources/db";
import UserAuthorizationGroupRelEntity from "@/lib/entities/authorization-group-user-rel-entity";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import UserEntity from "@/lib/entities/user-entity";
import UserCredentialEntity from "@/lib/entities/user-credential-entity";
import { QueryOrder } from "@mikro-orm/core";
import { MFA_FACTOR_AUTH_TYPE_FIDO2, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, VERIFICATION_TOKEN_TYPE_PASSWORD_RESET } from "@/utils/consts";
import { bcryptValidatePassword, generateRandomToken, pbkdf2HashPassword, sha256HashPassword } from "@/utils/dao-utils";
import UserFailedLoginAttemptsEntity from "@/lib/entities/user-failed-login-attempts-entity";
import UserMfaRelEntity from "@/lib/entities/user-mfa-rel-entity";
import UserFido2ChallengeEntity from "@/lib/entities/user-fido2-challenge-entity";
import UserVerificationTokenEntity from "@/lib/entities/user-verification-token-entity";

class DBIdentityDao extends IdentityDao {


    public async getUsers(clientId: string): Promise<Array<User>> {
        throw new Error("Method not implemented.");
    }

    public async getUserGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        const em = connection.em.fork();
        const rels: Array<UserAuthorizationGroupRelEntity> = await em.find(UserAuthorizationGroupRelEntity, {userId: userId});
        const groupIds = rels.map(r => r.groupId);
        const groups: Array<AuthorizationGroupEntity> = await em.find(AuthorizationGroupEntity, {groupId: groupIds});
        return Promise.resolve(groups);
    }

    public async getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>> {
        const em = connection.em.fork();
        const rels: Array<AuthenticationGroupUserRelEntity> = await em.find(AuthenticationGroupUserRelEntity, {userId: userId});
        const groupIds = rels.map(r => r.authenticationGroupId);
        const authnGroups: Array<AuthenticationGroupEntity> = await em.find(AuthenticationGroupEntity, {authenticationGroupId: groupIds});
        return Promise.resolve(authnGroups);
    }

    public async loginUser(username: string, password: string): Promise<SuccessfulLoginResponse | Error> {
        const em = connection.em.fork();
        const user: UserEntity | null = await em.findOne(UserEntity, {email: username});
        if(!user){
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
        const userCredential: UserCredentialEntity | null = await em.findOne(UserCredentialEntity, {userId: user.userId}, {orderBy: {dateCreated: QueryOrder.DESC}});
        if(!userCredential){
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
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
            const hashedPassword = sha256HashPassword(password, userCredential.salt, 64000);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
            const hashedPassword = sha256HashPassword(password, userCredential.salt, 128000);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){
            const hashedPassword = pbkdf2HashPassword(password, userCredential.hashedPassword, 128000);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){
            const hashedPassword = pbkdf2HashPassword(password, userCredential.hashedPassword, 256000);
            valid = hashedPassword === userCredential.hashedPassword;
        }
        else{
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
        if(!valid){
            throw new Error("ERROR_AUTHENTICATING_USER");
        }
        // Does the user have any second-factor authentication enabled?
        const mfas: Array<UserMfaRelEntity> = await em.find(UserMfaRelEntity, {userId: user.userId});
        if(mfas && mfas.length > 0){
            let mfa: UserMfaRelEntity | undefined;
            if(mfas.length === 1){
                mfa = mfas[0];
            }
            else{
                // find the primary factor and use it, the others are there for backup
                // in case, for example, the user has lost their security key or their
                // phone with an authenticator app on it.
                mfa = mfas.find(
                    (e: UserMfaRelEntity) => e.primaryMfa === true
                )
                // If not have been defined as primary, throw an error (although
                // this should never happen in real life...)
                if(!mfa){
                    throw new Error("ERROR_UNABLE_TO_FIND_PRIMARY_MULTIFACTOR_AUTHENTICATION_TYPE")
                }                
            }
            let r: SuccessfulLoginResponse = {
                mfaEnabled: true,
                userId: user.userId,
                mfaType: mfa.mfaType
            };
            if(mfa.mfaType === MFA_FACTOR_AUTH_TYPE_FIDO2){
                // create the challenge and save it for the next step
                const challenge: string = generateRandomToken(32, "base64url");
                r.challenge = challenge;
                const entity: UserFido2ChallengeEntity = new UserFido2ChallengeEntity();
                entity.challenge = challenge;
                entity.expiresAtMS = Date.now() + 120000; // Allow 2 minutes
                entity.issuedAtMS = Date.now();
                entity.userId = user.userId;
                await em.persistAndFlush(entity);
            }
            return Promise.resolve(r);
        }
        
        return Promise.resolve({
            userId: user.userId,
            challenge: "",
            mfaEnabled: false,
            mfaType: ""
        });
    }

    public async getLoginAttempts(userId: string): Promise<Array<UserFailedLoginAttempts>> {
        const em = connection.em.fork();
        const entities = await em.find(UserFailedLoginAttemptsEntity, {userId: userId});
        if(!entities){
            return [];
        }
        return entities;
    }

    public async incrementLoginAttempts(userId: string): Promise<void> {
        const em = connection.em.fork();
        const e: UserFailedLoginAttemptsEntity = new UserFailedLoginAttemptsEntity();
        e.failureAtMS = Date.now();
        e.userId = userId;
        await em.persistAndFlush(e);
        return Promise.resolve();
    }

    public async resetLoginAttempts(userId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(UserFailedLoginAttemptsEntity, {userId: userId});
        return Promise.resolve();
    }


    public async getUserById(userId: string): Promise<User | null> {
        const em = connection.em.fork();
        const u: UserEntity | null = await em.findOne(UserEntity, {userId: userId});
        return Promise.resolve(u);
    }

    public async savePasswordResetToken(userId: string, token: string): Promise<void> {
        const em = connection.em.fork();
        const entity: UserVerificationTokenEntity = new UserVerificationTokenEntity();
        entity.expiresAtMS = Date.now() + 600000; // allow 10 minutes
        entity.issuedAtMS = Date.now();
        entity.userId = userId;
        entity.token = token;
        entity.verificationType = VERIFICATION_TOKEN_TYPE_PASSWORD_RESET;
        await em.persistAndFlush(entity);
        return Promise.resolve();
    }

    public async getUserByPasswordResetToken(token: string): Promise<User | null> {
        const em = connection.em.fork();
        const tokenEntity = await em.findOne(UserVerificationTokenEntity, {token: token});
        if(!tokenEntity){
            return Promise.resolve(null);
        }
        // If the token has expired, then delete it
        if(tokenEntity.expiresAtMS < Date.now()){
            this.deletePasswordResetToken(token);
            return Promise.resolve(null);
        }
        const user: UserEntity | null = await em.findOne(UserEntity, {userId: tokenEntity.userId});
        return Promise.resolve(user);
    }

    public async deletePasswordResetToken(token: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(UserVerificationTokenEntity, {token: token});
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
    
    public async createUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async updateUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async deleteUser(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBIdentityDao;