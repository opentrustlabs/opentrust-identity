import { EntitySchema } from 'typeorm';
import { getBigIntTypeForDriver } from '@/utils/dao-utils';

const {
    RDB_DIALECT
} = process.env;

const UserTermsAndConditionsAcceptedEntity = new EntitySchema({
    columns: {
        userId: {
            type: String,
            primary: true,
            name: "userid"
        },
        tenantId: {
            type: String,
            primary: true,
            nullable: false,
            name: "tenantid"
        },
        acceptedAtMs: {
            type: getBigIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "acceptedatms"
        }
    },

    tableName: "user_terms_and_conditions_accepted",
    name: "userTermsAndConditionsAccepted",

});



export default UserTermsAndConditionsAcceptedEntity;
