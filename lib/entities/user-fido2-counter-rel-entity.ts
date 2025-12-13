import { EntitySchema } from 'typeorm';
import {  getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserFido2CounterRel {
    userId: string,
    fido2Counter: number
}

const UserFido2CounterRelEntity = new EntitySchema({


    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        fido2Counter: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            name: "fido2counter"
        }
    },

    tableName: "user_fido2_counter_rel",
    name: "userFido2CounterRel",

});


export default UserFido2CounterRelEntity;


