import { Model, DataTypes, Sequelize } from 'sequelize';

class ClientScopeRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ClientScopeRelEntity {
        return ClientScopeRelEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "clientid"
            },
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "scopeid"
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