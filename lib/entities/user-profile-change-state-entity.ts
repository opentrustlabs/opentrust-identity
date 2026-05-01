import { EntitySchema } from 'typeorm';
import { getIntTypeForDriver, getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;


const UserProfileChangeStateEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        changeProfileSessionToken: {
            type: String,
            primary: true,
            name: "changeprofilesessiontoken"
        },
        profileState: {
            type: String,
            primary: true,
            name: "profilestate"
        },
        profileProperty: {
            type: String,
            primary: false,
            nullable: false,
            name: "profileproperty"
        },
        profilePropertyValue: {
            type: String,
            primary: false,
            nullable: false,
            name: "profilepropertyvalue"
        },
        changeOrder: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "changeorder"
        },
        changeStateStatus: {
            type: String,
            primary: false,
            nullable: false,
            name: "changestatestatus"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },

    tableName: "user_profile_change_state",
    name: "userProfileChangeState",

});



export default UserProfileChangeStateEntity;
