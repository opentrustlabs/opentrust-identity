import type { NextApiRequest, NextApiResponse } from 'next'

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

    return res.status(404).json(req.headers);
    
}