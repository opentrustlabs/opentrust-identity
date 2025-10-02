import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthenticationGroupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthenticationGroupEntity {
        return AuthenticationGroupEntity.init({
            authenticationGroupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "authenticationgroupid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantid"
            },
            authenticationGroupName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "authenticationgroupname"
            },
            authenticationGroupDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				columnName: "authenticationgroupdescription"
            },
            defaultGroup: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "defaultgroup"
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
            tableName: "authentication_group",
            modelName: "authenticationGroup",
            timestamps: false
        });
    }
}



export default AuthenticationGroupEntity;