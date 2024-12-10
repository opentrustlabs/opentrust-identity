import { Client, ClientAuthHistory } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import { CLIENT_FILE } from "@/utils/consts";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { getFileContents } from "@/utils/dao-utils";
import { GraphQLError } from "graphql/error/GraphQLError";


const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedClientDao extends ClientDao {

   
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

    public async getClientAuthHistoryByJti(jti: string): Promise<ClientAuthHistory | null> {
        throw new Error("Method not implemented.");
    }
    public async saveClientAuthHistory(clientAuthHistory: ClientAuthHistory): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public async deleteClientAuthHistory(jti: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default FSBasedClientDao;