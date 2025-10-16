import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserDuressCredential {
    userId: string,
    dateCreatedMs: number,
    hashedPassword: string,
    hashingAlgorithm: string,
    salt: string
}

const UserDuressCredentialEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        dateCreatedMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
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

    tableName: "user_duress_credential",
    name: "userDuressCredential",

});



export default UserDuressCredentialEntity;
