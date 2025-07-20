import { DeletionStatus, MarkForDelete } from "@/graphql/generated/graphql-types";


abstract class MarkForDeleteDao {

    abstract markForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete>;

    abstract getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null>;

    abstract updateMarkForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete>;

    abstract deleteCompletedRecords(): Promise<void>;

    abstract resetStalledJobs(): Promise<void>;

    abstract getLatestMarkForDeleteRecords(limit: number): Promise<Array<MarkForDelete>>;

    abstract getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>>;

    abstract startStep(markForDeleteId: string, step: string): Promise<void>;

    abstract completeStep(markForDeleteId: string, step: string): Promise<void>;

}

export default MarkForDeleteDao;