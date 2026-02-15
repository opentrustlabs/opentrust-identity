import { getIntTypeForDriver } from '@/utils/dao-utils';
import { EntitySchema } from 'typeorm';
const {
    RDB_DIALECT
} = process.env;

const ClientTokenEnrichmentConfigurationEntity = new EntitySchema({

    tableName: "client_token_enrichment_configuration",
    name: "clientTokenEnrichmentConfiguration",
    columns: {
        clientId: {
            type: String,
            primary: true,
            name: "clientid"
        },
        uri: {
            type: String,
            primary: false,
            nullable: false,
            name: "uri"
        },
        failureMode: {
            type: String,
            primary: false,
            nullable: false,
            name: "failuremode"
        },
        timeoutMs: {
            type: getIntTypeForDriver(RDB_DIALECT || ""),
            primary: false,
            nullable: false,
            name: "timeoutms"
        }
    }
});


export default ClientTokenEnrichmentConfigurationEntity;