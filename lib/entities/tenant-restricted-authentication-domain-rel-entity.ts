import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantRestrictedAuthenticationDomainRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantRestrictedAuthenticationDomainRelEntity {
        return TenantRestrictedAuthenticationDomainRelEntity.init({
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
            sequelize,
            tableName: "tenant_restricted_authentication_domain_rel",
            modelName: "tenantRestrictedAuthenticationDomainRel",
            timestamps: false
        });
    }
}


export default TenantRestrictedAuthenticationDomainRelEntity;