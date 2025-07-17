import { Model, DataTypes, Sequelize } from 'sequelize';

export class DeletionStatusEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof DeletionStatusEntity {
        return DeletionStatusEntity.init({
            markForDeleteId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "markfordeleteid"
            },
            step: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                field: "step"
            },
            startedAt: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "startedat"
            },
            completedAt: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "completedat"
            }
        }, {
            sequelize,
            tableName: "deletion_status",
            modelName: "deletionStatus",
            timestamps: false
        })
    }
}