import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserDuressCredentialEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserDuressCredentialEntity {
        return UserDuressCredentialEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            dateCreatedMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
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
            tableName: "user_duress_credential",
            modelName: "userDuressCredential",
            timestamps: false
        });
    }
}


export default UserDuressCredentialEntity;