import { SchedulerLock } from "@/graphql/generated/graphql-types";
import SchedulerDao from "../../scheduler-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";
import SchedulerLockEntity from "@/lib/entities/scheduler-lock-entity";

class DBSchedulerDao extends SchedulerDao {

    public async getSchedulerLocks(limit: number): Promise<Array<SchedulerLock>>{
        
        const arr: Array<SchedulerLockEntity> = await (await DBDriver.getInstance().getSchedulerLockEntity()).findAll({            
            order: ["lockStartTimeMS"],
            limit: limit
        });
        return arr.map((entity: SchedulerLockEntity) => entity.dataValues);
    }

    public async getSchedulerLocksByName(lockName: string): Promise<Array<SchedulerLock>> {
        
        const arr: Array<SchedulerLockEntity> = await (await DBDriver.getInstance().getSchedulerLockEntity()).findAll({
            where: {
                lockName: lockName
            },
            order: ["lockStartTimeMS"]
        });
        return arr.map((entity: SchedulerLockEntity) => entity.dataValues);
    }

    public async getSchedulerLockByInstanceId(lockInstanceId: string): Promise<SchedulerLock | null>{
        
        const e: SchedulerLockEntity | null = await (await DBDriver.getInstance().getSchedulerLockEntity()).findOne({
            where: {
                lockInstanceId: lockInstanceId
            }
        });
        return e ? e.dataValues as SchedulerLock : null;
    }

    public async createSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        
        await (await DBDriver.getInstance().getSchedulerLockEntity()).create(lock);
        return lock;
    }

    public async updateSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        
        await (await DBDriver.getInstance().getSchedulerLockEntity()).update(lock, {
            where: {
                lockInstanceId: lock.lockInstanceId,
                lockName: lock.lockName
            }
        });
        return lock;
    }

    public async deleteSchedulerLock(lockInstanceId: string): Promise<void> {

        await (await DBDriver.getInstance().getSchedulerLockEntity()).destroy({
            where: {
                lockInstanceId: lockInstanceId
            }
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void> {

        await (await DBDriver.getInstance().getSchedulerLockEntity()).destroy({
            where: {
                lockExpiresAtMS: {
                    [Op.lt]: Date.now()
                }
            }
        });
    }
    
}

export default DBSchedulerDao;