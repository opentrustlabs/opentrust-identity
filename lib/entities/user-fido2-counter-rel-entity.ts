import { EntitySchema } from 'typeorm';

export interface UserFido2CounterRel {
    userId: string,
    fido2Counter: number
}

const UserFido2CounterRelEntity = new EntitySchema({


    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        fido2Counter: {
            type: "int",
            primary: true,
            name: "fido2Counter"
        }
    },

    tableName: "user_fido2_counter_rel",
    name: "userFido2CountrerRel",

});


export default UserFido2CounterRelEntity;


