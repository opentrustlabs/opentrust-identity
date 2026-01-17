import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import TenantDao from '@/lib/dao/tenant-dao';
import ClientDao from '@/lib/dao/client-dao';
import { Client, ClientScopeRel, Scope, Tenant } from '@/graphql/generated/graphql-types';
import {
    ALL_OIDC_SUPPORTED_SCOPE_VALUES,
    CLIENT_TYPE_USER_DELEGATED_PERMISSIONS,
    FAPI_CLIENT_CERTIFICATE_HEADER,
    FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER,
    OIDC_PAR_REQUEST_URI_PREFIX,
    OIDC_TOKEN_ERROR_INVALID_CLIENT
} from '@/utils/consts';
import { getParsedFapiClientCertificate, hasValidLoopbackRedirectUri, ParsedClientCertificate } from '@/utils/dao-utils';
import { OIDCErrorResponseBody } from '@/lib/models/error';
import { PushedAuthRequest } from '@/lib/entities/pushed-auth-request.entity';
import { logWithDetails } from '@/lib/logging/logger';
import AuthDao from '@/lib/dao/auth-dao';
import ScopeDao from '@/lib/dao/scope-dao';

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();


interface PARRequestBody {
    client_id?: string,
    response_type?: string,
    redirect_uri?: string,
    scope?: string,
    state?: string,
    nonce?: string,
    code_challenge?: string,
    code_challenge_method?: string,
    response_mode?: string    
}

interface PARSuccessResponse {
    request_uri: string;
    expires_in: number;
}

interface PARErrorResponse {
    error: string;
    error_description: string;
    error_code?: string;
}

