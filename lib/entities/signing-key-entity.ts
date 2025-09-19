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
            password: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "password"
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
            status: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "status"
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
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: false,
                columnName: "privatekeypkcs8",
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
            publicKey: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: true,
                columnName: "publickey",
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
                columnName: "certificate",
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