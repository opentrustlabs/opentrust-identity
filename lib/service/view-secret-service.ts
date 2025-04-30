import { Client, SecretObjectType, SigningKey } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import ClientDao from "../dao/client-dao";
import SigningKeysDao from "../dao/signing-keys-dao";


const kms: Kms = DaoFactory.getInstance().getKms();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();

class ViewSecretService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async viewSecret(objectId: string, objectType: SecretObjectType): Promise<string | null> {
        let decrypted: string | null = null;
        if(objectType === SecretObjectType.ClientSecret){
            const client: Client | null = await clientDao.getClientById(objectId);
            if(client){
                decrypted = await kms.decrypt(client.clientSecret);
            }
            
        }
        else if(objectType === SecretObjectType.PrivateKey){
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                decrypted = await kms.decrypt(signingKey.privateKeyPkcs8);
            }
        }
        else if(objectType === SecretObjectType.PrivateKeyPassword){
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                if(signingKey.password){
                    decrypted = await kms.decrypt(signingKey.password);
                }
            }
        }
        return decrypted;
    }



}

export default ViewSecretService;