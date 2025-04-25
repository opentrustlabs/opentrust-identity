import { Model, DataTypes, Sequelize } from 'sequelize';

class ProhibitedPasswordEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof ProhibitedPasswordEntity {
        return ProhibitedPasswordEntity.init({
            password: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "password"
            }
        }, 
		{
            sequelize,
            tableName: "prohibited_passwords",
            modelName: "prohibitedPasswords",
            timestamps: false
        });
    }
}

export default ProhibitedPasswordEntity;