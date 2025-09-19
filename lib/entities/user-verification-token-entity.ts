import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserVerificationTokenEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserVerificationTokenEntity {
        return UserVerificationTokenEntity.init({
            token: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "token"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "userid"
            },
            verificationType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "verificationtype"
            },
            issuedAtMS: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
				columnName: "issuedatms"
            },
            expiresAtMS: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
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