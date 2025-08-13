import type { NextApiRequest, NextApiResponse } from 'next'
import TenantDao from "../../../../lib/dao/tenant-dao";
import { Tenant } from '../../../../graphql/generated/graphql-types';
import { ErrorResponseBody } from '../../../..//lib/models/error';
import { GRANT_TYPES_SUPPORTED } from "../../../../utils/consts";
import { DaoFactory } from "../../../../lib/data-sources/dao-factory";

const {
    AUTH_DOMAIN
} = process.env;


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const { 
            tenant_id
        } = req.query;

    const tenantId = tenant_id as string;

    if(!req.method || req.method.toUpperCase() !== "GET"){
        const e: ErrorResponseBody =  {
            statusCode: 405,
            errorDetails: [{
                errorCode: "405",
                errorKey: "ERROR_METHOD_NOT_ALLOWED",
                errorMessage: "Method not allowed"
            }]
        };
        res.status(405).json(e)
    }

    // Check that the tenant exists and is enabled and can perform auth
    // If not, return 404
    const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);

    if(!tenant || tenant.enabled === false){
        const e: ErrorResponseBody =  {
            statusCode: 404,
            errorDetails: [{
                errorCode: "404",
                errorKey: "ERROR_TENANT_NOT_FOUND",
                errorMessage: "Tenant not found"
            }]
        };
        res.status(404).json(e);
    }
    else {
        
        res.status(200).json({
            issuer: `${AUTH_DOMAIN}/${tenantId}`,
            authorization_endpoint: `${AUTH_DOMAIN}/${tenantId}/oidc/authorize`,
            token_endpoint: `${AUTH_DOMAIN}/${tenantId}/oidc/token`,
            revocation_endpoint: `${AUTH_DOMAIN}/${tenantId}/oidc/revoke`,
            userinfo_endpoint: `${AUTH_DOMAIN}/${tenantId}/oidc/userinfo`,
            jwks_uri: `${AUTH_DOMAIN}/${tenantId}/oidc/keys`,
            token_endpoint_auth_methods_supported: [
                "client_secret_post",
                "client_secret_jwt",
                "none"
            ],
            response_modes_supported: [
                "query",
                "fragment"
            ],
            token_endpoint_auth_signing_alg_values_supported: [
                "RS256"
            ],
            claims_supported: [
                "sub",
                "iss",
                "aud",
                "iat",
                "exp",
                "at_hash",
                "name",
                "given_name",
                "family_name",
                "middle_name",
                "nickname",
                "preferred_username",
                "profile",
                "phone_number",
                "address",
                "updated_at",
                "email",
                "country_code"
            ],
            claims_parameter_supported: false,
            scopes_supported: [
                "openid",
                "profile",
                "email",
                "offline_access"
            ],
            response_types_supported: [
                "code"
            ],
            subject_types_supported: [
                "public"
            ],
            id_token_signing_alg_values_supported: [
                "RS256"
            ],
            request_object_signing_alg_values_supported: [
                "none"
            ],
            claim_types_supported: [
                "normal"
            ],
            grant_types_supported: GRANT_TYPES_SUPPORTED,
            code_challenge_methods_supported: [
                "S256"
            ]

        });
    }
}


