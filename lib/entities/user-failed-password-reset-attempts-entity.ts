import { EntitySchema } from 'typeorm';
import { getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserFailedPasswordResetAttempts {
    userId: string,
    failureAtMs: number,
    nextLoginNotBefore: number,
    failureCount: number
}

const UserFailedPasswordResetAttemptsEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        failureCount: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "failurecount"
        }
    },

    tableName: "user_failed_password_reset_attempts",
    name: "userFailedPasswordResetAttempts",

});



export default UserFailedPasswordResetAttemptsEntity;