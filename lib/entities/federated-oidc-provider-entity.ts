import { Model, DataTypes, Sequelize } from 'sequelize';

class FederatedOIDCProviderEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCProviderEntity {
        return FederatedOIDCProviderEntity.init({
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "federatedoidcproviderid"
            },
            federatedOIDCProviderName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedoidcprovidername"
            },
            federatedOIDCProviderDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "federatedoidcproviderdescription"
            },
            federatedOIDCProviderTenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				field: "federatedoidcprovidertenantid"
            },
            federatedOIDCProviderClientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedoidcproviderclientid"
            },
            federatedOIDCProviderClientSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "federatedoidcproviderclientsecret"
            },
            federatedOIDCProviderWellKnownUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedoidcproviderwellknownuri"
            },
            refreshTokenAllowed: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "refreshtokenallowed"
            },
            scopes: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "scopes",
                get() {
                    const s = this.getDataValue("scopes");
                    return s ? s.split(",") : [];
                },
                set(val: string[] | null) {
                    this.setDataValue("scopes", val ? val.join(",") : "");
                }
            },
            usePkce: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                field: "usepkce"
            },
            clientAuthType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientauthtype"
            },
            federatedOIDCProviderType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedoidcprovidertype"
            },
            socialLoginProvider: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                field: "socialloginprovider"
            }
        }, 
		{
            sequelize,
            tableName: "federated_oidc_provider",
            modelName: "federatedOidcProvider",
            timestamps: false
        });
    }
}

export default FederatedOIDCProviderEntity;