import { EntitySchema } from 'typeorm';

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
            type: "bigint",
            primary: false,
            nullable: false,
            name: "acceptedatms"
        }
    },

    tableName: "user_terms_and_conditions_accepted",
    name: "userTermsAndConditionsAccepted",

});



export default UserTermsAndConditionsAcceptedEntity;
