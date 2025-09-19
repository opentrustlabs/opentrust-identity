import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthenticationGroupUserRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthenticationGroupUserRelEntity {
        return AuthenticationGroupUserRelEntity.init({
            authenticationGroupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "authenticationgroupid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            }
        }, 
		{
            sequelize,
            tableName: "authentication_group_user_rel",
            modelName: "authenticationGroupUserRel",
            timestamps: false
        });
    }
}

export default AuthenticationGroupUserRelEntity;