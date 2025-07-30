import { Model, DataTypes, Sequelize } from 'sequelize';

class UserEmailBackupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserEmailBackupEntity {
        return UserEmailBackupEntity.init({
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
            tableName: "user_email_backup",
            modelName: "userEmailBackup",
            timestamps: false
        });
    }
}


export default UserEmailBackupEntity;