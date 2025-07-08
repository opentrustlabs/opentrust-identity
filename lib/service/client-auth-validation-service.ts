import { Client } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";



const kms: Kms = DaoFactory.getInstance().getKms();
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
        try{
            const decryptedClientSecret: string | null = await kms.decrypt(client.clientSecret);
            if(!decryptedClientSecret){
                return Promise.resolve(false);
            }
            if(decryptedClientSecret !== clientSecret){
                return Promise.resolve(false);
            }
            return Promise.resolve(true);
        }
        catch(err){
            return Promise.resolve(false);
        }
    }

}

export default ClientAuthValidationService;