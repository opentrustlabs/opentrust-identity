import { Tenant, Client, AuthorizationCodeData, RefreshData } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { OIDCErrorResponseBody } from '@/lib/models/error';
import ClientAuthValidationService from '@/lib/service/client-auth-validation-service';
import { CLIENT_TYPE_SERVICE_ACCOUNT_ONLY, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY, GRANT_TYPE_AUTHORIZATION_CODE, GRANT_TYPE_CLIENT_CREDENTIALS, GRANT_TYPE_REFRESH_TOKEN, GRANT_TYPES_SUPPORTED, OIDC_TOKEN_ERROR_INVALID_CLIENT, OIDC_TOKEN_ERROR_INVALID_GRANT, OIDC_TOKEN_ERROR_INVALID_REQUEST, OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT, OidcTokenErrorType, REFRESH_TOKEN_CLIENT_TYPE_PKCE, REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT } from '@/utils/consts';
import { generateHash } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'; 
import JwtService from '@/lib/service/jwt-service-utils';
import { OIDCTokenResponse } from '@/lib/models/token-response';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { validate } from 'graphql';
import RefreshDataEntity from '@/lib/entities/refresh-data-entity';


// TODO 
// Add an error URL using this auth domain -> should be a UI component displaying a 
// human-friendly message and UI.
// const {
//     AUTH_DOMAIN
// } = process.env;

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const clientAuthValidationService: ClientAuthValidationService = new ClientAuthValidationService();
const jwtService: JwtService = new JwtService();

interface TokenData {
    tenantId: string,
    clientId: string,
    scope: string | null,
    redirectUri: string | null,
    grantType: string,
    codeVerifier: string | null,
    code: string | null,
    refreshToken: string | null,
    clientSecret: string | null,
    clientAssertion: string | null,
    clientAssertionType: string | null,
    traceId: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    let traceId: string = req.headers["x-trace-id"] ? req.headers["x-trace-id"] as string : randomUUID.toString();
    const contentType: string | undefined = req.headers['content-type'];
    const method: string | undefined = req.method;
    if(!method || ! (method.toUpperCase() === "POST")){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000713",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_REQUEST_METHOD",
            timestamp: Date.now(),
            error_uri: "",
            trace_id: traceId
        }
        return res.status(405).json(error);
    }
    if(!contentType && ! (contentType?.toLocaleUpperCase() === "application/x-www-form-urlencoded")){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000714",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_CONTENT_TYPE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

    // read the tenant id from the query params (in this case, the path params) in the request
    const {
		tenant_id
    } = req.query;

    // Read the form post contents, auto-magically parsed by nextjs
    const {
        client_id,
        scope,
        redirect_uri,
        grant_type,
        code_verifier,
        code,
        refresh_token,
        client_secret,
        client_assertion,
        client_assertion_type
    } = req.body;

    const tenantId = tenant_id as string;
    const clientId = client_id ? client_id as string : null;
    const clientSecret = client_secret ? client_secret as string : null;
    const refreshToken = refresh_token ? refresh_token as string : null;
    const oidcScope = scope ? scope as string : "";
    const redirectUri = redirect_uri ? redirect_uri as string : null;
    const grantType = grant_type ? grant_type as string : null;
    const codeVerifier = code_verifier ? code_verifier as string : null;
    const oidcCode = code ? code as string : "";
    const clientAssertion = client_assertion ? client_assertion as string : null;
    const clientAssertionType = client_assertion_type ? client_assertion_type as string : null;

    if(!clientId || clientId === ""){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000715",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_ID",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId            
        }
        return res.status(400).json(error);
    }

    if(!grantType || grantType === "" || !GRANT_TYPES_SUPPORTED.includes(grantType)){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_GRANT,
            error_code: "0000716",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_OR_INVALID_GRANT_TYPE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

    // Handle the different types of grant types:
    // 1. Authorization code
    // 2. Refresh token
    // 3. Client credentials
    const tokenData: TokenData = {
        tenantId,
        clientId,
        clientSecret,
        code: oidcCode,
        codeVerifier,
        clientAssertion,
        grantType,
        redirectUri,
        refreshToken,
        scope: oidcScope,
        clientAssertionType,
        traceId
    }

    if(grantType === GRANT_TYPE_AUTHORIZATION_CODE){
        return handleAuthorizationCodeGrant(tokenData, res);
    }
    else if(grantType === GRANT_TYPE_REFRESH_TOKEN){
        return handleRefreshTokenGrant(tokenData, res);
    }
    else if(grantType === GRANT_TYPE_CLIENT_CREDENTIALS){
        return handleClientCredentialsGrant(tokenData, res)
    }

    //return res.status(200).json({message: "everything ok here"});

}

