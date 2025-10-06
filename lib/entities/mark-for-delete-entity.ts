import { EntitySchema } from 'typeorm';

export const MarkForDeleteEntity = new EntitySchema({


    columns: {
        markForDeleteId: {
            type: String,
            primary: true,
            name: "markfordeleteid"
        },
        objectId: {
            type: String,
            primary: false,
            nullable: false,
            name: "objectid"
        },
        objectType: {
            type: String,
            primary: false,
            nullable: false,
            name: "objecttype"
        },
        submittedBy: {
            type: String,
            primary: false,
            nullable: false,
            name: "submittedby"
        },
        submittedDate: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "submitteddate"
        },
        startedDate: {
            type: "bigint",
            primary: false,
            nullable: true,
            name: "starteddate"
        },
        completedDate: {
            type: "bigint",
            primary: false,
            nullable: true,
            name: "completeddate"
        }
    },
    tableName: "mark_for_delete",
    name: "markForDelete",

});

export default MarkForDeleteEntity;