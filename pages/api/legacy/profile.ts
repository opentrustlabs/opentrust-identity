// import IdentityDao from '@/lib/dao/identity-dao';
// import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { LegacyUserProfile } from '@/lib/models/principal';
import { NAME_ORDER_WESTERN } from '@/utils/consts';
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

//const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).end();
        return;
    }
    const bearerToken = authHeader.replace(/Bearer\s+/, "");

    // TODO: Look up the profile based on the bearer token that was issued for the user
    // For now, the email was appended to the auth token so derive the user data from that
    
    const email = bearerToken.split("::")[1].replace(/\@.*$/, "");
    console.log(email);
    const [f, l] = email.split(".");
    const firstName: string = f[0].toUpperCase() + f.slice(1);
    const lastName: string = l[0].toUpperCase() + l.slice(1);

    const legacyUserProfile: LegacyUserProfile = {
        email: email,
        emailVerified: true,
        firstName: firstName,
        lastName: lastName,
        middleName: null,
        phoneNumber: "13145551212",
        address: "115 High Valley",
        addressLine1: '',
        city: "Chesterfield",
        postalCode: "63017",
        stateRegionProvince: "US-MO",
        countryCode: "US",
        preferredLanguageCode: "en",
        nameOrder: NAME_ORDER_WESTERN
    }
    res.status(200).json(legacyUserProfile);

}