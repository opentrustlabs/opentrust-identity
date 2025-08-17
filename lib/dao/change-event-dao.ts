import { ChangeEvent } from "@/graphql/generated/graphql-types";


abstract class ChangeEventDao {

    abstract getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>>;

    abstract addChangeEvent(changeEvent: ChangeEvent): Promise<ChangeEvent>;

    abstract deleteExpiredData(): Promise<void>;

}

export default ChangeEventDao;