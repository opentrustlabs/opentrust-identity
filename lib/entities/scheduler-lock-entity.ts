import type { SchedulerLock } from "@/graphql/generated/graphql-types";

// @Entity({
//     tableName: "scheduler_lock"
// })
class SchedulerLockEntity implements SchedulerLock {

    constructor(schedulerLock?: SchedulerLock){
        if(schedulerLock){
            Object.assign(this, schedulerLock)
        }
    }

    __typename?: "SchedulerLock";
    
    lockName: string;

    lockInstanceId: string;
    
    lockStartTimeMS: number;

    lockExpiresAtMS: number;
    
    

}

export default SchedulerLockEntity;