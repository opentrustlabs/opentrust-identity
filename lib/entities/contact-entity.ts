import { Model, DataTypes, Sequelize } from 'sequelize';

class ContactEntity extends Model {

    static initModel(sequelize: Sequelize) {
        return ContactEntity.init({
            contactid: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "contactid"
            },
            objectid: {
                type: DataTypes.STRING,
                primaryKey: false,
                field: "objectid",
                allowNull: false
            },
            objecttype: {
                type: DataTypes.STRING,
                primaryKey: false,
                field: "objecttype",
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                field: "email",
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                primaryKey: false,
                field: "contactname",
                allowNull: true
            },
            userid: {
                type: DataTypes.STRING,
                primaryKey: false,
                field: "userid",
                allowNull: true
            }
        },
        {
            sequelize: sequelize,
            tableName: "contact",
            modelName: "contact",
            timestamps: false
        }
    );
    }
    __typename?: "Contact";

}

export default ContactEntity;