import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserAuthenticationHistory {
    userId: string,
    lastAuthenticationAtMs: number
}

const UserAuthenticationHistoryEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        lastAuthenticationAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: true,
            name: "lastauthenticationatms"
        }
    },

    tableName: "user_authentication_history",
    name: "userAuthenticationHistory",

});



export default UserAuthenticationHistoryEntity;
