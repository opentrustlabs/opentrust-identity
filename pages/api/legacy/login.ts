import { Scope, SystemSettings, Tenant, User, UserCredential } from '@/graphql/generated/graphql-types';
import IdentityDao from '@/lib/dao/identity-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { JWTPrincipal, LegacyUserAuthenticationPayload,  } from '@/lib/models/principal';
import IdentityService from '@/lib/service/identity-service';
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { LEGACY_USER_MIGRATION_SCOPE, PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN } from '@/utils/consts';
import type { NextApiRequest, NextApiResponse } from 'next';


// Note that this IAM tool can be used as a legacy user provider for any other
// IAM tool which supports legacy user migration, even new versions of this
// tool.
//
// Note also that these endpoints should NOT be on a server that is publicly available.


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if(req.method !== "POST"){
        res.status(405);
    }
    const rootTenant: Tenant = await tenantDao.getRootTenant();

    const systemSettings: SystemSettings = await tenantDao.getSystemSettings();
    if (systemSettings.enablePortalAsLegacyIdp === false) {
        res.status(403);
        return;
    }

    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(403);
        return;
    }

    const bearerToken = authToken.replace(/Bearer\s+/, "");
    const p: JWTPrincipal | null = await jwtServiceUtils.validateJwt(bearerToken);
    if (p === null || p.principal_type !== PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN) {
        res.status(403);
        return;
    }

    const arrScope: Array<Scope> = await jwtServiceUtils.getClientScopes(p.client_id);
    const requiredScope = arrScope.find(
        (s: Scope) => s.scopeName === LEGACY_USER_MIGRATION_SCOPE
    )
    if (!requiredScope) {
        res.status(403);
        return;
    }

    const payload: LegacyUserAuthenticationPayload = req.body;
    const user: User | null = await identityDao.getUserBy("email", payload.email);
    if (user === null) {
        res.status(403);
        return;
    }

    const userCredential: UserCredential | null = await identityDao.getUserCredentialForAuthentication(user.userId);
    if (userCredential === null) {
        res.status(403);
        return;
    }

    const identityService: IdentityService = new IdentityService({
        authToken: "",
        deviceFingerPrint: null,
        geoLocation: null,
        ipAddress: "",
        portalUserProfile: null,
        requestCache: new Map(),
        rootTenant: rootTenant
    });
    const isValid: boolean = identityService.validateUserCredentials(userCredential, payload.password);
    if (!isValid) {
        res.status(403);
        return;
    }

    res.status(200);


}

export const config = {
    api: {
        bodyParser: true,
    },
};