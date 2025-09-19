import { Model, DataTypes, Sequelize } from "@sequelize/core";

class ChangeEventEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ChangeEventEntity {
        return ChangeEventEntity.init({
            changeEventId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "changeeventid"
            },
            objectId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "objectid"
            },
            changeEventClass: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				columnName: "changeeventclass"
            },
            changeEventType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "changeeventtype"
            },
            changeTimestamp: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "changetimestamp"
            },
            changedBy: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "changedby"
            },
            data: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: false,
                columnName: "data",
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