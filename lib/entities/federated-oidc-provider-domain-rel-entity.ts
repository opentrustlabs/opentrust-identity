import { Model, DataTypes, Sequelize } from "@sequelize/core";

class FederatedOIDCProviderDomainRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCProviderDomainRelEntity {
        return FederatedOIDCProviderDomainRelEntity.init({
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "federatedoidcproviderid"
            },
            domain: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "domain"
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