import { Model, DataTypes, Sequelize } from 'sequelize';

class AuthorizationGroupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthorizationGroupEntity {
        return AuthorizationGroupEntity.init({
            groupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "groupid"
            },
            groupName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "groupname"
            },
            groupDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "groupdescription"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				field: "tenantid"
            },
            default: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "defaultgroup"
            },
            allowForAnonymousUsers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowforanonymoususers"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "markfordelete"
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