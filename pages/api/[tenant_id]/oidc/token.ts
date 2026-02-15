import { Tenant, Client, AuthorizationCodeData, RefreshData, AuthorizationDeviceCodeData, DeviceCodeAuthorizationStatus } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { OIDCErrorResponseBody } from '@/lib/models/error';
import ClientAuthValidationService from '@/lib/service/client-auth-validation-service';
import { CLIENT_TYPE_SERVICE_ACCOUNT, FAPI_CLIENT_CERTIFICATE_HEADER, FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER, GRANT_TYPE_AUTHORIZATION_CODE, GRANT_TYPE_CLIENT_CREDENTIALS, GRANT_TYPE_DEVICE_CODE, GRANT_TYPE_REFRESH_TOKEN, GRANT_TYPES_SUPPORTED, HTTP_HEADER_X_GEO_LOCATION, HTTP_HEADER_X_IP_ADDRESS, OIDC_TOKEN_ERROR_AUTHORIZATION_DECLINED, OIDC_TOKEN_ERROR_AUTHORIZATION_PENDING, OIDC_TOKEN_ERROR_BAD_VERIFICATION_CODE, OIDC_TOKEN_ERROR_EXPIRED_TOKEN, OIDC_TOKEN_ERROR_INVALID_CLIENT, OIDC_TOKEN_ERROR_INVALID_GRANT, OIDC_TOKEN_ERROR_INVALID_REQUEST, OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT, REFRESH_TOKEN_CLIENT_TYPE_DEVICE, REFRESH_TOKEN_CLIENT_TYPE_PKCE, REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT } from '@/utils/consts';
import { base64Decode, generateHash, getParsedFapiClientCertificate, ParsedClientCertificate } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import JwtService from '@/lib/service/jwt-service-utils';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import OIDCServiceUtils from '@/lib/service/oidc-service-utils';
import { SecurityEvent } from '@/lib/models/security-event';
import { OIDCUserInfoAddress } from '@/lib/models/principal';


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
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();


interface FapiTokenData {
    tenantId: string,
    clientId: string,
    scope: string | null,
    redirectUri: string,
    grantType: string,
    codeVerifier: string,
    code: string,
    traceId: string,
    refreshToken: string | null
}

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
    deviceCode: string | null,
    traceId: string
}



