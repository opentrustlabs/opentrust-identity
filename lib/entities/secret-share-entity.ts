import { Model, DataTypes, Sequelize } from "@sequelize/core";

class SecretShareEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SecretShareEntity {
        return SecretShareEntity.init({
            secretShareId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "secretshareid"
            },
            objectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "objectid"
            },
            secretShareObjectType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "objectype"
            },
            otp: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "otp"
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
            tableName: "secret_share",
            modelName: "secretShare",
            timestamps: false
        });
    }
}


export default SecretShareEntity;