import { SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { OIDCContext } from "@/graphql/graphql-context";
import { KEY_TYPES, PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, SIGNING_KEY_STATUS_ACTIVE, SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import { DaoFactory } from "../data-sources/dao-factory";

const signingKeysDao = DaoFactory.getInstance().getSigningKeysDao()
const tenantDao = DaoFactory.getInstance().getTenantDao();

class SigningKeysService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }
   
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        const signingKeys: Array<SigningKey> = await signingKeysDao.getSigningKeys(tenantId);
        // Do NOT!!! return any private key or password data with this call.
        signingKeys.forEach(
            (k: SigningKey) => {
                k.password = "";
                k.privateKeyPkcs8 = "";
            }
        )
        return signingKeysDao.getSigningKeys(tenantId);
    }    


    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        const tenant: Tenant | null = await tenantDao.getTenantById(key.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND", {

            })
        }

        if(!key.keyName || key.keyName === ""){
            throw new GraphQLError("ERROR_MISSING_KEY_NAME_OR_ALIAS");
        }
        if(!key.privateKeyPkcs8 || key.privateKeyPkcs8 === ""){
            throw new GraphQLError("ERROR_MISSING_PRIVATE_KEY");
        }
        if(key.certificate === "" && key.publicKey === ""){
            throw new GraphQLError("ERROR_MUST_PROVIDE_EITHER_A_PUBLIC_KEY_OR_CERTIFICATE");
        }
        if(key.password === "" && key.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)){
            throw new GraphQLError("ERROR_ENCRYPTED_PRIVATE_KEY_REQUIRES_PASSPHRASE");
        }
        if(key.keyType === "" || !KEY_TYPES.includes(key.keyType)){
            throw new GraphQLError("ERROR_MISSING_OR_INVALID_KEY_TYPE");
        }
        // TODO
        // Get the actual expiration for the public key
        if(key.publicKey !== "" && key.expiresAtMs < 0){
            throw new GraphQLError("ERROR_INVALID_EXPIRATION_FOR_PUBLIC_KEY");
        }
        
        key.keyId = randomUUID().toString();
        
        await signingKeysDao.createSigningKey(key);
        return Promise.resolve(key);        
    } 

    public async updateSigningKey(key: SigningKey): Promise<SigningKey> {

        if( ! (key.status === SIGNING_KEY_STATUS_REVOKED || key.status === SIGNING_KEY_STATUS_ACTIVE)) {
            throw new GraphQLError("ERROR_INVALID_SIGNING_KEY_STATUS");
        }
        const existingKey: SigningKey | null = await this.getSigningKeyById(key.keyId);
        if(!existingKey){
            throw new GraphQLError("ERROR_SIGNING_KEY_DOES_NOT_EXIST");
        }
        if(existingKey.status === SIGNING_KEY_STATUS_REVOKED){
            throw new GraphQLError("ERROR_CANNOT_UPDATE_A_REVOKED_KEY");
        }
        
        existingKey.keyName = key.keyName;
        existingKey.status = key.status;
        existingKey.expiresAtMs = key.expiresAtMs;
        await signingKeysDao.updateSigningKey(existingKey);
        return Promise.resolve(existingKey);

    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(keyId);
        if(signingKey){
            // Only return the public data. Viewing either the password for an encrypted
            // private key or a plain text private key requires special permissions.

            // A non-empty password means that an encrypted private key was supplied
            if(signingKey.password && signingKey.password !== ""){
                signingKey.password = ""
            }
            // else a plain text password was supplied.
            else{
                signingKey.privateKeyPkcs8 = ""
            }
        }
        return Promise.resolve(signingKey);        
    }
    

    public async deleteSigningKey(keyId: string): Promise<void> {
        await signingKeysDao.deleteSigningKey(keyId);
        
    }

}

export default SigningKeysService;