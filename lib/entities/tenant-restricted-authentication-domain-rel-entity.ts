import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantRestrictedAuthenticationDomainRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantRestrictedAuthenticationDomainRelEntity {
        return TenantRestrictedAuthenticationDomainRelEntity.init({
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
            sequelize,
            tableName: "tenant_restricted_authentication_domain_rel",
            modelName: "tenantRestrictedAuthenticationDomainRel",
            timestamps: false
        });
    }
}


export default TenantRestrictedAuthenticationDomainRelEntity;