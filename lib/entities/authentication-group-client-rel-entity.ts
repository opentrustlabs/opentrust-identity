import { Model, DataTypes, Sequelize } from "@sequelize/core";

class AuthenticationGroupClientRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AuthenticationGroupClientRelEntity {
        return AuthenticationGroupClientRelEntity.init({
            authenticationGroupId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "authenticationgroupid"
            },
            clientId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "clientid"
            }
        }, 
		{
            sequelize,
            tableName: "authentication_group_client_rel",
            modelName: "authenticationGroupClientRel",
            timestamps: false
        });
    }
}



export default AuthenticationGroupClientRelEntity;