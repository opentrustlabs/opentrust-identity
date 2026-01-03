import { EntitySchema } from 'typeorm';

const ClientFapiConfigurationEntity = new EntitySchema({

    tableName: "client_fapi_configuration",
    name: "clientFapiConfiguration",
    columns: {
        identifierValue: {
            type: String,
            primary: true,
            name: "identifiervalue"
        },
        clientId: {
            type: String,
            primary: false,
            nullable: false,
            name: "clientid"
        },
        identifierType: {
            type: String,
            primary: false,
            nullable: false,
            name: "identifiertype"
        }
    }
});


export default ClientFapiConfigurationEntity;