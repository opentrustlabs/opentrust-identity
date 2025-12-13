import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const AuthorizationDeviceCodeDataEntity = new EntitySchema({

    columns: {
        deviceCodeId: {
            type: String,
            primary: true,
            nullable: false,
            name: "devicecodeid"
        },
        deviceCode: {
            type: String,
            primary: false,
            nullable: false,
            name: "devicecode"
        },
        userCode: {
            type: String,
            primary: false,
            nullable: false,
            name: "usercode"
        },
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: false,
            name: "tenantid"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        scope: {
            type: String,
            primary: false,
            nullable: false,
            name: "scope"
        },
        authorizationStatus: {
            type: String,
            primary: false,
            nullable: false,
            name: "authorizationstatus"
        },
        userId: {
            type: String,
            primary: false,
            nullable: true,
            name: "userid"
        }
    },

    tableName: "authorization_device_code_data",
    name: "authorizationDeviceCodeData",


});



export default AuthorizationDeviceCodeDataEntity;
