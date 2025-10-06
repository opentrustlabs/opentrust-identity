import { EntitySchema } from 'typeorm';

export const DeletionStatusEntity = new EntitySchema({


    columns: {
        markForDeleteId: {
            type: String,
            primary: true,
            name: "markfordeleteid"
        },
        step: {
            type: String,
            primary: true,
            nullable: false,
            name: "step"
        },
        startedAt: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "startedat"
        },
        completedAt: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "completedat"
        }
    },
    tableName: "deletion_status",
    name: "deletionStatus",

});

export default DeletionStatusEntity;
