import { Model, DataTypes, Sequelize } from 'sequelize';

class ClientAuthHistoryEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientAuthHistoryEntity {
        return ClientAuthHistoryEntity.init({
            jti: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "jti"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "clientid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            expiresAtSeconds: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
				field: "expiresatseconds"
            }
        }, 
		{
            sequelize,
            tableName: "client_auth_history",
            modelName: "clientAuthHistory",
            timestamps: false
        });
    }
}


export default ClientAuthHistoryEntity;