async function handleAuthorizationCodeGrant(tokenData: TokenData, res: NextApiResponse) {

    const authorizationCodeData: AuthorizationCodeData | null = await authDao.getAuthorizationCodeData(tokenData.code || "");

    if(!authorizationCodeData){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_GRANT,
            error_code: "0000717",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_AUTHORIZATION_CODE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId       
        }
        return res.status(400).json(error);
    }
    // Delete the authorization code immediately so that it cannot be reused. No need to wait.
    authDao.deleteAuthorizationCodeData(tokenData.code || "");

    if(authorizationCodeData.tenantId !== tokenData.tenantId){

    }
    if(authorizationCodeData.clientId !== tokenData.clientId){

    }
    if(authorizationCodeData.redirectUri !== tokenData.redirectUri){

    }
    if(authorizationCodeData.expiresAtMs < Date.now()){

    }
    if(authorizationCodeData.scope !== tokenData.scope){

    }


    // Validate the code challenge if it exists or validate the
    // client authentication using either client secret or signed jwt
    // Issue the token response
    //
    // The presence of the code challenge indicates that the client
    // cannot store a client_secret value securely and so uses the PKCE
    // extention for the auth and token endpoints. The client will have been
    // validated for the PKCE extension enablement in the authorization call
    // before getting to this point.
    if(authorizationCodeData.codeChallenge){
        const error: OIDCErrorResponseBody | null = validateCodeVerifier(authorizationCodeData.codeChallenge, tokenData);
        if(error){
            return res.status(400).json(error);
        }        
    }
    else{
        if(tokenData.clientAssertion === null && tokenData.clientSecret === null){
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
                error_code: "0000720",
                error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_CREDENTIALS",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: tokenData.traceId
            }
            return res.status(400).json(error);
        }
        let credentialIsValid: boolean = false;
        if(tokenData.clientSecret){
            credentialIsValid = await clientAuthValidationService.validateClientAuthCredentials(tokenData.clientId, tokenData.clientSecret || "");
        }
        else {
            credentialIsValid = await jwtService.validateClientAuthJwt(tokenData.clientAssertion || "", tokenData.clientId, tokenData.tenantId);
        }
        if(!credentialIsValid){
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
                error_code: "0000720",
                error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CREDENTIALS",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: tokenData.traceId
            }
            return res.status(400).json(error);
        }
    }
    
    const oidcTokenResponse: OIDCTokenResponse | null = await jwtService.signUserJwt(authorizationCodeData.userId, authorizationCodeData.clientId, authorizationCodeData.tenantId, authorizationCodeData.scope);
    
    if(!oidcTokenResponse){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_USER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    if(oidcTokenResponse.refresh_token){
        const refreshData: RefreshData = {
            clientId: authorizationCodeData.clientId,
            refreshCount: 1,
            refreshToken: generateHash(oidcTokenResponse.refresh_token),
            refreshTokenClientType: authorizationCodeData.codeChallenge ? REFRESH_TOKEN_CLIENT_TYPE_PKCE : REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT,
            tenantId: authorizationCodeData.tenantId,
            userId: authorizationCodeData.userId,
            scope: authorizationCodeData.scope,
            redirecturi: authorizationCodeData.redirectUri,
            codeChallenge: authorizationCodeData.codeChallenge ? authorizationCodeData.codeChallenge : null,
            codeChallengeMethod: authorizationCodeData.codeChallengeMethod ? authorizationCodeData.codeChallengeMethod : null
        }
        await authDao.saveRefreshData(refreshData);
    };

    return res.status(200).json(oidcTokenResponse);
    
}

function validateCodeVerifier(codeChallenge: string, tokenData: TokenData): OIDCErrorResponseBody | null {
    
    // Validate the code challenge if it exists or validate the
    // client authentication using either client secret or signed jwt
    // Issue the token response
    //
    // The presence of the code challenge indicates that the client
    // cannot store a client_secret value securely and so uses the PKCE
    // extention for the auth and token endpoints. The client will have been
    // validated for the PKCE extension enablement in the authorization call
    // before getting to this point.
    
    if(!tokenData.codeVerifier || "" === tokenData.codeVerifier){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000718",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CODE_VERIFIER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId                
        }
        return error;
    }
    const hashedVerifier = generateHash(tokenData.codeVerifier, "sha256", "base64url");
    if(hashedVerifier !== codeChallenge){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000719",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE_VERIFIER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return error;
    }
    return null;
}


/**
 * 
 * @param tokenData 
 * @param res 
 * @returns 
 */
