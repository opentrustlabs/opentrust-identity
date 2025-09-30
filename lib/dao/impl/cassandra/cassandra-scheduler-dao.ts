import { SchedulerLock } from "@/graphql/generated/graphql-types";
import SchedulerDao from "../../scheduler-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { types } from "cassandra-driver";

class CassandraSchedulerDao extends SchedulerDao {

    public async getSchedulerLocks(limit: number): Promise<Array<SchedulerLock>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scheduler_lock");
        const results = await mapper.findAll({limit: limit});
        return results.toArray();
    }

    public async getSchedulerLocksByName(lockName: string): Promise<Array<SchedulerLock>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scheduler_lock");
        const results = await mapper.find({
            lockName: lockName
        });
        return results.toArray();
    }

    public async getSchedulerLockByInstanceId(lockInstanceId: string): Promise<SchedulerLock | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scheduler_lock");
        const results = await mapper.find({
            lockInstanceId: lockInstanceId
        });
        const arr = results.toArray();
        if(arr && arr.length > 0){
            return arr[0];
        }
        return null;
    }

    public async createSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        const ttlSeconds = Math.floor( (lock.lockExpiresAtMS - Date.now()) / 1000);
        const mapper = await CassandraDriver.getInstance().getModelMapper("scheduler_lock");
        await mapper.insert(lock, {ttl: ttlSeconds});
        return lock;
    }

    public async updateSchedulerLock(lock: SchedulerLock): Promise<SchedulerLock> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scheduler_lock");
        const ttlSeconds = Math.floor( (lock.lockExpiresAtMS - Date.now()) / 1000);
        await mapper.update(lock, {ttl: ttlSeconds});
        return lock
    }

    public async deleteSchedulerLock(lockInstanceId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("scheduler_lock");
        const lock: SchedulerLock | null = await this.getSchedulerLockByInstanceId(lockInstanceId);
        if(lock){
            const id = types.Uuid.fromString(lockInstanceId);
            await mapper.remove({
                lockName: lock.lockName,
                lockInstanceId: id
            });
        }
        return;

    }

    public async deleteExpiredData(): Promise<void> {
        // NO OP
        // All of the data is inserted and updated with a TTL
    }
    
}

export default CassandraSchedulerDao;