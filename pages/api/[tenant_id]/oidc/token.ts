import { Tenant, Client, DelegatedAuthenticationConstraint, ExternalOidcProvider, ExternalOidcAuthorizationRel, PreAuthenticationState, AuthorizationCodeData, ClientType } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import ExternalOIDCProviderDao from '@/lib/dao/external-oidc-provider-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { ErrorResponseBody } from '@/lib/models/error';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceClient from '@/lib/service/oidc-service-client';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, GRANT_TYPE_AUTHORIZATION_CODE, GRANT_TYPE_CLIENT_CREDENTIALS, GRANT_TYPE_REFRESH_TOKEN, GRANT_TYPES_SUPPORTED, OIDC_OPENID_SCOPE } from '@/utils/consts';
import { generateChallenge, generateCodeVerifierAndChallenge, generateRandomToken, getAuthDaoImpl, getClientDaoImpl, getExternalOIDCProvicerDaoImpl, getTenantDaoImpl } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'

const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();
const externalOIDCProviderDao: ExternalOIDCProviderDao = getExternalOIDCProvicerDaoImpl();
const authDao: AuthDao = getAuthDaoImpl();
const oidcServiceClient: OIDCServiceClient = new OIDCServiceClient();

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
    authHeader: string | null
}

const {
    AUTH_DOMAIN
} = process.env;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    const contentType: string | undefined = req.headers['content-type'];
    const method: string | undefined = req.method;
    if(!method || ! (method.toUpperCase() === "POST")){
        const error: ErrorResponseBody = {
            statusCode: 405,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_REQUEST_METHOD",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(405).json(error);
    }
    if(!contentType && ! (contentType?.toLocaleUpperCase() === "application/x-www-form-urlencoded")){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_CONTENT_TYPE",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }

    // read the tenant id from the query params in the request
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
        client_secret
    } = req.body;

    const authHeader: string | null = req.headers.authorization || null;

    console.log("tenant_id " + tenant_id as string);
    console.log("client_id: " + client_id as string);
    console.log("scope: " + scope as string);
    console.log("redirect_uri: " + redirect_uri as string);
    console.log("grant_type: " + grant_type as string);
    console.log("code_verifier: " + code_verifier as string);
    console.log("code: " + code as string);
    console.log("client_secret: " + client_secret as string);
    console.log("authorization header: " + authHeader);

    const tenantId = tenant_id as string;
    const clientId = client_id ? client_id as string : null;
    const clientSecret = client_secret ? client_secret as string : null;
    const refreshToken = refresh_token ? refresh_token as string : null;
    const oidcScope = scope ? scope as string : "";
    const redirectUri = redirect_uri ? redirect_uri as string : null;
    const grantType = grant_type ? grant_type as string : null;
    const codeVerifier = code_verifier ? code_verifier as string : null;
    const oidcCode = code ? code as string : "";
    
    if(!clientId || clientId === ""){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_ID",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }

    if(!grantType || grantType === "" || !GRANT_TYPES_SUPPORTED.includes(grantType)){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_OR_INVALID_GRANT_TYPE",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
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
        authHeader: authHeader !== null ? authHeader.replace(/^Bearer\s+/, ""): null,
        grantType,
        redirectUri,
        refreshToken,
        scope: oidcScope
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

    const d: AuthorizationCodeData | null = await authDao.getAuthorizationCodeData(tokenData.code || "");

    if(!d){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_BAD_AUTHORIZATION_CODE",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }

    if(d.tenantId !== tokenData.tenantId){

    }
    if(d.clientId !== tokenData.clientId){

    }
    if(d.redirectUri !== tokenData.redirectUri){

    }
    if(d.expiresAt !== ""){

    }
    if(d.scope !== tokenData.scope){

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
    if(d.codeChallenge){
        if(!tokenData.codeVerifier || "" === tokenData.codeVerifier){
            const error: ErrorResponseBody = {
                statusCode: 401,
                errorDetails: [{
                    errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CODE_VERIFIER",
                    errorMessageCanonical: "",
                    errorMessageTranslated: ""
                }]
            }
            return res.status(401).json(error);
        }
        const hashedVerifier = generateChallenge(tokenData.codeVerifier);
        if(hashedVerifier !== d.codeChallenge){
            const error: ErrorResponseBody = {
                statusCode: 401,
                errorDetails: [{
                    errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CODE_VERIFIER",
                    errorMessageCanonical: "",
                    errorMessageTranslated: ""
                }]
            }
            return res.status(401).json(error);
        }
    }
    else{
        if(tokenData.authHeader === null && tokenData.clientSecret === null){
            const error: ErrorResponseBody = {
                statusCode: 401,
                errorDetails: [{
                    errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_CREDENTIALS",
                    errorMessageCanonical: "",
                    errorMessageTranslated: ""
                }]
            }
            return res.status(401).json(error);
        }
        let credentialIsValid: boolean = false;
        if(tokenData.clientSecret){
            credentialIsValid = await clientDao.validateClientAuthCredentials(tokenData.clientId, tokenData.clientSecret || "");
        }
        else {
            credentialIsValid = await clientDao.validateClientAuthJwt(tokenData.authHeader || "");
        }
        if(!credentialIsValid){
            const error: ErrorResponseBody = {
                statusCode: 401,
                errorDetails: [{
                    errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CREDENTIALS",
                    errorMessageCanonical: "",
                    errorMessageTranslated: ""
                }]
            }
            return res.status(401).json(error);
        }
    }
    // TODO
    // Retrieve the user and issue the token response
}
async function handleRefreshTokenGrant(tokenData: TokenData, res: NextApiResponse){

}
async function handleClientCredentialsGrant(tokenData: TokenData, res: NextApiResponse){

    const tenant: Tenant | null = await tenantDao.getTenantById(tokenData.tenantId);
    if(!tenant || tenant.enabled !== true){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_TENANT",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }

    const client: Client | null = await clientDao.getClientById(tokenData.clientId);
    if(!client || client.enabled !== true || client.tenantId !== tenant.tenantId ){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }
    
    if(client.clientType === ClientType.UserDelegatedPermissionsOnly){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_TYPE_FOR_CLIENT_CREDENTIALS_GRANT",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }
    if(tokenData.authHeader === null && tokenData.clientSecret === null){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_MISSING_CLIENT_CREDENTIALS",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }
    let credentialIsValid: boolean = false;
    if(tokenData.clientSecret){
        credentialIsValid = await clientDao.validateClientAuthCredentials(tokenData.clientId, tokenData.clientSecret || "");
    }
    else {
        credentialIsValid = await clientDao.validateClientAuthJwt(tokenData.authHeader || "");
    }
    if(!credentialIsValid){
        const error: ErrorResponseBody = {
            statusCode: 401,
            errorDetails: [{
                errorKey: "ERROR_TOKEN_REQUEST_FAILED_WITH_INVALID_CLIENT_CREDENTIALS",
                errorMessageCanonical: "",
                errorMessageTranslated: ""
            }]
        }
        return res.status(401).json(error);
    }
    // TODO
    // Issue the JWT based on the client id


}
