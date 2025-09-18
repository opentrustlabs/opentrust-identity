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
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: false,
                field: "data",
                set(val: string | Buffer | null){
                    if(val === null || val === ""){
                        this.setDataValue("data", null);
                    }
                    else if(typeof val === "string"){
                        this.setDataValue("publdataicKey", Buffer.from(val, "utf-8"));
                    }
                    else{
                        this.setDataValue("data", val);
                    }
                }
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