import { Model, DataTypes, Sequelize } from 'sequelize';

class FederatedOIDCProviderDomainRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCProviderDomainRelEntity {
        return FederatedOIDCProviderDomainRelEntity.init({
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "federatedoidcproviderid"
            },
            domain: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "domain"
            }
        }, 
		{
            sequelize,
            tableName: "federated_oidc_provider_domain_rel",
            modelName: "federatedOidcProviderDomainRel",
            timestamps: false
        });
    }
}



export default FederatedOIDCProviderDomainRelEntity;