export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    const traceId: string = req.headers["x-trace-id"] ? req.headers["x-trace-id"] as string : randomUUID().toString();
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
    if(!contentType || contentType.toLowerCase() !== "application/x-www-form-urlencoded"){
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
        client_assertion_type,
        device_code
    } = req.body;

    // In case the client is sending in Basic auth credentials (jwt credentials
    // are sent in the client_assertion request body parameter)
    const authHeader: string | undefined = req.headers.authorization;
    let basicClientSecret: string | null = null;
    let basicClientId: string | null = null;
    if (authHeader) {
        const basicCredentials = authHeader.replace(/Basic\s+/, "");
        const decoded = base64Decode(basicCredentials);
        const credentials: Array<string> = decoded.split(":");
        if (credentials.length === 2) {
            basicClientId = credentials[0];
            basicClientSecret = credentials[1];
        }
    }

    const tenantId = tenant_id as string;
    const clientId = client_id ? client_id as string : basicClientId ? basicClientId : null;
    const clientSecret = client_secret ? client_secret as string : basicClientSecret ? basicClientSecret : null;
    const refreshToken = refresh_token ? refresh_token as string : null;
    const oidcScope = scope ? scope as string : "";
    const redirectUri = redirect_uri ? redirect_uri as string : null;
    const grantType = grant_type ? grant_type as string : null;
    const codeVerifier = code_verifier ? code_verifier as string : null;
    const oidcCode = code ? code as string : "";
    const clientAssertion = client_assertion ? client_assertion as string : null;
    const clientAssertionType = client_assertion_type ? client_assertion_type as string : null;
    const deviceCode = device_code ? device_code as string : null;


    // Extract FAPI client certificate headers
    const clientCertificate = req.headers[FAPI_CLIENT_CERTIFICATE_HEADER] ? req.headers[FAPI_CLIENT_CERTIFICATE_HEADER] as string : null;
    const clientCertificateVerify = req.headers[FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER] ? req.headers[FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER] as string : null;

    if (!grantType || grantType === "" || !GRANT_TYPES_SUPPORTED.includes(grantType)) {
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

    if (clientCertificate !== null && clientCertificateVerify !== null) {
        if(grantType === GRANT_TYPE_CLIENT_CREDENTIALS){
            return handleFapiClientCredentialsGrant(clientCertificate, clientCertificateVerify, traceId, res);
        }
        else if(grantType === GRANT_TYPE_AUTHORIZATION_CODE){
            const fapiTokenData: FapiTokenData = {
                tenantId,
                clientId: clientId || "",
                scope: oidcScope,
                redirectUri: redirectUri || "",
                grantType: grantType,
                codeVerifier: codeVerifier || "",
                code: oidcCode,
                traceId: traceId,
                refreshToken: null
            }
            return handleFapiAuthorizationCodeGrant(clientCertificate, clientCertificateVerify, req, res, fapiTokenData);
        }
        else if(grantType === GRANT_TYPE_REFRESH_TOKEN){
            const fapiTokenData: FapiTokenData = {
                tenantId,
                clientId: clientId || "",
                scope: oidcScope,
                redirectUri: redirectUri || "",
                grantType: grantType,
                codeVerifier: codeVerifier || "",
                code: oidcCode,
                traceId: traceId,
                refreshToken: refreshToken
            }
            return handleFapiRefreshTokenGrant(clientCertificate, clientCertificateVerify, res, fapiTokenData);
        }
    }
    else if (clientId !== null && clientId !== "") {
        // Handle the different types of grant types:
        // 1. Authorization code
        // 2. Refresh token
        // 3. Client credentials
        // 4. Device code
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
            deviceCode: deviceCode,
            traceId
        }

        if (grantType === GRANT_TYPE_AUTHORIZATION_CODE) {
            return handleAuthorizationCodeGrant(tokenData, req, res);
        }
        else if (grantType === GRANT_TYPE_REFRESH_TOKEN) {
            return handleRefreshTokenGrant(tokenData, res);
        }
        else if (grantType === GRANT_TYPE_CLIENT_CREDENTIALS) {
            return handleClientCredentialsGrant(tokenData, res)
        }
        else if (grantType === GRANT_TYPE_DEVICE_CODE) {
            return handleDeviceCodeGrant(tokenData, res);
        }
    }
    else {
        // For FAPI, the client is identified ONLY through their certificate, not
        // their client id. So if the certificate is null and the client id is null or empty
        // then fail
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000715",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

}

