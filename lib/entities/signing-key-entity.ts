import { EntitySchema } from 'typeorm';

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
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        createdAtMs: {
            type: "bigint",
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
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        },
        privateKeyPkcs8: {
            type: String,
            primary: false,
            nullable: false,
            name: "privatekeypkcs8",
        },
        publicKey: {
            type: String,
            primary: false,
            nullable: true,
            name: "publickey",
        },
        keyCertificate: {
            type: String,
            primary: false,
            nullable: true,
            name: "keycertificate"
        }
    },

    tableName: "signing_key",
    name: "signingKey",

});



export default SigningKeyEntity;
