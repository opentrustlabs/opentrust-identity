import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const UserRegistrationStateEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        email: {
            type: String,
            primary: false,
            nullable: false,
            name: "email"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        registrationSessionToken: {
            type: String,
            primary: true,
            name: "registrationsessiontoken"
        },
        registrationState: {
            type: String,
            primary: true,
            name: "registrationstate"
        },
        registrationStateOrder: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "registrationstateorder"
        },
        registrationStateStatus: {
            type: String,
            primary: false,
            nullable: false,
            name: "registrationstatestatus"
        },
        preAuthToken: {
            type: String,
            primary: false,
            nullable: true,
            name: "preauthtoken"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        deviceCodeId: {
            type: String,
            primary: false,
            nullable: true,
            name: "devicecodeid"
        }
    },

    tableName: "user_registration_state",
    name: "userRegistrationState",

});



export default UserRegistrationStateEntity;
