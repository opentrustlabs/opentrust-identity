import { Model, DataTypes, Sequelize } from "@sequelize/core";

export class MarkForDeleteEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof MarkForDeleteEntity {
        return MarkForDeleteEntity.init({
            markForDeleteId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "markfordeleteid"
            },
            objectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "objectid"
            },
            objectType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "objecttype"
            },
            submittedBy: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "submittedby"
            },
            submittedDate: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "submitteddate"
            },
            startedDate: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: true,
                columnName: "starteddate"
            },
            completedDate: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: true,
                columnName: "completeddate"
            }
        }, {
            sequelize,
            tableName: "mark_for_delete",
            modelName: "markForDelete",
            timestamps: false
        })
    }

}