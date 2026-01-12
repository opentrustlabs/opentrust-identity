import { OIDCErrorResponseBody } from '@/lib/models/error';
import { JWTPrincipal } from '@/lib/models/principal';
import JwtServiceUtils from '@/lib/service/jwt-service-utils';
import { FAPI_CLIENT_CERTIFICATE_HEADER, OIDC_TOKEN_ERROR_INVALID_REQUEST } from '@/utils/consts';
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'node:crypto';
import { getParsedFapiClientCertificate, ParsedClientCertificate } from '@/utils/dao-utils';

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

    // FAPI 2.0: Validate certificate-bound access tokens
    // If the access token contains a 'cnf' (confirmation) claim with x5t#S256,
    // verify that the client certificate thumbprint matches
    if (principal.cnf && principal.cnf['x5t#S256']) {
        const clientCertificate = req.headers[FAPI_CLIENT_CERTIFICATE_HEADER]
            ? req.headers[FAPI_CLIENT_CERTIFICATE_HEADER] as string
            : null;

        if (!clientCertificate) {
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
                error_code: "0000716",
                error_description: "ERROR_USER_PROFILE_FAILED_CERTIFICATE_BOUND_TOKEN_WITHOUT_CERTIFICATE",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: traceId
            }
            return res.status(401).json(error);
        }

        const parsedClientCertificate: ParsedClientCertificate = getParsedFapiClientCertificate(clientCertificate);

        if (parsedClientCertificate.error !== null) {
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
                error_code: "0000717",
                error_description: "ERROR_USER_PROFILE_FAILED_INVALID_CLIENT_CERTIFICATE",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: traceId
            }
            return res.status(401).json(error);
        }

        // Verify that the certificate thumbprint matches the cnf claim
        if (parsedClientCertificate.certificateThumbprint !== principal.cnf['x5t#S256']) {
            const error: OIDCErrorResponseBody = {
                error: OIDC_TOKEN_ERROR_INVALID_REQUEST,
                error_code: "0000718",
                error_description: "ERROR_USER_PROFILE_FAILED_CERTIFICATE_THUMBPRINT_MISMATCH",
                error_uri: "",
                timestamp: Date.now(),
                trace_id: traceId
            }
            return res.status(401).json(error);
        }
    }

    return res.status(200).json(principal);
    
}