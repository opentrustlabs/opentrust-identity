import { Client } from "@/graphql/generated/graphql-types";
//import TenantDao from "@/lib/dao/tenant-dao";
import ClientDao from "@/lib/dao/client-dao";
import { DaoFactory } from "../data-sources/dao-factory";

const {
    AUTH_DOMAIN
} = process.env;

//const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();

class ClientAuthValidationService {


    /**
     * @param clientId 
     * @param clientSecret 
     * @returns 
     */
    public async validateClientAuthCredentials(clientId: string, clientSecret: string): Promise<boolean> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            return Promise.resolve(false);
        }
        if(client.clientSecret !== clientSecret){
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }

    


}

export default ClientAuthValidationService;