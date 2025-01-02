import { User, AuthenticationGroup, AuthorizationGroup, AuthenticationGroupUserRel } from "@/graphql/generated/graphql-types";
import IdentityDao from "../../identity-dao";
import connection  from "@/lib/data-sources/db";
import UserAuthorizationGroupRelEntity from "@/lib/entities/user-authorization-group-rel-entity";
import AuthorizationGroupEntity from "@/lib/entities/authorization-group-entity";
import AuthenticationGroupUserRelEntity from "@/lib/entities/authentication-group-user-rel-entity";
import AuthenticationGroupEntity from "@/lib/entities/authentication-group-entity";
import UserEntity from "@/lib/entities/user-entity";
import UserCredentialEntity from "@/lib/entities/user-credential-entity";
import { QueryOrder } from "@mikro-orm/core";
import { PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS } from "@/utils/consts";

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

    public async loginUser(username: string, password: string): Promise<User | Error> {
        const em = connection.em.fork();
        const user: UserEntity | null = await em.findOne(UserEntity, {email: username});
        if(!user){
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
        const userCredential: UserCredentialEntity | null = await em.findOne(UserCredentialEntity, {userId: user.userId}, {orderBy: {dateCreated: QueryOrder.DESC}});
        if(!userCredential){
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
        if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS){

        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS){
            
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS){

        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS){

        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
        
        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){

        }
        else if(userCredential.hashingAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){

        }
        else{
            return new Error("ERROR_UNABLE_TO_LOGIN_USER");
        }
        return new Error("ERROR_")

    }

    public async getLoginAttempts(userId: string): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async incrementLoginAttempts(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async resetLoginAttempts(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async validateOTP(userId: string, challenge: string, challengeId: string, challengeType: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public async getUserById(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    public async saveForgotPasswordToken(userId: string, token: string): Promise<void> {
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