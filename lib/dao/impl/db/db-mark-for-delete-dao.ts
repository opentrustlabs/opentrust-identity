import { MarkForDelete, DeletionStatus } from "@/graphql/generated/graphql-types";
import MarkForDeleteDao from "../../mark-for-delete-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { And, IsNull, LessThan, Not } from "typeorm";

class DBMarkForDeleteDao extends MarkForDeleteDao {

    public async markForDelete(markForDelete: MarkForDelete): Promise<MarkForDelete> {
        const markForDeleteRepo = await RDBDriver.getInstance().getMarkForDeleteRepository();
        await markForDeleteRepo.insert(markForDelete);
        return Promise.resolve(markForDelete);
    }

    public async getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null> {
        const markForDeleteRepo = await RDBDriver.getInstance().getMarkForDeleteRepository();
        const result = await markForDeleteRepo.findOne({
            where: {
                markForDeleteId: markForDeleteId
            }
        });
        return result;
    }

    public async updateMarkForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete>{
        const markForDeleteRepo = await RDBDriver.getInstance().getMarkForDeleteRepository();
        await markForDeleteRepo.update(
            {
                markForDeleteId: deleteInput.markForDeleteId
            },
            deleteInput
        );        
        return deleteInput;
    }
    
    public async getLatestMarkForDeleteRecords(limit: number): Promise<Array<MarkForDelete>>{
        const markForDeleteRepo = await RDBDriver.getInstance().getMarkForDeleteRepository();
        const arr = await markForDeleteRepo.find({
            take: limit,
            order: {
                submittedDate: "ASC"
            }
        });
        return arr;
    }

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {

        const deletionStatusRepo = await RDBDriver.getInstance().getDeletionStatusRepository();
        const arr = await deletionStatusRepo.find({
            where: {
                markForDeleteId: markForDeleteId
            }
        });
        return arr;
    }

    public async deleteCompletedRecords(): Promise<void> {
        const markForDeleteRepo = await RDBDriver.getInstance().getMarkForDeleteRepository();
        await markForDeleteRepo.delete({
            completedDate: Not(IsNull())
        });
        return Promise.resolve();
    }

    /**
     * Any job which has started but not completed within 24 hours can be considered 
     * "stalled" (or "failed") and should be restarted on the next round of delete
     * operations by setting the started date back to null.
     */
    public async resetStalledJobs(): Promise<void> {
        const markForDeleteRepo = await RDBDriver.getInstance().getMarkForDeleteRepository();
        const stalledJobs: Array<MarkForDelete> = await markForDeleteRepo.find({
            where: {
                startedDate: And(Not(IsNull()), LessThan(Date.now() - (24 * 60 * 60 * 1000))),
                completedDate: IsNull()
            }
        });
        for(let i = 0; i < stalledJobs.length; i++){
            stalledJobs[i].startedDate = null;
            await markForDeleteRepo.update(
                {
                    markForDeleteId: stalledJobs[i].markForDeleteId
                },
                stalledJobs[i]
            );
        }
        return Promise.resolve();
    }

    public async startStep(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async completeStep(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBMarkForDeleteDao;