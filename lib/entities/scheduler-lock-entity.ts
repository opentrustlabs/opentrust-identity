import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

export const SchedulerLockEntity = new EntitySchema({
    columns: {
        lockName: {
            type: String,
            primary: true,
            name: "lockname"
        },
        lockInstanceId: {
            type: String,
            primary: true,
            name: "lockinstanceid"
        },
        lockStartTimeMS: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "lockstarttimems"
        },
        lockExpiresAtMS: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "lockexpiresatms"
        }
    },
    tableName: "scheduler_lock",
    name: "schedulerLock",

});

export default SchedulerLockEntity;
