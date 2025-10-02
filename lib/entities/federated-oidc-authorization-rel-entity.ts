import { Model, DataTypes, Sequelize } from "@sequelize/core";

class FederatedOIDCAuthorizationRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCAuthorizationRelEntity {
        return FederatedOIDCAuthorizationRelEntity.init({
            state: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "state"
            },
            federatedOIDCAuthorizationRelType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedoidcauthorizationreltype"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "email"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "userid"
            },
            codeVerifier: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "codeverifier"
            },
            codechallengemethod: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "codechallengemethod"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
				columnName: "expiresatms"
            },
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedoidcproviderid"
            },
            initClientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "initclientid"
            },
            initCodeChallenge: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "initcodechallenge"
            },
            initCodeChallengeMethod: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "initcodechallengemethod"
            },
            initRedirectUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "initredirecturi"
            },
            initResponseMode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "initresponsemode"
            },
            initResponseType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "initresponsetype"
            },
            initScope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "initscope"
            },
            initState: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "initstate"
            },
            initTenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "inittenantid"
            }
        }, 
		{
            sequelize,
            tableName: "federated_oidc_authorization_rel",
            modelName: "federatedOidcAuthorizationRel",
            timestamps: false
        });
    }
}
 


export default FederatedOIDCAuthorizationRelEntity;