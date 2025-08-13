import { OidcTokenErrorType } from "@/utils/consts"

export interface ErrorDetail {
    errorCode: string,
    errorKey: string,
    errorMessage: string
}

export interface ErrorResponseBody {
    statusCode: number,
    errorDetails: Array<ErrorDetail>
}

export interface OIDCErrorResponseBody {
    // The 3 specification-compliant properties
    error: OidcTokenErrorType,
    error_description: string,
    error_uri: string,
    // extensions 
    timestamp: number,
    error_code: string,
    trace_id: string
}

// export const ERROR_CODES = new Map<string, ErrorDetail>([
    
// ]);

export const ERROR_CODES: Record<string, ErrorDetail> = {
    DEFAULT: {
        errorCode: "DEFAULT",
        errorKey: "ERROR_DEFAULT_ERROR_MESSAGE",
        errorMessage: "An unknown error occurred during the processing of your request. Report the error or review the logs for more information."
    },
    EC00001: {
        errorCode: "EC00001",
        errorKey: "ERROR_INVALID_CLIENT_FOR_AUTHENTICATION_GROUP_QUERY",
        errorMessage: "Invalid client for authentication groups"
    },
    EC00002: {
        errorCode: "EC00002",
        errorKey: "ERROR_INVALID_OR_MISSING_SUBJECT",
        errorMessage: "Invalid or missing subject"
    },
    EC00003: {
        errorCode: "EC00003",
        errorKey: "ERROR_INSUFFICIENT_PERMISSIONS",
        errorMessage: "Insufficient permissions to perform operation"
    },
    EC00004: {
        errorCode: "EC00004",
        errorKey: "ERROR_INVALID_PERMISSION_FOR_TENANT",
        errorMessage: "Invalid permissions to perform operation for this tenant"
    },
    EC00005: {
        errorCode: "EC00005",
        errorKey: "ERROR_MISSING_TENANT_ID",
        errorMessage: "Missing tenant ID"
    },
    EC00006: {
        errorCode: "EC00006",
        errorKey: "ERROR_NO_MATCHING_TENANT_FOR_AUTHENTICATION_GROUP_QUERY",
        errorMessage: "No tenants found for user authentication groups"
    },
    EC00007: {
        errorCode: "EC00007",
        errorKey: "ERROR_INSUFFICIENT_PERMISSIONS_TO_VIEW_AUTHENTICATION_GROUP",
        errorMessage: "You do not have permission to view this authentication group"
    },
    EC00008: {
        errorCode: "EC00008",
        errorKey: "ERROR_TENANT_NOT_FOUND",
        errorMessage: "Tenant not found"
    },
    EC00009: {
        errorCode: "EC00009",
        errorKey: "ERROR_TENANT_IS_DISABLED_OR_MARKED_FOR_DELETE",
        errorMessage: "The operation cannot be performed because parent tenant is disabled or marked for deletion"
    },
    EC00010: {
        errorCode: "EC00010",
        errorKey: "ERROR_THE_AUTHENTICATION_GROUP_DOES_NOT_EXIST",
        errorMessage: "The authentication group does not exist"
    },
    EC00011: {
        errorCode: "EC00011",
        errorKey: "ERROR_CLIENT_DOES_NOT_EXIST",
        errorMessage: "Client does not exist"
    },
    EC00012: {
        errorCode: "EC00012",
        errorKey: "ERROR_CANNOT_ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT",
        errorMessage: "Authentication group belongs to a different tenant than the client and cannot be assigned"
    },
    EC00013: {
        errorCode: "EC00013",
        errorKey: "ERROR_USER_DOES_NOT_EXIST",
        errorMessage: "User not found"
    },
    EC00014: {
        errorCode: "EC00014",
        errorKey: "ERROR_INVALID_TENANT_FOR_USER_AUTHENTICATION_GROUP_ASSIGNMENT",
        errorMessage: "User cannot be assigned to the authentication group because they do not belong to the same tenant"
    },
    EC00015: {
        errorCode: "EC00015",
        errorKey: "ERROR_KEY_DOES_NOT_EXIST",
        errorMessage: "Key does not exist"
    },
    EC00016: {
        errorCode: "EC00016",
        errorKey: "ERROR_INVALID_CONTACT_TYPE",
        errorMessage: "Invalid contact type"
    },
    EC00017: {
        errorCode: "EC00017",
        errorKey: "ERROR_INVALID_EMAIL",
        errorMessage: "Invalid email"
    },
    EC00018: {
        errorCode: "EC00018",
        errorKey: "ERROR_OIDC_PROVIDER_NOT_ASSIGNED_TO_TENANT_FOR_READ_OPERATION",
        errorMessage: "You do have permission to view the OIDC provider"
    },
    EC00019: {
        errorCode: "EC00019",
        errorKey: "ERROR_UNABLE_TO_ENCRYPT_OIDC_PROVIDER_CLIENT_SECRET",
        errorMessage: "Failure encrypting the client secret of the OIDC provider"
    },
    EC00020: {
        errorCode: "EC00020",
        errorKey: "ERROR_MISSING_CLIENT_ID_IN_OIDC_CONFIGURATION",
        errorMessage: "The client id value is missing in the OIDC provider configuration"
    },
    EC00021: {
        errorCode: "EC00021",
        errorKey: "ERROR_MISSING_WELL_KNOWN_URI_IN_OIDC_CONFIGURATION",
        errorMessage: "The well known URI is missing in the OIDC provider configuration"
    },
    EC00022: {
        errorCode: "EC00022",
        errorKey: "ERROR_MISSING_OIDC_PROVIDER_NAME",
        errorMessage: "The provider name is required"
    },
    EC00023: {
        errorCode: "EC00023",
        errorKey: "ERROR_NO_FEDERATED_OIDC_PROVIDER_FOUND",
        errorMessage: "OIDC provider not found"
    },
    EC00024: {
        errorCode: "EC00024",
        errorKey: "ERROR_ENTERPRISE_OIDC_PROVIDERS_CANNOT_BE_ASSIGNED_TO_A_TENANT",
        errorMessage: "Enterprise OIDC providers cannot be assigned to tenants"
    },
    EC00025: {
        errorCode: "EC00025",
        errorKey: "ERROR_CANNOT_ASSIGN_DOMAINS_TO_SOCIAL_OIDC_PROVIDERS",
        errorMessage: "Domains cannot be assigned to social OIDC providers"
    },
    EC00026: {
        errorCode: "EC00026",
        errorKey: "ERROR_DOMAIN_IS_ALREADY_ASSIGNED_TO_AN_EXTERNAL_OIDC_PROVIDER",
        errorMessage: "The domain is already assigned to an OIDC provider"
    },
    EC00027: {
        errorCode: "EC00027",
        errorKey: "ERROR_INSUFFICIENT_PERMISSIONS_TO_READ_AUTHORIZATION_GROUP",
        errorMessage: "You do not have permissions to view this authorization group"
    },
    EC00028: {
        errorCode: "EC00028",
        errorKey: "ERROR_GROUP_NOT_FOUND",
        errorMessage: "Authentication group not found"
    },
    EC00029: {
        errorCode: "EC00029",
        errorKey: "ERROR_INVALID_TENANT_FOR_USER_AUTHORIZATION_GROUP_ASSIGNMENT",
        errorMessage: "User cannot be assigned to the authorization group because they do not belong to the same tenant"
    }, 
    EC00030: {
        errorCode: "EC00030",
        errorKey: "ERROR_NO_ACCESS_TO_TENANT",
        errorMessage: "You do not have permissions to view this tenant"
    },
    EC00031: {
        errorCode: "EC00031",
        errorKey: "ERROR_INVALID_CLIENT_TYPE",
        errorMessage: "Invalid or missing client type"
    },
    EC00032: {
        errorCode: "EC00032",
        errorKey: "ERROR_UNABLE_TO_ENCRYPT_CLIENT_SECRET",
        errorMessage: "Failure encrypting the client secret"
    },
    EC00033: {
        errorCode: "EC00033",
        errorKey: "ERROR_OIDC_NOT_ENABLED_FOR_THIS_CLIENT",
        errorMessage: "OIDC (SSO) is not enabled for this client"
    },
    EC00034: {
        errorCode: "EC00034",
        errorKey: "ERROR_INVALID_REDIRECT_URI",
        errorMessage: "Invalid redirect URI"
    },
    EC00035: {
        errorCode: "EC00035",
        errorKey: "ERROR_UNABLE_TO_FIND_A_ROOT_TENANT",
        errorMessage: "Unable to find a root tenant. The IAM tool requires a root tenant."
    },
    EC00036: {
        errorCode: "EC00036",
        errorKey: "ERROR_UNABLE_TO_FIND_OBJECT_FOR_DELETION",
        errorMessage: "Cannot find the object for deletion"
    },
    EC00037: {
        errorCode: "EC00037",
        errorKey: "ERROR_INSUFFICIENT_SCOPE_FOR_MARK_FOR_DELETION_OPERATION",
        errorMessage: "You do not have permissions to delete this object"
    },
    EC00038: {
        errorCode: "EC00038",
        errorKey: "ERROR_UNABLE_TO_DELETE_THE_ROOT_TENANT",
        errorMessage: "The root tenant cannot be deleted"
    },
    EC00039: {
        errorCode: "EC00039",
        errorKey: "ERROR_CANNOT_DELETE_CLIENT_ASSIGNED_TO_ROOT_TENANT_FOR_OUTBOUND_SERVICE_CALLS",
        errorMessage: "Cannot delete the client assigned to the root tenant for outbound service calls"
    },
    EC00040: {
        errorCode: "EC00040",
        errorKey: "ERROR_UNABLE_TO_DELETE_IAM_MANAGEMENT_SCOPE",
        errorMessage: "Cannot delete a scope which is used for IAM management"
    },
    EC00041: {
        errorCode: "EC00041",
        errorKey: "ERROR_RATE_LIMIT_VIEW_NO_ASSIGNED_TENANT",
        errorMessage: "You do not have permissions to view the rate limits assigned to this tenant"
    },
    EC00042: {
        errorCode: "EC00042",
        errorKey: "ERROR_RATE_LIMIT_SERVICE_GROUP_NOT_FOUND",
        errorMessage: "Rate limit service not found"
    },
    EC00043: {
        errorCode: "EC00043",
        errorKey: "ERROR_TENENT_IS_ALREADY_ASSIGNED_RATE_LIMIT",
        errorMessage: "The tenant is already assigned this rate limit"
    },
    EC00044: {
        errorCode: "EC00044",
        errorKey: "ERROR_TOTAL_RATE_LIMIT_EXCEEDED",
        errorMessage: "Total rate limit has been exceeded"
    },
    EC00045: {
        errorCode: "EC00045",
        errorKey: "ERROR_CANNOT_FIND_EXISTING_TENANT_RATE_LIMIT_REL_TO_UPDATE",
        errorMessage: "The rate limit is not assigned to the tenant"
    },
    EC00046: {
        errorCode: "EC00046",
        errorKey: "ERROR_PROVIDER_CANNOT_BE_MODIFIED",
        errorMessage: "The OIDC provider is locked and cannot be modified"
    },
    EC00047: {
        errorCode: "EC00047",
        errorKey: "ERROR_FEDERATED_OIDC_PROVIDER_SECRET_ENTRY_OTP_NOT_FOUND",
        errorMessage: "Cannot find the one-time passcode for setting the OIDC provider secret"
    },
    EC00048: {
        errorCode: "EC00048",
        errorKey: "ERROR_FEDERATED_OIDC_PROVIDER_SECRET_KEY_ENTRY_OTP_IS_EXPIRED",
        errorMessage: "The one-time passcode for setting the OIDC provider secret has expired"
    },
    EC00049: {
        errorCode: "EC00049",
        errorKey: "ERROR_NO_PROVIDER_ASSIGNED_TO_TENANT_FOR_SECRET_VIEW",
        errorMessage: "The secret is unavailable because the provider is not assigned to your tenant"
    },
    EC00050: {
        errorCode: "EC00050",
        errorKey: "ERROR_MISSING_KEY_NAME_OR_ALIAS",
        errorMessage: "Missing key name or alias"
    },
    EC00051: {
        errorCode: "EC00051",
        errorKey: "ERROR_MISSING_PRIVATE_KEY",
        errorMessage: "Missing private key"
    },
    EC00052: {
        errorCode: "EC00052",
        errorKey: "ERROR_MUST_PROVIDE_EITHER_A_PUBLIC_KEY_OR_CERTIFICATE",
        errorMessage: "Missing a public key or a certificate"
    },
    EC00053: {
        errorCode: "EC00053",
        errorKey: "ERROR_ENCRYPTED_PRIVATE_KEY_REQUIRES_PASSPHRASE",
        errorMessage: "An encrypted private key requires a passphrase"
    },
    EC00054: {
        errorCode: "EC00054",
        errorKey: "ERROR_INVALID_PASSPHRASE_LENGTH_FOR_PRIVATE_KEY",
        errorMessage: "Invalid length of passphrase for the private key"
    },
    EC00055: {
        errorCode: "EC00055",
        errorKey: "ERROR_MISSING_OR_INVALID_KEY_TYPE",
        errorMessage: "Missing or invalid key type"
    },
    EC00056: {
        errorCode: "EC00056",
        errorKey: "ERROR_MISSING_OR_INVALID_KEY_USE",
        errorMessage: "Missing or invalid key use"
    },
    EC00057: {
        errorCode: "EC00057",
        errorKey: "ERROR_INVALID_EXPIRATION_FOR_PUBLIC_KEY",
        errorMessage: "Invalid expiration date for public key"
    },
    EC00058: {
        errorCode: "EC00058",
        errorKey: "ERROR_UNABLE_TO_ENCRYPT_PRIVATE_KEY_INFORMATION",
        errorMessage: "Unable to encrypt the private key or passphrase"
    },
    EC00059: {
        errorCode: "EC00059",
        errorKey: "ERROR_MISSING_COMMON_NAME",
        errorMessage: "Missing the common name (CN) attribute"
    },
    EC00060: {
        errorCode: "EC00060",
        errorKey: "ERROR_MISSING_ORGANIZATION_NAME",
        errorMessage: "Missing the organization name (O) attribute"
    },
    EC00061: {
        errorCode: "EC00061",
        errorKey: "ERROR_INVALID_EXPIRATION_FOR_CERTIFICATE",
        errorMessage: "Invalid expiration date for the certificate"
    },
    EC00062: {
        errorCode: "EC00062",
        errorKey: "ERROR_INVALID_SIGNING_KEY_STATUS",
        errorMessage: "Invalid signing key status"
    },
    EC00063: {
        errorCode: "EC00063",
        errorKey: "ERROR_CANNOT_UPDATE_A_REVOKED_KEY",
        errorMessage: "Cannot updated a revoked key"
    }, 
    EC00064: {
        errorCode: "EC00064",
        errorKey: "ERROR_NO_ACCESS_TO_SIGNING_KEY",
        errorMessage: "You do not have access to this signing key"
    },
}

