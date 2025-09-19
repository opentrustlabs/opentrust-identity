import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserFido2CounterRelEntity extends Model {

    static initModel(sequelize: Sequelize): typeof UserFido2CounterRelEntity {
        return UserFido2CounterRelEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            fido2Counter: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                columnName: "fido2Counter"
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

