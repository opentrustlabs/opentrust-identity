import { Tenant, Client, PreAuthenticationState, ClientScopeRel, Scope, PreAuthenticationStateProtocolType } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import ScopeDao from '@/lib/dao/scope-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { PushedAuthRequest } from '@/lib/entities/pushed-auth-request.entity';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, CLIENT_TYPE_SERVICE_ACCOUNT, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN, CLIENT_TYPE_DEVICE, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, OIDC_PAR_REQUEST_URI_PREFIX } from '@/utils/consts';
import { generateRandomToken, hasValidLoopbackRedirectUri } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next';


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();

// const {
//     AUTH_DOMAIN
// } = process.env;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {
        tenant_id,
        request_uri,
    } = req.query;


    // ============================================================================
    // PAR (Pushed Authorization Request) Support - RFC 9126
    // ============================================================================
    // If request_uri is present, this is a PAR request. Load the stored request
    // parameters and override any parameters provided in the query string.
    // ============================================================================
    const requestUri = request_uri as string;

    if (requestUri) {
        handleFapiAuthorizationRequest(requestUri, tenant_id as string, res);
    }
    else {
        handleStandardAuthorizationRequest(req, res);
    }
}

async function handleStandardAuthorizationRequest(req: NextApiRequest, res: NextApiResponse) {

    const {
        tenant_id,
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        response_type,
        response_mode,
        nonce,
    } = req.query;

    const tenantId = tenant_id as string;
    const clientId = client_id as string;
    const redirectUri = redirect_uri as string;
    const oidcScope = scope as string;
    const oidcState = state as string;
    const codeChallenge = code_challenge as string;
    const codeChallengeMethod = code_challenge_method as string;
    const responseType = response_type as string;
    let responseMode = response_mode as string;
    const oidcNonce = nonce as string;

    // Default to query if not present or set to something else besides fragment
    if (responseMode !== "fragment") {
        responseMode = "query";
    }

    // 1. Do the scope values exist and are they correct?
    if (!oidcScope || oidcScope === "") {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_description=ERROR_MISSING_SCOPE&redirect_uri=${redirectUri}&scope=${oidcScope}&response_mode=${responseMode}`);
        res.end();
        return;
    }

    // 2. Is the response type set to "code"
    if (responseType !== "code") {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_description=ERROR_INVALID_RESPONSE_TYPE&redirect_uri=${redirectUri}&scope=${oidcScope}&response_mode=${responseMode}`);
        res.end();
        return;
    }

    // 3. Does the tenant exist and are they enabled. Also, is the tenant defined to use
    //		an federated OIDC provider itself, exclusively? Is so, then redirect immediaely.
    const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
    if (!tenant) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_description=ERROR_INVALID_TENANT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    if (tenant.enabled !== true || tenant.markForDelete === true) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_TENANT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }

    // 4. Does the client exist and do they belong to the tenant and is the client enabled
    const client: Client | null = await clientDao.getClientById(clientId);
    if (!client) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    if (client.tenantId !== tenantId) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    if (client.enabled !== true || client.markForDelete === true) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_CLIENT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    if (client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    // If the client is FAPI-enabled, then do not allow this downgraded authorization. FAPI-enabled
    // clients can ONLY use the /authorization endpoint with a request_uri parameter derived from
    // the /par endpoint.
    if (client.fapiEnabled === true) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_FAPI_CLIENT_AUTHORIZATION_DOWNGRADE&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }

    // 5. Is the client enabled for SSO and is the redirect URI registered with the client?
    if (!client.oidcEnabled) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    const uris = await clientDao.getRedirectURIs(clientId) || [];
    if (!(uris.includes(redirectUri) || hasValidLoopbackRedirectUri(uris, redirectUri))) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_REDIRECT_URI&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }


    // 6.   Does the client allow the PKCE extension to OAuth2 and do they allow the 
    //	    code challenge method (which should ONLY be set to "S256", never "plain")
    if (
        (codeChallenge || codeChallengeMethod) &&
        (!client.pkceEnabled)
    ) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_PKCE_NOT_ENABLED_FOR_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    if (codeChallengeMethod && !(codeChallengeMethod === "S256")) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_CODE_CHALLENGE_METHOD&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    //	7.  Make sure that if one of the code challenge parameters is present then both are present
    if (
        (codeChallengeMethod && !codeChallenge) ||
        (!codeChallengeMethod && codeChallenge)
    ) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_CODE_CHALLENGE_PARAMETERS_MISSING_ONE_OR_MORE&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }

    // 8.   Make sure that the scope values requested are all valid with respect to the OIDC spec and the client requesting auth.
    const scopeValues: Array<string> = oidcScope.split(/\s+/);
    const allSupportedScopeValues = [...ALL_OIDC_SUPPORTED_SCOPE_VALUES];

    // If this is a device client or a user delegated client, then add the delegated scope
    // values to the list of requested scopes so that we can carry this over to the refresh
    // data if this client allows refresh data    
    if (client.clientType === CLIENT_TYPE_DEVICE || client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS) {
        const scopeRels: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(client.clientId);
        const ids = scopeRels.map((rel: ClientScopeRel) => rel.scopeId);
        const scopes: Array<Scope> = await scopeDao.getScope(undefined, ids);
        scopes.forEach(
            (s: Scope) => allSupportedScopeValues.push(s.scopeName)
        );
    }

    let invalidScopeFound: boolean = false;
    for (let i = 0; i < scopeValues.length; i++) {
        if (!allSupportedScopeValues.includes(scopeValues[i])) {
            invalidScopeFound = true;
            break;
        }
    }
    if (invalidScopeFound) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_SCOPE_FOUND_FOR_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }


    // In the success case, create a unique key for the query parameter which maps
    // all of the incoming values to a single record and return it instead of the multiple
    // query params.
    const preAuthenticationState: PreAuthenticationState = {
        clientId: clientId,
        expiresAtMs: Date.now() + 5 /* minutes */ * 60 /* seconds/min  */ * 1000 /* ms/sec */,
        redirectUri: redirectUri,
        responseMode: responseMode,
        responseType: responseType,
        scope: oidcScope,
        tenantId: tenantId,
        token: generateRandomToken(32, "hex"),
        codeChallenge: codeChallenge,
        codeChallengeMethod: codeChallengeMethod,
        state: oidcState,
        nonce: oidcNonce,
        certificateThumbprint: null,
        preAuthenticationStateProtocol: PreAuthenticationStateProtocolType.Oidc,
        userAuthenticated: false
    }
    await authDao.savePreAuthenticationState(preAuthenticationState);

    res.status(302).setHeader("location", `/authorize/login?${QUERY_PARAM_PREAUTHN_TOKEN}=${preAuthenticationState.token}&${QUERY_PARAM_TENANT_ID}=${tenantId}&${QUERY_PARAM_REDIRECT_URI}=${redirectUri}`);
    res.end();

}

