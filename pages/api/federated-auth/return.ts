import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    // This the redirect URI that the application will use for ALL federated
    // OIDC providers (prefixing the process.env.AUTH_DOMAIN value to 
    // /api/federated-oidc-provider/return).
    //
    // In case of success, we should see a "code" parameter and a "state"
    // parameter returned. In case of error, we should see an "error" parameter
    // and possibly an "error_message" parameter. 
    //
    // In the success case, this handler will get the token from the federated
    // oidc provider, call the userinfo endpoint, and then find the user by their 
    // federatedoidcprovidersubjectid if they exist or create a new user (with a
    // new user id, email, name, etc. from the userinfo endpoint, and the
    // federatedoidcprovidersubjectid. Then it will generate the jwt and set it
    // either as a fragment in the URI or as a cookie value to the page which
    // the user initially requested or to the home page for the particular tenant
    // to which the user belongs.
    //
    // In the error case (or in case the token redemption fails), the user will be 
    // redirected to the error page with a detailed message.

    res.status(404).json(req.headers);
    
}