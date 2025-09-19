import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantManagementDomainRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantManagementDomainRelEntity {
        return TenantManagementDomainRelEntity.init(
            {
                tenantId: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    columnName: "tenantid"
                },
                domain: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    columnName: "domain"
                }
            },
            {
                sequelize: sequelize,
                tableName: "tenant_management_domain_rel",
                modelName: "tenantManagementDomainRel",
                timestamps: false
            }
        );
    }
}

export default TenantManagementDomainRelEntity;