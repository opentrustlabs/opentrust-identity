import { EntitySchema } from 'typeorm';


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
            type: "int",
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
            type: "bigint",
            primary: false,
            nullable: false,
            name: "expiresatms"
        },
        isPrimaryEmail: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "isprimaryemail"
        }
    },

    tableName: "user_profile_email_change_state",
    name: "userProfileEmailChangeState",

});



export default UserProfileChangeEmailStateEntity;
