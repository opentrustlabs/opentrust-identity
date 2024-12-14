import { User, Tenant, Client, SigningKey, NameOrder } from "@/graphql/generated/graphql-types";
import { getTenantDaoImpl, getClientDaoImpl, getIdentityDaoImpl, getSigningKeysDaoImpl, generateRandomToken } from "@/utils/dao-utils";
import ClientDao from "@/lib/dao/client-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import IdentityDao from "@/lib/dao/identity-dao";
import { OIDCTokenResponse } from "@/lib/models/token-response";
import { JWTPayload, SignJWT, JWK } from "jose";
import SigningKeysDao from "../dao/keys-dao";
import { TokenType } from "../models/principal";
import { randomUUID, createPrivateKey, PrivateKeyInput, KeyObject} from "node:crypto"; 
import NodeCache from "node-cache";
import { DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS } from "@/utils/consts";


interface CachedSigningKeyData {
    signingKey: SigningKey,
    keyObject: KeyObject
};

const SigningKeyCache = new NodeCache(
    {
        stdTTL: 43200, // 12 hours
        useClones: false,
        checkperiod: 1800, 
    }
);

const identityDao: IdentityDao = getIdentityDaoImpl();
const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();
const signingKeysDao: SigningKeysDao = getSigningKeysDaoImpl();

const {
    AUTH_DOMAIN
} = process.env;

class JwtService {

    /**
     * 
     * @param user 
     * @param clientId 
     * @param tenantId 
     * @param scope 
     */
    public async signUserJwt(userId: string, clientId: string, tenantId: string, scope: string): Promise<OIDCTokenResponse | null>{
        const user: User | null = await identityDao.getUserById(userId);
        if(!user){
            return Promise.resolve(null);
        }
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client || client.enabled !== true){
            return Promise.resolve(null);
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant || tenant.enabled !== true){
            return Promise.resolve(null);
        }

        const now = Date.now();
        const principal: JWTPayload = {
            sub: user.userId,
            iss: `${AUTH_DOMAIN}/api/${tenantId}`,
            aud: client.clientId,
            iat: now / 1000,
            exp: ( now / 1000 ) + client.userTokenTTLSeconds,
            at_hash: "",
            name: user.nameOrder === NameOrder.WesternNameOrder ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            given_name: user.firstName,
            family_name: user.lastName,
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: user.phoneNumber,
            address: user.address,
            updated_at: user.updatedDate,
            email: user.email,
            country_code: user.countryCode,
            language_code: user.preferredLanguageCode,
            jwt_id: randomUUID().toString(),
            tenant_id: tenantId,
            tenant_name: tenant.tenantName,
            client_id: clientId,
            client_name: client.clientName,
            client_type: client.clientType,
            token_type: TokenType.END_USER_TOKEN
        };

        const cachedSigningKeyData: CachedSigningKeyData | null = await this.getCachedSigningKey();
        if(!cachedSigningKeyData){
            return Promise.resolve(null);
        }
        
        const s: string = await new SignJWT(principal)
            .setJti("")
            .setProtectedHeader({
                alg: "RS256",
                kid: cachedSigningKeyData.signingKey.keyId
            })
            .sign(cachedSigningKeyData.keyObject);
        
        const oidcTokenResponse: OIDCTokenResponse = {
            access_token: s,
            token_type: "Bearer",
            refresh_token: client.maxRefreshTokenCount && client.maxRefreshTokenCount > 0 ? generateRandomToken(32) : null,
            expires_in: ( now / 1000 ) + client.userTokenTTLSeconds,
            id_token: s
        }
        
        return Promise.resolve(oidcTokenResponse);
    }

    /**
     * 
     * @param clientId  
     * @param tenantId 
     */
    public async signClientJwt(client: Client, tenant: Tenant): Promise<OIDCTokenResponse | null>{

        const now = Date.now();
        const principal: JWTPayload = {
            sub: client.clientId,
            iss: `${AUTH_DOMAIN}/api/${tenant.tenantId}`,
            aud: client.clientId,
            iat: now / 1000,
            exp: ( now / 1000 ) + DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
            at_hash: "",
            name: client.clientName,
            given_name: "",
            family_name: "",
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: "",
            address: "",
            updated_at: "",
            email: "",
            country_code: "",
            language_code: "",
            jwt_id: randomUUID().toString(),
            tenant_id: tenant.tenantId,
            tenant_name: tenant.tenantName,
            client_id: client.clientId,
            client_name: client.clientName,
            client_type: client.clientType,
            token_type: TokenType.SERVICE_ACCOUNT_TOKEN
        };

        const cachedSigningKeyData: CachedSigningKeyData | null = await this.getCachedSigningKey();
        if(!cachedSigningKeyData){
            return Promise.resolve(null);
        }
        
        const s: string = await new SignJWT(principal)
            .setJti("")
            .setProtectedHeader({
                alg: "RS256",
                kid: cachedSigningKeyData.signingKey.keyId
            })
            .sign(cachedSigningKeyData.keyObject);
        
        const oidcTokenResponse: OIDCTokenResponse = {
            access_token: s,
            token_type: "Bearer",
            refresh_token: client.maxRefreshTokenCount && client.maxRefreshTokenCount > 0 ? generateRandomToken(32) : null,
            expires_in: ( now / 1000 ) + DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
            id_token: s
        }
        
        return Promise.resolve(oidcTokenResponse);
    }



    /**
     * 
     * @returns 
     */
    protected async getCachedSigningKey(): Promise<CachedSigningKeyData | null> {
        
        if(SigningKeyCache.has("SIGNING_KEY_ARRAY")){
            const a: Array<CachedSigningKeyData> = SigningKeyCache.get("SIGNING_KEY_ARRAY") as Array<CachedSigningKeyData>;
            if(a.length > 0){
                return Promise.resolve(a[0]);
            }
            return Promise.resolve(null);
        }
        else{
            const rootTenant: Tenant = await tenantDao.getRootTenant();
            let signingKeys: Array<SigningKey> = await signingKeysDao.getSigningKeys(rootTenant.tenantId) || [];
            
            const now = Date.now();
            signingKeys = signingKeys.filter(
                (k: SigningKey) => k.expiresAtMs > now
            );

            let cachedArray = signingKeys.map(
                (key: SigningKey) => {
                    const privateKeyInput: PrivateKeyInput = {
                        key: key.privateKey,
                        encoding: "utf-8",
                        format: "pem",
                        passphrase: key.password || undefined
                    };
                    
                    const keyObject: KeyObject = createPrivateKey(privateKeyInput);
                    const cachedData: CachedSigningKeyData = {
                        signingKey: key,
                        keyObject: keyObject
                    };
                    return cachedData;
                }
            );
            // sort in descending order of expiration so we always use the newest keys for signing
            cachedArray = cachedArray.sort(
                (a: CachedSigningKeyData, b: CachedSigningKeyData) => {
                    return b.signingKey.expiresAtMs - a.signingKey.expiresAtMs;
                }
            )
            SigningKeyCache.set("SIGNING_KEY_ARRAY", cachedArray);
            if(cachedArray.length > 0){
                return Promise.resolve(cachedArray[0]);
            }
            else{
                return Promise.resolve(null);
            }
        }
                
    }

}

export default JwtService;