import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserEntity {
        return UserEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            address: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "address"
            },
            addressLine1: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "addressline1"
            },
            city: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				columnName: "city"
            },
            postalCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "postalcode"
            },
            stateRegionProvince: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "stateregionprovince"
            },
            countryCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "countrycode"
            },
            domain: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "domain"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "email"
            },
            emailVerified: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "emailverified"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "enabled"
            },
            federatedOIDCProviderSubjectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "federatedoidcprovidersubjectid"
            },
            firstName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "firstname"
            },
            lastName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "lastname"
            },
            locked: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "locked"
            },
            middleName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "middlename"
            },
            nameOrder: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "nameorder"
            },
            phoneNumber: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "phonenumber"
            },
            preferredLanguageCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "preferredlanguagecode"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
            }
        }, 
		{
            sequelize,
            tableName: "users",
            modelName: "users",
            timestamps: false
        });
    }
}


export default UserEntity;