import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantAvailableScopeEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantAvailableScopeEntity {
        return TenantAvailableScopeEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "scopeid"
            },
            accessRuleId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "accessruleid"
            }
        }, 
		{
            sequelize,
            tableName: "tenant_available_scope",
            modelName: "tenantAvailableScope",
            timestamps: false
        });
    }
}

export default TenantAvailableScopeEntity;