import { EntitySchema } from 'typeorm';

export interface UserVerificationToken {
    token: string,
    userId: string,
    verificationType: string,
    issuedAtMS: number,
    expiresAtMS: number
}

const UserVerificationTokenEntity  = new EntitySchema({
    tableName: "user_verification_token",
    name: "userVerificationToken",
    columns: {
        token: {
            type: String,
            primary: true,
            name: "token"
        },
        userId: {
            type: String,
            primary: false,
            nullable: false,
            name: "userid"
        },
        verificationType: {
            type: String,
            primary: false,
            nullable: false,
            name: "verificationtype"
        },
        issuedAtMS: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "issuedatms"
        },
        expiresAtMS: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    }
});

export default UserVerificationTokenEntity;