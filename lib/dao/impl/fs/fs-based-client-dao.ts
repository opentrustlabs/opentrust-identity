import { Client } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import { CLIENT_FILE } from "@/utils/consts";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { getFileContents } from "@/utils/dao-utils";
import { GraphQLError } from "graphql/error/GraphQLError";
import { decodeJwt, JWTPayload } from "jose";
//import { randomUUID } from 'crypto'; 

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

const {
    AUTH_DOMAIN
} = process.env;

class FSBasedClientDao extends ClientDao {

   
    /**
     * @param clientId 
     * @param clientSecret 
     * @returns 
     */
    public async validateClientAuthCredentials(clientId: string, clientSecret: string): Promise<boolean> {
        const client: Client | null = await this.getClientById(clientId);
        if(!client){
            return Promise.resolve(false);
        }
        if(client.clientSecret !== clientSecret){
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }

    /**
     * The only signing method allowed is HMAC SHA 256, not private keys. It also does
     * not support encrypted claims.
     * 
     * @param jwt 
     * @returns 
     */
    public async validateClientAuthJwt(jwt: string, tenantId: string): Promise<boolean> {
        
        // From the specification here: https://openid.net/specs/openid-connect-core-1_0.html section #9
        // First, let's find the client ID, which should be in the sub attribute and iss attribte
        // and should match
        const payload: JWTPayload = decodeJwt(jwt);
        if(!payload.iss || !payload.sub){
            return Promise.resolve(false);
        }
        if(payload.iss !== payload.sub){
            return Promise.resolve(false);
        }

        const aud: string | string[] | undefined = payload.aud;
        if(!aud){
            return Promise.resolve(false);
        }
        // audience should match this authorization server's token endpoint, including tenant id
        const a = `${AUTH_DOMAIN}/api/${tenantId}/oidc/token`;
        if(!Array.isArray(aud)){
            if(a !== aud){
                return Promise.resolve(false);
            }
        }
        else{
            if(a !== aud[0]){
                return Promise.resolve(false);
            }
        }
        
        const jti: string | undefined = payload.jti;
        if(!jti){
            return Promise.resolve(false);
        }


        return Promise.resolve(true);
    }

    public async getClients(tenantId?: string): Promise<Array<Client>> {
        let clients: Array<Client> = JSON.parse(getFileContents(`${dataDir}/${CLIENT_FILE}`, "[]"));
        if(tenantId){
            clients = clients.filter(
                (c: Client) => c.tenantId === tenantId
            )
        }
        return Promise.resolve(clients);
    }

    public async getClientsByTenant(tenantId: string): Promise<Array<Client>> {
        const allClients = await this.getClients();
        const clients: Array<Client> = allClients.filter(
            (client: Client) => client.tenantId === tenantId
        );
        return Promise.resolve(clients)
    }

    public async getClientById(clientId: string): Promise<Client | null> {
        const clients = await this.getClients();
        const client: Client | undefined = clients.find(
            (client: Client) => client.clientId === clientId
        );
        return client === undefined ? Promise.resolve(null) : Promise.resolve(client);

    }

    public async createClient(client: Client): Promise<Client> {
        const clients = await this.getClients();
        clients.push(client);
        writeFileSync(`${dataDir}/${CLIENT_FILE}`, JSON.stringify(clients), {encoding: "utf-8"});
        return Promise.resolve(client)
    }

    public async updateClient(client: Client): Promise<Client> {
        const clients: Array<Client> = await this.getClients();
        const clientToUpdate = clients.find(
            (c: Client) => {
                return c.clientId === client.clientId
            }
        );
        if(!clientToUpdate){
            throw new GraphQLError("ERROR_CLIENT_NOT_FOUND")
        }
        // tenantId is a write-only-read-only property, no updates regardless of what the client has sent
        // same for client secret
        clientToUpdate.clientDescription = client.clientDescription;
        clientToUpdate.clientName = client.clientName;
        clientToUpdate.enabled = client.enabled;
        clientToUpdate.oidcEnabled = client.oidcEnabled;
        clientToUpdate.pkceEnabled = client.pkceEnabled;
        clientToUpdate.redirectUris = client.redirectUris;
        writeFileSync(`${dataDir}/${CLIENT_FILE}`, JSON.stringify(clients), {encoding: "utf-8"});

        return Promise.resolve(client);
    }

    public async deleteClient(clientId: string): Promise<void> {
        // delete all LoginGroupClientRel
        // ClientTenantScopeRel
        // delete client
        throw new Error("Method not implemented.");
    }
}

export default FSBasedClientDao;