import { Client } from "@/graphql/generated/graphql-types";
import ClientDao from "@/lib/dao/client-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import { logWithDetails } from "../logging/logger";
import { timingSafeEqual } from "node:crypto";



const kms: Kms = DaoFactory.getInstance().getKms();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();

class ClientAuthValidationService {

    validateClientAuthCredentials(client: string, clientSecret: string): Promise<boolean>;
    validateClientAuthCredentials(client: Client, clientSecret: string): Promise<boolean>;
    

    /**
     * @param clientId 
     * @param clientSecret 
     * @returns 
     */
    public async validateClientAuthCredentials(client: string | Client, clientSecret: string): Promise<boolean> {

        let encryptedClientSecret: string | null = null;

        if(typeof client === "string"){
            const c: Client | null = await clientDao.getClientById(client);
            if(!c){
                return Promise.resolve(false);
            }
            encryptedClientSecret = await kms.decrypt(c.clientSecret);
        }
        else{
            encryptedClientSecret = await kms.decrypt(client.clientSecret);
        }
        if(encryptedClientSecret === null){
            return false;
        }
        
        try{
            const decryptedClientSecret: string | null = await kms.decrypt(encryptedClientSecret);
            if(!decryptedClientSecret){
                return Promise.resolve(false);
            }
            const areEqual: boolean = timingSafeEqual(Buffer.from(clientSecret), Buffer.from(decryptedClientSecret));
            if(!areEqual){
                return Promise.resolve(false);
            }
            return Promise.resolve(true);
        }
        catch(err: unknown){
            const e = err as Error;
            logWithDetails("error", `Error validating client auth credentials. ${e.message}`, {e});
            return Promise.resolve(false);
        }
    }

}

export default ClientAuthValidationService;