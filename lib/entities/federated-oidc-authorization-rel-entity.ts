import { Model, DataTypes, Sequelize } from 'sequelize';

class FederatedOIDCAuthorizationRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof FederatedOIDCAuthorizationRelEntity {
        return FederatedOIDCAuthorizationRelEntity.init({
            state: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "state"
            },
            federatedOIDCAuthorizationRelType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedoidcauthorizationreltype"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "email"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "userid"
            },
            codeVerifier: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "codeverifier"
            },
            codechallengemethod: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "codechallengemethod"
            },
            expiresAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
				field: "expiresatms"
            },
            federatedOIDCProviderId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedoidcproviderid"
            },
            initClientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "initclientid"
            },
            initCodeChallenge: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "initcodechallenge"
            },
            initCodeChallengeMethod: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "initcodechallengemethod"
            },
            initRedirectUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "initredirecturi"
            },
            initResponseMode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "initresponsemode"
            },
            initResponseType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "initresponsetype"
            },
            initScope: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "initscope"
            },
            initState: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "initstate"
            },
            initTenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "inittenantid"
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