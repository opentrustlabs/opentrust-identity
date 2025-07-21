import { Model, DataTypes, Sequelize } from 'sequelize';

class UserEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserEntity {
        return UserEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            address: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "address"
            },
            addressLine1: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "addressline1"
            },
            city: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
				field: "city"
            },
            postalCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "postalcode"
            },
            stateRegionProvince: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "stateregionprovince"
            },
            countryCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "countrycode"
            },
            domain: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "domain"
            },
            email: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "email"
            },
            emailVerified: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "emailverified"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "enabled"
            },
            federatedOIDCProviderSubjectId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "federatedoidcprovidersubjectid"
            },
            firstName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "firstname"
            },
            lastName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "lastname"
            },
            locked: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "locked"
            },
            middleName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "middlename"
            },
            nameOrder: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "nameorder"
            },
            phoneNumber: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "phonenumber"
            },
            preferredLanguageCode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "preferredlanguagecode"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "markfordelete"
            },
            termsAndConditionsAccepted: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "termsandconditionsaccepted"
            },
        }, 
		{
            sequelize,
            tableName: "user",
            modelName: "user",
            timestamps: false
        });
    }
}


export default UserEntity;