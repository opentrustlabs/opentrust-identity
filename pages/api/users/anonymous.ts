import type { NextApiRequest, NextApiResponse } from 'next'
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { Client, PortalUserProfile, Scope, Tenant, TenantAnonymousUserConfiguration, User } from '@/graphql/generated/graphql-types';
import { ANONYMOUS_USER_CREATE_SCOPE, DEFAULT_END_USER_TOKEN_TTL_SECONDS, NAME_ORDER_WESTERN, PRINCIPAL_TYPE_ANONYMOUS_USER, PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN } from '@/utils/consts';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import TenantDao from '@/lib/dao/tenant-dao';
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from '@/utils/i18n';
import { randomUUID } from 'crypto';
import ClientDao from '@/lib/dao/client-dao';
import { JWTPayload } from 'jose';

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();


export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    // The form data MAY have values in the following fields:
    // country_code
    // language_code
    
    // The authorization header should contain a signed jwt from the client
    // 
    // Validation checks:
    //
    // 1.   Is the JWT valid
    // 2.   Is the JWT TokenType of type SERVICE_ACCOUNT_TOKEN
    // 3.   Is the tenant valid
    //      a. Does the tenant exist and is it enabled
    //      b. Does the tenant allow anonymous tokens
    // 4.   Is the client valid
    //      a. Does the client exist and is it enabled
    if(req.method?.toUpperCase() !== "POST"){
        res.status(405).json({ error: "ERROR_METHOD_NOT_ALLOWED"});
        res.end();
        return;
    }

    const authorizationHeader: string | undefined = req.headers.authorization;
    if (!authorizationHeader) {
        res.status(403).json({ error: "ERROR_MISSING_AUTHORIZATION_HEADER" });
        res.end();
        return;
    }
    const jwt: string | undefined = authorizationHeader?.replace(/Bearer\s+/i, "").trim();
    if (!jwt) {
        res.status(403).json({ error: "ERROR_INVALID_AUTHORIZATION_HEADER_FORMAT" });
        res.end();
        return;
    }

    const profile: PortalUserProfile | null = await jwtServiceUtils.getPortalUserProfile(jwt);
    if(profile === null || profile.principalType !== PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN){
        res.status(403).json({ error: "ERROR_INVALID_PROFILE" });
        res.end();
        return;
    }

    const requiredScope = profile.scope.find(
        (s: Scope) => s.scopeName === ANONYMOUS_USER_CREATE_SCOPE
    )
    if(!requiredScope){
        res.status(403).json({ error: "ERROR_INVALID_INSUFFICIENT_PERMISSIONS_FOR_ANONYMOUS_USER_CREATION"});
        res.end();
        return;
    }

    const tenant: Tenant | null = await tenantDao.getTenantById(profile.tenantId);
    if(tenant === null || tenant.enabled === false || tenant.markForDelete === true || tenant.allowAnonymousUsers === false){
        res.status(403).json({ error: "ERROR_INVALID_TENANT_FOR_ANONYMOUS_USER_TOKENS"});
        res.end();
        return;
    }

    
    const tenantAnonymousUserConfiguration: TenantAnonymousUserConfiguration | null = await tenantDao.getAnonymousUserConfiguration(profile.tenantId);
    // Read the form post contents, auto-magically parsed by nextjs
    const {
        country_code,
        language_code
    } = req.body;

    let langCode = language_code as string;
    let cc = country_code as string
    let ttl: number = DEFAULT_END_USER_TOKEN_TTL_SECONDS;
    if(langCode){
        const l = LANGUAGE_CODES.find((lcd: LanguageCodeDef) => lcd.languageCode === langCode);
        if(l === undefined){
            if(tenantAnonymousUserConfiguration !== null && tenantAnonymousUserConfiguration.defaultlanguagecode){
                langCode = tenantAnonymousUserConfiguration.defaultlanguagecode;
            }
            else{
                langCode = "en";
            }
        }
    }
    else{
        if(tenantAnonymousUserConfiguration !== null && tenantAnonymousUserConfiguration.defaultlanguagecode){
            langCode = tenantAnonymousUserConfiguration.defaultlanguagecode;
        }
        else{
            langCode = "en";
        }
    }

    if(cc){
        const c = COUNTRY_CODES.find((ccd: CountryCodeDef) => ccd.countryCode === cc);
        if(c === undefined){
            if(tenantAnonymousUserConfiguration !== null && tenantAnonymousUserConfiguration.defaultcountrycode){
                cc = tenantAnonymousUserConfiguration.defaultcountrycode;
            }
            else{
                cc = "US";
            }
        }
    }
    else{
        if(tenantAnonymousUserConfiguration !== null && tenantAnonymousUserConfiguration.defaultcountrycode){
            cc = tenantAnonymousUserConfiguration.defaultcountrycode;
        }
        else{
            cc = "US";
        }
    }

    if(tenantAnonymousUserConfiguration && tenantAnonymousUserConfiguration.tokenttlseconds){
        ttl = tenantAnonymousUserConfiguration.tokenttlseconds;
    }
    

    const user: User = {
        domain: "",
        email: "",
        emailVerified: false,
        enabled: true,
        firstName: "",
        lastName: "",
        locked: false,
        markForDelete: false,
        nameOrder: NAME_ORDER_WESTERN,
        userId: randomUUID().toString(),
        address: "",
        countryCode: cc,
        preferredLanguageCode: langCode,
        city: "",
        stateRegionProvince: "",
        addressLine1: "",
        federatedOIDCProviderSubjectId: "",
        middleName: "",
        phoneNumber: "",
        postalCode: ""
    };

    const client: Client | null = await clientDao.getClientById(profile.userId);

    const result: {accessToken: string | null, principal: JWTPayload} | null =
                await jwtServiceUtils.signIAMPortalUserJwt(user, tenant, ttl, PRINCIPAL_TYPE_ANONYMOUS_USER, client || undefined);
    
    if(result === null){
        res.status(403).json({ error: "ERROR_UNABLE_TO_GENERATE_ACCESS_TOKEN_FOR_ANONYMOUS_USER" });
        res.end();
        return;
    }
    
    return res.status(200).json(result);
    
}

export const config = {
    api: {
      bodyParser: true,
    },
  };