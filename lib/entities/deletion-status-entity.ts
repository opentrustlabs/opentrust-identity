import { Model, DataTypes, Sequelize } from "@sequelize/core";

export class DeletionStatusEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof DeletionStatusEntity {
        return DeletionStatusEntity.init({
            markForDeleteId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "markfordeleteid"
            },
            step: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                columnName: "step"
            },
            startedAt: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "startedat"
            },
            completedAt: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "completedat"
            }
        }, {
            sequelize,
            tableName: "deletion_status",
            modelName: "deletionStatus",
            timestamps: false
        })
    }
}