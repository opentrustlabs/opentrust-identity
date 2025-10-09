import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const UserAuthenticationStateEntity = new EntitySchema({

    tableName: "user_authentication_state",
    name: "userAuthenticationState",
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        authenticationSessionToken: {
            type: String,
            primary: true,
            name: "authenticationsessiontoken"
        },
        authenticationState: {
            type: String,
            primary: true,
            name: "authenticationstate"
        },
        authenticationStateOrder: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "authenticationstateorder"
        },
        authenticationStateStatus: {
            type: String,
            primary: false,
            nullable: false,
            name: "authenticationstatestatus"
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
        returnToUri: {
            type: String,
            primary: false,
            nullable: true,
            name: "returntouri"
        },
        deviceCodeId: {
            type: String,
            primary: false,
            nullable: true,
            name: "devicecodeid"
        }
    }
});


export default UserAuthenticationStateEntity;