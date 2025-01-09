import { AuthenticationGroup, AuthorizationGroup, SuccessfulLoginResponse, User, UserFailedLoginAttempts } from "@/graphql/generated/graphql-types";
import IdentityDao from "../../identity-dao";

class FSBasedIdentityDao extends IdentityDao {

    getLoginAttempts(userId: string): Promise<Array<UserFailedLoginAttempts>> {
        throw new Error("Method not implemented.");
    }
    savePasswordResetToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getUserByPasswordResetToken(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    deletePasswordResetToken(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    saveEmailConfirmationToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getUserByEmailConfirmationToken(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    deleteEmailConfirmationToken(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    

    incrementLoginAttempts(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    resetLoginAttempts(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    saveForgotPasswordToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    getUserAuthenticationGroups(userId: string): Promise<Array<AuthenticationGroup>> {
        throw new Error("Method not implemented.");
    }

    validateOTP(userId: string, challenge: string, challengeId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getUserById(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    
    getUserGroups(userId: string): Promise<Array<AuthorizationGroup>> {
        throw new Error("Method not implemented.");
    }
    getUserLoginGroups(userId: string): Promise<Array<AuthenticationGroup>> {
        throw new Error("Method not implemented.");
    }
    
    getUsers(clientId: string): Promise<Array<User>> {
        throw new Error("Method not implemented.");
    }

    loginUser(username: string, password: string): Promise<SuccessfulLoginResponse | Error> {
        throw new Error("Method not implemented.");
    }
    createUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    updateUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    deleteUser(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}

export default FSBasedIdentityDao;