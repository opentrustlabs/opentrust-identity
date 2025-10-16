import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "startedat"
        },
        completedAt: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "completedat"
        }
    },
    tableName: "deletion_status",
    name: "deletionStatus",

});

export default DeletionStatusEntity;
