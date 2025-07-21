import { Model, DataTypes, Sequelize } from 'sequelize';

export class MarkForDeleteEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof MarkForDeleteEntity {
        return MarkForDeleteEntity.init({
            markForDeleteId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "markfordeleteid"
            },
            objectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "objectid"
            },
            objectType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "objecttype"
            },
            submittedBy: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "submittedby"
            },
            submittedDate: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "submitteddate"
            },
            startedDate: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: true,
                field: "starteddate"
            },
            completedDate: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: true,
                field: "completeddate"
            }
        }, {
            sequelize,
            tableName: "mark_for_delete",
            modelName: "markForDelete",
            timestamps: false
        })
    }

}