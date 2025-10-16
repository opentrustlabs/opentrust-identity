import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "submitteddate"
        },
        startedDate: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "starteddate"
        },
        completedDate: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "completeddate"
        }
    },
    tableName: "mark_for_delete",
    name: "markForDelete",

});

export default MarkForDeleteEntity;