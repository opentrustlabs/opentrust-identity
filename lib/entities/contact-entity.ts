import { EntitySchema } from 'typeorm';

const ContactEntity = new EntitySchema({


    columns: {
        contactid: {
            type: String,
            primary: true,
            name: "contactid"
        },
        objectid: {
            type: String,
            primary: false,
            name: "objectid",
            nullable: false
        },
        objecttype: {
            type: String,
            primary: false,
            name: "objecttype",
            nullable: false
        },
        email: {
            type: String,
            primary: false,
            name: "email",
            nullable: false
        },
        name: {
            type: String,
            primary: false,
            name: "contactname",
            nullable: true
        },
        userid: {
            type: String,
            primary: false,
            name: "userid",
            nullable: true
        }
    },
    tableName: "contact",
    name: "contact",
});

export default ContactEntity;
