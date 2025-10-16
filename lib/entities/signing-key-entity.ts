import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;


const SigningKeyEntity = new EntitySchema({


    columns: {
        keyId: {
            type: String,
            primary: true,
            name: "keyid"
        },
        keyType: {
            type: String,
            primary: false,
            nullable: false,
            name: "keytype"
        },
        keyName: {
            type: String,
            primary: false,
            nullable: false,
            name: "keyname"
        },
        keyUse: {
            type: String,
            primary: false,
            nullable: false,
            name: "keyuse"
        },
        keyPassword: {
            type: String,
            primary: false,
            nullable: true,
            name: "keypassword"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        createdAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "createdatms"
        },
        keyStatus: {
            type: String,
            primary: false,
            nullable: false,
            name: "keystatus"
        },
        tenantId: {
            type: String,
            primary: false,
            nullable: true,
            name: "tenantid"
        },
        markForDelete: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        },
        privateKeyPkcs8: {
            type: RDB_DIALECT === "oracle" ? "clob" : String,
            primary: false,
            nullable: false,
            name: "privatekeypkcs8",
            length: RDB_DIALECT !== "oracle" ? 8000 : undefined
        },
        publicKey: {
            type: RDB_DIALECT === "oracle" ? "clob" : String,
            primary: false,
            nullable: true,
            name: "publickey",
            length: RDB_DIALECT !== "oracle" ? 8000 : undefined
        },
        keyCertificate: {
            type: RDB_DIALECT === "oracle" ? "clob" : String,
            primary: false,
            nullable: true,
            name: "keycertificate",
            length: RDB_DIALECT !== "oracle" ? 8000 : undefined
        }
    },

    tableName: "signing_key",
    name: "signingKey",

});



export default SigningKeyEntity;
