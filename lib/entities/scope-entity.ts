import { Model, DataTypes, Sequelize } from 'sequelize';

class ScopeEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ScopeEntity {
        return ScopeEntity.init({
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "scopeid"
            },
            scopeName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scopename"
            },
            scopeDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scopedescription"
            },
            scopeUse: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scopeuse"
            }
        }, 
		{
            sequelize,
            tableName: "scope",
            modelName: "scope",
            timestamps: false
        });
    }
}


export default ScopeEntity;
