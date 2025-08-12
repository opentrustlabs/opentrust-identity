import { Model, DataTypes, Sequelize } from 'sequelize';

class UserProfileChangeEmailStateEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserProfileChangeEmailStateEntity {
        return UserProfileChangeEmailStateEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            changeEmailSessionToken: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "changeemailsessiontoken"
            },
            emailChangeState: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "emailchangestate"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "email"
            },            
            changeOrder: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "changeorder"
            },
            changeStateStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "changestatestatus"
            },            
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            },
            isPrimaryEmail: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "isprimaryemail"
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