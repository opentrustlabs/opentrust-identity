import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver, getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const UserProfileChangeEmailStateEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        changeEmailSessionToken: {
            type: String,
            primary: true,
            name: "changeemailsessiontoken"
        },
        emailChangeState: {
            type: String,
            primary: true,
            name: "emailchangestate"
        },
        email: {
            type: String,
            primary: false,
            nullable: false,
            name: "email"
        },
        changeOrder: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "changeorder"
        },
        changeStateStatus: {
            type: String,
            primary: false,
            nullable: false,
            name: "changestatestatus"
        },
        expiresAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        isPrimaryEmail: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "isprimaryemail",
            transformer: BooleanTransformer
        }
    },

    tableName: "user_profile_email_change_state",
    name: "userProfileEmailChangeState",

});



export default UserProfileChangeEmailStateEntity;
