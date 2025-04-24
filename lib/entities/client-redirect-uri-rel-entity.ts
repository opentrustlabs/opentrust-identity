import { Model, DataTypes, Sequelize } from 'sequelize';

class ClientRedirectUriRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientRedirectUriRelEntity {
        return ClientRedirectUriRelEntity.init({
            clientId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "clientid"
            },
            redirectUri: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "redirecturi"
            }
        }, 
		{
            sequelize,
            tableName: "client_redirect_uri_rel",
            modelName: "clientRedirectUriRel",
            timestamps: false
        });
    }
}


export default ClientRedirectUriRelEntity;