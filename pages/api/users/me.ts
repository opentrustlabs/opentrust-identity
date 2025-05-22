
import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@/graphql/generated/graphql-types';
// import IdentityDao from '@/lib/dao/identity-dao';
// import { DaoFactory } from '@/lib/data-sources/dao-impl';
// import TenantDao from '@/lib/dao/tenant-dao';
// import { Client } from '@opensearch-project/opensearch';
// import { getOpenSearchClient } from '@/lib/data-sources/search';
//import { MFA_FACTOR_AUTH_TYPE_NONE, NAME_ORDER_WESTERN } from '@/utils/consts';


// const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
// const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
// const searchClient: Client = getOpenSearchClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

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

    // for(let i = 0; i < arr.length; i++){
    //     const obj = arr[i];
    //     const domain = domains[i % domains.length];
    //     const user: User = {
    //         domain: domain,
    //         email: `${obj.f.toLowerCase()}.${obj.l.toLowerCase()}@${domain}`,
    //         emailVerified: true,
    //         enabled: true,
    //         firstName: obj.f,
    //         lastName: obj.l,
    //         locked: false,
    //         nameOrder: NAME_ORDER_WESTERN,
    //         userId: randomUUID().toString(),
    //         address: "",
    //         countryCode: "US",
    //         preferredLanguageCode: "en",
    //         federatedOIDCProviderSubjectId: "",
    //         middleName: "",
    //         phoneNumber: "",
    //     }
    //     await identityDao.createUser(user);
    //     users.push(user);
    // }



    return res.status(200).json(users);    
}

