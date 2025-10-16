import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const SystemSettingsEntity = new EntitySchema({

    columns: {
        systemId: {
            type: String,
            primary: true,
            name: "systemid"
        },
        allowRecoveryEmail: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowrecoveryemail",
            transformer: BooleanTransformer
        },
        allowDuressPassword: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "allowduresspassword",
            transformer: BooleanTransformer
        },
        rootClientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "rootclientid"
        },
        enablePortalAsLegacyIdp: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "enableportalaslegacyidp",
            transformer: BooleanTransformer
        },
        auditRecordRetentionPeriodDays: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
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
