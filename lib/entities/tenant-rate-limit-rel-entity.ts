import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantRateLimitRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantRateLimitRelEntity {
        return TenantRateLimitRelEntity.init({
            servicegroupid: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "servicegroupid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            allowUnlimitedRate: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                field: "allowunlimitedrate"
            },
            rateLimit: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
				field: "ratelimit"
            },
            rateLimitPeriodMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "ratelimitperiodminutes"
            }
        }, 
		{
            sequelize,
            tableName: "tenant_rate_limit_rel",
            modelName: "tenantRateLimitRel",
            timestamps: false
        });
    }
}

export default TenantRateLimitRelEntity