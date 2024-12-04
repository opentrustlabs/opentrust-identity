import { Tenant, Client, DelegatedAuthenticationConstraint, ExternalOidcProvider } from '@/graphql/generated/graphql-types';
import ClientDao from '@/lib/dao/client-dao';
import ExternalOIDCProviderDao from '@/lib/dao/external-oidc-provider-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, OIDC_OPENID_SCOPE } from '@/utils/consts';
import { getClientDaoImpl, getExternalOIDCProvicerDaoImpl, getTenantDaoImpl } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'

const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();
const externalOIDCProviderDao: ExternalOIDCProviderDao = getExternalOIDCProvicerDaoImpl();


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
	if (!oidcScope) {
		oidcScope = OIDC_OPENID_SCOPE;
	}
	else {
		const scopeValues: Array<string> = oidcScope.split(/\s+/);
		const valsFound: Array<string> = [];
		scopeValues.forEach(
			(val: string) => {
				if (ALL_OIDC_SUPPORTED_SCOPE_VALUES.includes(val.trim())) {
					valsFound.push(val);
				}
			}
		);
		if (!valsFound.includes(OIDC_OPENID_SCOPE)) {
			valsFound.push(OIDC_OPENID_SCOPE);
		}
		oidcScope = valsFound.join(" ");
	}

	// 2. Is the response mode set to "code"
	if (responseType !== "code") {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_message=ERROR_INVALID_RESPONSE_TYPE&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}

	// 3. Does the tenant exist and are they enabled. Also, is the tenant defined to use
	//		an external OIDC provider itself, exclusively? Is so, then redirect immediaely.
	const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
	if (!tenant) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_message=ERROR_INVALID_TENANT&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	if (!tenant?.enabled) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}

	// 4. Does the client exist and do they belong to the tenant and is the client enabled
	const client: Client | null = await clientDao.getClientById(clientId);
	if (!client) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	if (client.tenantId !== tenantId) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	if (!client.enabled) {
			res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_CLIENT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}`);
			res.end();
			return;
	}

	// 5. Is the client enabled for SSO and is the redirect URI registered with the client?
	if (!client.oidcEnabled) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	if (!redirectUri || !client.redirectUris?.includes(redirectUri)) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_REDIRECT_URI&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}

	// 6.	 Does the client allow the PKCE extension to OAuth2 and do they allow the 
	//			code challenge method (which should ONLY be set to "S256", never "plain")
	if (
		(codeChallenge || codeChallengeMethod) &&
		(!client.pkceEnabled)
	) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_PKCE_NOT_ENABLED_FOR_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	if (codeChallengeMethod && !(codeChallengeMethod === "S256")) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CODE_CHALLENGE_METHOD&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	//	Make sure that if one of the code challenge parameters is present then both are present
	if (
		(codeChallengeMethod && !codeChallenge) ||
		(!codeChallengeMethod && codeChallenge)
	) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CODE_CHALLENGE_PARAMETERS_MISSING_ONE_OR_MORE&redirect_uri=${redirectUri}&scope=${oidcScope}`);
		res.end();
		return;
	}
	if (tenant.delegatedAuthenticationConstraint === DelegatedAuthenticationConstraint.Exclusive) {
		if (!tenant.externalOIDCProviderId) {
			res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_INCORRECTLY_CONFIGURED_FOR_EXTERNAL_OIDC_PROVIDER&redirect_uri=${redirectUri}&scope=${oidcScope}`);
			res.end();
			return;
		}
		// TODO
		// Lookup the external OIDC provider and redirect the user immediately. Need to
		// Set the state, scope, client, response type, etc and save it for later use.
        const externalOIDCProvider: ExternalOidcProvider | null = await externalOIDCProviderDao.getExternalOIDCProviderById(tenant.externalOIDCProviderId);
        if(!externalOIDCProvider){
            res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_INCORRECTLY_CONFIGURED_FOR_EXTERNAL_OIDC_PROVIDER&redirect_uri=${redirectUri}&scope=${oidcScope}`);
			res.end();
			return;
        }
        else {
            // create state, etc, and save that data with the incoming state, etc.

            res.status(302).setHeader("location", `?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_INCORRECTLY_CONFIGURED_FOR_EXTERNAL_OIDC_PROVIDER&redirect_uri=${redirectUri}&scope=${oidcScope}`);
			res.end();
			return;
        }
	}

	// TODO
	// In the success case, create a unique key for the query parameter which maps 
	// all of the incoming values to a single record and return it instead of the multiple 
	// query params.
	console.log('tenantId is: ' + tenantId);
	console.log("scope is " + (scope as string));
	console.log("state is: " + (state as string));
	console.log("clientId is " + clientId);

	res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&redirect_uri=${redirectUri}&scope=${oidcScope}`);
	res.end();

}
