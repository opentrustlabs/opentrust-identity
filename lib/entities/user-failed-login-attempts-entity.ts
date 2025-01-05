import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "user_failed_login_attempts"
})
class UserFailedLoginAttemptsEntity {

    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "failureatms"})
    failureAtMS: number;

}

export default UserFailedLoginAttemptsEntity;