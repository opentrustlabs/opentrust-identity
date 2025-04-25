import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantAvailableScopeEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantAvailableScopeEntity {
        return TenantAvailableScopeEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "scopeid"
            },
            accessRuleId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "accessruleid"
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