import { Model, DataTypes, Sequelize } from 'sequelize';

class UserMfaRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserMfaRelEntity {
        return UserMfaRelEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            mfaType: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "mfatype"
            },
            primaryMfa: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "primarymfa"
            },
            totpSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				field: "totpsecret"
            },
            totpHashAlgorithm: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "totphashalgorithm"
            },
            fido2PublicKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "fido2publickey"
            },
            fido2CredentialId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "fido2credentialid"
            },
            fido2PublicKeyAlgorithm: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "fido2publickeyalgorithm"
            },
            fido2Transports: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "fido2transports"
            },
            fido2KeySupportsCounters: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                field: "fido2keysupportscounters"
            }
        }, 
		{
            sequelize,
            tableName: "user_mfa_rel",
            modelName: "userMfaRel",
            timestamps: false
        });
    }
}


export default UserMfaRelEntity;