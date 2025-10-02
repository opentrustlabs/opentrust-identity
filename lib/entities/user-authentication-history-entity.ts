import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserAuthenticationHistoryEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserAuthenticationHistoryEntity {
        return UserAuthenticationHistoryEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            lastAuthenticationAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                columnName: "lastauthenticationatms"
            }
        }, 
        {
            sequelize,
            tableName: "user_authentication_history",
            modelName: "userAuthenticationHistory",
            timestamps: false
        });
    }
}


export default UserAuthenticationHistoryEntity;