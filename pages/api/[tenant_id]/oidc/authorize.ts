import { Tenant, Client, FederatedOidcProvider, FederatedOidcAuthorizationRel, PreAuthenticationState } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceClient from '@/lib/service/oidc-service-client';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, CLIENT_TYPE_SERVICE_ACCOUNT_ONLY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, OIDC_OPENID_SCOPE, QUERY_PARAM_PREAUTH_REDIRECT_URI, QUERY_PARAM_PREAUTH_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from '@/utils/consts';
import { generateCodeVerifierAndChallenge, generateRandomToken } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const oidcServiceClient: OIDCServiceClient = new OIDCServiceClient();

const {
    AUTH_DOMAIN
} = process.env;

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

	// 2. Is the response type set to "code"
	if (responseType !== "code") {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_message=ERROR_INVALID_RESPONSE_TYPE&redirect_uri=${redirectUri}&scope=${oidcScope}&response_mode=${responseMode}`);
		res.end();
		return;
	}

	// 3. Does the tenant exist and are they enabled. Also, is the tenant defined to use
	//		an federated OIDC provider itself, exclusively? Is so, then redirect immediaely.
	const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
	if (!tenant) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=invalid_request&error_message=ERROR_INVALID_TENANT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
	if (!tenant?.enabled) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}

	// 4. Does the client exist and do they belong to the tenant and is the client enabled
	const client: Client | null = await clientDao.getClientById(clientId);
	if (!client) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
	if (client.tenantId !== tenantId) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
	if (!client.enabled) {
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_CLIENT_NOT_ENABLED&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
	}
    if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT_ONLY){
        res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
        res.end();
        return;
    }

	// 5. Is the client enabled for SSO and is the redirect URI registered with the client?
	if (!client.oidcEnabled) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_CLIENT_NOT_ENABLED_FOR_SSO&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
    const uris = await clientDao.getRedirectURIs(clientId) || [];
	if (!redirectUri || !uris.includes(redirectUri)) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_REDIRECT_URI&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}

	// 6.	 Does the client allow the PKCE extension to OAuth2 and do they allow the 
	//			code challenge method (which should ONLY be set to "S256", never "plain")
	if (
		(codeChallenge || codeChallengeMethod) &&
		(!client.pkceEnabled)
	) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_PKCE_NOT_ENABLED_FOR_CLIENT&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
	if (codeChallengeMethod && !(codeChallengeMethod === "S256")) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CODE_CHALLENGE_METHOD&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
	//	Make sure that if one of the code challenge parameters is present then both are present
	if (
		(codeChallengeMethod && !codeChallenge) ||
		(!codeChallengeMethod && codeChallenge)
	) {
		res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_INVALID_CODE_CHALLENGE_PARAMETERS_MISSING_ONE_OR_MORE&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
		res.end();
		return;
	}
	if (tenant.federatedAuthenticationConstraint === FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE) {
        // 1.   Need to look up all of the federated IdPs associated to this tenant.
        // 2.   If there is just one, then redirect immediately.
        // 3.   Otherwise, show the login page as below with the saved temporary token -> incoming data relationship.
        const oidcProviders: Array<FederatedOidcProvider> = await federatedOIDCProviderDao.getFederatedOidcProviders(tenantId);
        if(!oidcProviders || oidcProviders.length === 0){
            res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_INCORRECTLY_CONFIGURED_FOR_FEDERATED_OIDC_PROVIDER_NO_PROVIDERS_DEFINED&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
			res.end();
			return;
        }
		// Use the only OIDC provider and redirect the user immediately. Need to
		// Set the state, scope, client, response type, etc and save it for later use.
        if(oidcProviders.length === 1){
            // create state, etc, and save that data with the incoming state, etc.
            const wellKnownConfig: WellknownConfig | null = await oidcServiceClient.getWellKnownConfig(
                oidcProviders[0].federatedOIDCProviderWellKnownUri
                //"https://api.sigmaaldrich.com/auth/.well-known/openid-configuration"
            );
            if(!wellKnownConfig){
                res.status(302).setHeader("location", `/authorize/login?tenant_id=${tenantId}&client_id=${clientId}&state=${oidcState}&error=unauthorized_client&error_message=ERROR_TENANT_INCORRECTLY_CONFIGURED_FOR_FEDERATED_OIDC_PROVIDER_INVALID_WELL_KNOWN_URI&redirect_uri=${redirectUri}&scope=${oidcScope}&response_type=${responseType}&response_mode=${responseMode}`);
                res.end();
                return;
            }

            // If we are supposed to use PKCE, then we need to generate the code challenge and save it too.
            const {verifier, challenge} = oidcProviders[0].usePkce ? generateCodeVerifierAndChallenge() : {verifier: null, challenge: null}; 
                        
            const federatedOidcAuthorizationRel: FederatedOidcAuthorizationRel = {
                state: generateRandomToken(32, "hex"),
                codeVerifier: verifier,
                expiresAtMs: Date.now() + 5 /* minutes */ * 60 /* seconds/min  */ * 1000 /* ms/sec */,
                federatedOIDCProviderId: oidcProviders[0].federatedOIDCProviderId,
                initClientId: clientId,
                initRedirectUri: redirectUri,
                initResponseMode: responseMode,
                initScope: oidcScope,
                initState: oidcState,
                initTenantId: tenantId,
                initCodeChallenge: codeChallenge,
                initCodeChallengeMethod: codeChallengeMethod,
                initResponseType: responseType
            }
            await authDao.saveFederatedOIDCAuthorizationRel(federatedOidcAuthorizationRel);
            
            const codeChallengeQueryParams = oidcProviders[0].usePkce ? `&code_challenge=${challenge}&code_challenge_method=S256` : "";
            res.status(302).setHeader("location", `${wellKnownConfig.authorization_endpoint}?client_id=${oidcProviders[0].federatedOIDCProviderClientId}&state=${federatedOidcAuthorizationRel.state}&response_type=code&response_mode=query&redirect_uri=${AUTH_DOMAIN}${"/api/openid/return&scope=openid%20email%20profile%20offline_access"}${codeChallengeQueryParams}`);
			res.end();
			return;            
        }
	}


	// In the success case, create a unique key for the query parameter which maps 
	// all of the incoming values to a single record and return it instead of the multiple 
	// query params.
	console.log('tenantId is: ' + tenantId);
	console.log("scope is " + (scope as string));
	console.log("state is: " + (state as string));
	console.log("clientId is " + clientId);

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

	res.status(302).setHeader("location", `/authorize/login?${QUERY_PARAM_PREAUTHN_TOKEN}=${preAuthenticationState.token}&${QUERY_PARAM_PREAUTH_TENANT_ID}=${tenantId}&${QUERY_PARAM_PREAUTH_REDIRECT_URI}=${redirectUri}`);
	res.end();

}
