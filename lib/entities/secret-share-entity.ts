import { Model, DataTypes, Sequelize } from 'sequelize';

class SecretShareEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof SecretShareEntity {
        return SecretShareEntity.init({
            secretShareId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "secretshareid"
            },
            objectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "objectid"
            },
            secretShareObjectType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "objectype"
            },
            otp: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "otp"
            },
            expiresAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "expiresatms"
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