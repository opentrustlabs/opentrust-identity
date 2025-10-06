import { EntitySchema } from 'typeorm';

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
            type: "bigint",
            primary: false,
            nullable: false,
            name: "lockstarttimems"
        },
        lockExpiresAtMS: {
            type: "bigint",
            primary: false,
            nullable: false,
            name: "lockexpiresatms"
        }
    },
    tableName: "scheduler_lock",
    name: "schedulerLock",

});

export default SchedulerLockEntity;
