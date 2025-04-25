import { ChangeEvent } from "@/graphql/generated/graphql-types";
import ChangeEventDao from "../../change-event-dao";
import ChangeEventEntity from "@/lib/entities/change-event-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Sequelize } from "sequelize";

class DBChangeEventDao extends ChangeEventDao {

    public async getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entities: Array<ChangeEventEntity> | null = await sequelize.models.changeEvent.findAll({
            where: {
                objectId: objectId
            },
            order: [
                ["changeTimestamp", "DESC"]
            ]
        });

        const models: Array<ChangeEvent> = entities.map(
            (entity: ChangeEventEntity) => {
                const model: ChangeEvent = {
                    changeEventClass: entity.getDataValue("changeEventClass"),
                    changeEventId: entity.getDataValue("changeEventId"),
                    changeEventType: entity.getDataValue("changeEventType"),
                    changeTimestamp: entity.getDataValue("changeTimestamp"),
                    changedById: entity.getDataValue("changedById"),
                    data: Buffer.from(entity.getDataValue("data")).toString("utf-8"),
                    keyId: entity.getDataValue("keyId"),
                    objectid: entity.getDataValue("objectid"),
                    objecttype: entity.getDataValue("objecttype"),
                    signature: Buffer.from(entity.getDataValue("signature")).toString("utf-8")
                }
                return model;
            }
        );
        
        return Promise.resolve(models);
    }   

}

export default DBChangeEventDao;