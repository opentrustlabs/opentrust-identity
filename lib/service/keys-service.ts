import { SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import { getSigningKeysDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { OIDCContext } from "@/graphql/graphql-context";

const signingKeysDao = getSigningKeysDaoImpl()
const tenantDao = getTenantDaoImpl();

class SigningKeysService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }
   
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        return signingKeysDao.getSigningKeys(tenantId);
    }    

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        const tenant: Tenant | null = await tenantDao.getTenantById(key.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            })
        }
        
        key.keyId = randomUUID().toString();
        
        await signingKeysDao.createSigningKey(key);
        return Promise.resolve(key);        
    }    

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        return signingKeysDao.getSigningKeyById(keyId);
    }
    

    public async deleteSigningKey(keyId: string): Promise<void> {
        await signingKeysDao.deleteSigningKey(keyId);
        
    }

}

export default SigningKeysService;