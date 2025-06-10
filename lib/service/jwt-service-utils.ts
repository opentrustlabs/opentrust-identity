import { User, Tenant, Client, SigningKey, ClientAuthHistory } from "@/graphql/generated/graphql-types";
import { generateRandomToken } from "@/utils/dao-utils";
import ClientDao from "@/lib/dao/client-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import IdentityDao from "@/lib/dao/identity-dao";
import { OIDCTokenResponse } from "@/lib/models/token-response";
import { JWTPayload, SignJWT, JWTVerifyResult, jwtVerify, decodeJwt, decodeProtectedHeader, ProtectedHeaderParameters } from "jose";
import SigningKeysDao from "../dao/signing-keys-dao";
import { OIDCPrincipal } from "../models/principal";
import { randomUUID, createPrivateKey, PrivateKeyInput, KeyObject, createSecretKey, createPublicKey, PublicKeyInput } from "node:crypto"; 
import NodeCache from "node-cache";
import { CLIENT_SECRET_ENCODING, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, NAME_ORDER_WESTERN, TOKEN_TYPE_END_USER_TOKEN, TOKEN_TYPE_SERVICE_ACCOUNT_TOKEN } from "@/utils/consts";
import { DaoFactory } from "../data-sources/dao-factory";

const SIGNING_KEY_ARRAY_CACHE_KEY = "SIGNING_KEY_ARRAY_CACHE_KEY"
interface CachedSigningKeyData {
    signingKey: SigningKey,
    privateKeyObject: KeyObject
    publicKeyObject: KeyObject
};


const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();

const {
    AUTH_DOMAIN
} = process.env;

class JwtServiceUtils {

    static SigningKeyCache = new NodeCache({
            stdTTL: 43200, // 12 hours
            useClones: false,
            checkperiod: 1800, 
        }
    );

    static OIDCPrincipalCache = new NodeCache({
        stdTTL: 900, // 15 minutes
        useClones: false,
        checkperiod: 1800, 
    })

    /**
     * 
     * @param user 
     * @param tenant 
     * @param ttlInSeconds 
     * @returns 
     */
    public async signIAMPortalUserJwt(user: User, tenant: Tenant, ttlInSeconds: number): Promise<string | null> {
        const now = Date.now();
        const principal: JWTPayload = {
            sub: user.userId,
            iss: `${AUTH_DOMAIN}/api/${tenant.tenantId}`,
            aud: `${AUTH_DOMAIN}/api`,
            iat: now / 1000,
            exp: ( now / 1000 ) + ttlInSeconds,
            at_hash: "",
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            given_name: user.firstName,
            family_name: user.lastName,
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: user.phoneNumber,
            address: user.address,
            updated_at: "", // TODO get the history of the updates to the user
            email: user.email,
            country_code: user.countryCode,
            language_code: user.preferredLanguageCode,
            jwt_id: randomUUID().toString(),
            tenant_id: tenant.tenantId,
            tenant_name: tenant.tenantName,
            client_id: "",
            client_name: "",
            client_type: "",
            token_type: TOKEN_TYPE_END_USER_TOKEN
        };
        const s: string | null = await this.signJwt(principal);
        return Promise.resolve(s);
    }

    /**
     * 
     * @param user 
     * @param clientId 
     * @param tenantId 
     * @param scope 
     */
    public async signUserJwt(userId: string, clientId: string, tenantId: string, scope: string): Promise<OIDCTokenResponse | null>{
        const user: User | null = await identityDao.getUserBy("id", userId);
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
            exp: client.userTokenTTLSeconds ? ( now / 1000 ) + client.userTokenTTLSeconds : ( now / 1000 ) + DEFAULT_END_USER_TOKEN_TTL_SECONDS,
            at_hash: "",
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            given_name: user.firstName,
            family_name: user.lastName,
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: user.phoneNumber,
            address: user.address,
            updated_at: "", // TODO get the history of the updates to the user
            email: user.email,
            country_code: user.countryCode,
            language_code: user.preferredLanguageCode,
            jwt_id: randomUUID().toString(),
            tenant_id: tenantId,
            tenant_name: tenant.tenantName,
            client_id: clientId,
            client_name: client.clientName,
            client_type: client.clientType,
            token_type: TOKEN_TYPE_END_USER_TOKEN
        };

        const s: string | null = await this.signJwt(principal);
        if(s === null){
            return Promise.resolve(null);
        }
        
        const oidcTokenResponse: OIDCTokenResponse = {
            access_token: s,
            token_type: "Bearer",
            refresh_token: client.maxRefreshTokenCount && client.maxRefreshTokenCount > 0 ? generateRandomToken(32) : null,
            expires_in: client.userTokenTTLSeconds ? ( now / 1000 ) + client.userTokenTTLSeconds : ( now / 1000 ) + DEFAULT_END_USER_TOKEN_TTL_SECONDS,
            id_token: s
        }
        
