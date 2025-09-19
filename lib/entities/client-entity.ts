import { Model, DataTypes, Sequelize } from "@sequelize/core";

class ClientEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientEntity {
        return ClientEntity.init({
            clientId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "clientid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            clientName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientname"
            },
            clientDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				columnName: "clientdescription"
            },
            clientSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientsecret"
            },
            clientTokenTTLSeconds: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "clienttokenttlseconds"
            },
            clientType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clienttype"
            },
            maxRefreshTokenCount: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "maxrefreshtokencount"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "enabled"
            },
            oidcEnabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "oidcenabled"
            },
            pkceEnabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "pkceenabled"
            },
            userTokenTTLSeconds: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "usertokenttlseconds"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
            },
            audience: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "audience"
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