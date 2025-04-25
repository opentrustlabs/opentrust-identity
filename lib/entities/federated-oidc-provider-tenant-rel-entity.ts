import { Model, DataTypes, Sequelize } from 'sequelize';

class FederatedOIDCProviderTenantRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCProviderTenantRelEntity {
        return FederatedOIDCProviderTenantRelEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "federatedoidcproviderid"
            }
        }, 
		{
            sequelize,
            tableName: "federated_oidc_provider_tenant_rel",
            modelName: "federatedOidcProviderTenantRel",
            timestamps: false
        });
    }
}



export default FederatedOIDCProviderTenantRelEntity;