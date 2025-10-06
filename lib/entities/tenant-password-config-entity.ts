import { EntitySchema } from 'typeorm';

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
            type: "int",
            primary: false,
            nullable: false,
            name: "passwordmaxlength"
        },
        passwordMinLength: {
            type: "int",
            primary: false,
            nullable: false,
            name: "passwordminlength"
        },
        requireLowerCase: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "requirelowercase"
        },
        requireNumbers: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "requirenumbers"
        },
        requireSpecialCharacters: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "requirespecialcharacters"
        },
        requireUpperCase: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "requireuppercase"
        },
        specialCharactersAllowed: {
            type: String,
            primary: false,
            nullable: true,
            name: "specialcharactersallowed"
        },
        requireMfa: {
            type: "boolean",
            primary: false,
            nullable: false,
            name: "requiremfa"
        },
        mfaTypesRequired: {
            type: String,
            primary: false,
            nullable: true,
            name: "mfatypesrequired"
        },
        maxRepeatingCharacterLength: {
            type: "int",
            primary: false,
            nullable: true,
            name: "maxrepeatingcharacterlength"
        },
        passwordRotationPeriodDays: {
            type: "int",
            primary: false,
            nullable: true,
            name: "passwordrotationperioddays"
        },
        passwordHistoryPeriod: {
            type: "int",
            primary: false,
            nullable: true,
            name: "passwordhistoryperiod"
        }
    },
    tableName: "tenant_password_config",
    name: "tenantPasswordConfig",

})



export default TenantPasswordConfigEntity;
