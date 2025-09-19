import { Model, DataTypes, Sequelize } from "@sequelize/core";

class ContactEntity extends Model {

    static initModel(sequelize: Sequelize) {
        return ContactEntity.init({
            contactid: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "contactid"
            },
            objectid: {
                type: DataTypes.STRING,
                primaryKey: false,
                columnName: "objectid",
                allowNull: false
            },
            objecttype: {
                type: DataTypes.STRING,
                primaryKey: false,
                columnName: "objecttype",
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                columnName: "email",
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                primaryKey: false,
                columnName: "contactname",
                allowNull: true
            },
            userid: {
                type: DataTypes.STRING,
                primaryKey: false,
                columnName: "userid",
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