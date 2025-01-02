import { ChangeEvent } from "@/graphql/generated/graphql-types";
import ChangeEventDao from "../../change-event-dao";
import connection  from "@/lib/data-sources/db";
import ChangeEventEntity from "@/lib/entities/change-event-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBChangeEventDao extends ChangeEventDao {

    public async getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>> {
        const em = connection.em.fork();        
        const entities: Array<ChangeEventEntity> | null = await em.find(ChangeEventEntity, {objectId: objectId}, {orderBy: {changeTimestamp: QueryOrder.DESC}});
        return Promise.resolve(entities.map(e => e.toModel()));
    }   

}

export default DBChangeEventDao;