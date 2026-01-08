import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID, X509Certificate } from 'crypto';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import TenantDao from '@/lib/dao/tenant-dao';
import ClientDao from '@/lib/dao/client-dao';
import { Client, Tenant } from '@/graphql/generated/graphql-types';
import {
    FAPI_CLIENT_CERTIFICATE_HEADER,
    FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER,
    OIDC_AUTHORIZATION_ERROR_UNAUTHORIZED_CLIENT,
    OIDC_TOKEN_ERROR_INVALID_CLIENT
} from '@/utils/consts';
import { generateHash } from '@/utils/dao-utils';
import { OIDCErrorResponseBody } from '@/lib/models/error';

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();

// TODO: Add AuthDao or PARDao method for storing PAR requests
// const parDao = DaoFactory.getInstance().getParDao();

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
    // 2. private_key_jwt - via client_assertion (not implemented in this stub)

    let client: Client | null = null;
    let authenticatedClientId: string | null = null;
    let certificateThumbprint: string | null = null;

    // Method 1: mTLS authentication
    if (clientCertificate && clientCertificateVerify) {
        if (clientCertificateVerify !== 'SUCCESS') {            
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_CLIENT,
                error_code: "0000802",
                error_description: "Client certificate verification failed",
                timestamp: Date.now(),
                error_uri: "",
                trace_id: traceId
            }
            return res.status(400).json(error);            
        }

        try {
            const certPem: string = decodeURIComponent(clientCertificate);
            const cert = new X509Certificate(certPem);

            // Extract SAN:URI for FAPI client identification
            const sanExtension = cert.subjectAltName;
            if (!sanExtension) {
                return res.status(400).json({
                    error: 'invalid_client',
                    error_description: 'Client certificate missing SAN extension',
                    error_code: '0000803'
                });
            }

            const sanEntries = sanExtension.split(', ');
            const uriEntries = sanEntries.filter(entry => entry.startsWith('URI:'));

            if (uriEntries.length !== 1) {
                return res.status(400).json({
                    error: 'invalid_client',
                    error_description: 'Client certificate must have exactly one SAN:URI entry',
                    error_code: '0000804'
                });
            }

            const clientCertificateSanUri = uriEntries[0].substring(4);
            client = await clientDao.getClientByFapiIdentifier(clientCertificateSanUri);

            if (!client || client.enabled !== true || client.markForDelete === true) {
                return res.status(400).json({
                    error: 'invalid_client',
                    error_description: 'Client not found for certificate SAN:URI',
                    error_code: '0000805'
                });
            }

            authenticatedClientId = client.clientId;

            // Store certificate thumbprint for later validation during token request
            const derEncoded: Buffer = Buffer.from(
                certPem
                    .replace(/-----BEGIN CERTIFICATE-----/, '')
                    .replace(/-----END CERTIFICATE-----/, '')
                    .replace(/\s+/g, ''),
                'base64'
            );
            certificateThumbprint = generateHash(derEncoded, 'sha256', 'base64url');

        } catch (error: unknown) {
            const e = error as Error;
            return res.status(400).json({
                error: 'invalid_client',
                error_description: `Certificate parsing failed: ${e.message}`,
                error_code: '0000806'
            });
        }
    }
    // Method 2: private_key_jwt authentication (not yet implemented)
    // TODO: Implement private_key_jwt authentication via client_assertion parameter
    else {
        return res.status(400).json({
            error: 'invalid_client',
            error_description: 'Client authentication required. Use mTLS.',
            error_code: '0000807'
        });
    }

    // Validate client is enabled and FAPI-enabled
    if (!client || client.enabled !== true || client.markForDelete) {
        return res.status(400).json({
            error: 'invalid_client',
            error_description: 'Client is disabled or marked for deletion',
            error_code: '0000808'
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
    if (client_id && client_id !== authenticatedClientId) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'client_id in request does not match authenticated client',
            error_code: '0000811'
        });
    }
   

    // Validate required authorization parameters
    if (!response_type) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'response_type is required',
            error_code: '0000813'
        });
    }

    // FAPI Advanced requires response_type=code
    if (response_type !== 'code') {
        return res.status(400).json({
            error: 'unsupported_response_type',
            error_description: 'Only response_type=code is supported for FAPI',
            error_code: '0000814'
        });
    }

    if (!redirect_uri) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'redirect_uri is required',
            error_code: '0000815'
        });
    }

    // TODO: Validate redirect_uri is registered for this client
    // const registeredUris = await clientDao.getRedirectURIs(client.clientId);
    // if (!registeredUris.includes(redirect_uri)) {
    //     return res.status(400).json({
    //         error: 'invalid_request',
    //         error_description: 'redirect_uri not registered for this client',
    //         error_code: '0000816'
    //     });
    // }

    // FAPI requires state parameter
    if (!state) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'state parameter is required for FAPI',
            error_code: '0000817'
        });
    }

    // FAPI requires PKCE with S256
    if (!code_challenge) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'code_challenge is required for FAPI',
            error_code: '0000818'
        });
    }

    if (code_challenge_method !== 'S256') {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'code_challenge_method must be S256 for FAPI',
            error_code: '0000819'
        });
    }

    // FAPI requires nonce when requesting ID tokens (scope includes openid)
    if (scope && scope.includes('openid') && !nonce) {
        return res.status(400).json({
            error: 'invalid_request',
            error_description: 'nonce is required when requesting ID tokens',
            error_code: '0000820'
        });
    }

    // TODO: Validate response_mode if provided
    // FAPI supports: jwt, query.jwt, fragment.jwt, form_post.jwt
    // if (response_mode && !['jwt', 'query.jwt', 'fragment.jwt', 'form_post.jwt'].includes(response_mode)) {
    //     return res.status(400).json({
    //         error: 'invalid_request',
    //         error_description: 'Invalid response_mode for FAPI',
    //         error_code: '0000821'
    //     });
    // }

    // TODO: Validate scope against client's allowed scopes
    // const clientScopes = await scopeDao.getClientScopeRels(client.clientId);
    // Validate requested scopes are subset of client's allowed scopes

    // Generate request_uri (URN format as per RFC 9126)
    const requestUri = `urn:ietf:params:oauth:request_uri:${randomUUID()}`;
    const expiresAt = Date.now() + (PAR_EXPIRY_SECONDS * 1000);

    // Create PAR record to store
    const parRecord = {
        requestUri,
        clientId: authenticatedClientId,
        tenantId,
        responseType: response_type,
        redirectUri: redirect_uri,
        scope: scope || '',
        state,
        nonce: nonce || null,
        codeChallenge: code_challenge,
        codeChallengeMethod: code_challenge_method,
        responseMode: response_mode || null,
        certificateThumbprint,
        createdAtMs: Date.now(),
        expiresAtMs: expiresAt
    };

    // TODO: Store PAR record in database
    // await parDao.createPAR(parRecord);
    // For now, this is a placeholder - you'll need to implement storage
    console.log('PAR Record (needs storage implementation):', parRecord);

    // Return success response
    return res.status(201).json({
        request_uri: requestUri,
        expires_in: PAR_EXPIRY_SECONDS
    });
}