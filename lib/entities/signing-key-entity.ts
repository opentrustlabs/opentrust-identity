import { Model, DataTypes, Sequelize } from 'sequelize';

class SigningKeyEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SigningKeyEntity {
        return SigningKeyEntity.init({
            keyId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "keyid"
            },
            keyType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "keytype"
            },
            keyName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "keyname"
            },
            keyUse: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
				field: "keyuse"
            },
            privateKeyPkcs8: {
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: false,
                field: "privatekeypkcs8"
            },
            password: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "password"
            },
            publicKey: {
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: true,
                field: "publickey"
            },
            certificate: {
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: true,
                field: "certificate"
            },
            expiresAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            },
            status: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "status"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "tenantid"
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