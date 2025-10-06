import { EntitySchema } from 'typeorm';

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
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        }
    },

    tableName: "secret_share",
    name: "secretShare",

});



export default SecretShareEntity;
