import { Model, DataTypes, Sequelize } from 'sequelize';

class ChangeEventEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ChangeEventEntity {
        return ChangeEventEntity.init({
            changeEventId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "changeeventid"
            },
            objectid: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "objectid"
            },
            objecttype: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "objecttype"
            },
            changeEventClass: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				field: "changeeventclass"
            },
            changeEventClassId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				field: "changeeventclassid"
            },
            changeEventType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "changeeventtype"
            },
            changeEventTypeId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "changeeventtypeid"
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