import { Model, DataTypes, Sequelize } from 'sequelize';

export class SchedulerLockEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SchedulerLockEntity {
        return SchedulerLockEntity.init({
            lockName: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "lockname"
            },
            lockInstanceId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "lockinstanceid"
            },
            lockStartTimeMS: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "lockstarttimems"
            },
            lockExpiresAtMS: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "lockexpiresatms"
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