async function handleRefreshTokenGrant(tokenData: TokenData, res: NextApiResponse){

    if(!tokenData.refreshToken){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000722",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_REFRESH_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    // We always store the refresh token by its hashed value so that anybody who has access
    // to the raw data would NOT be able to misuse them.
    const hashedRefreshToken: string = generateHash(tokenData.refreshToken);
    const refreshTokenData: RefreshData | null = await authDao.getRefreshData(hashedRefreshToken);
    if(!refreshTokenData){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000723",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_REFRESH_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    const client: Client | null = await clientDao.getClientById(refreshTokenData.clientId);
    if(!client){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000724",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(client.enabled !== true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000725",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(client.tenantId !== tokenData.tenantId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000726",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_TENANT_AND_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT_ONLY){        
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000727",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_TYPE_FOR_REFRESH_TOKEN_GRANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    
    // Validate the client credentials if this is not a PKCE enabled refresh token
    if(refreshTokenData.refreshTokenClientType !== REFRESH_TOKEN_CLIENT_TYPE_PKCE){
        if(tokenData.clientAssertion === null && tokenData.clientSecret === null){
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
                error_code: "0000728",
                error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_CREDENTIALS",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: tokenData.traceId
            }
            return res.status(400).json(error);
        }
        let credentialIsValid: boolean = false;
        if(tokenData.clientSecret){
            credentialIsValid = await clientAuthValidationService.validateClientAuthCredentials(tokenData.clientId, tokenData.clientSecret || "");
        }
        else {
            credentialIsValid = await jwtService.validateClientAuthJwt(tokenData.clientAssertion || "", tokenData.clientId, tokenData.tenantId);
        }
        if(!credentialIsValid){
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
                error_code: "0000729",
                error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CREDENTIALS",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: tokenData.traceId
            }
            return res.status(400).json(error);
        }
    }
    // Otherwise validate the original code challenge against the verifier. For PKCE we always
    // want to require the verifier, but it is a good idea to limit the number of refresh
    // tokens issued.
    else if(refreshTokenData.refreshTokenClientType === REFRESH_TOKEN_CLIENT_TYPE_PKCE){
        const error: OIDCErrorResponseBody | null = validateCodeVerifier(tokenData.codeVerifier || "", tokenData);
        if(error){
            return res.status(400).json(error);
        }
    }

    // Finally, have we maxed out the number of refresh tokens that can be issued?
    if(client.maxRefreshTokenCount && refreshTokenData.refreshCount > client.maxRefreshTokenCount){

        // Delete the refresh token ONLY in this error case, since in the others
        // there is still a possibility that the client was malicious or misconfigured
        // and so we should maintain the refresh token in the meantime.
        authDao.deleteRefreshDataByRefreshToken(hashedRefreshToken);
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000730",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MAXIMUM_REFRESH_COUNT_REACHED",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    // This will rotate the refresh token. So we need to remove the old
    // one (based on its hash value) and save the new one (also based on
    // its hash value).
    const oidcTokenResponse: OIDCTokenResponse | null = await jwtService.signUserJwt(refreshTokenData.userId, refreshTokenData.clientId, refreshTokenData.tenantId, refreshTokenData.scope);
    if(!oidcTokenResponse){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000731",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_USER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(oidcTokenResponse.refresh_token){
        const newRefreshData: RefreshData = {
            clientId: refreshTokenData.clientId,
            refreshCount: refreshTokenData.refreshCount + 1,
            refreshToken: generateHash(oidcTokenResponse.refresh_token),
            refreshTokenClientType: refreshTokenData.refreshTokenClientType,
            tenantId: refreshTokenData.tenantId,
            userId: refreshTokenData.userId,
            scope: refreshTokenData.scope,
            redirecturi: refreshTokenData.redirecturi,
            codeChallenge: refreshTokenData.codeChallenge,
            codeChallengeMethod: refreshTokenData.codeChallengeMethod
        }
        await authDao.saveRefreshData(newRefreshData);
    };
    await authDao.deleteRefreshDataByRefreshToken(hashedRefreshToken);
    
    return res.status(200).json(oidcTokenResponse);

}
async function handleClientCredentialsGrant(tokenData: TokenData, res: NextApiResponse){

    const tenant: Tenant | null = await tenantDao.getTenantById(tokenData.tenantId);
    if(!tenant || tenant.enabled !== true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000732",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_TENANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    const client: Client | null = await clientDao.getClientById(tokenData.clientId);
    if(!client || client.enabled !== true || client.tenantId !== tenant.tenantId ){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000733",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    
    if(client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000734",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_TYPE_FOR_CLIENT_CREDENTIALS_GRANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(tokenData.clientAssertion === null && tokenData.clientSecret === null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000735",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_CREDENTIALS",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    let credentialIsValid: boolean = false;
    if(tokenData.clientSecret){
        credentialIsValid = await clientAuthValidationService.validateClientAuthCredentials(tokenData.clientId, tokenData.clientSecret || "");
    }
    else {
        credentialIsValid = await jwtService.validateClientAuthJwt(tokenData.clientAssertion || "", tokenData.clientId, tokenData.tenantId);
    }
    if(!credentialIsValid){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000736",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CREDENTIALS",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    
    const oidcTokenResponse: OIDCTokenResponse | null = await jwtService.signClientJwt(client, tenant);
    if(!oidcTokenResponse){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000737",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    return res.status(200).json(oidcTokenResponse);

}
