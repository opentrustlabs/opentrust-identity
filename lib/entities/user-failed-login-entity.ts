import { Model, DataTypes, Sequelize } from 'sequelize';

class UserFailedLoginEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserFailedLoginEntity {
        return UserFailedLoginEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            failureAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                field: "failureatms"
            },
            nextLoginNotBefore: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "nextloginnotbefore"
            },
            failureCount: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "failurecount"
            }
        }, 
		{
            sequelize,
            tableName: "user_failed_login",
            modelName: "userFailedLogin",
            timestamps: false
        });
    }
}


export default UserFailedLoginEntity;