const PAR_EXPIRY_SECONDS = 60; // RFC 9126 recommends 60 seconds

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PARSuccessResponse | PARErrorResponse>
) {
    const { tenant_id } = req.query;
    const tenantId = tenant_id as string;
    const traceId = randomUUID().toString();

    // PAR only accepts POST
    if (!req.method || req.method.toUpperCase() !== 'POST') {
        return res.status(405).json({
            error: 'invalid_request',
            error_description: 'Method not allowed. PAR endpoint only accepts POST requests.',
            error_code: '0000800'
        });
    }

    // Validate tenant exists and is enabled
    const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
    if (!tenant || tenant.enabled !== true || tenant.markForDelete === true) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Tenant not found or disabled',
            error_code: '0000801'
        });
    }

    // Extract request body parameters
    const {
        client_id,
        response_type,
        redirect_uri,
        scope,
        state,
        nonce,
        code_challenge,
        code_challenge_method,
        response_mode
    }: PARRequestBody = req.body;

    const clientId = client_id as string || null;
    const responseType = response_type as string;
    const redirectUri = redirect_uri as string;
    const oidcScope = scope as string;
    const oidcNonce = nonce as string;
    const codeChallenge = code_challenge as string;
    const codeChallengeMethod = code_challenge_method as string;
    const responseMode = response_mode as string;

    // Extract FAPI client certificate headers for mTLS client authentication
    const clientCertificate = req.headers[FAPI_CLIENT_CERTIFICATE_HEADER]
        ? req.headers[FAPI_CLIENT_CERTIFICATE_HEADER] as string
        : null;
    const clientCertificateVerify = req.headers[FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER]
        ? req.headers[FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER] as string
        : null;

    // Authenticate the client
    // FAPI supports two authentication methods for PAR:
    // 1. mTLS (tls_client_auth) - via certificate
    // 2. private_key_jwt - via client_assertion (not implemented)

    let client: Client | null = null;

    // Method 1: mTLS authentication
    if(!clientCertificate || !clientCertificateVerify){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000802",
            error_description: "Client certificate verification failed",
            timestamp: Date.now(),
            error_uri: "",
            trace_id: traceId
        }
        logWithDetails("error", "FAPI PAR: Invalid Client", {...error});
        return res.status(400).json(error);   
    }
    
    if (clientCertificateVerify !== 'SUCCESS') {            
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000802",
            error_description: "Client certificate verification failed",
            timestamp: Date.now(),
            error_uri: "",
            trace_id: traceId
        }
        logWithDetails("error", "FAPI PAR: Invalid Client", {...error});
        return res.status(400).json(error);            
    }

    if(!clientId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
            error_code: "0000812",
            error_description: "Missing client_id",
            timestamp: Date.now(),
            error_uri: "",
            trace_id: traceId
        }
        logWithDetails("error", "FAPI PAR: Missing Client ID", {...error});
    }
    
    const parsedClientCertificate: ParsedClientCertificate = getParsedFapiClientCertificate(clientCertificate);

    if(parsedClientCertificate.error !== null){
        return res.status(400).json({
            error: parsedClientCertificate.error,
            error_description: parsedClientCertificate.errorDescription || "",
            error_code: "000805"
        });
    }
    

    client = await clientDao.getClientByFapiIdentifier(parsedClientCertificate.sanUri);

    if (!client || client.enabled !== true || client.markForDelete === true) {
        return res.status(400).json({
            error: 'invalid_client',
            error_description: 'Client not found for certificate SAN:URI',
            error_code: '0000805'
        });
    }

    if (client.fapiEnabled !== true) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'PAR is only available for FAPI-enabled clients',
            error_code: '0000809'
        });
    }

    // Validate client belongs to the tenant
    if (client.tenantId !== tenantId) {
        return res.status(400).json({
            error: 'invalid_client',
            error_description: 'Client does not belong to this tenant',
            error_code: '0000810'
        });
    }

    // If client_id is provided in body, it must match the authenticated client
    if (clientId !== client.clientId) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'client_id in request does not match authenticated client',
            error_code: '0000811'
        });
    }   

    // Validate required authorization parameters
    if (!responseType) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'response_type is required',
            error_code: '0000813'
        });
    }

    // FAPI Advanced requires response_type=code
    if (responseType !== 'code') {
        return res.status(400).json({
            error: 'unsupported_response_type',
            error_description: 'Only response_type=code is supported for FAPI',
            error_code: '0000814'
        });
    }

    if (!redirectUri) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'redirect_uri is required',
            error_code: '0000815'
        });
    }

    
    const redirectUris = await clientDao.getRedirectURIs(client.clientId);
    if (!( redirectUris.includes(redirectUri) || hasValidLoopbackRedirectUri(redirectUris, redirectUri)) ) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'redirect_uri not registered for this client',
            error_code: '0000816'
        });
    }
    
    // FAPI requires state parameter
    if (!state) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'state parameter is required for FAPI',
            error_code: '0000817'
        });
    }

    // FAPI requires PKCE with S256
    if (!codeChallenge) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'code_challenge is required for FAPI',
            error_code: '0000818'
        });
    }

    if (codeChallengeMethod !== 'S256') {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'code_challenge_method must be S256 for FAPI',
            error_code: '0000819'
        });
    }

    // FAPI requires nonce when requesting ID tokens (scope includes openid)
    if (oidcScope && oidcScope.includes('openid') && !oidcNonce) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'nonce is required when requesting ID tokens',
            error_code: '0000820'
        });
    }
    
    // Although FAPI supports jwt, query.jwt, fragment.jwt, and form_post.jwt,
    // we will only use form_post.jwt. This will need to be made known to
    // any client that wants to use FAPI
    if (!responseMode || responseMode !== "form_post.jwt") {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Invalid response_mode for FAPI. Supported response_mode values are: form_post.jwt',
            error_code: '0000821'
        });
    }
    
    // The client needs to explicitly specify the scope values it wants. If any scope value is
    // not allowed based on what is configured with the client then error.
    // For Identity client types, we only care about the basic 4 OIDC scope.
    // For user-delegated-permission client types, these must be configured
    const scopeValues: Array<string> = oidcScope.split(/\s+/);
    const allSupportedScopeValues = [...ALL_OIDC_SUPPORTED_SCOPE_VALUES];

    // If this is a device client or a user delegated client, then add the delegated scope
    // values to the list of requested scopes so that we can carry this over to the refresh
    // data if this client allows refresh data
    if(client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS){
        const scopeRels: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(client.clientId);
        const ids = scopeRels.map((rel: ClientScopeRel) => rel.scopeId);
        const scopes: Array<Scope> = await scopeDao.getScope(undefined, ids);
        scopes.forEach(
            (s: Scope) => allSupportedScopeValues.push(s.scopeName)
        );
    }

    let invalidScopeFound: boolean = false;
    for(let i = 0; i < scopeValues.length; i++){
        if(!allSupportedScopeValues.includes(scopeValues[i])){
            invalidScopeFound = true;
            break;
        }
    }

    if(invalidScopeFound){
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Invalid scope requested',
            error_code: '0000821'
        });
    }
    

    // Generate request_uri (URN format as per RFC 9126)
    const requestUri = `${OIDC_PAR_REQUEST_URI_PREFIX}${randomUUID()}`;
    const expiresAtMs = Date.now() + (PAR_EXPIRY_SECONDS * 1000);

    // Create PAR record to store
    const parRecord: PushedAuthRequest = {
        requestUri,
        clientId: client.clientId,
        tenantId,
        responseType: responseType,
        redirectUri: redirectUri,
        scope: scope || "",
        nonce: oidcNonce || "",
        codeChallenge: codeChallenge,
        codeChallengeMethod: codeChallengeMethod,
        responseMode: responseMode,
        certificateThumbprint: parsedClientCertificate.certificateThumbprint,
        state: state,
        createdAtMs: Date.now(),
        expiresAtMs: expiresAtMs
    };

    await authDao.saveParData(parRecord);

    // Return success response
    return res.status(201).json({
        request_uri: requestUri,
        expires_in: PAR_EXPIRY_SECONDS
    });
}