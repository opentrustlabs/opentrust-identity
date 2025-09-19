import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantRateLimitRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantRateLimitRelEntity {
        return TenantRateLimitRelEntity.init({
            servicegroupid: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "servicegroupid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            allowUnlimitedRate: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                columnName: "allowunlimitedrate"
            },
            rateLimit: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
				columnName: "ratelimit"
            },
            rateLimitPeriodMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "ratelimitperiodminutes"
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