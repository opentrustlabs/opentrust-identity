import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserFido2Challenge {
    userId: string,
    challenge: string,
    issuedAtMs: number,
    expiresAtMs: number
}

const UserFido2ChallengeEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        challenge: {
            type: String,
            primary: false,
            nullable: false,
            name: "challenge"
        },
        issuedAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "issuedatms"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },

    tableName: "user_fido2_challenge",
    name: "userFido2Challenge",

});



export default UserFido2ChallengeEntity;
