import { EntitySchema } from 'typeorm';

const UserEntity = new EntitySchema({
    name: "users",
    tableName: "users",
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"

        },
        address: {
            type: String,
            primary: false,
            nullable: true,
            name: "address"
        },
        addressLine1: {
            type: String,
            primary: false,
            nullable: true,
            name: "addressline1"
        },
        city: {
            type: String,
            primary: false,
            nullable: true,
            name: "city"
        },
        postalCode: {
            type: String,
            primary: false,
            nullable: true,
            name: "postalcode"
        },
        stateRegionProvince: {
            type: String,
            primary: false,
            nullable: true,
            name: "stateregionprovince"
        },
        countryCode: {
            type: String,
            primary: false,
            nullable: true,
            name: "countrycode"
        },
        domain: {
            type: String,
            primary: false,
            nullable: false,
            name: "domain"
        },
        email: {
            type: String,
            primary: false,
            nullable: false,
            name: "email"
        },
        emailVerified: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "emailverified"
        },
        enabled: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "enabled"
        },
        federatedOIDCProviderSubjectId: {
            type: String,
            primary: false,
            nullable: true,
            name: "federatedoidcprovidersubjectid"
        },
        firstName: {
            type: String,
            primary: false,
            nullable: false,
            name: "firstname"
        },
        lastName: {
            type: String,
            primary: false,
            nullable: false,
            name: "lastname"
        },
        locked: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "locked"
        },
        middleName: {
            type: String,
            primary: false,
            nullable: true,
            name: "middlename"
        },
        nameOrder: {
            type: String,
            primary: false,
            nullable: false,
            name: "nameorder"
        },
        phoneNumber: {
            type: String,
            primary: false,
            nullable: true,
            name: "phonenumber"
        },
        preferredLanguageCode: {
            type: String,
            primary: false,
            nullable: true,
            name: "preferredlanguagecode"
        },
        markForDelete: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "markfordelete"
        }
    }
});

export default UserEntity;