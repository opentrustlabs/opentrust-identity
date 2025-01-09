import type { UserFailedLoginAttempts } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "user_failed_login_attempts"
})
class UserFailedLoginAttemptsEntity implements UserFailedLoginAttempts {

    constructor(userFailedLoginAttempts?: UserFailedLoginAttempts){
        if(userFailedLoginAttempts){
            Object.assign(this, userFailedLoginAttempts);
        }
    }
    __typename?: "UserFailedLoginAttempts";

    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "failureatms"})
    failureAtMS: number;

}

export default UserFailedLoginAttemptsEntity;