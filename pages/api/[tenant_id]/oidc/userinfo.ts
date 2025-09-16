// import { Tenant, Client, FederatedOidcProvider, FederatedOidcAuthorizationRel, PreAuthenticationState } from '@/graphql/generated/graphql-types';
// import AuthDao from '@/lib/dao/auth-dao';
// import ClientDao from '@/lib/dao/client-dao';
// import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
// import TenantDao from '@/lib/dao/tenant-dao';
// import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { OIDCErrorResponseBody } from '@/lib/models/error';
import { JWTPrincipal } from '@/lib/models/principal';
// import { WellknownConfig } from '@/lib/models/wellknown-config';
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
// import OIDCServiceClient from '@/lib/service/oidc-service-utils';
import { OIDC_TOKEN_ERROR_INVALID_REQUEST } from '@/utils/consts';
//import { generateCodeVerifierAndChallenge, generateRandomToken} from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'node:crypto';

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();


// const {
//     AUTH_DOMAIN
// } = process.env;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

    const traceId = randomUUID().toString();    
    const authHeader: string | undefined = req.headers.authorization;
    if(!authHeader){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000715",
            error_description: "ERROR_USER_PROFILE_FAILED_WITH_MISSING_AUTHORIZATION",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId            
        }
        return res.status(400).json(error);        
    }

    const jwt = authHeader.replace(/Bearer\s+/, "");

    const principal: JWTPrincipal | null = await jwtServiceUtils.validateJwt(jwt);

    if(principal === null){
        const error: OIDCErrorResponseBody = {
            error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
            error_code: "0000715",
            error_description: "ERROR_USER_PROFILE_FAILED_WITH_INVALID_JWT_OR_PROFILE",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: traceId            
        }
        return res.status(400).json(error);  
    }
    return res.status(200).json(principal);
    
}