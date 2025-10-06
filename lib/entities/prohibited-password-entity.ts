import { EntitySchema } from 'typeorm';


export interface ProhibitedPassword {
    password: string
}

const ProhibitedPasswordEntity = new EntitySchema({


    columns: {
        password: {
            type: String,
            primary: true,
            name: "password"
        }
    },

    tableName: "prohibited_passwords",
    name: "prohibitedPasswords",

});

export default ProhibitedPasswordEntity;
