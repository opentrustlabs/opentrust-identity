import { EntitySchema } from 'typeorm';


export interface UserAuthenticationHistory {
    userId: string,
    lastAuthenticationAtMs: number
}

const UserAuthenticationHistoryEntity = new EntitySchema({


    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        lastAuthenticationAtMs: {
            type: "bigint",
            primary: true,
            name: "lastauthenticationatms"
        }
    },

    tableName: "user_authentication_history",
    name: "userAuthenticationHistory",

});



export default UserAuthenticationHistoryEntity;
