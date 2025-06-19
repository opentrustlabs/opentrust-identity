import { Model, DataTypes, Sequelize } from 'sequelize';
export class LoginFailurePolicyEntity extends Model {

    static initModel(sequelize: Sequelize): typeof LoginFailurePolicyEntity {
        return LoginFailurePolicyEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            loginFailurePolicyType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "loginfailurepolicytype"
            },
            failureThreshold: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "failurethreshold"
            },
            pauseDurationMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "pausedurationminutes"
            },
            numberOfPauseCyclesBeforeLocking: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "numberofpausecyclesbeforelocking"
            },
            initBackoffDurationMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "initbackoffdurationminutes"
            },
            numberOfBackoffCyclesBeforeLocking: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "numberofbackoffcyclesbeforelocking"
            }
        }, {
            sequelize,
            tableName: "login_failure_policy",
            modelName: "loginFailurePolicy",
            timestamps: false
        })
    }
}

