import type { SchedulerLock } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "scheduler_lock"
})
class SchedulerLockEntity implements SchedulerLock {

    constructor(schedulerLock?: SchedulerLock){
        if(schedulerLock){
            Object.assign(this, schedulerLock)
        }
    }

    __typename?: "SchedulerLock";
    
    @PrimaryKey({fieldName: "localname"})
    lockName: string;

    @PrimaryKey({fieldName: "lockinstanceid"})
    lockInstanceId: string;
    
    @Property({fieldName: "lockstarttimems"})
    lockStartTimeMS: number;

    @Property({fieldName: "lockexpiresatms"})
    lockExpiresAtMS: number;
    
    

}

export default SchedulerLockEntity;