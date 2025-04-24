import { Model, DataTypes, Sequelize } from 'sequelize';

class AuthorizationGroupUserRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationGroupUserRelEntity {
        return AuthorizationGroupUserRelEntity.init({
            groupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "groupid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
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