import { EntitySchema } from 'typeorm';

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
            type: "boolean",
            primary: false,
            nullable: false,
            name: "emailverified"
        }
    },

    tableName: "user_email_recovery",
    name: "userEmailRecovery",

});



export default UserEmailRecoveryEntity;
