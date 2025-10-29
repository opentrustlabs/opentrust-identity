import { User, Tenant, Client, SigningKey, ClientAuthHistory, PortalUserProfile, AuthorizationGroup, UserScopeRel, Scope, SystemSettings, ClientScopeRel, RefreshData } from "@/graphql/generated/graphql-types";
import { generateRandomToken, getDomainFromEmail } from "@/utils/dao-utils";
import ClientDao from "@/lib/dao/client-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import IdentityDao from "@/lib/dao/identity-dao";
import { OIDCTokenResponse } from "@/lib/models/token-response";
import { JWTPayload, SignJWT, JWTVerifyResult, jwtVerify, decodeJwt, decodeProtectedHeader, ProtectedHeaderParameters } from "jose";
import SigningKeysDao from "../dao/signing-keys-dao";
import { JWTPrincipal, MyUserProfile, ProfileAuthorizationGroup, ProfileScope } from "../models/principal";
import { randomUUID, createPrivateKey, PrivateKeyInput, KeyObject, createSecretKey, createPublicKey, PublicKeyInput } from "node:crypto"; 
import NodeCache from "node-cache";
import { CLIENT_SECRET_ENCODING, CLIENT_TYPE_DEVICE, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, KEY_USE_JWT_SIGNING, NAME_ORDER_WESTERN, PRINCIPAL_TYPE_ANONYMOUS_USER, PRINCIPAL_TYPE_END_USER, PRINCIPAL_TYPE_IAM_PORTAL_USER, PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN } from "@/utils/consts";
import { DaoFactory } from "../data-sources/dao-factory";
import ScopeDao from "../dao/scope-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import Kms from "../kms/kms";
import AuthDao from "../dao/auth-dao";
import { logWithDetails } from "../logging/logger";

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
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();

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
    });


    static PortalUserProfileCache = new NodeCache({
        stdTTL: 900, // 15 minutes
        useClones: false,
        checkperiod: 1800, 
    });

    /**
     * The MyUserProfile object is returned for external clients calling the /api/users/me endpoint
     * to get additional information about the user beyond what the OIDC user profile. This can be used
     * both for user-based JWTs and for client-based JWTs.
     * 
     * It is not to be confused with the PortalUserProfile object, which is similar. The PortalUserProfile
     * object is to be used for authorization for all IAM-based GraphQL calls and is not meant for external
     * consumption.
     * 
     * @param jwt 
     * @param includeScope 
     * @param includeAuthorizationGroups 
     * @returns 
     */
    public async getMyUserProfile(jwt: string, includeScope: boolean, includeAuthorizationGroups: boolean): Promise<MyUserProfile | null> {
        
        let principal: JWTPrincipal | null = null;
        const p = await this.validateJwt(jwt);
        if (p) {
            principal = p;
        }

        if(principal === null){
            return null;
        }
        
        let user: User | null = null;
        const client: Client | null = await clientDao.getClientById(principal.sub);
        if(client === null){
            return null;
        }
        let myUserProfile: MyUserProfile | null = null;
        if(principal.principal_type === PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN){
            
            const arrScopes = includeScope ? await this.getClientScopes(client.clientId) : [];
            const arrProfileScopes = arrScopes.map(
                (s: Scope) => {
                    const profileScope: ProfileScope = {
                        scopeDescription: s.scopeDescription,
                        scopeId: s.scopeId,
                        scopeName: s.scopeName
                    }
                    return profileScope
                }
            )
            myUserProfile = {
                domain: "",
                email: "",
                emailVerified: true,
                enabled: client.enabled,
                firstName: "",
                lastName: "",
                locked: false,
                nameOrder: "",
                scope: arrProfileScopes,
                tenantId: principal.tenant_id,
                tenantName: principal.tenant_name,
                userId: principal.sub,
                countryCode: principal.country_code,
                preferredLanguageCode: principal.language_code,
                clientId: principal.client_id,
                clientName: principal.client_name,
                authorizationGroups: [],
                address: null,
                federatedOIDCProviderSubjectId: null,
                middleName: null,
                phoneNumber: null,
                expiresAtMs: principal.exp * 1000,
                principalType: principal.principal_type,
                addressLine1: null,
                city: null,
                postalCode: null,
                stateRegionProvince: null
            }
        }
        else if(principal.principal_type === PRINCIPAL_TYPE_ANONYMOUS_USER){            
            const arrScopes = includeScope ? await this.getScopes(principal.sub, principal.tenant_id) : [];
            const arrProfileScopes = arrScopes.map(
                (s: Scope) => {
                    const profileScope: ProfileScope = {
                        scopeDescription: s.scopeDescription,
                        scopeId: s.scopeId,
                        scopeName: s.scopeName
                    }
                    return profileScope
                }
            )
            myUserProfile = {
                domain: "",
                email: "",
                emailVerified: false,
                enabled: true,
                firstName: "",
                lastName: "",
                locked: false,
                nameOrder: "",
                scope: arrProfileScopes,
                tenantId: principal.tenant_id,
                tenantName: principal.tenant_name,
                userId: principal.sub,
                countryCode: principal.country_code,
                preferredLanguageCode: principal.language_code,
                clientId: principal.client_id,
                clientName: principal.client_name,
                authorizationGroups: [],
                address: null,
                federatedOIDCProviderSubjectId: null,
                middleName: null,
                phoneNumber: null,
                expiresAtMs: principal.exp * 1000,
                principalType: principal.principal_type,
                addressLine1: null,
                city: null,
                postalCode: null,
                stateRegionProvince: null
            }
        }
        else{            
            user = await identityDao.getUserBy("id", principal.sub);
            if(user === null){
                return null;
            }
            
            const arrProfileScopes: Array<ProfileScope> = [];
            if(client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS || client.clientType === CLIENT_TYPE_DEVICE){
                const arrScopes = includeScope ? await this.getDelegatedScope(user, client, principal.tenant_id) : [];
                arrScopes.forEach(
                    (s: Scope) => {
                        const profileScope: ProfileScope = {
                            scopeDescription: s.scopeDescription,
                            scopeId: s.scopeId,
                            scopeName: s.scopeName
                        }
                        arrProfileScopes.push(profileScope);
                    }
                );
            }
            else{
                const arrScopes = includeScope ? await this.getScopes(user.userId, principal.tenant_id) : [];
                arrScopes.forEach(
                    (s: Scope) => {
                        const profileScope: ProfileScope = {
                            scopeDescription: s.scopeDescription,
                            scopeId: s.scopeId,
                            scopeName: s.scopeName
                        }
                        arrProfileScopes.push(profileScope);
                    }
                );
            }            

            const arrAuthzGroups: Array<AuthorizationGroup> = includeAuthorizationGroups ? await authorizationGroupDao.getUserAuthorizationGroups(user.userId) : [];
            const arrProfileAuthzGroups: Array<ProfileAuthorizationGroup> = arrAuthzGroups.map(
                (g: AuthorizationGroup) => {
                    const portalGroup: ProfileAuthorizationGroup = {
                        groupId: g.groupId,
                        groupName: g.groupName
                    }
                    return portalGroup;                    
                }
            );
            myUserProfile = {
                domain: getDomainFromEmail(principal.email),
                email: principal.email,
                emailVerified: principal.email_verified || false,
                enabled: true,
                firstName: principal.given_name,
                lastName: principal.family_name,
                locked: false,
                nameOrder: user.nameOrder,
                scope: arrProfileScopes,
                tenantId: principal.tenant_id,
                tenantName: principal.tenant_name,
                userId: principal.sub,
                countryCode: principal.country_code,
                preferredLanguageCode: principal.language_code,
                clientId: principal.client_id,
                clientName: principal.client_name,
                authorizationGroups: arrProfileAuthzGroups,
                address: user.address || null,
                federatedOIDCProviderSubjectId: user.federatedOIDCProviderSubjectId || null,
                middleName: user.middleName || null,
                phoneNumber: user.phoneNumber || null,
                expiresAtMs: principal.exp * 1000,
                principalType: principal.principal_type,
                addressLine1: user.addressLine1 || null,
                city: user.city || null,
                postalCode: user.postalCode || null,
                stateRegionProvince: user.stateRegionProvince || null
            }
        }            
        
        return myUserProfile;
        
    }

    /**
     * The PortalUserProfile object is for internal IAM use, not for external consumption like the MyUserProfile object.
     * A 
     * @param jwt 
     * @returns 
     */
    public async getPortalUserProfile(jwt: string): Promise<PortalUserProfile | null> {
        
        if(JwtServiceUtils.PortalUserProfileCache.has(jwt)){
            return JwtServiceUtils.PortalUserProfileCache.get(jwt) as PortalUserProfile;
        }

        let principal: JWTPrincipal | null = null;

        const p = await this.validateJwt(jwt);
        if (p) {
            principal = p;
        }
        if(principal === null){
            return null;
        }        
        
        let user: User | null = null;
        let client: Client | null = null;
        let profile: PortalUserProfile | null = null;
        if(principal.principal_type === PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN){
            client = await clientDao.getClientById(principal.sub);
            if(client === null || client.enabled === false || client.markForDelete === true){
                return null;
            }
            const arrScopes = await this.getClientScopes(client.clientId);            
            profile = {
                domain: "",
                email: "",
                emailVerified: true,
                enabled: true,
                firstName: "",
                lastName: "",
                locked: false,
                nameOrder: "",
                scope: arrScopes,
                tenantId: principal.tenant_id,
                tenantName: principal.tenant_name,
                userId: principal.sub,
                countryCode: principal.country_code,
                preferredLanguageCode: principal.language_code,
                managementAccessTenantId: principal.tenant_id,
                principalType: principal.principal_type,
                expiresAtMs: principal.exp * 1000,
                address: null,
                addressLine1: null,
                city: null,
                stateRegionProvince: null,
                postalCode: null
            }
        }
        else if(principal.principal_type === PRINCIPAL_TYPE_END_USER || principal.principal_type === PRINCIPAL_TYPE_IAM_PORTAL_USER){
            user = await identityDao.getUserBy("id", principal.sub);
            if(user === null || user.enabled === false || user.markForDelete === true){
                return null;
            }
            const arrScope: Array<Scope> = await this.getScopes(user.userId, principal.tenant_id);
            profile = {
                domain: getDomainFromEmail(principal.email),
                email: principal.email,
                emailVerified: principal.email_verified || false,
                enabled: true,
                firstName: principal.given_name,
                lastName: principal.family_name,
                locked: false,
                nameOrder: user.nameOrder,
                scope: arrScope,
                tenantId: principal.tenant_id,
                tenantName: principal.tenant_name,
                userId: principal.sub,
                countryCode: principal.country_code,
                preferredLanguageCode: principal.language_code,
                managementAccessTenantId: principal.principal_type === PRINCIPAL_TYPE_IAM_PORTAL_USER ? principal.tenant_id : null,
                principalType: principal.principal_type,
                expiresAtMs: principal.exp * 1000,
                address: user.address,
                addressLine1: user.addressLine1,
                city: user.city,
                federatedOIDCProviderSubjectId: user.federatedOIDCProviderSubjectId,
                middleName: user.middleName,
                phoneNumber: user.phoneNumber,
                postalCode: user.postalCode,
                stateRegionProvince: user.stateRegionProvince
            }
        } 
        JwtServiceUtils.PortalUserProfileCache.set(jwt, profile);
        return profile;
        
    }


    /**
     * Signs a JWT means for consumption within the IAM portal.
     * @param user 
     * @param tenant 
     * @param ttlInSeconds 
     * @returns 
     */
    public async signIAMPortalUserJwt(user: User, tenant: Tenant, ttlInSeconds: number, tokenType: string, client?: Client): Promise<{accessToken: string | null, principal: JWTPayload} | null> {
        const now = Date.now();
        const principal: JWTPayload = {
            sub: user.userId,
            iss: `${AUTH_DOMAIN}/api/${tenant.tenantId}`,
            aud: `${AUTH_DOMAIN}/api`,
            iat: Math.floor(now / 1000),
            exp: Math.floor( now / 1000 ) + ttlInSeconds,
            at_hash: "",
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            given_name: user.firstName,
            family_name: user.lastName,
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: user.phoneNumber,
            address: {
                formatted: "",
                street_address: user.address,
                locality: user.city,
                region: user.stateRegionProvince,
                postal_code: user.postalCode,
                country: user.countryCode
            },
            email: user.email,
            email_verified: user.emailVerified,
            country_code: user.countryCode,
            language_code: user.preferredLanguageCode,
            jti: randomUUID().toString(),
            tenant_id: tenant.tenantId,
            tenant_name: tenant.tenantName,
            client_id: client ? client.clientId : "",
            client_name: client ? client.clientName : "",
            client_type: client ? client.clientType : "",
            principal_type: tokenType
        };
        const s: string | null = await this.signJwt(principal);
        return Promise.resolve({accessToken: s, principal: principal});
    }

    /**
     * Signs a standard user JWT. 
     * @param user 
     * @param clientId 
     * @param tenantId 
     * @param scope 
     */
    public async signUserJwt(userId: string, clientId: string, tenantId: string): Promise<{oidcTokenResponse: OIDCTokenResponse, principal: JWTPayload} | null>{
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user || user.enabled === false || user.markForDelete === true || user.locked === true){
            return Promise.resolve(null);
        }
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client || client.enabled !== true || client.markForDelete === true){
            return Promise.resolve(null);
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant || tenant.enabled !== true || tenant.markForDelete === true){
            return Promise.resolve(null);
        }

        const now = Date.now();
        const principal: JWTPayload = {
            sub: user.userId,
            iss: `${AUTH_DOMAIN}/api/${tenantId}`,
            aud: client.clientId,
            iat: Math.floor(now / 1000),
            exp: client.userTokenTTLSeconds ? Math.floor( now / 1000 ) + client.userTokenTTLSeconds : Math.floor( now / 1000 ) + DEFAULT_END_USER_TOKEN_TTL_SECONDS,
            at_hash: "",
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            given_name: user.firstName,
            family_name: user.lastName,
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: user.phoneNumber,
            address: {
                formatted: "",
                street_address: user.address,
                locality: user.city,
                region: user.stateRegionProvince,
                postal_code: user.postalCode,
                country: user.countryCode
            },
            email: user.email,
            email_verified: user.emailVerified,
            country_code: user.countryCode,
            language_code: user.preferredLanguageCode,
            jti: randomUUID().toString(),
            tenant_id: tenantId,
            tenant_name: tenant.tenantName,
            client_id: clientId,
            client_name: client.clientName,
            client_type: client.clientType,
            principal_type: PRINCIPAL_TYPE_END_USER
        };

        const idToken: string | null = await this.signJwt(principal);
        if(idToken === null){
            return Promise.resolve(null);
        }
        let accessToken: string | null = null;
        if(client.audience !== null && client.audience !== ""){
            principal.aud = client.audience;
            accessToken = await this.signJwt(principal);
        }
        
        let generateRefreshToken: boolean = false;
        if(client.maxRefreshTokenCount === undefined || client.maxRefreshTokenCount === null){
            generateRefreshToken = true;
        }
        else if(client.maxRefreshTokenCount > 0){
            generateRefreshToken = true;
        }

        const oidcTokenResponse: OIDCTokenResponse = {
            access_token: accessToken !== null ? accessToken : idToken,
            token_type: "Bearer",
            refresh_token: generateRefreshToken ? generateRandomToken(32) : null,
            expires_in: client.userTokenTTLSeconds ? Math.floor( now / 1000 ) + client.userTokenTTLSeconds : Math.floor( now / 1000 ) + DEFAULT_END_USER_TOKEN_TTL_SECONDS,
            id_token: idToken
        }
        
        return Promise.resolve({oidcTokenResponse: oidcTokenResponse, principal: principal});
    }

    /**
     * Uses the root client id to generate a JWT which is then sent to any external 
     * service. The external service will be able to validate the JWT and get the
     * scope assigned to the client in order to check for permissions.
     * 
     * @returns 
     */
    public async getAuthTokenForOutboundCalls(): Promise<string | null>{
        const systemSettings: SystemSettings = await tenantDao.getSystemSettings();
        let authToken: string | null = null;
        if(systemSettings.rootClientId){      
            const client: Client | null = await clientDao.getClientById(systemSettings.rootClientId);            
            if(client !== null){
                const tenant: Tenant | null = await tenantDao.getRootTenant();
                if(tenant === null){
                    return null;
                }
                const tokenResponse = await this.signClientJwt(client, tenant);
                if(tokenResponse && tokenResponse.oidcTokenResponse){
                    authToken = tokenResponse.oidcTokenResponse.access_token;
                }
            }
        }
        return authToken;
    }

    /**
     * 
     * @param clientId  
     * @param tenantId 
     */
    public async signClientJwt(client: Client, tenant: Tenant): Promise<{oidcTokenResponse: OIDCTokenResponse, principal: JWTPayload} | null>{

        const now = Date.now();
        const principal: JWTPayload = {
            sub: client.clientId,
            iss: `${AUTH_DOMAIN}/api/${tenant.tenantId}`,
            aud: client.clientId,
            iat: Math.floor(now / 1000),
            exp: client.clientTokenTTLSeconds ? Math.floor( now / 1000 ) + client.clientTokenTTLSeconds : Math.floor( now / 1000 ) + DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
            at_hash: "",
            name: client.clientName,
            given_name: "",
            family_name: "",
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: "",
            address: null,
            updated_at: "",
            email: "",
            email_verified: true,
            country_code: "",
            language_code: "",
            jti: randomUUID().toString(),
            tenant_id: tenant.tenantId,
            tenant_name: tenant.tenantName,
            client_id: client.clientId,
            client_name: client.clientName,
            client_type: client.clientType,
            principal_type: PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN
        };
        
        const s: string | null = await this.signJwt(principal);
        if(s === null){
            return Promise.resolve(null);
        }

        const oidcTokenResponse: OIDCTokenResponse = {
            access_token: s,
            token_type: "Bearer",
            refresh_token: null,
            expires_in: client.clientTokenTTLSeconds ? Math.floor( now / 1000 ) + client.clientTokenTTLSeconds : Math.floor( now / 1000 ) + DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
            id_token: s
        }
        
        return Promise.resolve({oidcTokenResponse: oidcTokenResponse, principal: principal});
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
        let decryptedClientSecret: string | null = null;
        try{
            decryptedClientSecret = await kms.decrypt(client.clientSecret);
            if(!decryptedClientSecret){
                return Promise.resolve(false);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error validating client auth JWT. ${err.message}`, {...err});
            return Promise.resolve(false);
        }
        const secretKey: KeyObject = createSecretKey(decryptedClientSecret, CLIENT_SECRET_ENCODING);
        
        try{
            const p: JWTVerifyResult = await jwtVerify(jwt, secretKey, {});
            if(!p.payload){
                return Promise.resolve(false);
            }
            else{
                return Promise.resolve(true);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error validating client auth JWT. ${err.message}`, {...err});
            return Promise.resolve(false)
        }
    }

    /**
     * 
     * @param jwt 
     */
    public async validateJwt(jwt: string): Promise<JWTPrincipal | null> {

        // Always check the expiration value of the cached data too.
        const nowInSeconds = Date.now() / 1000;
        if(JwtServiceUtils.OIDCPrincipalCache.has(jwt)){
            const principal: JWTPrincipal = JwtServiceUtils.OIDCPrincipalCache.get(jwt) as JWTPrincipal;
            if(principal.exp < nowInSeconds){                
                return Promise.resolve(null);
            }
            else{
                return principal;
            }
        }

        try {
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

            const cachedSigningKeyData: CachedSigningKeyData | null = await this.getCachedSigningKey(keyId);
            if(!cachedSigningKeyData){
                return Promise.resolve(null);
            }
            const p: JWTVerifyResult = await jwtVerify(jwt, cachedSigningKeyData.publicKeyObject);
            if(!p.payload){                
                return Promise.resolve(null);
            }
            else{
                JwtServiceUtils.OIDCPrincipalCache.set(jwt, p.payload);
                return Promise.resolve(p.payload as unknown as JWTPrincipal);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error validating client auth JWT. ${err.message}`, {...err});
            return Promise.resolve(null);
        }        
    }

    public async validateJwtWithCertificate(jwt: string, publicKeyObject: KeyObject): Promise<JWTVerifyResult> {
        const p: JWTVerifyResult = await jwtVerify(jwt, publicKeyObject);
        return p;
    }


    /**
     * 
     * @param clientId 
     * @returns 
     */
    public async getClientScopes(clientId: string): Promise<Array<Scope>> {
        const arrRels: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(clientId);
        const scopeIds: Array<string> = arrRels.map(
            (r: ClientScopeRel) => r.scopeId
        );
        const arrScope: Array<Scope> = await scopeDao.getScope(undefined, Array.from(scopeIds));  
        return arrScope;
        
    }

    public async signJwtWithKey(principal: JWTPayload, privateKeyObject: KeyObject, keyId: string): Promise<string> {
        const s: string = await new SignJWT(principal)
            .setProtectedHeader({
                alg: "RS256",
                kid: keyId
            })
            .sign(privateKeyObject);

        return s;
    }

    /**
     * 
     * @param principal 
     * @returns 
     */
    public async signJwt(principal: JWTPayload): Promise<string | null> {

        const cachedSigningKeyData: CachedSigningKeyData | null = await this.getCachedSigningKey();        
        if(!cachedSigningKeyData){
            return Promise.resolve(null);
        }
        
        const s: string = await this.signJwtWithKey(principal, cachedSigningKeyData.privateKeyObject, cachedSigningKeyData.signingKey.keyId);
        return s;
    }

    public async hmacSignClient(clientId: string, clientSecret: string, tokenEndpoint: string): Promise<string> {
        const principal: JWTPayload = {
            iss: clientId,
            sub: clientId,
            aud: tokenEndpoint,
            exp: Math.floor(Date.now() / 1000) + (15 * 60),
            jti: randomUUID().toString()
        }
        
        
        const s: string = await new SignJWT(principal)
            .setProtectedHeader({
                alg: "HS256"
            })
            .setIssuedAt(Date.now() / 1000)
            .sign(new TextEncoder().encode(clientSecret));
        return s;
    }

 
    /**
     * Optional argument of key id. If signing a jwt, omit the key id argument and
     * this will return the first element in the list. 
     * @returns CachedSigningKeyData or null
     */
    protected async getCachedSigningKey(keyId?: string): Promise<CachedSigningKeyData | null> {

        let cachedSigningKey: CachedSigningKeyData | null = null;
        if(JwtServiceUtils.SigningKeyCache.has(SIGNING_KEY_ARRAY_CACHE_KEY)){
            const a: Array<CachedSigningKeyData> = JwtServiceUtils.SigningKeyCache.get(SIGNING_KEY_ARRAY_CACHE_KEY) as Array<CachedSigningKeyData>;
            if(a.length > 0){
                if(keyId){
                    if(JwtServiceUtils.SigningKeyCache.has(keyId)){
                        cachedSigningKey = JwtServiceUtils.SigningKeyCache.get(keyId) as CachedSigningKeyData;
                    }
                }
                else{
                    cachedSigningKey = a[0];
                }
            }
        }
        else{
            const rootTenant: Tenant | null = await tenantDao.getRootTenant();
            if(rootTenant === null){
                return null;
            }
            let signingKeys: Array<SigningKey> = await signingKeysDao.getSigningKeys(rootTenant.tenantId) || [];            
            const now = Date.now();
            
            // Filter out any keys that have expired and are not used for JWT signing and sort by expiration date descending.
            signingKeys = signingKeys
            .filter(
                (k: SigningKey) => k.expiresAtMs > now && k.keyUse === KEY_USE_JWT_SIGNING
            )
            .sort(
                (key1, key2) => key2.expiresAtMs - key1.expiresAtMs
            );            
            
            const cachedArray: Array<CachedSigningKeyData> = [];
            for(let i = 0; i < signingKeys.length; i++){
                const key: SigningKey = signingKeys[i];
                
                let passphrase: string | undefined = undefined;
                if(key.keyPassword){
                    passphrase = await kms.decrypt(key.keyPassword) || undefined;
                }
                const privateKeyInput: PrivateKeyInput = {
                    key: key.privateKeyPkcs8,
                    encoding: "utf-8",
                    format: "pem",
                    passphrase: passphrase
                };                    
                const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);

                const publicKeyInput: PublicKeyInput = {
                    key: key.keyCertificate ? key.keyCertificate : key.publicKey ? key.publicKey : "",
                    encoding: "utf-8",
                    format: "pem"
                };
                const publicKeyObject = createPublicKey(publicKeyInput);

                const cachedData: CachedSigningKeyData = {
                    signingKey: key,
                    privateKeyObject: privateKeyObject,
                    publicKeyObject: publicKeyObject
                };
                // Append to the list, and also set the key individually for lookup by the
                // key id
                cachedArray.push(cachedData);
                JwtServiceUtils.SigningKeyCache.set(key.keyId, cachedData);
            }
            
            JwtServiceUtils.SigningKeyCache.set(SIGNING_KEY_ARRAY_CACHE_KEY, cachedArray);
            if(cachedArray.length > 0){
                if(keyId){
                    if(JwtServiceUtils.SigningKeyCache.has(keyId)){
                        cachedSigningKey = JwtServiceUtils.SigningKeyCache.get(keyId) as CachedSigningKeyData;
                    }
                }
                else{
                    cachedSigningKey = cachedArray[0];
                }
            }
        }
        return Promise.resolve(cachedSigningKey);
    }

    protected async getDelegatedScope(user: User, client: Client, tenantId: string): Promise<Array<Scope>>{
        const arrRefreshData: Array<RefreshData> = await authDao.getRefreshDataByUserId(user.userId);
        const refreshData: RefreshData | undefined = arrRefreshData.find(
            (d: RefreshData) => d.userId === user.userId && d.clientId === client.clientId && d.tenantId === tenantId
        );
        
        const arrScope: Array<Scope> = [];
        if(refreshData){
            const arrScopeNames = refreshData.scope.split(",");            
            for(let i = 0; i < arrScopeNames.length; i++){
                const scope: Scope | null = await scopeDao.getScopeByScopeName(arrScopeNames[i]);
                if(scope){
                    arrScope.push(scope);
                }
            }
        }
        else{
            // If no refresh data is found, then this is a client which does not allow refresh tokens, so
            // take the client's delegated scope values.
            if(client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS || client.clientType === CLIENT_TYPE_DEVICE){
                const scopeRel = await scopeDao.getClientScopeRels(client.clientId);
                const ids = scopeRel.map( (rel: ClientScopeRel) => rel.scopeId);
                const scopes: Array<Scope> = await scopeDao.getScope(undefined, ids);
                scopes.forEach(
                    (s: Scope) => arrScope.push(s)
                )
            }            
        }
        return arrScope;
    }

    protected async getScopes(userId: string, tenantId: string): Promise<Array<Scope>> {
        const setScopeIds: Set<string> = new Set();

        const defaultAuthzGroups: Array<AuthorizationGroup> = await authorizationGroupDao.getDefaultAuthorizationGroups(tenantId);
        
        const arrAuthorizationGroups: Array<AuthorizationGroup> = await authorizationGroupDao.getUserAuthorizationGroups(userId);
        arrAuthorizationGroups.push(...defaultAuthzGroups);

        const arrAuthzGroupIds = arrAuthorizationGroups.map((g: AuthorizationGroup) => g.groupId);
        for(let i = 0; i < arrAuthzGroupIds.length; i++){
            const arrRels = await scopeDao.getAuthorizationGroupScopeRels(arrAuthzGroupIds[i]);
            for(let j = 0; j < arrRels.length; j++){
                setScopeIds.add(arrRels[j].scopeId);
            }
        }

        const userScopeRels: Array<UserScopeRel> = await scopeDao.getUserScopeRels(userId, tenantId);
        for(let i = 0; i < userScopeRels.length; i++){
            setScopeIds.add(userScopeRels[i].scopeId)
        }            
        const arrScope: Array<Scope> = await scopeDao.getScope(undefined, Array.from(setScopeIds));  
        return arrScope;
    }

    

}

export default JwtServiceUtils;
    