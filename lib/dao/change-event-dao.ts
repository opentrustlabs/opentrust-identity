import { ChangeEvent } from "@/graphql/generated/graphql-types";


abstract class ChangeEventDao {

    abstract getChangeEventHistory(objectId: string): Promise<Array<ChangeEvent>>;

}

export default ChangeEventDao;