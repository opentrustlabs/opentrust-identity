import { Model, DataTypes, Sequelize } from "@sequelize/core";

class SigningKeyEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SigningKeyEntity {
        return SigningKeyEntity.init({
            keyId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "keyid"
            },
            keyType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "keytype"
            },
            keyName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "keyname"
            },
            keyUse: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				columnName: "keyuse"
            },            
            keyPassword: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "keypassword"
            },            
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "expiresatms"
            },
            createdAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "createdatms"
            },
            keyStatus: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "keystatus"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "tenantid"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
            },
            privateKeyPkcs8: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "privatekeypkcs8",
            },
            publicKey: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "publickey",
            },
            keyCertificate: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "keycertificate"
            }
        }, 
		{
            sequelize,
            tableName: "signing_key",
            modelName: "signingKey",
            timestamps: false
        });
    }
}


export default SigningKeyEntity;