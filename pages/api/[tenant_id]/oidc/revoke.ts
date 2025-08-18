import { DaoFactory } from '@/lib/data-sources/dao-factory';
import type { NextApiRequest, NextApiResponse } from 'next';
import JwtService from '@/lib/service/jwt-service-utils';
import AuthDao from '@/lib/dao/auth-dao';
import { base64Decode, generateHash } from '@/utils/dao-utils';
import ClientAuthValidationService from '@/lib/service/client-auth-validation-service';
import { RefreshData } from '@/graphql/generated/graphql-types';
import { JWTPrincipal } from '@/lib/models/principal';
import { logWithDetails } from '@/lib/logging/logger';

const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const jwtService: JwtService = new JwtService();
const clientAuthValidationService: ClientAuthValidationService = new ClientAuthValidationService();

// This will "logout" a user, which means that it will delete the refresh data for
// the corresponding userid, tenantid, and clientid. This will ONLY logout a user
// from ONE of the sessions that they have established. If they have more sessions
// with different applications then they will need to logout of those independently
// of the current session.
//
// A note on implementation:
// =========================
// The specification for revocation says that private clients should pass their client id and
// client secret either as basic auth credentials or in the request body. 
// 
// However, there may be public clients which do not have a client secret value and which
// have used the PKCE exntension to generate auth and refresh tokens. How do these
// clients guarantee their identity? In the revocation process there is no way for
// them to provide any type of code challenge with the initial request followed by
// the verifier during the authorization code exchange, as is done with authentication.
//
// A public client can just delete the access token and refresh token from its local store,
// but that leaves a refresh token just kind-of dangling out there in the database.
// 
// What kinds of attacks are possible if no client_secret value is present, and what
// are the security implications (beyond the annoyance of having to log in again, over
// and over....). An attacker would need to know the client id (easy to obtain 
// because it is public and is transmitted in the URI of every authorization request), 
// and would need to know the user's access token or refresh token (harder to obtain, since 
// the attacker would need access to the local data store of the device, such as the browser's 
// cookies or local storage, and would imply that the attacker either has access to the user's
// device or has injected a malicious script into the application). 
// 
// But if the attacker has access to the refresh or access token, why would they 
// choose to revoke the tokens rather than use them? (Again, constantly logging somebody
// out of their sessions would be annoying, but not necessarily a security vulnerability
// of the IAM tool since the IAM tool cannot protect the user from a poorly protected
// device or a poorly protected web application).
//
// The revocation endpoint, therefore, is implemented as follows:
//
// 1.   ONLY private clients will be able to invoke this endpoint, since a 
//      client_secret is required.
// 2.   Clients can either use Basic Authorization (Base64 encoded client_id:client_secret)
//      or can send the client_id and client_secret as part of the request body.
// 3.   Regardless of whether the token type hint is a refresh token or an access token
//      ONLY the session related to the tenant ID will be revoked. The user may have
//      other sessions with other tenants, and these will be unaffected.
// 4.   PUBLIC clients will only be able to delete the access token and refresh token from their
//      local data store. This provides an acceptable level of security since:
//          a.  The access token will eventually expire in a short period of time.
//          b.  The refresh token will also eventually expire (although in a longer
//              period of time) and be cleaned up via a scheduled job.

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    // read the tenant id from the query params (in this case, the path params) in the request
    const {
		tenant_id
    } = req.query;

    // Read the form post contents, auto-magically parsed by nextjs
    const {
        token,
        token_type_hint,
        client_id,
        client_secret
    } = req.body;

    // TODO
    // Inspect the authorization header to see if there is a bearer or basic
    // authz value.

    // If no token, then fail.
    if(!token){
        res.status(403).end();
        return;
    }

    // token_type_hint can be either "access_token" or "refresh_token" or null
    // If not null, then check to make sure it is one of the allowed values
    if(token_type_hint && !(token_type_hint === "access_token" || token_type_hint === "refresh_token")){
        res.status(403).end();
        return;
    }

    // If this is an access token, then we should see 2 "." characters
    // in it, since the IAM tool issues signed JWTs for access tokens.
    if(token_type_hint && token_type_hint === "access_token"){
        const t: string = token as string;
        const index1 = t.indexOf(".");
        const index2 = t.lastIndexOf(".");
        if(index1 < 0 || index2 < 0){
            res.status(403).end();
            return;
        }
        if(index1 === index2){
            res.status(403).end();
            return;
        }
    }
    

    let clientId: string | null = null;
    let clientSecret: string | null = null;

    const authHeader = req.headers.authorization;
    if(authHeader){
        const credentials = authHeader.replace(/Basic\s+/, "");
        [clientId, clientSecret] = base64Decode(credentials).split(":");

    }
    else if(client_id && client_secret){
        clientId = client_id;
        clientSecret = clientSecret;
    }

    if(!clientId || !clientSecret){
        res.status(403).end();
        return;
    }
    else{
        try{
            const isValidCredentials = await clientAuthValidationService.validateClientAuthCredentials(clientId, clientSecret);
            if(!isValidCredentials){
                res.status(403).end();
                return;
            }
            
            const t: string = token as string;
            const hashedToken = generateHash(t);
            const refreshData: RefreshData | null = await authDao.getRefreshData(hashedToken);
            let principal: JWTPrincipal | null = null;
            if(t.indexOf(".") > 0){
                try{
                    principal = await jwtService.validateJwt(t);
                }
                catch(err: unknown){
                    const e = err as Error
                    logWithDetails("error", "Error revoking a user refresh token. Could not create a principal object from the supplied token", {e});                    
                    res.status(403).end();
                    return;
                }
            }
            if(refreshData !== null){
                if(refreshData.tenantId !== tenant_id){
                    res.status(403).end();
                    return;
                }
                await authDao.deleteRefreshDataByRefreshToken(hashedToken);
            }
            else if(principal !== null){
                if(principal.tenant_id !== tenant_id){
                    res.status(403).end();
                    return;
                }
                await authDao.deleteRefreshData(principal.sub, principal.tenant_id, principal.client_id);
            }
        }
        catch(err){
            const e = err as Error
            logWithDetails("error", "Error revoking a user refresh token. Encountered an unexpected error.", {e});  
            res.status(403).end();
            return;
        }        
    }
    res.status(200).end();
    
}