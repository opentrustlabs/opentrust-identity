import { Model, DataTypes, Sequelize } from 'sequelize';

class UserDuressCredentialEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserDuressCredentialEntity {
        return UserDuressCredentialEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            dateCreated: {
                type: DataTypes.DATE,
                primaryKey: false,
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
            tableName: "user_duress_credential",
            modelName: "userDuressCredential",
            timestamps: false
        });
    }
}


export default UserDuressCredentialEntity;