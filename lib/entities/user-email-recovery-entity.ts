import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export interface UserEmailRecovery {
    userId: string,
    email: string,
    emailVerified: boolean
}

const UserEmailRecoveryEntity = new EntitySchema({


    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        email: {
            type: String,
            primary: false,
            nullable: false,
            name: "email"
        },
        emailVerified: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "emailverified",
            transformer: BooleanTransformer
        }
    },

    tableName: "user_email_recovery",
    name: "userEmailRecovery",

});



export default UserEmailRecoveryEntity;
