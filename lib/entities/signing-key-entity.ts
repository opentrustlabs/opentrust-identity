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
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: false,
                field: "privatekeypkcs8",
                set(val: string | Buffer | null){
                    if(val === null || val === ""){
                        this.setDataValue("privateKeyPkcs8", null);
                    }
                    else if(typeof val === "string"){
                        this.setDataValue("privateKeyPkcs8", Buffer.from(val, "utf-8"));
                    }
                    else{
                        this.setDataValue("privateKeyPkcs8", val);
                    }
                }
            },
            password: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "password"
            },
            publicKey: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: true,
                field: "publickey",
                set(val: string | Buffer | null){
                    if(val === null || val === ""){
                        this.setDataValue("publicKey", null);
                    }
                    else if(typeof val === "string"){
                        this.setDataValue("publicKey", Buffer.from(val, "utf-8"));
                    }
                    else{
                        this.setDataValue("publicKey", val);
                    }
                }
            },
            certificate: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: true,
                field: "certificate",
                set(val: string | Buffer | null){
                    if(val === null || val === ""){
                        this.setDataValue("certificate", null);
                    }
                    else if(typeof val === "string"){
                        this.setDataValue("certificate", Buffer.from(val, "utf-8"));
                    }
                    else{
                        this.setDataValue("certificate", val);
                    }
                }
            },
            expiresAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
            },
            createdAtMs: {
                type: DataTypes.NUMBER,
                primaryKey: false,
                allowNull: false,
                field: "createdatms"
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
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "markfordelete"
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