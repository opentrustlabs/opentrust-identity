import { Model, DataTypes, Sequelize } from 'sequelize';

class UserFido2ChallengeEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserFido2ChallengeEntity {
        return UserFido2ChallengeEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            challenge: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "challenge"
            },
            issuedAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "issuedatms"
            },
            expiresAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
				field: "expiresatms"
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