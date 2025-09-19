import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthorizationGroupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationGroupEntity {
        return AuthorizationGroupEntity.init({
            groupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "groupid"
            },
            groupName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "groupname"
            },
            groupDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "groupdescription"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				columnName: "tenantid"
            },
            default: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "defaultgroup"
            },
            allowForAnonymousUsers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowforanonymoususers"
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
            tableName: "authorization_group",
            modelName: "authorizationGroup",
            timestamps: false
        });
    }
}



export default AuthorizationGroupEntity;