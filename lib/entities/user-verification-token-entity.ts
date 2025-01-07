import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "user_verification_token"
})
class UserVerificationTokenEntity {

    @PrimaryKey({fieldName: "token"})
    token: string;
    
    @Property({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "verificationtype"})
    verificationType: string;

    @Property({fieldName: "issuedatms"})
    issuedAtMS: number;

    @Property({fieldName: "expiresatms"})
    expiresAtMS: number;

}

export default UserVerificationTokenEntity;