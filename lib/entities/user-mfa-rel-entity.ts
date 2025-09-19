import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserMfaRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserMfaRelEntity {
        return UserMfaRelEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            mfaType: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "mfatype"
            },
            primaryMfa: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "primarymfa"
            },
            totpSecret: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				columnName: "totpsecret"
            },
            totpHashAlgorithm: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "totphashalgorithm"
            },
            fido2PublicKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "fido2publickey"
            },
            fido2CredentialId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "fido2credentialid"
            },
            fido2PublicKeyAlgorithm: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "fido2publickeyalgorithm"
            },
            fido2Transports: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "fido2transports"
            },
            fido2KeySupportsCounters: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: true,
                columnName: "fido2keysupportscounters"
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