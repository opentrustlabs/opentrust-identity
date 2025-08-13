
import type { NextApiRequest, NextApiResponse } from 'next'
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { OIDCUserProfile } from '@/lib/models/principal';

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();

// Will return a OIDCUserProfile or error

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

    const { include } = req.query;
    let includeScope = false;
    let includeGroups = false;
    if(Array.isArray(include)){
        for(let i = 0; i < include.length; i++){
            if(include[i] === "scope"){
                includeScope = true;
            }
            if(include[i] === "groups"){
                includeGroups = true;
            }
        }
    }

    const profile: OIDCUserProfile | null = await jwtServiceUtils.getOIDCUserProfile(jwt || "", includeScope, includeGroups);
    if(profile === null){
        res.status(403).json({ error: "ERROR_INVALID_AUTHORIZATION_HEADER_FORMAT" });
        res.end();
        return;
    }
    else {
        res.status(200).json(profile);
        return;
    }   
}

