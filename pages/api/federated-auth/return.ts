import { AuthorizationCodeData, FederatedAuthTest, FederatedOidcAuthorizationRel, FederatedOidcProvider, User } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import IdentityDao from '@/lib/dao/identity-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import Kms from '@/lib/kms/kms';
import { OIDCUserInfo } from '@/lib/models/principal';
import { OIDCTokenResponse } from '@/lib/models/token-response';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceUtils from '@/lib/service/oidc-service-utils';
import { FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX, NAME_ORDER_WESTERN } from '@/utils/consts';
import { generateRandomToken, getDomainFromEmail } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'node:crypto';


const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

const {
    AUTH_DOMAIN
} = process.env;


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
        handleFederatedAuthTest(oidcState, oidcCode, res);
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

    let decryptedSecret: string | null = null;
    if(federatedAuthTest.clientSecret){
        decryptedSecret = await kms.decrypt(federatedAuthTest.clientSecret);
    }
    const tokenResponse: OIDCTokenResponse | null = await oidcServiceUtils.redeemAuthorizationCode(
        wellKnownConfig.token_endpoint,
        code,
        federatedAuthTest.clientId,
        decryptedSecret,
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
    await authDao.deleteFederatedAuthTestByState(state);
    res.status(302).setHeader("location", "/authorize/auth-successful");    
    res.end();
    return;
}

async function handleFederatedAuth(state: string, code: string, res: NextApiResponse){
    const authRel: FederatedOidcAuthorizationRel | null = await authDao.getFederatedOIDCAuthorizationRel(state);
    if(authRel === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"Federated authorization failed. The authorization state was invalid or was not found."}`);
        res.end();
        return;
    }

    if(authRel.expiresAtMs < Date.now()){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"Federated authorization failed. The authorization state has expired."}`);
        res.end();
        return;
    }

    const oidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(authRel.federatedOIDCProviderId);
    if(oidcProvider === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"Federated authorization failed. No Federated OIDC Provider was found."}`);
        res.end();
        return;
    }

    const wellKnownConfig: WellknownConfig | null = await oidcServiceUtils.getWellKnownConfig(oidcProvider.federatedOIDCProviderWellKnownUri);
    if(!wellKnownConfig){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The OIDC provider does not have a well-known URI"}`);
        res.end();
        return;
    }

    let decryptedSecret: string | null = null;
    if(oidcProvider.federatedOIDCProviderClientSecret){
        decryptedSecret = await kms.decrypt(oidcProvider.federatedOIDCProviderClientSecret);
    }

    const tokenResponse: OIDCTokenResponse | null = await oidcServiceUtils.redeemAuthorizationCode(
        wellKnownConfig.token_endpoint,
        code,
        oidcProvider.federatedOIDCProviderClientId,
        decryptedSecret,
        authRel.codeVerifier || null,
        `${AUTH_DOMAIN}/api/federated-auth/return`,
        oidcProvider.scopes.join(" "),
        oidcProvider.clientAuthType        
    );
    if(tokenResponse === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The authorization code or federated OIDC provider was invalid."}`);
        res.end();
        return;
    }
    
    const userInfo: OIDCUserInfo | null = await oidcServiceUtils.getOIDCUserInfo(wellKnownConfig.userinfo_endpoint, tokenResponse.access_token);
    if(userInfo === null || userInfo.email === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"The user information from the federated OIDC provider cannot be obtained or insufficient scope for retrieving email was provided."}`);
        res.end();
        return;
    }

    let user: User | null = await identityDao.getUserBy("email", userInfo.email);
    if(user === null){
        user = userInfoToUser(userInfo);
        await identityDao.createUser(user);     
    }
    await identityDao.addUserAuthenticationHistory(user.userId, Date.now());   
    
    const authorizationCodeData: AuthorizationCodeData = {
        clientId: authRel.initClientId || "",
        code: generateRandomToken(32, "hex"),
        expiresAtMs: Date.now() + (30 * 60 * 1000),
        redirectUri: authRel.initRedirectUri,
        scope: authRel.initScope,
        tenantId: authRel.initTenantId,
        userId: user.userId,
        codeChallenge: authRel.initCodeChallenge,
        codeChallengeMethod: authRel.initCodeChallengeMethod
    }
    await authDao.saveAuthorizationCodeData(authorizationCodeData);
    await authDao.deleteFederatedOIDCAuthorizationRel(state);

    res.status(302).setHeader("location", `${authRel.initRedirectUri}?code=${authorizationCodeData.code}&state=${authRel.initState}`);
    res.end();
    return;
}

function userInfoToUser(userInfo: OIDCUserInfo): User {
    let langCode = "en";
    let countryCode = "US";
    if(userInfo.locale){
        const l = userInfo.locale.split("-");
        if(l.length === 2){
            langCode = l[0];
            countryCode = l[1];
        }
    }
    const user: User = {
        domain: getDomainFromEmail(userInfo.email),
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        enabled: true,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        locked: false,
        markForDelete: false,
        nameOrder: NAME_ORDER_WESTERN,
        userId: randomUUID().toString(),
        middleName: userInfo.middle_name,
        federatedOIDCProviderSubjectId: userInfo.sub,
        phoneNumber: userInfo.phone_number,
        recoveryEmail: null,
        address: userInfo.address?.street_address,
        countryCode: countryCode,
        stateRegionProvince: userInfo.address?.region,
        postalCode: userInfo.address?.postal_code,
        city: userInfo.address?.locality,
        preferredLanguageCode: langCode
    }
    return user;
}

export const config = {
  api: {
    externalResolver: true,
  }
}
