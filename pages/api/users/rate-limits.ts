import type { NextApiRequest, NextApiResponse } from 'next'
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { MyUserProfile } from '@/lib/models/principal';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import TenantDao from '@/lib/dao/tenant-dao';
import { Tenant, TenantRateLimitRelView } from '@/graphql/generated/graphql-types';
import RateLimitDao from '@/lib/dao/rate-limit-dao';

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const rateLimitDao: RateLimitDao = DaoFactory.getInstance().getRateLimitDao();

export interface ServiceRateLimit {
    allowUnlimitedRate: boolean,
    rateLimit: number | null,
    rateLimitPeriodMinutes: number | null
    serviceGroupId: string
    serviceGroupName: string
}

export interface RateLimitResponse {
    allowUnlimitedRate: boolean,
    rateLimit: number | null,
    rateLimitPeriodMinutes: number | null,
    serviceRateLimits: Array<ServiceRateLimit>
}

// Will return the tenant configuration for rate limts along with an
// array of rate limits, which may be empty if none have been
// defined for the tenant

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // The authorization header should contain a signed jwt from the client    
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

    const profile: MyUserProfile | null = await jwtServiceUtils.getMyUserProfile(jwt || "", false, false);
    if(profile === null){
        res.status(403).json({ error: "ERROR_INVALID_AUTHORIZATION_HEADER_FORMAT" });
        res.end();
        return;
    }
    
    const tenant: Tenant | null = await tenantDao.getTenantById(profile.tenantId);
    if(tenant === null){
        res.status(403).json({ error: "ERROR_INVALID_TENANT" });
        res.end();
        return;
    }

    const rateLimitResponse: RateLimitResponse = {
        allowUnlimitedRate: tenant.allowUnlimitedRate,
        rateLimit: tenant.defaultRateLimit || null,
        rateLimitPeriodMinutes: tenant.defaultRateLimitPeriodMinutes || null,
        serviceRateLimits: []
    }

    const rateLimitRels: Array<TenantRateLimitRelView> = await rateLimitDao.getRateLimitTenantRelViews(tenant.tenantId, null);
    for(let i = 0; i < rateLimitRels.length; i++){
        rateLimitResponse.serviceRateLimits.push({
            allowUnlimitedRate: rateLimitRels[i].allowUnlimitedRate || false,
            rateLimit: rateLimitRels[i].rateLimit || null,
            rateLimitPeriodMinutes: rateLimitRels[i].rateLimitPeriodMinutes || null,
            serviceGroupId: rateLimitRels[i].servicegroupid,
            serviceGroupName: rateLimitRels[i].servicegroupname
        });
    }

    res.status(200).json(rateLimitResponse);
    return;

}