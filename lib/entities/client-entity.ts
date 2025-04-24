import { Model, DataTypes, Sequelize } from 'sequelize';

class ClientEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientEntity {
        return ClientEntity.init({
            clientId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "clientid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            clientName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientname"
            },
            clientDescription: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
				field: "clientdescription"
            },
            clientSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientsecret"
            },
            clientTokenTTLSeconds: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "clienttokenttlseconds"
            },
            clientType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clienttype"
            },
            maxRefreshTokenCount: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "maxrefreshtokencount"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "enabled"
            },
            oidcEnabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "oidcenabled"
            },
            pkceEnabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "pkceenabled"
            },
            userTokenTTLSeconds: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "usertokenttlseconds"
            }
        }, 
		{
            sequelize,
            tableName: "client",
            modelName: "client",
            timestamps: false
        });
    }
}


export default ClientEntity;