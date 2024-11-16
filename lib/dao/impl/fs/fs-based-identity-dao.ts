import { User } from "@/graphql/generated/graphql-types";
import IdentityDao from "../../identity-dao";

class FSBasedIdentityDAO extends IdentityDao {
    
    getUsers(clientId: string): Promise<Array<User>> {
        throw new Error("Method not implemented.");
    }
    loginUser(username: string, password: string): Promise<User> {
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

export default FSBasedIdentityDAO;