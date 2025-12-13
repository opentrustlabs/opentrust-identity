import { EntitySchema } from 'typeorm';
import { getBlobTypeForDriver, stringToBlobTransformer } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const blobType = getBlobTypeForDriver(RDB_DIALECT || "");


const TenantLookAndFeelEntity = new EntitySchema({


    columns: {
        tenantid: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        adminheaderbackgroundcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "adminheaderbackgroundcolor"
        },
        adminheadertext: {
            type: String,
            primary: false,
            nullable: true,
            name: "adminheadertext"
        },
        adminheadertextcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "adminheadertextcolor"
        },
        authenticationheaderbackgroundcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticationheaderbackgroundcolor"
        },
        authenticationheadertext: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticationheadertext"
        },
        authenticationheadertextcolor: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticationheadertextcolor"
        },

        authenticationlogouri: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticationlogouri"
        },
        authenticationlogomimetype: {
            type: String,
            primary: false,
            nullable: true,
            name: "authenticationlogomimetype"
        },
        authenticationlogo: {
            type: blobType,
            primary: false,
            nullable: true,
            name: "authenticationlogo",
            transformer: stringToBlobTransformer()
        }
    },
    tableName: "tenant_look_and_feel",
    name: "tenantLookAndFeel",

});


export default TenantLookAndFeelEntity;
