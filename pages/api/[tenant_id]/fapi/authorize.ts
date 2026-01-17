import { AuthorizationCodeData, Client, PreAuthenticationState, PreAuthenticationStateProtocolType, User } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import IdentityDao from '@/lib/dao/identity-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { OIDCErrorResponseBody } from '@/lib/models/error';
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { OIDC_TOKEN_ERROR_INVALID_REQUEST } from '@/utils/consts';
import { generateRandomToken } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'node:crypto';

const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {
        tenant_id,
        _tk
    } = req.query;

    const token = _tk as string;
    const tenantId = tenant_id as string;

    const traceId: string = req.headers["x-trace-id"] ? req.headers["x-trace-id"] as string : randomUUID().toString();

    const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(token);
    if(!preAuthenticationState){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_INVALID_TOKEN",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);   
    }

    if(preAuthenticationState.expiresAtMs < Date.now()){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_EXPIRED_AUTHORIZATION",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);  
    }

    if(preAuthenticationState.preAuthenticationStateProtocol !== PreAuthenticationStateProtocolType.Fapi){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_NON_FAPI_ENABLED_ACCOUNT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);  
    }

    if(preAuthenticationState.userAuthenticated !== true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_NON_AUTHENTICATED_USER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);  
    }

    if(preAuthenticationState.tenantId !== tenantId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_INVALID_TENANT_ID",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);  
    }

    if(!preAuthenticationState.authenticatedUserId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_INVALID_OR_MISSING_USER_ID",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);  
    }

    const user: User | null = await identityDao.getUserBy("id", preAuthenticationState.authenticatedUserId);
    if(user === null || user.markForDelete === true || user.enabled !== true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_INVALID_OR_MISSING_USER",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error); 
    }

    const client: Client | null = await clientDao.getClientById(preAuthenticationState.clientId);
    if(client === null || client.enabled !== true || client.markForDelete === true || client.fapiEnabled !== true || client.tenantId !== tenantId){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_INVALID_OR_MISSING_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);  
    }
    
    const authCode = generateRandomToken(32, "hex");

    const response: string | null = await jwtServiceUtils.signFapiResponse(client, authCode, preAuthenticationState);
    if(!response){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000721",
            error_description: "ERROR_FAPI_AUTHORIZATION_FAILED_WITH_INVALID_JWT_RESPONSE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId
        }
        return res.status(400).json(error);
    }

    // FAPI requires short-lived authorization codes (60-120 seconds recommended)
    const authorizationCodeData: AuthorizationCodeData = {
        clientId: preAuthenticationState.clientId,
        code: authCode,
        expiresAtMs: Date.now() + (60 * 1000), // 60 seconds for FAPI
        redirectUri: preAuthenticationState.redirectUri,
        scope: preAuthenticationState.scope,
        tenantId: preAuthenticationState.tenantId,
        userId: preAuthenticationState.authenticatedUserId,
        codeChallenge: preAuthenticationState.codeChallenge,
        codeChallengeMethod: preAuthenticationState.codeChallengeMethod,
        nonce: preAuthenticationState.nonce || null,
        certificateThumbprint: preAuthenticationState.certificateThumbprint || null
    }
    await authDao.saveAuthorizationCodeData(authorizationCodeData);

    // Delete the pre-authentication state to prevent reuse
    await authDao.deletePreAuthenticationState(token);

    // For FORM POST JWTs send the following back
    // regardless of whether it is an error or success. The value must always
    // be a signed JWT
    // 
    const responseDoc = `
    <!DOCTYPE html>
    <html>
        <body onload="document.forms[0].submit()">
            <form method="post" action="${preAuthenticationState.redirectUri}">
            <input type="hidden" name="response" value="${response}" />
            </form>
        </body>
    </html>
    `

    res.status(200).setHeader("Content-Type", "text/html").send(responseDoc);
    res.end();
}



    