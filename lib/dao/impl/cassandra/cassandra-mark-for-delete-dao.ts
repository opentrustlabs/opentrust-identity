import { MarkForDelete, DeletionStatus } from "@/graphql/generated/graphql-types";
import MarkForDeleteDao from "../../mark-for-delete-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";


class CassandraMarkForDeleteDao extends MarkForDeleteDao {

    public async markForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("mark_for_delete");
        await mapper.insert(deleteInput);
        return deleteInput;
    }

    public async getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("mark_for_delete");
        return mapper.get({
            markForDeleteId: markForDeleteId
        });
    }

    public async updateMarkForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("mark_for_delete");
        await mapper.update(deleteInput);
        return deleteInput;
    }

    public async deleteCompletedRecords(): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("mark_for_delete");
        const results: Array<MarkForDelete> = (await mapper.findAll()).toArray();
        for(let i = 0; i < results.length; i++){
            const m: MarkForDelete = results[i];
            if(! (m.completedDate === null || m.completedDate === undefined) ){
                mapper.remove({
                    markForDeleteId: m.markForDeleteId
                });
            }
        }
    }

    public async resetStalledJobs(): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("mark_for_delete");
        const results: Array<MarkForDelete> = (await mapper.findAll()).toArray();
        for(let i = 0; i < results.length; i++){
            const m: MarkForDelete = results[i];
            if(
                (m.completedDate === null || m.completedDate === undefined) &&
                (m.startedDate && m.startedDate < (Date.now() - 24 * 60 * 60 * 1000))
            ){
                m.startedDate = null;
                await mapper.update(m);
            }
        }
        return;
    }
    
    public async getLatestMarkForDeleteRecords(limit: number): Promise<Array<MarkForDelete>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("mark_for_delete");
        const results: Array<MarkForDelete> = (await mapper.findAll()).toArray();

        return results
            .sort(
                (a: MarkForDelete, b: MarkForDelete) => a.submittedDate - b.submittedDate
            )
            .slice(0, limit);
    }

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("deletion_status");
        return mapper.get({markForDeleteId: markForDeleteId});
    }

    public async startStep(markForDeleteId: string, step: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async completeStep(markForDeleteId: string, step: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default CassandraMarkForDeleteDao;