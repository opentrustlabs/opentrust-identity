import { Model, DataTypes, Sequelize } from 'sequelize';

class ChangeEventEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ChangeEventEntity {
        return ChangeEventEntity.init({
            changeEventId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "changeeventid"
            },
            objectId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "objectid"
            },
            changeEventClass: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				field: "changeeventclass"
            },
            changeEventType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "changeeventtype"
            },
            changeTimestamp: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "changetimestamp"
            },
            changedBy: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "changedby"
            },
            data: {
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: false,
                field: "data"
            }
        }, 
		{
            sequelize,
            tableName: "change_event",
            modelName: "changeEvent",
            timestamps: false
        });
    }
}


export default ChangeEventEntity;