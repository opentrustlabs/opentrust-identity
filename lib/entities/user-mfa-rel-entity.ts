import { EntitySchema } from 'typeorm';

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
            type: "boolean",
            primary: false,
            nullable: false,
            name: "primarymfa"
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
            type: "int",
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
            type: "boolean",
            primary: false,
            nullable: true,
            name: "fido2keysupportscounters"
        }
    },

    tableName: "user_mfa_rel",
    name: "userMfaRel",

});



export default UserMfaRelEntity;
