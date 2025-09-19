import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserFailedLoginEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserFailedLoginEntity {
        return UserFailedLoginEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            failureAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                columnName: "failureatms"
            },
            nextLoginNotBefore: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "nextloginnotbefore"
            },
            failureCount: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "failurecount"
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