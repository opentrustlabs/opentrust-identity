import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthorizationGroupScopeRelEntity extends Model {

    static initModel(sequelize: Sequelize): typeof AuthorizationGroupScopeRelEntity {
        return AuthorizationGroupScopeRelEntity.init({
            groupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "groupid"
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
            tableName: "authorization_group_scope_rel",
            modelName: "authorizationGroupScopeRel",
            timestamps: false
        });
    }    
}

export default AuthorizationGroupScopeRelEntity;