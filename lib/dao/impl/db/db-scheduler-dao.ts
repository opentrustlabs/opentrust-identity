import { SchedulerLock } from "@/graphql/generated/graphql-types";
import SchedulerDao from "../../scheduler-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";
import SchedulerLockEntity from "@/lib/entities/scheduler-lock-entity";

class DBSchedulerDao extends SchedulerDao {

    public async getSchedulerLocksByName(lockName: string): Promise<Array<SchedulerLock>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<SchedulerLockEntity> = await sequelize.models.schedulerLock.findAll({
            where: {
                lockName: lockName
            },
            order: ["lockStartTimeMS"],
            raw: true
        });
        return arr as any as Array<SchedulerLock>;
    }

    public async getSchedulerLockByInstanceId(lockInstanceId: string): Promise<SchedulerLock | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const e: SchedulerLockEntity | null = await sequelize.models.schedulerLock.findOne({
            where: {
                lockInstanceId: lockInstanceId
            },
            raw: true
        });
        return e as any as SchedulerLock;
    }

    public async createSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.schedulerLock.create(lock);
        return lock;
    }

    public async updateSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.schedulerLock.update(lock, {
            where: {
                lockInstanceId: lock.lockInstanceId,
                lockName: lock.lockName
            }
        });
        return lock;
    }

    public async deleteSchedulerLock(lockInstanceId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.schedulerLock.destroy({
            where: {
                lockInstanceId: lockInstanceId
            }
        });
        return Promise.resolve();
    }

    public async deleteExpiredData(): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.schedulerLock.destroy({
            where: {
                lockExpiresAtMS: {
                    [Op.lt]: Date.now()
                }
            }
        });
    }
    
}

export default DBSchedulerDao;