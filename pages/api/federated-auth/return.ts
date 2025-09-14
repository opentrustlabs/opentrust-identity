import { FederatedAuthTest, FederatedOidcAuthorizationRel } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import IdentityDao from '@/lib/dao/identity-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { OIDCUserInfo } from '@/lib/models/principal';
import { OIDCTokenResponse } from '@/lib/models/token-response';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceUtils from '@/lib/service/oidc-service-utils';
import { FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX } from '@/utils/consts';
import type { NextApiRequest, NextApiResponse } from 'next'


const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    // This the redirect URI that the application will use for ALL federated
    // OIDC providers (prefixing the process.env.AUTH_DOMAIN value to 
    // /api/federated-auth/return).
    //
    // In case of success, we should see a "code" parameter and a "state"
    // parameter returned. In case of error, we should see an "error" parameter
    // and possibly an "error_message" parameter. 
    //
    // In the success case, this handler will get the token from the federated
    // oidc provider, call the userinfo endpoint, and then find the user by their 
    // federatedoidcprovidersubjectid if they exist or create a new user (with a
    // new user id, email, name, etc. from the userinfo endpoint, and the
    // federatedoidcprovidersubjectid. Then it will generate the jwt and set it
    // either as a fragment in the URI or as a cookie value to the page which
    // the user initially requested or to the home page for the particular tenant
    // to which the user belongs.
    //
    // In the error case (or in case the token redemption fails), the user will be 
    // redirected to the error page with a detailed message.
    //
    //
    // *****************************************************************************
    // During the IAM tool initialization, or when configuring a new OIDC provider
    // for the root tenant we might need to test the provider configuration
    // before committing or updating the provider data. In this case, a special
    // version of the state parameter is used. It has a format of:
    // 
    // oidctest-base64Encoded(encrypted(JSON.toString(({ clientId, redirectUri, scope, rnd, tmpProviderId, clientSecret?, codeVerifier? })))
    //
    // where code verifier is optional if using client secret post for token exchange, and
    // the client secret is optional and code verifier is required if using PKCE.

    const {
		code,
		state,
		error,
		error_message
	} = req.query;
    
    if(error){
        const message = error_message as string | null;
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${message}`);
        res.end();
    }

    const oidcState: string = state as string;
    const oidcCode: string = code as string;

    if(oidcState.startsWith(FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX)){
        handleFederatedAuthTest(oidcState.replace(FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX, ""), oidcCode, res);
    }
    else{
        handleFederatedAuth(oidcState, oidcCode, res);
    }    
}

async function handleFederatedAuthTest(state: string, code: string, res: NextApiResponse) {
    const federatedAuthTest: FederatedAuthTest | null = await authDao.getFederatedAuthTestByState(state);
    if(federatedAuthTest === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The token used for testing the OIDC provider is invalid or has expired"}`);
        res.end();
        return;
    }
    if(federatedAuthTest.expiresAtMs < Date.now()){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The token used for testing the OIDC provider has expired"}`);
        res.end();
        return;
    }
    const wellKnownConfig: WellknownConfig | null = await oidcServiceUtils.getWellKnownConfig(federatedAuthTest.wellKnownUri);
    if(!wellKnownConfig){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The OIDC provider does not have a well-known URI"}`);
        res.end();
        return;
    }

    const tokenResponse: OIDCTokenResponse | null = await oidcServiceUtils.redeemAuthorizationCode(
        wellKnownConfig.token_endpoint,
        code,
        federatedAuthTest.clientId,
        federatedAuthTest.clientSecret || null,
        federatedAuthTest.codeVerifier || null,
        federatedAuthTest.redirectUri,
        federatedAuthTest.scope,
        federatedAuthTest.clientAuthType
    );
    if(tokenResponse === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The authorization code or client configuration used for testing the OIDC provider is invalid"}`);
        res.end();
        return;
    }

    const userInfo: OIDCUserInfo | null = await oidcServiceUtils.getOIDCUserInfo(wellKnownConfig.userinfo_endpoint, tokenResponse.access_token);
    if(userInfo === null || userInfo.email === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The user information for testing the OIDC provider cannot be obtained."}`);
        res.end();
        return;
    }
    res.status(302).setHeader("location", "/authorize/auth-successful");
    res.end();
    return;
}

async function handleFederatedAuth(state: string, code: string, res: NextApiResponse){
    const authRel: FederatedOidcAuthorizationRel | null = await authDao.getFederatedOIDCAuthorizationRel(state);
    if(authRel === null){
        
    }
}