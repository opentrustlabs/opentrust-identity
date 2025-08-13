import { Model, DataTypes, Sequelize } from 'sequelize';

class UserAuthenticationHistoryEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserAuthenticationHistoryEntity {
        return UserAuthenticationHistoryEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            lastAuthenticationAtMs: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "lastauthenticationatms"
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