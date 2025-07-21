import { MarkForDelete, DeletionStatus } from "@/graphql/generated/graphql-types";
import MarkForDeleteDao from "../../mark-for-delete-dao";
import { Op, Sequelize } from "sequelize";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { MarkForDeleteEntity } from "@/lib/entities/mark-for-delete-entity";


class DBMarkForDeleteDao extends MarkForDeleteDao {

    public async markForDelete(markForDelete: MarkForDelete): Promise<MarkForDelete> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.markForDelete.create(markForDelete);
        return Promise.resolve(markForDelete);
    }

    public async getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: MarkForDeleteEntity | null = await sequelize.models.markForDelete.findByPk(markForDeleteId);
        if(entity){
            return Promise.resolve(entity as any as MarkForDelete);
        }
        return Promise.resolve(null);
    }

    public async updateMarkForDelete(deleteInput: MarkForDelete): Promise<MarkForDelete>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.markForDelete.update(deleteInput, {
            where: {
                markForDeleteId: deleteInput.markForDeleteId
            }
        });
        return deleteInput;
    }
    
    public async getLatestMarkForDeleteRecords(limit: number): Promise<Array<MarkForDelete>>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<MarkForDeleteEntity> | null = await sequelize.models.markForDelete.findAll({
            limit: limit,
            order: ["submittedDate"]
        });
        return arr.map( (e) => e.dataValues);
    }

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr = await sequelize.models.deletionStatus.findAll({
            where: {
                markForDeleteId: markForDeleteId
            }
        });
        return Promise.resolve(arr as any as Array<DeletionStatus>);
    }

    public async deleteCompletedRecords(): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.markForDelete.destroy({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        const stalledJobs: Array<MarkForDeleteEntity> = await sequelize.models.markForDelete.findAll({
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

    public async startStep(markForDeleteId: string, step: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async completeStep(markForDeleteId: string, step: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBMarkForDeleteDao;