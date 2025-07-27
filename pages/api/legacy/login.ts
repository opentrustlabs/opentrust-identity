// import IdentityDao from '@/lib/dao/identity-dao';
// import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { LegacyUserAuthenticationPayload, LegacyUserAuthenticationResponse } from '@/lib/models/principal';
import { generateRandomToken } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next';


// Note that this IAM tool can be used as a legacy user provider for any other
// IAM tool which supports legacy user migration, even new versions of this
// tool.
//
// For now, for testing purposes, we will implement default of true. Un-comment
// code for actual implementation.
//
// Note also that these endpoints should NOT be on a server that is publicly available.
// Future enhancements will be a authorization header with a signed JWT from the
// relying service with a scope of "legacy.user.migration"

// const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const payload: LegacyUserAuthenticationPayload = req.body;
    console.log(payload);



    const legacyUserAuthenticationResponse: LegacyUserAuthenticationResponse = {
        accessToken: `generateRandomToken(24, "hex")::${payload.email}`
    }

    res.status(200).json(legacyUserAuthenticationResponse);     

}