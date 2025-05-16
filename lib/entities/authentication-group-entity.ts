import { Model, DataTypes, Sequelize } from 'sequelize';

class AuthenticationGroupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthenticationGroupEntity {
        return AuthenticationGroupEntity.init({
            authenticationGroupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "authenticationgroupid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantid"
            },
            authenticationGroupName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "authenticationgroupname"
            },
            authenticationGroupDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				field: "authenticationgroupdescription"
            },
            defaultGroup: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "defaultgroup"
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
            tableName: "authentication_group",
            modelName: "authenticationGroup",
            timestamps: false
        });
    }
}



export default AuthenticationGroupEntity;