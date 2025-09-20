import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserCredentialEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserCredentialEntity {
        return UserCredentialEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            dateCreatedMs: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                columnName: "datecreatedms"
            },
            hashedPassword: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "hashedpassword"
            },
            hashingAlgorithm: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				columnName: "hashingalgorithm"
            },
            salt: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "salt"
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