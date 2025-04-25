import { Model, DataTypes, Sequelize } from 'sequelize';

class UserFailedLoginAttemptsEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserFailedLoginAttemptsEntity {
        return UserFailedLoginAttemptsEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            failureAtMS: {
                type: DataTypes.NUMBER,
                primaryKey: true,
                field: "failureatms"
            }
        }, 
		{
            sequelize,
            tableName: "user_failed_login_attempts",
            modelName: "userFailedLoginAttempts",
            timestamps: false
        });
    }
}


export default UserFailedLoginAttemptsEntity;