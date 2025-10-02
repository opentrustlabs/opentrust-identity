import { Model, DataTypes, Sequelize } from "@sequelize/core";

class FederatedOIDCProviderEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCProviderEntity {
        return FederatedOIDCProviderEntity.init({
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "federatedoidcproviderid"
            },
            federatedOIDCProviderName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedoidcprovidername"
            },
            federatedOIDCProviderDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "federatedoidcproviderdescription"
            },
            federatedOIDCProviderTenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				columnName: "federatedoidcprovidertenantid"
            },
            federatedOIDCProviderClientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedoidcproviderclientid"
            },
            federatedOIDCProviderClientSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "federatedoidcproviderclientsecret"
            },
            federatedOIDCProviderWellKnownUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedoidcproviderwellknownuri"
            },
            refreshTokenAllowed: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "refreshtokenallowed"
            },
            scopes: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "scopes",
                get() {
                    const s = this.getDataValue("scopes");
                    return s ? s.split(",") : [];
                },
                set(val: string[] | string | null) {                    
                    if(val === null){
                        this.setDataValue("scopes", "");
                    }
                    else if(Array.isArray(val)){
                        this.setDataValue("scopes", val.join(","));
                    }
                    else{
                        this.setDataValue("scopes", val);
                    }
                }
            },
            usePkce: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                columnName: "usepkce"
            },
            clientAuthType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientauthtype"
            },
            federatedOIDCProviderType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedoidcprovidertype"
            },
            socialLoginProvider: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "socialloginprovider"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
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