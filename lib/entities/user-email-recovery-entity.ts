import { Model, DataTypes, Sequelize } from 'sequelize';

class UserEmailRecoveryEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserEmailRecoveryEntity {
        return UserEmailRecoveryEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "email"
            },
            emailVerified: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "emailverified"
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