import { User } from "@/graphql/generated/graphql-types";

abstract class IdentityDao {

    abstract getUsers(clientId: string): Promise<Array<User>>;

    abstract loginUser(username: string, password: string): Promise<User>;

    abstract createUser(user: User): Promise<User>;

    abstract updateUser(user: User): Promise<User>;

    abstract deleteUser(userId: string): Promise<void>;

}

export default IdentityDao;