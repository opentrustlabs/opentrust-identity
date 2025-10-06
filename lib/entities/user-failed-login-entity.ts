import { EntitySchema } from 'typeorm';

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
            type: "bigint",
            primary: true,
            name: "failureatms"
        },
        nextLoginNotBefore: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "nextloginnotbefore"
        },
        failureCount: {
            type: "int",
            primary: false,
            nullable: false,
            name: "failurecount"
        }
    },

    tableName: "user_failed_login",
    name: "userFailedLogin",

});



export default UserFailedLoginEntity;
