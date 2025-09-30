import { AuthorizationCodeData, FederatedAuthTest, FederatedOidcAuthorizationRel, FederatedOidcProvider, Tenant, User, UserTenantRel } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import IdentityDao from '@/lib/dao/identity-dao';
import OpenSearchDao from '@/lib/dao/impl/search/open-search-dao';
import SearchDao from '@/lib/dao/search-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import Kms from '@/lib/kms/kms';
import { OIDCUserInfo } from '@/lib/models/principal';
import { OIDCTokenResponse } from '@/lib/models/token-response';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceUtils from '@/lib/service/oidc-service-utils';
import { FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX, NAME_ORDER_WESTERN, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY } from '@/utils/consts';
import { generateRandomToken, getDomainFromEmail } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'node:crypto';


const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();
const searchDao: SearchDao = new OpenSearchDao();

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

    if(oidcState && oidcState.startsWith(FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX)){
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

    const tenant: Tenant | null = await tenantDao.getTenantById(authRel.initTenantId);
    if(tenant === null){
        res.status(302).setHeader("location", `/access-error?access_error_code=00076&extended_message=${"No valid tenant was found for authentication."}`);
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

    const userByFederatedSubjectId: User | null = await identityDao.getUserBy("federatedoidcproviderid", userInfo.sub);    
    const userByEmail: User | null = await identityDao.getUserBy("email", userInfo.email);    
    let userByPhone: User | null = null;
    if(userInfo.phone_number){
        userByPhone = await identityDao.getUserBy("phone", userInfo.phone_number);
    }
    
    const authorizationCode: string = generateRandomToken(32, "hex");

    // Should be a rare error condition, but if there are user records by both email and by subject id, and they
    // are different records, then there is no clean way to reconcile these. The latest IdP data takes
    // precedence and so we update the userBySubject with the email, rename the email for the userByEmail with a 
    // "disabled" prefix and update the search indexes.
    if(userByFederatedSubjectId !== null && userByEmail !== null && userByFederatedSubjectId.userId !== userByEmail.userId){
        userByEmail.email = `disabled.${userInfo.email}`;
        userByEmail.enabled = false;
        await identityDao.updateUser(userByEmail);
        searchDao.updateSearchIndexUserDocuments(userByEmail);

        userByFederatedSubjectId.email = userInfo.email;
        await identityDao.updateUser(userByFederatedSubjectId);
        searchDao.updateSearchIndexUserDocuments(userByFederatedSubjectId);
        await updateUserTenantRel(tenant, userByFederatedSubjectId);
        await identityDao.addUserAuthenticationHistory(userByFederatedSubjectId.userId, Date.now());
        await saveAuthorizationCodeData(authorizationCode, authRel, userByFederatedSubjectId);
    }
    // Otherwise, if there are no existing records, then create a new user based on the userinfo retrieved from the 3rd party IdP
    else if(userByFederatedSubjectId === null && userByEmail === null){
        const newUser: User = userInfoToUser(userInfo);
        if(userByPhone === null){
            newUser.phoneNumber = userInfo.phone_number;            
        }
        await identityDao.createUser(newUser);
        await searchDao.updateObjectSearchIndex(tenant, newUser);
        await searchDao.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, newUser);
        await updateUserTenantRel(tenant, newUser);
        await identityDao.addUserAuthenticationHistory(newUser.userId, Date.now());
        await saveAuthorizationCodeData(authorizationCode, authRel, newUser);
    }
    
    // Otherwise, if we find the record based on the IdP ID, but no email-based
    // record, then we update the existing record with the information from the 
    // userinfo
    else if(userByFederatedSubjectId !== null && userByEmail === null){
        userByFederatedSubjectId.email = userInfo.email;
        userByFederatedSubjectId.domain = getDomainFromEmail(userInfo.email);
        userByFederatedSubjectId.emailVerified = userInfo.email_verified;
        userByFederatedSubjectId.firstName = userInfo.given_name;
        userByFederatedSubjectId.lastName = userInfo.family_name;
        userByFederatedSubjectId.middleName = userInfo.middle_name;

        if(userByPhone === null){
            userByFederatedSubjectId.phoneNumber = userInfo.phone_number;            
        }
        await identityDao.updateUser(userByFederatedSubjectId);        
        searchDao.updateSearchIndexUserDocuments(userByFederatedSubjectId);
        await updateUserTenantRel(tenant, userByFederatedSubjectId);  
        await identityDao.addUserAuthenticationHistory(userByFederatedSubjectId.userId, Date.now());
        await saveAuthorizationCodeData(authorizationCode, authRel, userByFederatedSubjectId);
    }
    // Otherwise, we have found a record with the same email, but it was not previously tied
    // to a 3rd party IdP, so we just update the existing record with the IdP ID
    else if(userByFederatedSubjectId === null && userByEmail !== null){
        userByEmail.federatedOIDCProviderSubjectId = userInfo.sub;
        await identityDao.updateUser(userByEmail);
        await saveAuthorizationCodeData(authorizationCode, authRel, userByEmail);
    }
    
    await authDao.deleteFederatedOIDCAuthorizationRel(state);

    res.status(302).setHeader("location", `${authRel.initRedirectUri}?code=${authorizationCode}&state=${authRel.initState}`);
    res.end();
    return;
}

async function saveAuthorizationCodeData(authorizationCode: string, authRel: FederatedOidcAuthorizationRel, user: User): Promise<AuthorizationCodeData>{
    const authorizationCodeData: AuthorizationCodeData = {
        clientId: authRel.initClientId || "",
        code: authorizationCode,
        expiresAtMs: Date.now() + (30 * 60 * 1000),
        redirectUri: authRel.initRedirectUri,
        scope: authRel.initScope,
        tenantId: authRel.initTenantId,
        userId: user.userId,
        codeChallenge: authRel.initCodeChallenge,
        codeChallengeMethod: authRel.initCodeChallengeMethod
    }
    await authDao.saveAuthorizationCodeData(authorizationCodeData);
    return authorizationCodeData;
}

async function updateUserTenantRel(tenant: Tenant, user: User): Promise<void> {
    const rels: Array<UserTenantRel> = await identityDao.getUserTenantRelsByUserId(user.userId);
    if(rels.length === 0){
        await identityDao.assignUserToTenant(tenant.tenantId, user.userId, USER_TENANT_REL_TYPE_PRIMARY);
        await searchDao.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, user);
    }
    else{
        const existingRel = rels.find(
            (rel: UserTenantRel) => rel.tenantId = tenant.tenantId
        );
        if(!existingRel){
            await identityDao.assignUserToTenant(tenant.tenantId, user.userId, USER_TENANT_REL_TYPE_GUEST);
            await searchDao.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, user);
        }
    }
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
