import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const UserCredentialEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        dateCreatedMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: true,
            name: "datecreatedms"
        },
        hashedPassword: {
            type: String,
            primary: false,
            nullable: false,
            name: "hashedpassword"
        },
        hashingAlgorithm: {
            type: String,
            primary: false,
            nullable: false,
            name: "hashingalgorithm"
        },
        salt: {
            type: String,
            primary: false,
            nullable: false,
            name: "salt"
        }
    },

    tableName: "user_credential",
    name: "userCredential",

});



export default UserCredentialEntity;
