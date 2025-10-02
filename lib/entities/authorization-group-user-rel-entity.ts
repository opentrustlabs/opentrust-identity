import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthorizationGroupUserRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationGroupUserRelEntity {
        return AuthorizationGroupUserRelEntity.init({
            groupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "groupid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            }
        }, 
		{
            sequelize,
            tableName: "authorization_group_user_rel",
            modelName: "authorizationGroupUserRel",
            timestamps: false
        });
    }
}


export default AuthorizationGroupUserRelEntity;