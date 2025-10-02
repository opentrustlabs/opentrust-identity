import { Model, DataTypes, Sequelize } from "@sequelize/core";


class TenantLoginFailurePolicyEntity extends Model {

    static initModel(sequelize: Sequelize): typeof TenantLoginFailurePolicyEntity {
        return TenantLoginFailurePolicyEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            loginFailurePolicyType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "loginfailurepolicytype"
            },
            failureThreshold: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "failurethreshold"
            },
            pauseDurationMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "pausedurationminutes"
            },
            maximumLoginFailures: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "maximumloginfailures"
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