import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserScopeRelEntity extends Model {

    static initModel(sequelize: Sequelize): typeof UserScopeRelEntity {
        return UserScopeRelEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "scopeid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            }
        }, 
        {
            sequelize,
            tableName: "user_scope_rel",
            modelName: "userScopeRel",
            timestamps: false
        });
    }    
}

export default UserScopeRelEntity;
