import { Client, ClientAuthHistory, Tenant } from "@/graphql/generated/graphql-types";
import { decodeJwt, JWTPayload, jwtVerify, JWTVerifyResult } from "jose";
import TenantDao from "@/lib/dao/tenant-dao";
import ClientDao from "@/lib/dao/client-dao";
import { getClientDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import { createSecretKey } from "node:crypto";
import { CLIENT_SECRET_ENCODING } from "@/utils/consts";

const {
    AUTH_DOMAIN
} = process.env;

const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();

class JwtService {


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
        const secretKey = createSecretKey(client.clientSecret, CLIENT_SECRET_ENCODING);
        
        const p: JWTVerifyResult = await jwtVerify(jwt, secretKey, {});
        if(!p.payload){
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }


}

export default JwtService;