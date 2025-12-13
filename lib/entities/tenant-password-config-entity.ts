import { EntitySchema } from 'typeorm';
import { BooleanTransformer, getBooleanTypeForDriver, getIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const TenantPasswordConfigEntity = new EntitySchema({
    columns: {
        tenantId: {
            type: String,
            primary: true,
            name: "tenantid"
        },
        passwordHashingAlgorithm: {
            type: String,
            primary: false,
            nullable: false,
            name: "passwordhashingalgorithm"
        },
        passwordMaxLength: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "passwordmaxlength"
        },
        passwordMinLength: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "passwordminlength"
        },
        requireLowerCase: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "requirelowercase",
            transformer: BooleanTransformer
        },
        requireNumbers: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "requirenumbers",
            transformer: BooleanTransformer
        },
        requireSpecialCharacters: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "requirespecialcharacters",
            transformer: BooleanTransformer
        },
        requireUpperCase: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "requireuppercase",
            transformer: BooleanTransformer
        },
        specialCharactersAllowed: {
            type: String,
            primary: false,
            nullable: true,
            name: "specialcharactersallowed"
        },
        requireMfa: {
            type: getBooleanTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "requiremfa",
            transformer: BooleanTransformer
        },
        mfaTypesRequired: {
            type: String,
            primary: false,
            nullable: true,
            name: "mfatypesrequired"
        },
        maxRepeatingCharacterLength: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "maxrepeatingcharacterlength"
        },
        passwordRotationPeriodDays: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "passwordrotationperioddays"
        },
        passwordHistoryPeriod: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: true,
            name: "passwordhistoryperiod"
        }
    },
    tableName: "tenant_password_config",
    name: "tenantPasswordConfig",

})



export default TenantPasswordConfigEntity;
