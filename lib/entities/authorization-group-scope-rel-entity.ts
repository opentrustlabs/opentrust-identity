import { Model, DataTypes, Sequelize } from 'sequelize';

class AuthorizationGroupScopeRelEntity extends Model {

    static initModel(sequelize: Sequelize): typeof AuthorizationGroupScopeRelEntity {
        return AuthorizationGroupScopeRelEntity.init({
            groupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "groupid"
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
            tableName: "authorization_group_scope_rel",
            modelName: "authorizationGroupScopeRel",
            timestamps: false
        });
    }    
}

export default AuthorizationGroupScopeRelEntity;