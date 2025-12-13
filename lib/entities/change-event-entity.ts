import { EntitySchema } from 'typeorm';
import { getBlobTypeForDriver, stringToBlobTransformer, getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const blobType = getBlobTypeForDriver(RDB_DIALECT || "");

const ChangeEventEntity = new EntitySchema({

    tableName: "change_event",
    name: "changeEvent",
    columns: {
        changeEventId: {
            type: String,
            primary: true,
            name: "changeeventid"
        },
        objectId: {
            type: String,
            primary: true,
            name: "objectid"
        },
        changeEventClass: {
            type: String,
            primary: false,
            nullable: false,
            name: "changeeventclass"
        },
        changeEventType: {
            type: String,
            primary: false,
            nullable: false,
            name: "changeeventtype"
        },
        changeTimestamp: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "changetimestamp"
        },
        changedBy: {
            type: String,
            primary: false,
            nullable: false,
            name: "changedby"
        },
        data: {
            type: blobType,
            primary: false,
            nullable: false,
            name: "data",
            transformer: stringToBlobTransformer()
        }
    }
});


export default ChangeEventEntity;
