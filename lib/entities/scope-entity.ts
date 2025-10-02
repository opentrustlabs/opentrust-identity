import { Model, DataTypes, Sequelize } from "@sequelize/core";

class ScopeEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ScopeEntity {
        return ScopeEntity.init({
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "scopeid"
            },
            scopeName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scopename"
            },
            scopeDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scopedescription"
            },
            scopeUse: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "scopeuse"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
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
