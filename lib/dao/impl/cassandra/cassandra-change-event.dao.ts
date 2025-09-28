import { ChangeEvent, SystemSettings } from "@/graphql/generated/graphql-types";
import ChangeEventDao from "../../change-event-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS } from "@/utils/consts";


class CassandraChangeEventDao extends ChangeEventDao {

    public async getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("change_event");
        const results = (await mapper.find({objectId: objectId})).toArray();
        return results;
    }

    public async addChangeEvent(changeEvent: ChangeEvent): Promise<ChangeEvent> {
        // 1.   Get the TTL from the system-settings table
        // 2.   Convert from day to seconds and insert
        const systemSettingsMapper = await CassandraDriver.getInstance().getModelMapper("system_settings");
        const results: Array<SystemSettings> = (await systemSettingsMapper.findAll()).toArray();
        let ttlSeconds = DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS * 24 * 60 * 60;
        if(results && results.length > 0 && results[0].auditRecordRetentionPeriodDays){
            ttlSeconds = results[0].auditRecordRetentionPeriodDays * 24 * 60 * 60;
        }
        
        const changeEventMapper = await CassandraDriver.getInstance().getModelMapper("change_event");
        await changeEventMapper.insert(changeEvent);
        return changeEvent;
    }

    public async deleteExpiredData(): Promise<void> {
        // NO OP
        // Since the data is inserted with a TTL it will expire automatically.
    }

}

export default CassandraChangeEventDao;