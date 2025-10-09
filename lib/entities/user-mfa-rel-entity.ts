import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const UserMfaRelEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        mfaType: {
            type: String,
            primary: true,
            name: "mfatype"
        },
        primaryMfa: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "primarymfa",
            transformer: BooleanTransformer
        },
        totpSecret: {
            type: String,
            primary: false,
            nullable: true,
            name: "totpsecret"
        },
        totpHashAlgorithm: {
            type: String,
            primary: false,
            nullable: true,
            name: "totphashalgorithm"
        },
        fido2PublicKey: {
            type: String,
            primary: false,
            nullable: true,
            name: "fido2publickey"
        },
        fido2CredentialId: {
            type: String,
            primary: false,
            nullable: true,
            name: "fido2credentialid"
        },
        fido2PublicKeyAlgorithm: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "fido2publickeyalgorithm"
        },
        fido2Transports: {
            type: String,
            primary: false,
            nullable: true,
            name: "fido2transports"
        },
        fido2KeySupportsCounters: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "fido2keysupportscounters",
            transformer: BooleanTransformer
        }
    },

    tableName: "user_mfa_rel",
    name: "userMfaRel",

});



export default UserMfaRelEntity;
