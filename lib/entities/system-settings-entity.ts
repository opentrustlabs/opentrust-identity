import { EntitySchema } from 'typeorm';

const SystemSettingsEntity = new EntitySchema({


    columns: {
        systemId: {
            type: String,
            primary: true,
            name: "systemid"
        },
        allowRecoveryEmail: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowrecoveryemail"
        },
        allowDuressPassword: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "allowduresspassword"
        },
        rootClientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "rootclientid"
        },
        enablePortalAsLegacyIdp: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "enableportalaslegacyidp"
        },
        auditRecordRetentionPeriodDays: {
            type: "int",
            primary: false,
            nullable: true,
            name: "auditrecordretentionperioddays"
        },
        noReplyEmail: {
            type: String,
            primary: false,
            nullable: true,
            name: "noreplyemail"
        },
        contactEmail: {
            type: String,
            primary: false,
            nullable: true,
            name: "contactemail"
        },
    },

    tableName: "system_settings",
    name: "systemSettings",

});



export default SystemSettingsEntity;
