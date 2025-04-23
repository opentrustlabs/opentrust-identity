import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantManagementDomainRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantManagementDomainRelEntity {
        return TenantManagementDomainRelEntity.init(
            {
                tenantId: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    field: "tenantid"
                },
                domain: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    field: "domain"
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