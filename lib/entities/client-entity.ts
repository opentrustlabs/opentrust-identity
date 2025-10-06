import { EntitySchema } from 'typeorm';

const ClientEntity = new EntitySchema({
    
    
        columns: {
            clientId: {
                type: String,
                primary: true,
                name: "clientid"
            },
            tenantId: {
                type: String,
                primary: false,
                nullable: false,
                name: "tenantid"
            },
            clientName: {
                type: String,
                primary: false,
                nullable: false,
                name: "clientname"
            },
            clientDescription: {
                type: String,
                primary: false,
                nullable: true,
				name: "clientdescription"
            },
            clientSecret: {
                type: String,
                primary: false,
                nullable: false,
                name: "clientsecret"
            },
            clientTokenTTLSeconds: {
                type: "int",
                primary: false,
                nullable: true,
                name: "clienttokenttlseconds"
            },
            clientType: {
                type: String,
                primary: false,
                nullable: false,
                name: "clienttype"
            },
            maxRefreshTokenCount: {
                type: "int",
                primary: false,
                nullable: true,
                name: "maxrefreshtokencount"
            },
            enabled: {
                type: "boolean",
                primary: false,
                nullable: false,
                name: "enabled"
            },
            oidcEnabled: {
                type: "boolean",
                primary: false,
                nullable: false,
                name: "oidcenabled"
            },
            pkceEnabled: {
                type: "boolean",
                primary: false,
                nullable: false,
                name: "pkceenabled"
            },
            userTokenTTLSeconds: {
                type: "int",
                primary: false,
                nullable: true,
                name: "usertokenttlseconds"
            },
            markForDelete: {
                type: "boolean",
                primary: false,
                nullable: false,
                name: "markfordelete"
            },
            audience: {
                type: String,
                primary: false,
                nullable: true,
                name: "audience"
            }
        }, 
		
            tableName: "client",
            name: "client",
            
        });


export default ClientEntity;
