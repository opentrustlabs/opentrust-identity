import { Model, DataTypes, Sequelize } from "@sequelize/core";

export class SchedulerLockEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SchedulerLockEntity {
        return SchedulerLockEntity.init({
            lockName: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "lockname"
            },
            lockInstanceId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "lockinstanceid"
            },
            lockStartTimeMS: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "lockstarttimems"
            },
            lockExpiresAtMS: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "lockexpiresatms"
            }
        }, {
            sequelize,
            tableName: "scheduler_lock",
            modelName: "schedulerLock",
            timestamps: false
        })
    }
}

export default SchedulerLockEntity;