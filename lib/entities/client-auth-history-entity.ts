import { Model, DataTypes, Sequelize } from "@sequelize/core";

class ClientAuthHistoryEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientAuthHistoryEntity {
        return ClientAuthHistoryEntity.init({
            jti: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "jti"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "clientid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            expiresAtSeconds: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
				columnName: "expiresatseconds"
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