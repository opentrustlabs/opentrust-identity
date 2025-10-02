import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserFido2ChallengeEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserFido2ChallengeEntity {
        return UserFido2ChallengeEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            challenge: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "challenge"
            },
            issuedAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "issuedatms"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
				columnName: "expiresatms"
            }
        }, 
		{
            sequelize,
            tableName: "user_fido2_challenge",
            modelName: "userFido2Challenge",
            timestamps: false
        });
    }
}


export default UserFido2ChallengeEntity;