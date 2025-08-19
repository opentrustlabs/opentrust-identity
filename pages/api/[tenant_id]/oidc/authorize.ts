import { Tenant, Client, PreAuthenticationState, ClientScopeRel, Scope } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import ScopeDao from '@/lib/dao/scope-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, CLIENT_TYPE_SERVICE_ACCOUNT, OIDC_OPENID_SCOPE, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN, CLIENT_TYPE_DEVICE, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS } from '@/utils/consts';
import { generateRandomToken, hasValidLoopbackRedirectUri } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'

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
		client_id,
		redirect_uri,
		scope,
		state,
		code_challenge,
		code_challenge_method,
		response_type,
		response_mode } = req.query;
        
    // https://api.sigmaaldrich.com/auth/v1/openid/keys
    // https://login.microsoftonline.com/common/discovery/v2.0/keys
    // https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
    // const wellKnownConfig = await oidcServiceClient.getWellKnownConfig("https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration");
    // const wellKnownConfig = await oidcServiceClient.getWellKnownConfig("https://api.sigmaaldrich.com/auth/.well-known/openid-configuration");
    // console.log(JSON.stringify(wellKnownConfig));
    // const msKeys: Jwks | null = await oidcServiceClient.getJwksKeys("https://login.microsoftonline.com/common/discovery/v2.0/keys");
    // console.log(msKeys);
    // if(msKeys){
    //     console.log(msKeys.keys[0].x5c[0]);
    // }

    // const sialKeys = await oidcServiceClient.getJwksKeys("https://api.sigmaaldrich.com/auth/v1/openid/keys");
    // console.log(sialKeys);

	const tenantId = tenant_id as string;
	const clientId = client_id as string;

	// Required parameter
	const redirectUri = redirect_uri as string;

	// Scope should be set (at a minimum) to openid to access the user info endpoint.
	// profile email and offline_access are all optional but recommended.
	let oidcScope = scope as string;

	// Clients SHOULD sent a state value
	const oidcState = state as string;

	// Hashed value of a random string that the client generates. Only if the client supports PKCE
	const codeChallenge = code_challenge as string;

	// Only allow a value of S256, never plain, if the client supports PKCE, 
	const codeChallengeMethod = code_challenge_method as string;

	// This should be set to code for the authorization endpoint, token for the token endpoint
	const responseType = response_type as string;	// code

	// Optional parameter, values are either fragment or query. 
	// Default to query if not present or set to something else besides fragment
	let responseMode = response_mode as string;
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
	if (!tenant?.enabled) {
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
	if (!client.enabled) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_description=ERROR_CLIENT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
	}
    if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT){
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
	if (!redirectUri || !uris.includes(redirectUri) || !hasValidLoopbackRedirectUri(uris, redirectUri)) {
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
    if((client.clientType === CLIENT_TYPE_DEVICE || client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS) && client.maxRefreshTokenCount && client.maxRefreshTokenCount > 0){
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
        state: oidcState
    }
    await authDao.savePreAuthenticationState(preAuthenticationState);

	res.status(302).setHeader("location", `/authorize/login?${QUERY_PARAM_PREAUTHN_TOKEN}=${preAuthenticationState.token}&${QUERY_PARAM_TENANT_ID}=${tenantId}&${QUERY_PARAM_REDIRECT_URI}=${redirectUri}`);
	res.end();

}
