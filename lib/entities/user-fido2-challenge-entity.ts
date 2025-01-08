import { Entity, PrimaryKey, Property } from "@mikro-orm/core";


@Entity({
    tableName: "user_fido2_challenge"
})
class UserFido2ChallengeEntity {

    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "challenge"})
    challenge: string;

    @Property({fieldName: "issuedatms"})
    issuedAtMS: number;

    @Property({fieldName: "expiresatms"})
    expiresAtMS: number

}

export default UserFido2ChallengeEntity;