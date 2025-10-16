import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "emailverified",
            transformer: BooleanTransformer
        },
        enabled: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "enabled",
            transformer: BooleanTransformer
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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "locked",
            transformer: BooleanTransformer
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
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "markfordelete",
            transformer: BooleanTransformer
        }
    }
});

export default UserEntity;