import { Model, DataTypes, Sequelize } from "@sequelize/core";

class ClientScopeRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientScopeRelEntity {
        return ClientScopeRelEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "clientid"
            },
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "scopeid"
            }
        }, 
		{
            sequelize,
            tableName: "client_scope_rel",
            modelName: "clientScopeRel",
            timestamps: false
        });
    }
}


export default ClientScopeRelEntity;