import { EntitySchema } from 'typeorm';
import { getBlobTypeForDriver, stringToBlobTransformer } from '@/utils/dao-utils';

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
        changeEventconst: {
            type: String,
            primary: false,
            nullable: false,
            name: "changeeventconst"
        },
        changeEventType: {
            type: String,
            primary: false,
            nullable: false,
            name: "changeeventtype"
        },
        changeTimestamp: {
            type: "bigint",
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
            name: "accessruledefinition",
            transformer: stringToBlobTransformer()
        }
    }
});


export default ChangeEventEntity;