        return Promise.resolve(oidcTokenResponse);
    }


    protected async signJwt(principal: JWTPayload): Promise<string | null> {
        const cachedSigningKeyData: CachedSigningKeyData | null = await this.getCachedSigningKey();
        if(!cachedSigningKeyData){
            return Promise.resolve(null);
        }
        
        const s: string = await new SignJWT(principal)
            .setProtectedHeader({
                alg: "RS256",
                kid: cachedSigningKeyData.signingKey.keyId
            })
            .sign(cachedSigningKeyData.privateKeyObject);
        return s;
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
            exp: client.clientTokenTTLSeconds ? ( now / 1000 ) + client.clientTokenTTLSeconds : ( now / 1000 ) + DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
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
            token_type: TOKEN_TYPE_SERVICE_ACCOUNT_TOKEN
        };
        
        const s: string | null = await this.signJwt(principal);
        if(s === null){
            return Promise.resolve(null);
        }

        const oidcTokenResponse: OIDCTokenResponse = {
            access_token: s,
            token_type: "Bearer",
            refresh_token: null,
            expires_in: client.clientTokenTTLSeconds ? ( now / 1000 ) + client.clientTokenTTLSeconds : ( now / 1000 ) + DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
            id_token: s
        }
        
        return Promise.resolve(oidcTokenResponse);
    }


    /**
     * The only signing method allowed is HMAC SHA 256, not private keys. It also does
     * not support encrypted claims.
     * 
     * @param jwt 
     * @param clientId
     * @param tenantId
     * @returns 
     */
    public async validateClientAuthJwt(jwt: string, clientId: string, tenantId: string): Promise<boolean> {
        
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
        if(payload.sub !== clientId){
            return Promise.resolve(false);
        }

        const aud: string | string[] | undefined = payload.aud;
        if(!aud){
            return Promise.resolve(false);
        }
        // audience should match this authorization server's token endpoint, which in 
        // this case includes the tenant id
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
        
        // Check the expiration of the token
        if(!payload.exp){
            return Promise.resolve(false);
        }
        const nowInSeconds = Date.now() / 1000;
        if(payload.exp < nowInSeconds){
            return Promise.resolve(false);
        }

        // Does the client exist and does it belong to the tenant and is it
        // enabled?
        const client: Client | null = await clientDao.getClientById(payload.sub);
        if(!client){
            return Promise.resolve(false);
        }
        if(client.tenantId !== tenantId || client.enabled !== true){
            return Promise.resolve(false);
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
        if(!tenant || tenant.enabled !== true){
            return Promise.resolve(false);
        }

        // jti should be used only once, per the spec, to avoid replay attacks. But once 
        // the token is expired, should we remove it or face a continuous increase in
        // client auth history? Since we're also checking for expiration, it probably
        // is okay to remove once the token is expired
        const jti: string | undefined = payload.jti;
        if(!jti){
            return Promise.resolve(false);
        }
        const clientAuthHistory: ClientAuthHistory | null = await clientDao.getClientAuthHistoryByJti(jti);
        if(clientAuthHistory){
            return Promise.resolve(false);
        }
        // even if the token itself is not signed correctly, save the history of this jti to prevent replay
        clientDao.saveClientAuthHistory({jti, clientId: payload.sub, tenantId, expiresAtSeconds: payload.exp});
        const secretKey: KeyObject = createSecretKey(client.clientSecret, CLIENT_SECRET_ENCODING);
        
        try{
            const p: JWTVerifyResult = await jwtVerify(jwt, secretKey, {});
            if(!p.payload){
                return Promise.resolve(false);
            }
            else{
                return Promise.resolve(true);
            }
        }
        catch(error){
            return Promise.resolve(false)
        }
    }

    /**
     * 
     * @param jwt 
     */
    public async validateJwt(jwt: string): Promise<OIDCPrincipal | null> {

        // Always check the expiration value of the cached data too.
        const nowInSeconds = Date.now() / 1000;
        if(JwtServiceUtils.OIDCPrincipalCache.has(jwt)){
            const principal: OIDCPrincipal = JwtServiceUtils.OIDCPrincipalCache.get(jwt) as OIDCPrincipal;
            if(principal.exp < nowInSeconds){                
                return Promise.resolve(null);
            }
            else{
                return principal;
            }
        }
        
        const protectedHeader: ProtectedHeaderParameters = decodeProtectedHeader(jwt);
        const keyId = protectedHeader.kid;
        if(!keyId){
            return Promise.resolve(null);
        }
        if(!protectedHeader.alg || protectedHeader.alg !== "RS256"){
            return Promise.resolve(null);
        }
        const payload: JWTPayload = decodeJwt(jwt);
        
        if(!payload.exp || payload.exp < nowInSeconds){
            return Promise.resolve(null);
        }

        const cachedSigningKeyData: CachedSigningKeyData | null = await this.getCachedSigningKeyById(keyId);
        if(!cachedSigningKeyData){
            return Promise.resolve(null);
        }

        try {
            const p: JWTVerifyResult = await jwtVerify(jwt, cachedSigningKeyData.publicKeyObject)
            if(!p.payload){                
                return Promise.resolve(null);
            }
            else{
                JwtServiceUtils.OIDCPrincipalCache.set(jwt, p.payload);
                return Promise.resolve(p.payload as unknown as OIDCPrincipal);
            }
        }
        catch(error){
            return Promise.resolve(null);
        }

        
    }

    public async testJwtSign(jwtPayload: JWTPayload, pemPrivateKey: string, passphrase?: string): Promise<string> {

        const privateKeyInput: PrivateKeyInput = {
            key: pemPrivateKey,
            encoding: "utf-8",
            format: "pem",
            passphrase: passphrase ? passphrase : undefined
        };                    
        const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);

        const s: string = await new SignJWT(jwtPayload)
        .setProtectedHeader({
            alg: "RS256",
            kid: "1234567890"
        })
        .sign(privateKeyObject);
        return s;
    }

    public async testJwtVerifySignatureWithPublicKey(jwt: string, pemPublicKey: string): Promise<OIDCPrincipal | null>{

        const publicKeyInput: PublicKeyInput = {
            key: pemPublicKey,
            encoding: "utf-8",
            format: "pem",

        };
        const publicKeyObject = createPublicKey(publicKeyInput);
        try {
            const p: JWTVerifyResult = await jwtVerify(jwt, publicKeyObject)
            if(!p.payload){
                return Promise.resolve(null);
            }
            else{
                return Promise.resolve(p.payload as unknown as OIDCPrincipal);
            }
        }
        catch(error){
            console.log(error);
            return Promise.resolve(null);
        }
    }

    public async testJwtVerifySignatureWitCertificate(jwt: string, pemCertificate: string): Promise<OIDCPrincipal | null>{
        const publicKeyInput: PublicKeyInput = {
            key: pemCertificate,
            encoding: "utf-8",
            format: "pem"
        };
        const publicKeyObject = createPublicKey(publicKeyInput);
        try {
            const p: JWTVerifyResult = await jwtVerify(jwt, publicKeyObject)
            if(!p.payload){
                return Promise.resolve(null);
            }
            else{
                return Promise.resolve(p.payload as unknown as OIDCPrincipal);
            }
        }
        catch(error){
            return Promise.resolve(null);
        }
    }

    /**
     * 
     * @param keyId 
     * @returns 
     */
    protected async getCachedSigningKeyById(keyId: string): Promise<CachedSigningKeyData | null>{
        if(JwtServiceUtils.SigningKeyCache.has(keyId)){
            return Promise.resolve(JwtServiceUtils.SigningKeyCache.get(keyId) as CachedSigningKeyData);
        }
        else{
            const key: SigningKey | null = await signingKeysDao.getSigningKeyById(keyId);
            if(!key){
                return Promise.resolve(null);
            }
            const privateKeyInput: PrivateKeyInput = {
                key: key.privateKeyPkcs8,
                encoding: "utf-8",
                format: "pem",
                passphrase: key.password || undefined
            };                    
            const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);

            const publicKeyInput: PublicKeyInput = {
                key: key.certificate ? key.certificate : key.publicKey ? key.publicKey : "",
                encoding: "utf-8",
                format: "pem"
            };
            const publicKeyObject = createPublicKey(publicKeyInput);

            const cachedData: CachedSigningKeyData = {
                signingKey: key,
                privateKeyObject: privateKeyObject,
                publicKeyObject: publicKeyObject
            };
            JwtServiceUtils.SigningKeyCache.set(keyId, cachedData);
            return Promise.resolve(cachedData);
        }
    }

    /**
     * 
     * @returns 
     */
    protected async getCachedSigningKey(): Promise<CachedSigningKeyData | null> {
        
        if(JwtServiceUtils.SigningKeyCache.has(SIGNING_KEY_ARRAY_CACHE_KEY)){
            const a: Array<CachedSigningKeyData> = JwtServiceUtils.SigningKeyCache.get(SIGNING_KEY_ARRAY_CACHE_KEY) as Array<CachedSigningKeyData>;
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
                        key: key.privateKeyPkcs8,
                        encoding: "utf-8",
                        format: "pem",
                        passphrase: key.password || undefined
                    };                    
                    const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);

                    const publicKeyInput: PublicKeyInput = {
                        key: key.certificate ? key.certificate : key.publicKey ? key.publicKey : "",
                        encoding: "utf-8",
                        format: "pem"
                    };
                    const publicKeyObject = createPublicKey(publicKeyInput);

                    const cachedData: CachedSigningKeyData = {
                        signingKey: key,
                        privateKeyObject: privateKeyObject,
                        publicKeyObject: publicKeyObject
                    };
                    return cachedData;
                }
            );
            // sort in descending order of expiration so we always use the newest keys for signing
            cachedArray = cachedArray.sort(
                (a: CachedSigningKeyData, b: CachedSigningKeyData) => {
                    return b.signingKey.expiresAtMs - a.signingKey.expiresAtMs;
                }
            );

            JwtServiceUtils.SigningKeyCache.set(SIGNING_KEY_ARRAY_CACHE_KEY, cachedArray);
            if(cachedArray.length > 0){
                return Promise.resolve(cachedArray[0]);
            }
            else{
                return Promise.resolve(null);
            }
        }
                
    }

}

export default JwtServiceUtils;