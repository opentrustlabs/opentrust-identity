import { SchedulerLock } from "@/graphql/generated/graphql-types";


abstract class SchedulerDao {

    abstract getSchedulerLocksByName(lockName: string): Promise<Array<SchedulerLock>>;

    abstract getSchedulerLockByInstanceId(lockInstanceId: string): Promise<SchedulerLock | null>;

    abstract createSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock>;

    abstract updateSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock>;

    abstract deleteSchedulerLock(lockInstanceId: string): Promise<void>;

    abstract deleteExpiredData(): Promise<void>;

}

export default SchedulerDao;