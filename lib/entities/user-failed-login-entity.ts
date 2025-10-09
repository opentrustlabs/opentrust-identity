import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserFailedLogin {
    userId: string,
    failureAtMs: number,
    nextLoginNotBefore: number,
    failureCount: number
}

const UserFailedLoginEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        failureAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: true,
            name: "failureatms"
        },
        nextLoginNotBefore: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "nextloginnotbefore"
        },
        failureCount: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "failurecount"
        }
    },

    tableName: "user_failed_login",
    name: "userFailedLogin",

});



export default UserFailedLoginEntity;
