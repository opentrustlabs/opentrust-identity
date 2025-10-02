import { ChangeEvent, SystemSettings } from "@/graphql/generated/graphql-types";
import ChangeEventDao from "../../change-event-dao";
import ChangeEventEntity from "@/lib/entities/change-event-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op } from "@sequelize/core";
import SystemSettingsEntity from "@/lib/entities/system-settings-entity";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS } from "@/utils/consts";

class DBChangeEventDao extends ChangeEventDao {

    public async getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>> {
        
        
        const entities: Array<ChangeEventEntity> = await (await DBDriver.getInstance().getChangeEventEntity()).findAll({
            where: {
                objectId: objectId
            },
            order: [
                ["changeTimestamp", "DESC"]
            ]
        });

        const models: Array<ChangeEvent> = entities.map(
            (entity: ChangeEventEntity) => this.entityToModel(entity)
        );
        
        return Promise.resolve(models);
    }

    public async addChangeEvent(changeEvent: ChangeEvent): Promise<ChangeEvent>{
        
        
        (await DBDriver.getInstance().getChangeEventEntity()).create({
            ...changeEvent,
            data: Buffer.from(changeEvent.data, "utf-8")
        });
        
        return changeEvent;
    }

    public async deleteExpiredData(): Promise<void> {

        const systemSettingsEntity: SystemSettingsEntity | null = await (await DBDriver.getInstance().getChangeEventEntity()).findOne();
        let periodDays: number = DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS;
        if(systemSettingsEntity !== null){
            const systemSettings: SystemSettings = systemSettingsEntity.dataValues;
            if(systemSettings.auditRecordRetentionPeriodDays){
                periodDays = systemSettings.auditRecordRetentionPeriodDays;
            }
        }

        const timestampMs: number = periodDays * 24 * 60 * 60 * 1000;

        // Sequelize does not support deletion in bulk with limits, so must do this manually...
        // To delete the change records, retrieve 1000 at a time and delete with in clause     
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<ChangeEventEntity> = await (await DBDriver.getInstance().getChangeEventEntity()).findAll({
                where: {
                    changeTimestamp: {
                        [Op.lt]: timestampMs
                    }
                },
                limit: 1000
            });
            
            if(arr.length === 0){
                hasMoreRecords = false;
                break;
            }
            
            const ids = arr
                .map(
                    (v: ChangeEventEntity) => v.getDataValue("changeEventId")
                );
            
            await (await DBDriver.getInstance().getChangeEventEntity()).destroy({
                where: {
                    changeEventId: {
                        [Op.in]: ids
                    }
                }
            });
        }
    }


    protected entityToModel(entity: ChangeEventEntity): ChangeEvent {
        const model: ChangeEvent = {
            changeEventClass: entity.getDataValue("changeEventClass"),
            changeEventId: entity.getDataValue("changeEventId"),
            changeEventType: entity.getDataValue("changeEventType"),
            changeTimestamp: entity.getDataValue("changeTimestamp"),
            changedBy: entity.getDataValue("changedBy"),
            data: Buffer.from(entity.getDataValue("data")).toString("utf-8"),
            objectId: entity.getDataValue("objectId"),
        }
        return model;
    }



}

export default DBChangeEventDao;