import { SystemSettings, Scope, User } from '@/graphql/generated/graphql-types';
import IdentityDao from '@/lib/dao/identity-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { LegacyUserProfile, JWTPrincipal } from '@/lib/models/principal';
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { LEGACY_USER_MIGRATION_SCOPE, PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN } from '@/utils/consts';
import type { NextApiRequest, NextApiResponse } from 'next';



// Note that this IAM tool can be used as a legacy user provider for any other
// IAM tool which supports legacy user migration, even new versions of this
// tool.
//
//
// Note also that these endpoints should NOT be on a server that is publicly available.


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method !== "GET") {
        res.status(405);
        return;
    }

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

    const {
        email
    } = req.query;
    const username: string | null = email as string;

    if (!username) {
        res.status(404);
        return;
    }

    const user: User | null = await identityDao.getUserBy("email", username);
    if(user === null){
        res.status(404);
        return;
    }

    const legacyUserProfile: LegacyUserProfile = {
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName || null,
        phoneNumber: user.phoneNumber || null,
        address: user.address || "",
        addressLine1: user.addressLine1 || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        stateRegionProvince: user.stateRegionProvince || "",
        countryCode: user.countryCode || "",
        preferredLanguageCode: user.preferredLanguageCode || "",
        nameOrder: user.nameOrder
    }
    res.status(200).json(legacyUserProfile);

}