import { ChangeEvent, SystemSettings } from "@/graphql/generated/graphql-types";
import ChangeEventDao from "../../change-event-dao";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS } from "@/utils/consts";
import RDBDriver from "@/lib/data-sources/rdb";
import { In, LessThan } from "typeorm";

class DBChangeEventDao extends ChangeEventDao {

    public async getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>> {

        const changeEventRepo = await RDBDriver.getInstance().getChangeEventRepository();
        const results = await changeEventRepo.find({
            where: {
                objectId: objectId
            },
            order: {
                changeTimestamp: "DESC"
            }
        });
        return results;        
    }

    public async addChangeEvent(changeEvent: ChangeEvent): Promise<ChangeEvent>{
        const changeEventRepo = await RDBDriver.getInstance().getChangeEventRepository();
        await changeEventRepo.insert(changeEvent);
        return changeEvent;
    }

    public async deleteExpiredData(): Promise<void> {
        const systemSettingsRepo = await RDBDriver.getInstance().getSystemSettingsRepository();
        const arrSystemSettings: Array<SystemSettings> = await systemSettingsRepo.find();        
        let periodDays: number = DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS;
        if(arrSystemSettings !== null && arrSystemSettings.length > 0){
            const systemSettings: SystemSettings = arrSystemSettings[0];
            if(systemSettings.auditRecordRetentionPeriodDays){
                periodDays = systemSettings.auditRecordRetentionPeriodDays;
            }
        }

        
        // To delete the change records, retrieve 1000 at a time and delete with in clause
        const timestampMs: number = periodDays * 24 * 60 * 60 * 1000;
        const changeEventRepo = await RDBDriver.getInstance().getChangeEventRepository();
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<ChangeEvent> = await changeEventRepo.find({
                where: {
                    changeTimestamp: LessThan(timestampMs)
                },
                take: 1000
            });

            if(arr.length === 0){
                hasMoreRecords = false;
                break;
            }

            const ids = arr
                .map(
                    (v: ChangeEvent) => v.changeEventId
                );
            
            await changeEventRepo.delete({
                changeEventId: In(ids)
            });
        }
    }


}

export default DBChangeEventDao;