async function handleFapiAuthorizationRequest(requestUri: string, tenantId: string, res: NextApiResponse) {

    // Validate request_uri format (must be URN as per RFC 9126)
    // If it does not have the valid prefix, 
    if (!requestUri.startsWith(OIDC_PAR_REQUEST_URI_PREFIX)) {
        res.status(400).json({error: "invalid_request", error_description: "Invalid Request: Unable to determine client identity"});
        res.end();
        return;
    }

    const pushedAuthRequest: PushedAuthRequest | null = await authDao.getParData(requestUri);

    if (!pushedAuthRequest) {
        res.status(400).json({error: "invalid_request", error_description: "Invalid Request: Unable to determine client identity"});
        res.end();
        return;
    }
    
    if (pushedAuthRequest.expiresAtMs < Date.now()) {
        res.status(400).json({error: "invalid_request", error_description: "Invalid Request: Expired request."});
        res.end();
        return;
    }
    
    const client: Client | null = await clientDao.getClientById(pushedAuthRequest.clientId);
    if(!client || client.enabled !== true || client.markForDelete === true || client.tenantId !== tenantId){
        res.status(400).json({error: "invalid_request", error_description: "Invalid Client"});
        res.end();
        return;
    }

    // Save the preauthenticationstate data with thumbprint
    const preAuthenticationState: PreAuthenticationState = {
        clientId: pushedAuthRequest.clientId,
        expiresAtMs: Date.now() + (5 /* minutes */ * 60 /* seconds/min  */ * 1000 /* ms/sec */),
        redirectUri: pushedAuthRequest.redirectUri,
        responseMode: pushedAuthRequest.responseMode,
        responseType: pushedAuthRequest.responseType,
        scope: pushedAuthRequest.scope,
        tenantId: tenantId,
        token: generateRandomToken(32, "hex"),
        codeChallenge: pushedAuthRequest.codeChallenge,
        codeChallengeMethod: pushedAuthRequest.codeChallengeMethod,
        state: pushedAuthRequest.state,
        nonce: pushedAuthRequest.nonce,
        certificateThumbprint: pushedAuthRequest.certificateThumbprint,
        preAuthenticationStateProtocol: PreAuthenticationStateProtocolType.Fapi,
        userAuthenticated: false
    }
    await authDao.savePreAuthenticationState(preAuthenticationState);

    // Delete the PAR record
    await authDao.deleteParData(requestUri);

    res.status(302).setHeader("location", `/authorize/login?${QUERY_PARAM_PREAUTHN_TOKEN}=${preAuthenticationState.token}&${QUERY_PARAM_TENANT_ID}=${tenantId}`);
    res.end();

}