async function handleAuthorizationCodeGrant(tokenData: TokenData, req: NextApiRequest, res: NextApiResponse) {

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

    if(
        authorizationCodeData.tenantId !== tokenData.tenantId ||
        authorizationCodeData.clientId !== tokenData.clientId ||
        authorizationCodeData.redirectUri !== tokenData.redirectUri ||
        authorizationCodeData.expiresAtMs < Date.now() ||
        authorizationCodeData.scope !== tokenData.scope
    ){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    // Check to make sure that the client is NOT FAPI-enabled to prevent
    // downgrade attacks
    const client: Client | null = await clientDao.getClientById(tokenData.clientId);
    if(client === null || client.enabled !== true || client.markForDelete === true || client.fapiEnabled === true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
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
        const error: OIDCErrorResponseBody | null = validateCodeVerifier(authorizationCodeData.codeChallenge, tokenData.codeVerifier || "", tokenData.traceId);
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
    
    const response = await jwtService.signUserJwt(authorizationCodeData.userId, authorizationCodeData.clientId, authorizationCodeData.tenantId);        
    if(!response){
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

    if(response.oidcTokenResponse.refresh_token){
        const refreshData: RefreshData = {
            clientId: authorizationCodeData.clientId,
            refreshCount: 1,
            refreshToken: generateHash(response.oidcTokenResponse.refresh_token),
            refreshTokenClientType: authorizationCodeData.codeChallenge ? REFRESH_TOKEN_CLIENT_TYPE_PKCE : REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT,
            tenantId: authorizationCodeData.tenantId,
            userId: authorizationCodeData.userId,
            scope: authorizationCodeData.scope,
            redirecturi: authorizationCodeData.redirectUri,
            codeChallenge: authorizationCodeData.codeChallenge ? authorizationCodeData.codeChallenge : null,
            codeChallengeMethod: authorizationCodeData.codeChallengeMethod ? authorizationCodeData.codeChallengeMethod : null,
            expiresAtMs: Date.now() + (14 * 24 * 60 * 60 * 1000), // Allow 14 days before token automatically expires. TODO -> make this configurable in the client
            certificateThumbprint: null
        }
        await authDao.saveRefreshData(refreshData);
    };

    const ipAddress: string = req.headers[HTTP_HEADER_X_IP_ADDRESS] as string || "";
    const geoLocation: string = req.headers[HTTP_HEADER_X_GEO_LOCATION] as string || ""

    const authToken = await jwtService.getAuthTokenForOutboundCalls();
    const address: OIDCUserInfoAddress | null = response.principal.address ? response.principal.address as OIDCUserInfoAddress : null; 
    const securityEvent: SecurityEvent = {
        securityEventType: "auth_code_exchanged",
        userId: response.principal.sub || "unknown",
        email: response.principal.email as string || "unknown",
        phoneNumber: response.principal.phone_number as string || null,
        address: address ? address.street_address : null,
        city: address ? address.locality as string : null,
        stateRegionProvince: address ? address.region : null,
        countryCode: response.principal.country_code as string || null,
        postalCode: address ? address.postal_code  : null,
        jti: response.principal.jti || "",
        ipAddress: ipAddress,
        geoLocation: geoLocation,
        deviceFingerprint: ""
    }
    oidcServiceUtils.invokeSecurityEventCallback(securityEvent, authToken);

    return res.status(200).json(response.oidcTokenResponse);
   
    
}

function validateCodeVerifier(codeChallenge: string, codeVerifier: string, traceId: string): OIDCErrorResponseBody | null {
    
    // Validate the code challenge if it exists or validate the
    // client authentication using either client secret or signed jwt
    // Issue the token response
    //
    // The presence of the code challenge indicates that the client
    // cannot store a client_secret value securely and so uses the PKCE
    // extention for the auth and token endpoints. The client will have been
    // validated for the PKCE extension enablement in the authorization call
    // before getting to this point.
    
    if(!codeVerifier || "" === codeVerifier){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000718",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CODE_VERIFIER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId                
        }
        return error;
    }
    const hashedVerifier = generateHash(codeVerifier, "sha256", "base64url");
    if(hashedVerifier !== codeChallenge){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000719",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE_VERIFIER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
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
    if(refreshTokenData.expiresAtMs < Date.now()){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000738",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_EXPIRED_REFRESH_TOKEN",
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
    if(client.enabled !== true || client.markForDelete === true){
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
    if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT){        
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
    
    // Validate the client credentials if this is not a PKCE enabled refresh token or DEVICE token
    if(refreshTokenData.refreshTokenClientType === REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT){
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
    const response = await jwtService.signUserJwt(refreshTokenData.userId, refreshTokenData.clientId, refreshTokenData.tenantId);    
    if(!response){
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
    if(response.oidcTokenResponse.refresh_token){
        const newRefreshData: RefreshData = {
            clientId: refreshTokenData.clientId,
            refreshCount: refreshTokenData.refreshCount + 1,
            refreshToken: generateHash(response.oidcTokenResponse.refresh_token),
            refreshTokenClientType: refreshTokenData.refreshTokenClientType,
            tenantId: refreshTokenData.tenantId,
            userId: refreshTokenData.userId,
            scope: refreshTokenData.scope,
            redirecturi: refreshTokenData.redirecturi,
            codeChallenge: refreshTokenData.codeChallenge,
            codeChallengeMethod: refreshTokenData.codeChallengeMethod,
            expiresAtMs: Date.now() + (14 * 24 * 60 * 60 * 1000), // Allow 14 days before token automatically expires. TODO -> make this configurable in the client
            certificateThumbprint: null
        }
        await authDao.saveRefreshData(newRefreshData);
    };
    await authDao.deleteRefreshDataByRefreshToken(hashedRefreshToken);
    
    return res.status(200).json(response.oidcTokenResponse);

}

/**
 * 
 * @param tokenData 
 * @param res 
 * @returns 
 */
async function handleClientCredentialsGrant(tokenData: TokenData, res: NextApiResponse){

    const tenant: Tenant | null = await tenantDao.getTenantById(tokenData.tenantId);
    if(!tenant || tenant.enabled !== true || tenant.markForDelete === true){
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
    if(!client || client.enabled !== true || client.markForDelete === true || client.tenantId !== tenant.tenantId ){
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
    
    if(client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT){
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

    // For FAPI clients, their client is derived from the subject alternate names field in the client certificate
    // and must not be present in the request body or auth header or anywhere else.
    // To prevent downgrade attacks, do not let FAPI enabled clients obtain tokens without client certs
    if(client.fapiEnabled === true){
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
    
    const response = await jwtService.signClientJwt(client, tenant);
    if(!response){
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

    return res.status(200).json(response.oidcTokenResponse);

}

async function handleFapiRefreshTokenGrant(
        clientCertificate: string, 
        clientCertificateVerify: string, 
        res: NextApiResponse, 
        fapiTokenData: FapiTokenData
    )
{

    if(!fapiTokenData.refreshToken || fapiTokenData.refreshToken === ""){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000722",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_REFRESH_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    // FAPI: Parse and validate client certificate if provided    
    // Check that the certificate was successfully verified by the web server
    if(clientCertificateVerify !== "SUCCESS"){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000740",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CERTIFICATE_VERIFICATION",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    const parsedClientCertificate: ParsedClientCertificate = getParsedFapiClientCertificate(clientCertificate);
    if(parsedClientCertificate.error !== null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000743",
            error_description: parsedClientCertificate.errorDescription || "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_SAN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    
    const client: Client | null = await clientDao.getClientByFapiIdentifier(parsedClientCertificate.sanUri);
    if(client === null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000743",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_SAN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(client.clientId !== fapiTokenData.clientId || client.enabled !== true || client.markForDelete === true || client.fapiEnabled !== true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000733",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
    if(!tenant || tenant.enabled !== true || tenant.markForDelete === true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000732",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_TENANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    // We always store the refresh token by its hashed value so that anybody who has access
    // to the raw data would NOT be able to misuse them.
    const hashedRefreshToken: string = generateHash(fapiTokenData.refreshToken);
    const refreshTokenData: RefreshData | null = await authDao.getRefreshData(hashedRefreshToken);
    if(!refreshTokenData){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000723",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_REFRESH_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(refreshTokenData.expiresAtMs < Date.now()){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000738",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_EXPIRED_REFRESH_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(refreshTokenData.certificateThumbprint !== parsedClientCertificate.certificateThumbprint){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000738",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CERTIFICATE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
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
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    // This will rotate the refresh token. So we need to remove the old
    // one (based on its hash value) and save the new one (also based on
    // its hash value).
    const response = await jwtService.signUserJwt(refreshTokenData.userId, refreshTokenData.clientId, refreshTokenData.tenantId, parsedClientCertificate.certificateThumbprint);    
    if(!response){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000731",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_USER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(response.oidcTokenResponse.refresh_token){
        const newRefreshData: RefreshData = {
            clientId: refreshTokenData.clientId,
            refreshCount: refreshTokenData.refreshCount + 1,
            refreshToken: generateHash(response.oidcTokenResponse.refresh_token),
            refreshTokenClientType: refreshTokenData.refreshTokenClientType,
            tenantId: refreshTokenData.tenantId,
            userId: refreshTokenData.userId,
            scope: refreshTokenData.scope,
            redirecturi: refreshTokenData.redirecturi,
            codeChallenge: refreshTokenData.codeChallenge,
            codeChallengeMethod: refreshTokenData.codeChallengeMethod,
            expiresAtMs: Date.now() + (14 * 24 * 60 * 60 * 1000), // Allow 14 days before token automatically expires. TODO -> make this configurable in the client
            certificateThumbprint: refreshTokenData.certificateThumbprint
        }
        await authDao.saveRefreshData(newRefreshData);
    };
    await authDao.deleteRefreshDataByRefreshToken(hashedRefreshToken);


    
    return res.status(200).json(response.oidcTokenResponse);




}
async function handleFapiAuthorizationCodeGrant(
        clientCertificate: string, 
        clientCertificateVerify: string, 
        req: NextApiRequest, 
        res: NextApiResponse, 
        fapiTokenData: FapiTokenData    
    )
{

    // FAPI: Parse and validate client certificate if provided    
    // Check that the certificate was successfully verified by the web server
    if(clientCertificateVerify !== "SUCCESS"){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000740",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CERTIFICATE_VERIFICATION",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    const parsedClientCertificate: ParsedClientCertificate = getParsedFapiClientCertificate(clientCertificate);
    if(parsedClientCertificate.error !== null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000743",
            error_description: parsedClientCertificate.errorDescription || "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_SAN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    
    const client: Client | null = await clientDao.getClientByFapiIdentifier(parsedClientCertificate.sanUri);
    if(client === null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000743",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_SAN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(client.clientId !== fapiTokenData.clientId || client.enabled !== true || client.markForDelete === true || client.fapiEnabled !== true || client.tenantId !== fapiTokenData.tenantId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000733",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
    if(!tenant || tenant.enabled !== true || tenant.markForDelete === true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000732",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_TENANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    const authorizationCodeData: AuthorizationCodeData | null = await authDao.getAuthorizationCodeData(fapiTokenData.code || "");

    if(!authorizationCodeData){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_GRANT,
            error_code: "0000717",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_AUTHORIZATION_CODE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId       
        }
        return res.status(400).json(error);
    }
    // Delete the authorization code immediately so that it cannot be reused. No need to wait.
    authDao.deleteAuthorizationCodeData(fapiTokenData.code || "");

    if(
        authorizationCodeData.tenantId !== fapiTokenData.tenantId ||
        authorizationCodeData.clientId !== fapiTokenData.clientId ||
        authorizationCodeData.redirectUri !== fapiTokenData.redirectUri ||
        authorizationCodeData.expiresAtMs < Date.now() ||
        authorizationCodeData.scope !== fapiTokenData.scope
    ){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }
    if(authorizationCodeData.certificateThumbprint !== parsedClientCertificate.certificateThumbprint){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CERTIFICATE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    // PKCE is required for FAPI
    const codeVerificationValidationErrorResponse: OIDCErrorResponseBody | null = validateCodeVerifier(authorizationCodeData.codeChallenge || "", fapiTokenData.codeVerifier || "", fapiTokenData.traceId);
    if(codeVerificationValidationErrorResponse){
        return res.status(400).json(codeVerificationValidationErrorResponse);
    }

    const response = await jwtService.signUserJwt(
        authorizationCodeData.userId,
        authorizationCodeData.clientId,
        authorizationCodeData.tenantId,
        parsedClientCertificate.certificateThumbprint,
        authorizationCodeData.nonce || undefined
    );
    
    if(!response){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_USER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: fapiTokenData.traceId
        }
        return res.status(400).json(error);
    }

    if(response.oidcTokenResponse.refresh_token){
        const refreshData: RefreshData = {
            clientId: authorizationCodeData.clientId,
            refreshCount: 1,
            refreshToken: generateHash(response.oidcTokenResponse.refresh_token),
            refreshTokenClientType: authorizationCodeData.codeChallenge ? REFRESH_TOKEN_CLIENT_TYPE_PKCE : REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT,
            tenantId: authorizationCodeData.tenantId,
            userId: authorizationCodeData.userId,
            scope: authorizationCodeData.scope,
            redirecturi: authorizationCodeData.redirectUri,
            codeChallenge: authorizationCodeData.codeChallenge ? authorizationCodeData.codeChallenge : null,
            codeChallengeMethod: authorizationCodeData.codeChallengeMethod ? authorizationCodeData.codeChallengeMethod : null,
            expiresAtMs: Date.now() + (14 * 24 * 60 * 60 * 1000), // Allow 14 days before token automatically expires. TODO -> make this configurable in the client
            certificateThumbprint: parsedClientCertificate.certificateThumbprint
        }
        await authDao.saveRefreshData(refreshData);
    };

    const ipAddress: string = req.headers[HTTP_HEADER_X_IP_ADDRESS] as string || "";
    const geoLocation: string = req.headers[HTTP_HEADER_X_GEO_LOCATION] as string || ""

    const authToken = await jwtService.getAuthTokenForOutboundCalls();
    const address: OIDCUserInfoAddress | null = response.principal.address ? response.principal.address as OIDCUserInfoAddress : null; 
    const securityEvent: SecurityEvent = {
        securityEventType: "auth_code_exchanged",
        userId: response.principal.sub || "unknown",
        email: response.principal.email as string || "unknown",
        phoneNumber: response.principal.phone_number as string || null,
        address: address ? address.street_address : null,
        city: address ? address.locality as string : null,
        stateRegionProvince: address ? address.region : null,
        countryCode: response.principal.country_code as string || null,
        postalCode: address ? address.postal_code  : null,
        jti: response.principal.jti || "",
        ipAddress: ipAddress,
        geoLocation: geoLocation,
        deviceFingerprint: ""
    }
    oidcServiceUtils.invokeSecurityEventCallback(securityEvent, authToken);

    return res.status(200).json(response.oidcTokenResponse);

}

async function handleFapiClientCredentialsGrant(clientCertificate: string, clientCertificateVerify: string, traceId: string, res: NextApiResponse){
    
    // FAPI: Parse and validate client certificate if provided    
    // Check that the certificate was successfully verified by the web server
    if(clientCertificateVerify !== "SUCCESS"){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000740",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CERTIFICATE_VERIFICATION",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

    const parsedClientCertificate: ParsedClientCertificate = getParsedFapiClientCertificate(clientCertificate);
    if(parsedClientCertificate.error !== null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000743",
            error_description: parsedClientCertificate.errorDescription || "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_SAN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }
    
    const client: Client | null = await clientDao.getClientByFapiIdentifier(parsedClientCertificate.sanUri);
    if(client === null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000743",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_SAN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }
    if(client.enabled !== true || client.markForDelete === true || client.fapiEnabled !== true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000733",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

    const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
    if(!tenant || tenant.enabled !== true || tenant.markForDelete === true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000732",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_TENANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }
    
    const response = await jwtService.signClientJwt(client, tenant, parsedClientCertificate.certificateThumbprint);
    if(!response){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_FAILED_SIGNATURE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

    return res.status(200).json(response.oidcTokenResponse);
    
}

async function handleDeviceCodeGrant(tokenData: TokenData, res: NextApiResponse) {

    if(!tokenData.deviceCode){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    const hashedDeviceCode = generateHash(tokenData.deviceCode);
    const deviceCodeData: AuthorizationDeviceCodeData | null = await authDao.getAuthorizationDeviceCodeData(hashedDeviceCode, "devicecode");
    if(deviceCodeData === null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_BAD_VERIFICATION_CODE,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    if(tokenData.clientId !== deviceCodeData.clientId || tokenData.tenantId !== deviceCodeData.tenantId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    if(deviceCodeData.expiresAtMs < Date.now()){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_EXPIRED_TOKEN,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_EXPIRED_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }

    if(deviceCodeData.authorizationStatus === DeviceCodeAuthorizationStatus.Pending){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_AUTHORIZATION_PENDING,
            error_code: "0000721",
            error_description: "",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    else if(deviceCodeData.authorizationStatus === DeviceCodeAuthorizationStatus.Cancelled){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_AUTHORIZATION_DECLINED,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);
    }
    else if(deviceCodeData.authorizationStatus === DeviceCodeAuthorizationStatus.Approved){
        // Delete the device code data, regardless of whether any errors occur afterwards.
        await authDao.deleteAuthorizationDeviceCodeData(deviceCodeData.deviceCodeId);
        
        if(!deviceCodeData.userId){
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
                error_code: "0000721",
                error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_USER",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: tokenData.traceId
            }
            return res.status(400).json(error);
        }

        const response = await jwtService.signUserJwt(deviceCodeData.userId, deviceCodeData.clientId, deviceCodeData.tenantId);    
        if(!response){
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

        if(response.oidcTokenResponse.refresh_token){
            const refreshData: RefreshData = {
                clientId: deviceCodeData.clientId,
                refreshCount: 1,
                refreshToken: generateHash(response.oidcTokenResponse.refresh_token),
                refreshTokenClientType: REFRESH_TOKEN_CLIENT_TYPE_DEVICE,
                tenantId: deviceCodeData.tenantId,
                userId: deviceCodeData.userId || "",
                scope: deviceCodeData.scope,
                redirecturi: "",
                codeChallenge: null,
                codeChallengeMethod: null,
                expiresAtMs: Date.now() + (14 * 24 * 60 * 60 * 1000), // Allow 14 days before token automatically expires. TODO -> make this configurable in the client
                certificateThumbprint: null
            }
            await authDao.deleteAuthorizationDeviceCodeData(deviceCodeData.deviceCodeId);
            await authDao.saveRefreshData(refreshData);
        };

        return res.status(200).json(response.oidcTokenResponse);
    }
    else{        
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000721",
            error_description: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: tokenData.traceId
        }
        return res.status(400).json(error);        
    }
}
