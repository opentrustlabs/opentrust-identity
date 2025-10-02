import { MarkForDelete, DeletionStatus } from "@/graphql/generated/graphql-types";
import MarkForDeleteDao from "../../mark-for-delete-dao";
import { Op } from "@sequelize/core";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { MarkForDeleteEntity } from "@/lib/entities/mark-for-delete-entity";
import { DeletionStatusEntity } from "@/lib/entities/deletion-status-entity";


class DBMarkForDeleteDao extends MarkForDeleteDao {

    public async markForDelete(markForDelete: MarkForDelete): Promise<MarkForDelete> {
        
        await (await DBDriver.getInstance().getMarkForDeleteEntity()).create(markForDelete);
        return Promise.resolve(markForDelete);
    }

    public async getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null> {
        const entity: MarkForDeleteEntity | null = await (await DBDriver.getInstance().getMarkForDeleteEntity()).findByPk(markForDeleteId);
        if(entity){
            return Promise.resolve(entity.dataValues as MarkForDelete);
        }
        return Promise.resolve(null);
    }

    public async updateMarkForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete>{
        await (await DBDriver.getInstance().getMarkForDeleteEntity()).update(deleteInput, {
            where: {
                markForDeleteId: deleteInput.markForDeleteId
            }
        });
        return deleteInput;
    }
    
    public async getLatestMarkForDeleteRecords(limit: number): Promise<Array<MarkForDelete>>{
        const arr: Array<MarkForDeleteEntity> | null = await (await DBDriver.getInstance().getMarkForDeleteEntity()).findAll({
            limit: limit,
            order: ["submittedDate"]
        });
        return arr.map( (e) => e.dataValues);
    }

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {
        const arr: Array<DeletionStatusEntity> = await (await DBDriver.getInstance().getDeletionStatusEntity()).findAll({
            where: {
                markForDeleteId: markForDeleteId
            }
        });
        return arr.map((entity: DeletionStatusEntity) => entity.dataValues);        
    }

    public async deleteCompletedRecords(): Promise<void> {
        await (await DBDriver.getInstance().getMarkForDeleteEntity()).destroy({
            where: {
                completedDate: {
                    [Op.not]: null
                }
            }
        });
        return Promise.resolve();
    }

    /**
     * Any job which has started but not completed within 24 hours can be considered 
     * "stalled" (or "failed") and should be restarted on the next round of delete
     * operations by setting the started date back to null.
     */
    public async resetStalledJobs(): Promise<void> {
        const stalledJobs: Array<MarkForDeleteEntity> = await (await DBDriver.getInstance().getMarkForDeleteEntity()).findAll({
            where: {
                completedDate: null,
                startedDate: {
                    [Op.ne]: null,
                    [Op.lt]: Date.now() - (24 * 60 * 60 * 1000)
                }
            },
            limit: 200
        });
        for(let i = 0; i < stalledJobs.length; i++){
            stalledJobs[i].setDataValue("startedDate", null);
            stalledJobs[i].save()
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