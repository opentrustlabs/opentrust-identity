import { getBlobTypeForDriver, stringToBlobTransformer } from '@/utils/dao-utils';
import { EntitySchema } from 'typeorm';

const {
    RDB_DIALECT
} = process.env;

const blobType = getBlobTypeForDriver(RDB_DIALECT || "");

const AccessRuleEntity = new EntitySchema({
    tableName: "access_rule",
    name: "accessRule",    
    columns: {
        accessRuleId: {
            type: String,
            primary: true,
            name: "accessruleid"
        },
        accessRuleName: {
            type: String,
            primary: false,
            nullable: false,
            name: "accessrulename"
        },
        scopeAccessRuleSchemaId: {
            type: String,
            primary: false,
            nullable: false,
            name: "scopeconstraintschemaid"
        },
        accessRuleDefinition: {
            type: blobType,
            primary: false,
            nullable: false,
            name: "accessruledefinition",
            transformer: stringToBlobTransformer()
        }
    } 
});


export default AccessRuleEntity;