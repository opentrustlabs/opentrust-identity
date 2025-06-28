import { Model, DataTypes, Sequelize } from 'sequelize';


class TenantLoginFailurePolicyEntity extends Model {

    static initModel(sequelize: Sequelize): typeof TenantLoginFailurePolicyEntity {
        return TenantLoginFailurePolicyEntity.init({
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
            maximumLoginFailures: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "maximumloginfailures"
            }
        }, {
            sequelize,
            tableName: "tenant_login_failure_policy",
            modelName: "tenantLoginFailurePolicy",
            timestamps: false
        })
    }
}

export default TenantLoginFailurePolicyEntity;