import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserEmailRecoveryEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserEmailRecoveryEntity {
        return UserEmailRecoveryEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "email"
            },
            emailVerified: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "emailverified"
            }
        }, 
        {
            sequelize,
            tableName: "user_email_recovery",
            modelName: "userEmailRecovery",
            timestamps: false
        });
    }
}


export default UserEmailRecoveryEntity;