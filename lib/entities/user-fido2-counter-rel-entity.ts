import { Model, DataTypes, Sequelize } from 'sequelize';

class UserFido2CounterRelEntity extends Model {

    static initModel(sequelize: Sequelize): typeof UserFido2CounterRelEntity {
        return UserFido2CounterRelEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            fido2Counter: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "fido2Counter"
            }
        }, 
        {
            sequelize,
            tableName: "user_fido2_counter_rel",
            modelName: "userFido2CountrerRel",
            timestamps: false
        });
    }
}

export default UserFido2CounterRelEntity;

