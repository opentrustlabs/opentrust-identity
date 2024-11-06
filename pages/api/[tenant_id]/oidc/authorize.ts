import type { NextApiRequest, NextApiResponse } from 'next'
 

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const { 
            tenant_id, 
            client_id, 
            redirect_uri, 
            scope, 
            state, 
            code_challenge, 
            code_challenge_method, 
            response_type, 
            response_mode } = req.query;

    const tenantId = tenant_id as string;
    const clientId = client_id as string;

    // This should be set to code for the authorization endpoint, token for the token endpoint
    const responseType = response_type as string;  // code

    // Hashed value of a random string that the client generates. Only if the client supports PKCE
    const codeChallenge = code_challenge as string; 

    // Only allow a value of S256, never plain, if the client supports PKCE, 
    const codeChallengeMethod = code_challenge_method as string;  

    // Optional parameter, values are either fragment or query. Defaults to query
    const responseMode = response_mode as string; 

    // Required parameter
    const redirectUri = redirect_uri as string;

    

    // 1. Does the tenant exist and are they enabled

    // 2. Does the client exist and do they belong to the tenant and is the client enabled

    // 3. Does the client allow the PKCE extension to OAuth2 and do they allow the 
    // code challenge method (which should ONLY be set to "S256", never "plain")


    // 4. Is the redirect URI registered for this client?


    console.log('tenantId is: ' + tenantId);
    console.log("scope is " + (scope as string));
    console.log("state is: " + (state as string));
    console.log("clientId is " + clientId);

    res.status(302).setHeader("location", `/authorize/login?client_id=${clientId}&state=${state}&error=therewasanerror&redirect_uri=${redirectUri}`);
    res.end();

}