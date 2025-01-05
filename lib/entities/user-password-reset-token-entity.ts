import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "user_password_reset_token"
})
class UserPasswordResetTokenEntity {

    @PrimaryKey({fieldName: "resettoken"})
    resetToken: string;
    
    @Property({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "issuedatms"})
    issuedAtMS: number;

}

export default UserPasswordResetTokenEntity;