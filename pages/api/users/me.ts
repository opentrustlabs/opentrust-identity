
import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@/graphql/generated/graphql-types';
import IdentityDao from '@/lib/dao/identity-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import JwtServiceUtils from '@/lib/service/jwt-service-utils';


const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();

// Will return a OIDCUserProfile or error

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const includes = req.query["include"];
    const authorizationHeader: string | undefined = req.headers.authorization;
    if (!authorizationHeader) {
        res.status(403).json({ error: "ERROR_MISSING_AUTHORIZATION_HEADER" });
        res.end();
    }
    const jwt: string | undefined = authorizationHeader?.replace(/Bearer\s+/i, "").trim();
    if (!jwt) {
        res.status(403).json({ error: "ERROR_INVALID_AUTHORIZATION_HEADER_FORMAT" });
        res.end();
    }

    const profile = await jwtServiceUtils.getPortalUserProfile(jwt || "");



        // By default this will return an enhanced profile for any type of token
        // (client, anonymous, end user). In addition, it may return additional
        // fields if the client requests them in the "include" query parameter,
        // which is a multi-field.
        // The include parameter MAY have one or more of the following values
        // 1.   groups
        // 2.   scope
        // 3.   constraints
        // 
        // Example GET https://mydomain/api/users/me?include=groups&include=scope&include=constraints


        // The authorization header should contain a signed jwt from the client
        // 
        // Validation checks:
        //
        // 1.   Is the JWT valid
        // 2.   Is the tenant valid
        //      a. Does the tenant exist and is it enabled
        // 3.   Is the client valid
        //      a. Does the client exist and is it enabled

        const users: Array<User> = [];


        return res.status(200).json(users);
    }

