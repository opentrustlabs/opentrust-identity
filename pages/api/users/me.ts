
import type { NextApiRequest, NextApiResponse } from 'next'
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { MyUserProfile, ProfileScope } from '@/lib/models/principal';
import { CLIENT_TYPE_IDENTITY, MY_PROFILE_READ_SCOPE, PRINCIPAL_TYPE_ANONYMOUS_USER, PRINCIPAL_TYPE_END_USER } from '@/utils/consts';
import { Client } from '@/graphql/generated/graphql-types';

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();


// Will return a MyUserProfile or error

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
    // 
    // 3.   constraints (reserved for enhancements to the rules that can be applied to scopes)
    // 
    // Example GET https://mydomain/api/users/me?include=groups&include=scope&include=constraints


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


    const result: {client: Client, myUserProfile: MyUserProfile} | null = await jwtServiceUtils.getMyUserProfile(jwt || "", true, true);

    if(result === null || result.myUserProfile === null){
        res.status(403).json({ error: "ERROR_INVALID_USER" });
        res.end();
        return;
    }

    if(result.myUserProfile.principalType === PRINCIPAL_TYPE_ANONYMOUS_USER || result.myUserProfile.principalType === PRINCIPAL_TYPE_END_USER){
        if(result.client.clientType !== CLIENT_TYPE_IDENTITY){
            const s: ProfileScope | undefined = result.myUserProfile.scope.find(
                (v: ProfileScope) => v.scopeName === MY_PROFILE_READ_SCOPE
            );
            if(s === undefined){
                res.status(403).json({ error: "ERROR_INSUFFICIENT_SCOPE_TO_VIEW_PROFILE"});
                res.end();
                return;
            }
            else{
                res.status(200).json(result.myUserProfile);
                return;        
            }
        }
        else{
            res.status(200).json(result.myUserProfile);
            return;    
        }
    }
    else {
        res.status(200).json(result.myUserProfile);
        return;
    }   
}

