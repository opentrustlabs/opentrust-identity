import { Model, DataTypes, Sequelize } from 'sequelize';

class UserCredentialEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserCredentialEntity {
        return UserCredentialEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            dateCreated: {
                type: DataTypes.DATE,
                primaryKey: true,
                field: "datecreated"
            },
            hashedPassword: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "hashedpassword"
            },
            hashingAlgorithm: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				field: "hashingalgorithm"
            },
            salt: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "salt"
            }
        }, 
		{
            sequelize,
            tableName: "user_credential",
            modelName: "userCredential",
            timestamps: false
        });
    }
}


export default UserCredentialEntity;