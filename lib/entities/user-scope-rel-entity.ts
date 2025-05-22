import { Model, DataTypes, Sequelize } from 'sequelize';

class UserScopeRelEntity extends Model {

    static initModel(sequelize: Sequelize): typeof UserScopeRelEntity {
        return UserScopeRelEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            scopeId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "scopeid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
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
