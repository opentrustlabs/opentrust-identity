import { SchedulerLock } from "@/graphql/generated/graphql-types";
import SchedulerDao from "../../scheduler-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { LessThan } from "typeorm";

class DBSchedulerDao extends SchedulerDao {

    public async getSchedulerLocks(limit: number): Promise<Array<SchedulerLock>>{
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        const arr = await schedulerRepo.find({
            order: {
                lockStartTimeMS: "ASC"
            },
            take: limit
        });
        return arr;
    }

    public async getSchedulerLocksByName(lockName: string): Promise<Array<SchedulerLock>> {
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        const arr = await schedulerRepo.find({
            where: {
                lockName: lockName
            },
            order: {
                lockStartTimeMS: "ASC"
            }
        });
        return arr;
    }

    public async getSchedulerLockByInstanceId(lockInstanceId: string): Promise<SchedulerLock | null>{
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        const result = await schedulerRepo.findOne({
            where: {
                lockInstanceId: lockInstanceId
            }
        });
        return result;
    }

    public async createSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        await schedulerRepo.insert(lock);
        return lock;
    }

    public async updateSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        await schedulerRepo.update(
            {
                lockInstanceId: lock.lockInstanceId,
                lockName: lock.lockName
            },
            lock
        );
        return lock;
    }

    public async deleteSchedulerLock(lockInstanceId: string): Promise<void> {
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        await schedulerRepo.delete({
            lockInstanceId: lockInstanceId
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void> {
        const schedulerRepo = await RDBDriver.getInstance().getSchedulerLockRepository();
        await schedulerRepo.delete({
            lockExpiresAtMS: LessThan(Date.now())
        });
    }
    
}

export default DBSchedulerDao;