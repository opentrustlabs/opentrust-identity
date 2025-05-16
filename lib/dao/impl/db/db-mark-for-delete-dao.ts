import { MarkForDelete, DeletionStatus } from "@/graphql/generated/graphql-types";
import MarkForDeleteDao from "../../mark-for-delete-dao";
import { Sequelize } from "sequelize";
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

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr = await sequelize.models.deletionStatus.findAll({
            where: {
                markForDeleteId: markForDeleteId
            }
        });
        return Promise.resolve(arr as any as Array<DeletionStatus>);
    }

    public async startStep(markForDeleteId: string, step: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async completeStep(markForDeleteId: string, step: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBMarkForDeleteDao;