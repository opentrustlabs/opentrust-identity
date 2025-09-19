import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserProfileChangeEmailStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserProfileChangeEmailStateEntity {
        return UserProfileChangeEmailStateEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            changeEmailSessionToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "changeemailsessiontoken"
            },
            emailChangeState: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "emailchangestate"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "email"
            },            
            changeOrder: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "changeorder"
            },
            changeStateStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "changestatestatus"
            },            
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
            },
            isPrimaryEmail: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "isprimaryemail"
            }
        }, 
        {
            sequelize,
            tableName: "user_profile_email_change_state",
            modelName: "userProfileEmailChangeState",
            timestamps: false
        });
    }
}


export default UserProfileChangeEmailStateEntity;