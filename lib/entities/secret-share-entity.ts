import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const SecretShareEntity = new EntitySchema({
    columns: {
        secretShareId: {
            type: String,
            primary: true,
            name: "secretshareid"
        },
        objectId: {
            type: String,
            primary: false,
            nullable: false,
            name: "objectid"
        },
        secretShareObjectType: {
            type: String,
            primary: false,
            nullable: false,
            name: "objectype"
        },
        otp: {
            type: String,
            primary: false,
            nullable: false,
            name: "otp"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },

    tableName: "secret_share",
    name: "secretShare",

});



export default SecretShareEntity;
