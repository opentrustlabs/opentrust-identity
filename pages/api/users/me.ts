import type { NextApiRequest, NextApiResponse } from 'next'

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

    
}