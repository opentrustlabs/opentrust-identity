import { Tenant, Client, PreAuthenticationState, ClientScopeRel, Scope } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import ScopeDao from '@/lib/dao/scope-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, CLIENT_TYPE_SERVICE_ACCOUNT, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN, CLIENT_TYPE_DEVICE, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, FAPI_CLIENT_CERTIFICATE_HEADER, FAPI_CLIENT_CERTIFICATE_VERIFY_HEADER } from '@/utils/consts';
import { generateRandomToken, hasValidLoopbackRedirectUri, generateHash } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { X509Certificate } from 'crypto';

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();

// TODO: Add ParDao to factory
// const parDao = DaoFactory.getInstance().getParDao();

// const {
//     AUTH_DOMAIN
// } = process.env;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

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
		request_uri,
		nonce,
		claims,
		acr_values
	} = req.query;

	let tenantId = tenant_id as string;
	let clientId = client_id as string;
	let redirectUri = redirect_uri as string;
	let oidcScope = scope as string;
	let oidcState = state as string;
	let codeChallenge = code_challenge as string;
	let codeChallengeMethod = code_challenge_method as string;
	let responseType = response_type as string;
	let responseMode = response_mode as string;
	let oidcNonce = nonce as string;
	let oidcClaims = claims as string;
	let acrValues = acr_values as string;

	// ============================================================================
	// PAR (Pushed Authorization Request) Support - RFC 9126
	// ============================================================================
	// If request_uri is present, this is a PAR request. Load the stored request
	// parameters and override any parameters provided in the query string.
	// ============================================================================
	const requestUri = request_uri as string;

	if (requestUri) {
		// Validate request_uri format (must be URN as per RFC 9126)
		if (!requestUri.startsWith('urn:ietf:params:oauth:request_uri:')) {
			res.status(302).setHeader("location", `/authorize/login?error=invalid_request&error_description=ERROR_INVALID_REQUEST_URI_FORMAT`);
			res.end();
			return;
		}

		// TODO: Fetch PAR record from database
		// const parRecord = await parDao.getPARByRequestUri(requestUri);
		// For now, this is a placeholder
		const parRecord = null; // Replace with actual fetch

		if (!parRecord) {
			res.status(302).setHeader("location", `/authorize/login?error=invalid_request&error_description=ERROR_REQUEST_URI_NOT_FOUND`);
			res.end();
			return;
		}

		// TODO: Check if PAR has expired
		// if (parRecord.expiresAtMs < Date.now()) {
		//     res.status(302).setHeader("location", `/authorize/login?error=invalid_request&error_description=ERROR_REQUEST_URI_EXPIRED`);
		//     res.end();
		//     return;
		// }

		// TODO: Check if PAR has already been consumed (single-use)
		// if (parRecord.consumed) {
		//     res.status(302).setHeader("location", `/authorize/login?error=invalid_request&error_description=ERROR_REQUEST_URI_ALREADY_USED`);
		//     res.end();
		//     return;
		// }

		// TODO: Mark PAR as consumed
		// await parDao.markPARConsumed(requestUri);

		// TODO: Override authorization parameters with values from PAR record
		// tenantId = parRecord.tenantId;
		// clientId = parRecord.clientId;
		// redirectUri = parRecord.redirectUri;
		// oidcScope = parRecord.scope;
		// oidcState = parRecord.state;
		// codeChallenge = parRecord.codeChallenge;
		// codeChallengeMethod = parRecord.codeChallengeMethod;
		// responseType = parRecord.responseType;
		// responseMode = parRecord.responseMode || 'query';
		// oidcNonce = parRecord.nonce;
		// oidcClaims = parRecord.claims;
		// acrValues = parRecord.acrValues;
		// certificateThumbprint = parRecord.certificateThumbprint;

		// IMPORTANT: For FAPI, when request_uri is used, clients MUST NOT send
		// additional authorization parameters in the query string. If they do,
		// the authorization server MUST reject the request.
		// TODO: Add validation to reject if both request_uri and other params present
		// if (client_id || redirect_uri || scope || state || code_challenge) {
		//     res.status(302).setHeader("location", `/authorize/login?error=invalid_request&error_description=ERROR_REQUEST_URI_WITH_ADDITIONAL_PARAMS`);
		//     res.end();
		//     return;
		// }
	}



	// ============================================================================
	// Standard authorization parameter normalization
	// ============================================================================
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
    if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT){
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }
    // For the moment, we are only allowing FAPI clients to be service clients and therefore not eligible
    // for SSO. The FAPI clients can ONLY use the client_credentials grant, which does not require this
    // authorization step
    if(client.fapiEnabled === true){
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
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
	if (!( uris.includes(redirectUri) || hasValidLoopbackRedirectUri(uris, redirectUri)) ) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_INVALID_REDIRECT_URI&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}


	// 6.	 Does the client allow the PKCE extension to OAuth2 and do they allow the 
	//			code challenge method (which should ONLY be set to "S256", never "plain")
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
    if(client.clientType === CLIENT_TYPE_DEVICE || client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS){
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
        // TODO: Add these fields to PreAuthenticationState entity for FAPI Advanced support
        // nonce: oidcNonce,
        // certificateThumbprint: certificateThumbprint
    }
    await authDao.savePreAuthenticationState(preAuthenticationState);

	res.status(302).setHeader("location", `/authorize/login?${QUERY_PARAM_PREAUTHN_TOKEN}=${preAuthenticationState.token}&${QUERY_PARAM_TENANT_ID}=${tenantId}&${QUERY_PARAM_REDIRECT_URI}=${redirectUri}`);
	res.end();

}
