import { Model, DataTypes, Sequelize } from 'sequelize';

class UserVerificationTokenEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserVerificationTokenEntity {
        return UserVerificationTokenEntity.init({
            token: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "token"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "userid"
            },
            verificationType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "verificationtype"
            },
            issuedAtMS: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
				field: "issuedatms"
            },
            expiresAtMS: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            }
        }, 
		{
            sequelize,
            tableName: "user_verification_token",
            modelName: "userVerificationToken",
            timestamps: false
        });
    }
}

export default UserVerificationTokenEntity;