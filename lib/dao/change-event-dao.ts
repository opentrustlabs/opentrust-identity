import { ChangeEvent, ChangeEventData } from "@/graphql/generated/graphql-types";


abstract class ChangeEventDao {

    abstract getChangeEventHistory(objectId: string): Promise<{changeEvent: ChangeEvent, changeEventData: Array<ChangeEventData>}>;

}

export default ChangeEventDao;