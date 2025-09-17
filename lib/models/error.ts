import { ErrorDetail } from "@/graphql/generated/graphql-types"
import { OidcTokenErrorType } from "@/utils/consts"



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


export const ERROR_CODES: Record<string, ErrorDetail> = {
    // NULL error to avoid have return types of <ErrorDetail | null> all over the place.
    NULL_ERROR: {
        errorCode: "NULL",
        errorKey: "ERROR_NULL_ERROR_MESSAGE",
        errorMessage: "Placeholder error code for non-errors."
    },
    DEFAULT: {
        errorCode: "DEFAULT",
        errorKey: "ERROR_DEFAULT_ERROR_MESSAGE",
        errorMessage: "An unknown error occurred during the processing of your request. Report the error or review the logs for more information."
    },
    EC00001: {
        errorCode: "EC00001",
        errorKey: "ERROR_INVALID_CLIENT_FOR_AUTHENTICATION_GROUP_QUERY",
        errorMessage: "Invalid client for authentication groups."
    },
    EC00002: {
        errorCode: "EC00002",
        errorKey: "ERROR_INVALID_OR_MISSING_SUBJECT",
        errorMessage: "Invalid or missing subject."
    },
    EC00003: {
        errorCode: "EC00003",
        errorKey: "ERROR_INSUFFICIENT_PERMISSIONS",
        errorMessage: "Insufficient permissions to perform operation."
    },
    EC00004: {
        errorCode: "EC00004",
        errorKey: "ERROR_INVALID_PERMISSION_FOR_TENANT",
        errorMessage: "Invalid permissions to perform operation for this tenant."
    },
    EC00005: {
        errorCode: "EC00005",
        errorKey: "ERROR_MISSING_TENANT_ID",
        errorMessage: "Missing tenant ID."
    },
    EC00006: {
        errorCode: "EC00006",
        errorKey: "ERROR_NO_MATCHING_TENANT_FOR_AUTHENTICATION_GROUP_QUERY",
        errorMessage: "No tenants found for user authentication groups."
    },
    EC00007: {
        errorCode: "EC00007",
        errorKey: "ERROR_INSUFFICIENT_PERMISSIONS_TO_VIEW_AUTHENTICATION_GROUP",
        errorMessage: "You do not have permission to view this authentication group."
    },
    EC00008: {
        errorCode: "EC00008",
        errorKey: "ERROR_TENANT_NOT_FOUND",
        errorMessage: "Tenant not found."
    },
    EC00009: {
        errorCode: "EC00009",
        errorKey: "ERROR_TENANT_IS_DISABLED_OR_MARKED_FOR_DELETE",
        errorMessage: "The operation cannot be performed because parent tenant is disabled or marked for deletion."
    },
    EC00010: {
        errorCode: "EC00010",
        errorKey: "ERROR_THE_AUTHENTICATION_GROUP_DOES_NOT_EXIST",
        errorMessage: "Authentication group not found."
    },
    EC00011: {
        errorCode: "EC00011",
        errorKey: "ERROR_CLIENT_DOES_NOT_EXIST",
        errorMessage: "Client not found."
    },
    EC00012: {
        errorCode: "EC00012",
        errorKey: "ERROR_CANNOT_ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT",
        errorMessage: "Authentication group belongs to a different tenant than the client and cannot be assigned."
    },
    EC00013: {
        errorCode: "EC00013",
        errorKey: "ERROR_USER_DOES_NOT_EXIST",
        errorMessage: "User not found."
    },
    EC00014: {
        errorCode: "EC00014",
        errorKey: "ERROR_INVALID_TENANT_FOR_USER_AUTHENTICATION_GROUP_ASSIGNMENT",
        errorMessage: "User cannot be assigned to the authentication group because they do not belong to the same tenant."
    },
    EC00015: {
        errorCode: "EC00015",
        errorKey: "ERROR_KEY_DOES_NOT_EXIST",
        errorMessage: "Key not found."
    },
    EC00016: {
        errorCode: "EC00016",
        errorKey: "ERROR_INVALID_CONTACT_TYPE",
        errorMessage: "Invalid contact type."
    },
    EC00017: {
        errorCode: "EC00017",
        errorKey: "ERROR_INVALID_EMAIL",
        errorMessage: "Invalid email."
    },
    EC00018: {
        errorCode: "EC00018",
        errorKey: "ERROR_OIDC_PROVIDER_NOT_ASSIGNED_TO_TENANT_FOR_READ_OPERATION",
        errorMessage: "You do have permission to view the OIDC provider."
    },
    EC00019: {
        errorCode: "EC00019",
        errorKey: "ERROR_UNABLE_TO_ENCRYPT_OIDC_PROVIDER_CLIENT_SECRET",
        errorMessage: "Failure encrypting the client secret of the OIDC provider."
    },
    EC00020: {
        errorCode: "EC00020",
        errorKey: "ERROR_MISSING_CLIENT_ID_IN_OIDC_CONFIGURATION",
        errorMessage: "The client id value is missing in the OIDC provider configuration."
    },
    EC00021: {
        errorCode: "EC00021",
        errorKey: "ERROR_MISSING_WELL_KNOWN_URI_IN_OIDC_CONFIGURATION",
        errorMessage: "The well known URI is missing in the OIDC provider configuration."
    },
    EC00022: {
        errorCode: "EC00022",
        errorKey: "ERROR_MISSING_OIDC_PROVIDER_NAME",
        errorMessage: "The provider name is required."
    },
    EC00023: {
        errorCode: "EC00023",
        errorKey: "ERROR_NO_FEDERATED_OIDC_PROVIDER_FOUND",
        errorMessage: "OIDC provider not found."
    },
    EC00024: {
        errorCode: "EC00024",
        errorKey: "ERROR_ENTERPRISE_OIDC_PROVIDERS_CANNOT_BE_ASSIGNED_TO_A_TENANT",
        errorMessage: "Enterprise OIDC providers cannot be assigned to tenants."
    },
    EC00025: {
        errorCode: "EC00025",
        errorKey: "ERROR_CANNOT_ASSIGN_DOMAINS_TO_SOCIAL_OIDC_PROVIDERS",
        errorMessage: "Domains cannot be assigned to social OIDC providers."
    },
    EC00026: {
        errorCode: "EC00026",
        errorKey: "ERROR_DOMAIN_IS_ALREADY_ASSIGNED_TO_AN_EXTERNAL_OIDC_PROVIDER",
        errorMessage: "The domain is already assigned to an OIDC provider."
    },
    EC00027: {
        errorCode: "EC00027",
        errorKey: "ERROR_INSUFFICIENT_PERMISSIONS_TO_READ_AUTHORIZATION_GROUP",
        errorMessage: "You do not have permissions to view this authorization group."
    },
    EC00028: {
        errorCode: "EC00028",
        errorKey: "ERROR_AUTHORIZATION_GROUP_NOT_FOUND",
        errorMessage: "Authorization group not found."
    },
    EC00029: {
        errorCode: "EC00029",
        errorKey: "ERROR_INVALID_TENANT_FOR_USER_AUTHORIZATION_GROUP_ASSIGNMENT",
        errorMessage: "User cannot be assigned to the authorization group because they do not belong to the same tenant."
    }, 
    EC00030: {
        errorCode: "EC00030",
        errorKey: "ERROR_NO_ACCESS_TO_TENANT",
        errorMessage: "You do not have permissions to view this tenant."
    },
    EC00031: {
        errorCode: "EC00031",
        errorKey: "ERROR_INVALID_CLIENT_TYPE",
        errorMessage: "Invalid or missing client type."
    },
    EC00032: {
        errorCode: "EC00032",
        errorKey: "ERROR_UNABLE_TO_ENCRYPT_CLIENT_SECRET",
        errorMessage: "Failure encrypting the client secret."
    },
    EC00033: {
        errorCode: "EC00033",
        errorKey: "ERROR_OIDC_NOT_ENABLED_FOR_THIS_CLIENT",
        errorMessage: "OIDC (SSO) is not enabled for this client."
    },
    EC00034: {
        errorCode: "EC00034",
        errorKey: "ERROR_INVALID_REDIRECT_URI",
        errorMessage: "Invalid redirect URI."
    },
    EC00035: {
        errorCode: "EC00035",
        errorKey: "ERROR_UNABLE_TO_FIND_A_ROOT_TENANT",
        errorMessage: "Unable to find a root tenant. The IAM tool requires a root tenant."
    },
    EC00036: {
        errorCode: "EC00036",
        errorKey: "ERROR_UNABLE_TO_FIND_OBJECT_FOR_DELETION",
        errorMessage: "Cannot find the object for deletion."
    },
    EC00037: {
        errorCode: "EC00037",
        errorKey: "ERROR_INSUFFICIENT_SCOPE_FOR_MARK_FOR_DELETION_OPERATION",
        errorMessage: "You do not have permissions to delete this object."
    },
    EC00038: {
        errorCode: "EC00038",
        errorKey: "ERROR_UNABLE_TO_DELETE_THE_ROOT_TENANT",
        errorMessage: "The root tenant cannot be deleted."
    },
    EC00039: {
        errorCode: "EC00039",
        errorKey: "ERROR_CANNOT_DELETE_CLIENT_ASSIGNED_TO_ROOT_TENANT_FOR_OUTBOUND_SERVICE_CALLS",
        errorMessage: "Cannot delete the client assigned to the root tenant for outbound service calls."
    },
    EC00040: {
        errorCode: "EC00040",
        errorKey: "ERROR_UNABLE_TO_DELETE_IAM_MANAGEMENT_SCOPE",
        errorMessage: "Cannot delete a scope which is used for IAM management."
    },
    EC00041: {
        errorCode: "EC00041",
        errorKey: "ERROR_RATE_LIMIT_VIEW_NO_ASSIGNED_TENANT",
        errorMessage: "You do not have permissions to view the rate limits assigned to this tenant."
    },
    EC00042: {
        errorCode: "EC00042",
        errorKey: "ERROR_RATE_LIMIT_SERVICE_GROUP_NOT_FOUND",
        errorMessage: "Rate limit service group not found."
    },
    EC00043: {
        errorCode: "EC00043",
        errorKey: "ERROR_TENENT_IS_ALREADY_ASSIGNED_RATE_LIMIT",
        errorMessage: "The tenant is already assigned this rate limit."
    },
    EC00044: {
        errorCode: "EC00044",
        errorKey: "ERROR_TOTAL_RATE_LIMIT_EXCEEDED",
        errorMessage: "Total rate limit has been exceeded."
    },
    EC00045: {
        errorCode: "EC00045",
        errorKey: "ERROR_CANNOT_FIND_EXISTING_TENANT_RATE_LIMIT_REL_TO_UPDATE",
        errorMessage: "The rate limit is not assigned to the tenant."
    },
    EC00046: {
        errorCode: "EC00046",
        errorKey: "ERROR_PROVIDER_CANNOT_BE_MODIFIED",
        errorMessage: "The OIDC provider is locked and cannot be modified."
    },
    EC00047: {
        errorCode: "EC00047",
        errorKey: "ERROR_FEDERATED_OIDC_PROVIDER_SECRET_ENTRY_OTP_NOT_FOUND",
        errorMessage: "Cannot find the one-time passcode for setting the OIDC provider secret."
    },
    EC00048: {
        errorCode: "EC00048",
        errorKey: "ERROR_FEDERATED_OIDC_PROVIDER_SECRET_KEY_ENTRY_OTP_IS_EXPIRED",
        errorMessage: "The one-time passcode for setting the OIDC provider secret has expired."
    },
    EC00049: {
        errorCode: "EC00049",
        errorKey: "ERROR_NO_PROVIDER_ASSIGNED_TO_TENANT_FOR_SECRET_VIEW",
        errorMessage: "The secret is unavailable because the provider is not assigned to your tenant."
    },
    EC00050: {
        errorCode: "EC00050",
        errorKey: "ERROR_MISSING_KEY_NAME_OR_ALIAS",
        errorMessage: "Missing key name or alias."
    },
    EC00051: {
        errorCode: "EC00051",
        errorKey: "ERROR_MISSING_PRIVATE_KEY",
        errorMessage: "Missing private key."
    },
    EC00052: {
        errorCode: "EC00052",
        errorKey: "ERROR_MUST_PROVIDE_EITHER_A_PUBLIC_KEY_OR_CERTIFICATE",
        errorMessage: "Missing a public key or a certificate."
    },
    EC00053: {
        errorCode: "EC00053",
        errorKey: "ERROR_ENCRYPTED_PRIVATE_KEY_REQUIRES_PASSPHRASE",
        errorMessage: "An encrypted private key requires a passphrase."
    },
    EC00054: {
        errorCode: "EC00054",
        errorKey: "ERROR_INVALID_PASSPHRASE_LENGTH_FOR_PRIVATE_KEY",
        errorMessage: "Invalid length of passphrase for the private key."
    },
    EC00055: {
        errorCode: "EC00055",
        errorKey: "ERROR_MISSING_OR_INVALID_KEY_TYPE",
        errorMessage: "Missing or invalid key type."
    },
    EC00056: {
        errorCode: "EC00056",
        errorKey: "ERROR_MISSING_OR_INVALID_KEY_USE",
        errorMessage: "Missing or invalid key use."
    },
    EC00057: {
        errorCode: "EC00057",
        errorKey: "ERROR_INVALID_EXPIRATION_FOR_PUBLIC_KEY",
        errorMessage: "Invalid expiration date for public key."
    },
    EC00058: {
        errorCode: "EC00058",
        errorKey: "ERROR_UNABLE_TO_ENCRYPT_PRIVATE_KEY_INFORMATION",
        errorMessage: "Unable to encrypt the private key or passphrase."
    },
    EC00059: {
        errorCode: "EC00059",
        errorKey: "ERROR_MISSING_COMMON_NAME",
        errorMessage: "Missing the common name (CN) attribute."
    },
    EC00060: {
        errorCode: "EC00060",
        errorKey: "ERROR_MISSING_ORGANIZATION_NAME",
        errorMessage: "Missing the organization name (O) attribute."
    },
    EC00061: {
        errorCode: "EC00061",
        errorKey: "ERROR_INVALID_EXPIRATION_FOR_CERTIFICATE",
        errorMessage: "Invalid expiration date for the certificate."
    },
    EC00062: {
        errorCode: "EC00062",
        errorKey: "ERROR_INVALID_SIGNING_KEY_STATUS",
        errorMessage: "Invalid signing key status."
    },
    EC00063: {
        errorCode: "EC00063",
        errorKey: "ERROR_CANNOT_UPDATE_A_REVOKED_KEY",
        errorMessage: "Cannot updated a revoked key."
    }, 
    EC00064: {
        errorCode: "EC00064",
        errorKey: "ERROR_NO_ACCESS_TO_SIGNING_KEY",
        errorMessage: "You do not have access to this signing key."
    },
    EC00065: {
        errorCode: "EC00065",
        errorKey: "ERROR_INVALID_PROFILE_FOR_SCOPE_QUERY",
        errorMessage: "Your profile is not set up for querying scope."
    },
    EC00066: {
        errorCode: "EC00066",
        errorKey: "ERROR_NO_PERMISSIONS_TO_VIEW_SCOPE",
        errorMessage: "You do not have permissions to view scope details."
    }    ,
    EC00067: {
        errorCode: "EC00067",
        errorKey: "ERROR_NO_PERMISSION_TO_VIEW_TENANT_SCOPE",
        errorMessage: "You do not have permissions to view scope for this tenant."
    },
    EC00068: {
        errorCode: "EC00068",
        errorKey: "ERROR_INVALID_SCOPE_USAGE_FOR_CREATION",
        errorMessage: "Invalid scope usage."
    },
    EC00069: {
        errorCode: "EC00069",
        errorKey: "ERROR_SCOPE_NAME_AND_DESCRIPTION_MUST_BE_POPULATED",
        errorMessage: "Scope name and description must be populated."
    },
    EC00070: {
        errorCode: "EC00070",
        errorKey: "ERROR_SCOPE_EXISTS_WITH_SUPPLIED_NAME",
        errorMessage: "A scope already exists with the supplied name."
    },
    EC00071: {
        errorCode: "EC00071",
        errorKey: "ERROR_SCOPE_NOT_FOUND",
        errorMessage: "Scope not found."
    },
    EC00072: {
        errorCode: "EC00072",
        errorKey: "ERROR_IAM_MANAGEMENT_SCOPE_IS_READ_ONLY",
        errorMessage: "Scope used for IAM management is read only and cannot be modified."
    },
    EC00073: {
        errorCode: "EC00073",
        errorKey: "ERROR_CANNOT_FIND_TENANT_FOR_SCOPE_ASSIGNMENT",
        errorMessage: "Cannot find tenant for scope assignment."
    },
    EC00074: {
        errorCode: "EC00074",
        errorKey: "ERROR_CANNOT_REMOVE_IAM_MANAGEMENT_SCOPE_FROM_ROOT_TENANT",
        errorMessage: "IAM management scope cannot be removed from the root tenant."
    },
    EC00075: {
        errorCode: "EC00075",
        errorKey: "ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_CLIENT",
        errorMessage: "The scope value is not assigned to the tenant of this client."
    },
    EC00076: {
        errorCode: "EC00076",
        errorKey: "ERROR_CLIENT_DOES_NOT_BELONG_TO_TENANT",
        errorMessage: "The client used for assignment does not belong to the supplied tenant."
    },
    EC00077: {
        errorCode: "EC00077",
        errorKey: "ERROR_UNABLE_TO_ASSIGN_SCOPE_TO_IDENTITY_CLIENT_TYPE",
        errorMessage: "Unable to assign scope values to an Identity client type."
    },
    EC00078: {
        errorCode: "EC00078",
        errorKey: "ERROR_ONE_OR_MORE_SCOPE_VALUES_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_AUTHORIZATION_GROUP",
        errorMessage: "One or more scope values is not assigned to the tenant of this authorization group."
    },
    EC00079: {
        errorCode: "EC00079",
        errorKey: "ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_AUTHORIZATION_GROUP",
        errorMessage: "The scope value is not assigned to the tenant of this authorization group."
    },
    EC00080: {
        errorCode: "EC00080",
        errorKey: "ERROR_AUTHORIZATION_GROUP_DOES_NOT_BELONG_TO_TENANT",
        errorMessage: "The authorization group used for assignment does not belong to the supplied tenant."
    },
    EC00081: {
        errorCode: "EC00081",
        errorKey: "ERROR_USER_DOES_NOT_BELONG_TO_TENANT_FOR_SCOPE_ASSIGNMENT",
        errorMessage: "The user does not belong to the tenant for scope assignment."
    },
    EC00082: {
        errorCode: "EC00082",
        errorKey: "ERROR_ONE_OR_MORE_SCOPE_VALUES_IS_NOT_ASSIGNED_TO_THE_TENANT_THAT_THE_USER_BELONGS_TO",
        errorMessage: "One or more scope values is not assigned to the tenant that the user belongs to."
    },
    EC00083: {
        errorCode: "EC00083",
        errorKey: "ERROR_CANNOT_FIND_ACCESS_RULE_ID",
        errorMessage: "Access rule not found."
    },
    EC00084: {
        errorCode: "EC00084",
        errorKey: "ERROR_CANNOT_ASSIGN_ROOT_TENANT_SCOPE_TO_NON_ROOT_TENANT",
        errorMessage: "Cannot assign a root tenant exclusive scope to a non-root tenant."
    },
    EC00085: {
        errorCode: "EC00085",
        errorKey: "ERROR_NO_PERMISSIONS_FOR_SEARCH",
        errorMessage: "You do not have permission to search IAM data."
    },
    EC00086: {
        errorCode: "EC00086",
        errorKey: "ERROR_NO_VALID_PERMISSIONS_DEFINED_FOR_SEARCH_TYPE",
        errorMessage: "The search type requested does not exist."
    },
    EC00087: {
        errorCode: "EC00087",
        errorKey: "ERROR_NO_PERMISSION_TO_VIEW_SEARCH_RESULT_TYPE",
        errorMessage: "You do not have permissions to view this search result type."
    },
    EC00088: {
        errorCode: "EC00088",
        errorKey: "ERROR_PASSWORD_MINIMUM_LENGTH_OUT_OF_BOUNDS",
        errorMessage: "The password minimum length is out of bound.s"
    },
    EC00089: {
        errorCode: "EC00089",
        errorKey: "ERROR_PASSWORD_MAXIMUM_LENGTH_OUT_OF_BOUNDS",
        errorMessage: "The password maximum length is out of bounds."
    },
    EC00090: {
        errorCode: "",
        errorKey: "ERROR_NO_MFA_TYPE_SPECIFIED_FOR_REQUIRED_MFA",
        errorMessage: "MFA is required and no MFA type has been selected."
    },
    EC00091: {
        errorCode: "EC00091",
        errorKey: "ERROR_INVALID_MFA_TYPE_SUPPLIED",
        errorMessage: "Invalid MFA type supplied."
    },
    EC00092: {
        errorCode: "EC00092",
        errorKey: "ERROR_INVALID_PASSWORD_HASHING_ALGORITHM_SUPPLIED",
        errorMessage: "Invalid password hashing algorithm supplied."
    },
    EC00093: {
        errorCode: "EC00093",
        errorKey: "ERROR_INVALID_ROOT_CLIENT",
        errorMessage: "Invalid root client."
    },
    EC00094: {
        errorCode: "EC00094",
        errorKey: "ERROR_CLIENT_DOES_NOT_BELONG_TO_THE_ROOT_TENANT",
        errorMessage: "The client does not belong to the root tenant."
    },
    EC00095: {
        errorCode: "EC00095",
        errorKey: "ERROR_INVALID_AUTHENTICATION_STATE",
        errorMessage: "Authentication failed due to a missing step or because authentication took too long."
    },
    EC00096: {
        errorCode: "EC00096",
        errorKey: "ERROR_AUTHENTICATION_INVALID_USER_ID",
        errorMessage: "Invalid user for authentication."
    },
    EC00097: {
        errorCode: "EC00097",
        errorKey: "ERROR_USER_CANNOT_BE_AUTHENTICATED",
        errorMessage: "The user account is locked or disabled and cannot be authenticated."
    },
    EC00098: {
        errorCode: "EC00098",
        errorKey: "ERROR_AUTHENTICATION_FORGOT_PASSWORD_NO_BACKUP_EMIAL_CONFIGURED",
        errorMessage: "No recovery email was configured with the supplied email address."
    },
    EC00099: {
        errorCode: "EC00099",
        errorKey: "ERROR_INVALID_PASSWORD_RESET_TOKEN",
        errorMessage: "The password reset token is not valid."
    },
    EC00100: {
        errorCode: "EC00100",
        errorKey: "ERROR_REQUIRED_TERMS_AND_CONDITIONS_NOT_ACCEPTED",
        errorMessage: "Required terms and conditions not accepted."
    },
    EC00101: {
        errorCode: "EC00101",
        errorKey: "ERROR_INVALID_USER_CODE_FOR_DEVICE_CODE_NOT_FOUND",
        errorMessage: "The code you entered for registering your device was not found."
    },
    EC00102: {
        errorCode: "EC00102",
        errorKey: "ERROR_DEVICE_CODE_HAS_EXPIRED",
        errorMessage: "The code you entered for registering your device has expired."
    },
    EC00103: {
        errorCode: "EC00103",
        errorKey: "ERROR_DEVICE_CODE_HAS_BEEN_FINALIZED",
        errorMessage: "The code you entered for registering your device has already been used."
    },
    EC00104: {
        errorCode: "EC00104",
        errorKey: "ERROR_INVALID_PRE_AUTH_TOKEN_OR_DEVICE_CODE",
        errorMessage: "Authentication is denied."
    },
    EC00105: {
        errorCode: "EC00105",
        errorKey: "ERROR_INVALID_TENANT_FOR_PRE_AUTH_TOKEN",
        errorMessage: "Authentication cannot be completed due to incorrect or missing information."
    },
    EC00106: {
        errorCode: "EC00106",
        errorKey: "ERROR_USER_IS_NOT_PERMITTED_TO_AUTHENTICATE_TO_THIS_TENANT",
        errorMessage: "You are not permitted to authenticate to this tenant."
    },
    EC00107: {
        errorCode: "EC00107",
        errorKey: "ERROR_USER_DOES_NOT_BELONG_TO_VALID_AUTHENTICATION_GROUP_FOR_CLIENT",
        errorMessage: "You are not permitted to authenticate to the application because you do not belong to an authentication group assigned to this application."
    },
    EC00108: {
        errorCode: "EC00108",
        errorKey: "ERROR_USER_REGISTRATION_IS_NOT_PERMITTED_FOR_THIS_TENANT",
        errorMessage: "Your account cannot be found and registration is not permitted for this tenant."
    },
    EC00109: {
        errorCode: "EC00109",
        errorKey: "ERROR_NO_CREDENTIALS_FOUND_FOR_USER",
        errorMessage: "Authentication failed. No credentials were found for your account."
    },
    EC00110: {
        errorCode: "EC00110",
        errorKey: "ERROR_NO_DOMAIN_FOUND_FOR_TENANT_MANAGEMENT",
        errorMessage: "You are not allowed management access to any tenant."
    },
    EC00111: {
        errorCode: "EC00111",
        errorKey: "ERROR_EXCLUSIVE_TENANT_AND_NO_FEDERATED_OICD_PROVIDER",
        errorMessage: "Your account is either not valid for this tenant or cannot be created with this tenant."
    },
    EC00112: {
        errorCode: "EC00112",
        errorKey: "ERROR_TENANT_DOES_NOT_ALLOW_FEDERATED_OIDC_PROVIDER_AUTHENTICATION",
        errorMessage: "Your account is managed through a 3rd party identity provider and this tenant does not permit authentication through a 3rd party."
    },
    EC00113: {
        errorCode: "EC00113",
        errorKey: "ERROR_UNABLE_TO_DETERMINE_AUTHORIZATION_PARAMETERS_FOR_FEDERATED_OIDC_PROVIDER",
        errorMessage: "Unable to determine authorization parameters for 3rd party identity provider."
    },
    EC00114: {
        errorCode: "EC00114",
        errorKey: "ERROR_USER_TENANT_REL_DOES_NOT_EXIST",
        errorMessage: "Access to user details is not permitted."
    },
    EC00115: {
        errorCode: "EC00115",
        errorKey: "ERROR_NO_MATCHING_USER_AND_NO_TENANT_SELF_REGISTRATION",
        errorMessage: "Your account does not exist and it cannot be created."
    },
    EC00116: {
        errorCode: "EC00116",
        errorKey: "ERROR_CONDITIONS_FOR_AUTHENTICATION_NOT_MET",
        errorMessage: "It is not possible to authenticate your account."
    },
    EC00117: {
        errorCode: "EC00117",
        errorKey: "ERROR_INVALID_CREDENTIALS",
        errorMessage: "Authentication failed. Invalid credentials."
    },
    EC00118: {
        errorCode: "EC00118",
        errorKey: "ERROR_USER_IS_LOCKED",
        errorMessage: "Your account has been locked after too many failed login attempts."
    },
    EC00119: {
        errorCode: "EC00119",
        errorKey: "ERROR_AUTHENTICTION_IS_PAUSED_FOR_USER",
        errorMessage: "Authentication is temporarily disabled for your account. Please wait before trying again."
    },
    EC00120: {
        errorCode: "EC00120",
        errorKey: "ERROR_TOTP_TOKEN_INVALID",
        errorMessage: "The passcode you entered is not valid."
    },
    EC00121: {
        errorCode: "EC00121",
        errorKey: "ERROR_INVALID_SECURITY_KEY_INPUT",
        errorMessage: "Your security key input is not valid."
    },
    EC00122: {
        errorCode: "EC00122",
        errorKey: "ERROR_NO_LEGACY_USER_MIGRATION_CONFIGURATION_FOUND",
        errorMessage: "Your account cannot be authenticated using this tenant"
    },
    EC00123: {
        errorCode: "EC00123",
        errorKey: "ERROR_INVALID_CREDENTIALS_FOR_USER_MIGRATION",
        errorMessage: "Authentication failed. Invalid Credentials."
    },
    EC00124: {
        errorCode: "EC00124",
        errorKey: "ERROR_NO_LEGACY_USER_PROFILE_FOUND",
        errorMessage: "Authentication failed. Your account profile could not be found."
    },
    EC00125: {
        errorCode: "EC00125",
        errorKey: "ERROR_PASSWORD_DOES_NOT_MEET_REQUIRED_FORMAT",
        errorMessage: "Your password does not meet the required format"
    },
    EC00126: {
        errorCode: "EC00126",
        errorKey: "ERROR_PASSWORD_HAS_BEEN_PREVIOUSLY_USED_WITHIN_THE_PASSWORD_HISTORY_PERIOD",
        errorMessage: "Your password has been used previously. Please choose another one."
    },
    EC00127: {
        errorCode: "EC00127",
        errorKey: "ERROR_CREATING_TOTP",
        errorMessage: "There was an error creating the time-based one-time passcode."
    },
    EC00128: {
        errorCode: "EC00128",
        errorKey: "ERROR_VALIDATING_SECURITY_KEY_REGISTRATION_INPUT",
        errorMessage: "There was an error validating the security key registration."
    },
    EC00129: {
        errorCode: "EC00129",
        errorKey: "ERROR_NOT_A_VALID_SOCIAL_OIDC_PROVIDER",
        errorMessage: "Authentication only allowed for social 3rd party identity providers"
    },
    EC00130: {
        errorCode: "EC00130",
        errorKey: "ERROR_SOCIAL_PROVIDER_NOT_ASSIGNED_TO_TENANT",
        errorMessage: "Authentication using a social identity provider is not permitted for this tenant."
    },
    EC00131: {
        errorCode: "EC00131",
        errorKey: "ERROR_INVALID_TENANT_FOR_AUTHENTICATION_COMPLETION",
        errorMessage: "Authentication cannot be completed due to a missing or invalid tenant."
    },
    EC00132: {
        errorCode: "EC00132",
        errorKey: "ERROR_GENERATING_ACCESS_TOKEN_AUTHENTICATION_COMPLETION",
        errorMessage: "There was an error completing your authentication. "
    },
    EC00133: {
        errorCode: "EC00133",
        errorKey: "ERROR_REGISTRATION_FOR_USER_ALREADY_IN_PROGRESS",
        errorMessage: "Registration cannot be started. There is an active registration already in-progress for this account."
    },
    EC00134: {
        errorCode: "EC00134",
        errorKey: "ERROR_REGISTRATION_NO_USER_FOUND_FOR_EMAIL_VALIDATION_TOKEN",
        errorMessage: "The validation token you entered is invalid."
    },
    EC00135: {
        errorCode: "EC00135",
        errorKey: "ERROR_INVALID_USER_FOUND_FOR_TOKEN",
        errorMessage: "The validation token you entered is invalid."
    },
    EC00136: {
        errorCode: "EC00136",
        errorKey: "ERROR_NO_RECOVERY_EMAIL_FOUND",
        errorMessage: "Your recovery email was not found."
    },
    EC00137: {
        errorCode: "EC00137",
        errorKey: "ERROR_NO_DURESS_PASSWORD_SUPPLIED",
        errorMessage: "No duress password was supplied."
    },
    EC00138: {
        errorCode: "EC00138",
        errorKey: "ERROR_PASSWORD_COUNT_INCORRECT",
        errorMessage: "There are no credentials for your account. A duress password cannot be created."
    },
    EC00139: {
        errorCode: "EC00139",
        errorKey: "ERROR_DURESS_PASSWORD_HAS_BEEN_USED_DURING_REGISTRATION",
        errorMessage: "The duress password you entered has already been used during registration. Choose another duress password."
    },
    EC00140: {
        errorCode: "EC00140",
        errorKey: "ERROR_NO_RECOVERY_EMAIL_SUPPLIED",
        errorMessage: "No recovery email was supplied"
    },
    EC00141: {
        errorCode: "EC00141",
        errorKey: "ERROR_RECOVERY_ACCOUNT_ALREADY_EXISTS_FOR_USER",
        errorMessage: "A recovery email for your account already exists."
    },
    EC00142: {
        errorCode: "EC00142",
        errorKey: "ERROR_EMAIL_ALREADY_IN_USE",
        errorMessage: "Email is not available"
    },
    EC00143: {
        errorCode: "EC00143",
        errorKey: "ERROR_INVALID_EMAIL_ADDRESS",
        errorMessage: "Email is not in a valid format"
    },
    EC00144: {
        errorCode: "EC00144",
        errorKey: "ERROR_DOMAIN_IS_MANAGED_BY_EXTERNAL_OIDC_PROVIDER",
        errorMessage: "The email adddress is not permitted."
    },
    EC00145: {
        errorCode: "EC00145",
        errorKey: "ERROR_UNABLE_TO_ADD_RECOVERY_EMAIL",
        errorMessage: "Unable to add a recovery email for this account."
    },
    EC00146: {
        errorCode: "EC00146",
        errorKey: "ERROR_CANNOT_BE_MODIFIED",
        errorMessage: "This account cannot be modified"
    },
    EC00147: {
        errorCode: "EC00147",
        errorKey: "ERROR_USER_PROFILE_IS_CONTROLLED_BY_3RD_PARTY_IDP",
        errorMessage: "Your profile is managed through an external identity provider and cannot be modified."
    },
    EC00148: {
        errorCode: "EC00148",
        errorKey: "ERROR_NO_PERMISSIONS_TO_ADD_RECOVERY_EMAIL",
        errorMessage: "You do not have permission to add a recovery email for this account."
    },
    EC00149: {
        errorCode: "EC00149",
        errorKey: "ERROR_INVALID_EMAIL_CHANGE_STATE",
        errorMessage: "Changing email failed due to a missing step or because the change request timed-out."
    },
    EC00150: {
        errorCode: "EC00150",
        errorKey: "ERROR_NO_VALID_REGISTRATION_STATE_FOUND",
        errorMessage: "Registration failed due to a missing step or because registration took too long."
    },
    EC00151: {
        errorCode: "EC00151",
        errorKey: "ERROR_NO_USER_FOUND_FOR_REGISTRATION_COMPLETION",
        errorMessage: "Registration cannot be completed because the user account cannot be found."
    },
    EC00152: {
        errorCode: "EC00152",
        errorKey: "ERROR_INVALID_TENANT_FOR_REGISTRATION_COMPLETION",
        errorMessage: "Registration cannot be completed because the tenant cannot be found."
    },
    EC00153: {
        errorCode: "EC00153",
        errorKey: "ERROR_GENERATING_ACCESS_TOKEN_REGISTRATION_COMPLETION",
        errorMessage: "There was an error creating an access token for your account. Access cannot be granted at this time."
    },
    EC00154: {
        errorCode: "EC00154",
        errorKey: "ERROR_NOT_AUTHORIZED_FOR_USER_UPDATE",
        errorMessage: "You do not have permissions to update the user."
    },
    EC00155: {
        errorCode: "EC00155",
        errorKey: "ERROR_USER_IS_MARKED_FOR_DELETE_AND_CANNOT_BE_UPDATED",
        errorMessage: "The user account is marked for delete and cannot be modified"
    },
    EC00156: {
        errorCode: "EC00156",
        errorKey: "ERROR_TENANT_DOES_NOT_ALLOW_USER_SELF_REGISTRATION",
        errorMessage: "This tenant does not allow user self-registration."
    },
    EC00157: {
        errorCode: "EC00157",
        errorKey: "ERROR_INVALID_PASSWORD_EITHER_PROHIBITED_OR_INVALID_FORMAT",
        errorMessage: "The password you entered has either an invalid format or is not allowed because it is a known weak password."
    },
    EC00158: {
        errorCode: "EC00158",
        errorKey: "ERROR_INVALID_EMAIL_DOMAIN",
        errorMessage: "The email domain is invalid."
    },
    EC00159: {
        errorCode: "EC00159",
        errorKey: "ERROR_REGISTRATION_DOMAIN_IS_MANAGED_BY_EXTERNAL_OIDC_PROVIDER",
        errorMessage: "You cannot register an email with a domain that is externally managed"
    },
    EC00160: {
        errorCode: "EC00160",
        errorKey: "ERROR_REGISTRATION_TENANT_HAS_RESTRICTED_EMAIL_DOMAINS",
        errorMessage: "The tenant you are attempting to register against does not allow email addresses with your domain."
    },
    EC00161: {
        errorCode: "EC00161",
        errorKey: "ERROR_INVALID_USER_TENANT_RELATIONSHIP_TYPE",
        errorMessage: "Invalid user and tenant relationship type."
    },
    EC00162: {
        errorCode: "EC00162",
        errorKey: "ERROR_TENANT_USER_ASSGNMENT_MUST_BE_PRIMARY_TENANT",
        errorMessage: "The first user tenant relationship must be a primary type."
    },
    EC00163: {
        errorCode: "EC00163",
        errorKey: "ERROR_NO_PRIMARY_RELATIONSHIP_EXISTS_FOR_THE_USER_AND_TENANT",
        errorMessage: "Before the user can be assigned to this tenant, there must be a primary relationship between the user and one other tenant."
    },
    EC00164: {
        errorCode: "EC00164",
        errorKey: "ERROR_MUST_BE_GUEST_TENANT",
        errorMessage: "The user being assigned to this tenant must be as a non-primary, or guest, type."
    },
    EC00165: {
        errorCode: "EC00165",
        errorKey: "ERROR_CANNOT_ASSIGN_TO_A_GUEST_RELATIONSHIP",
        errorMessage: "Cannot assign a guest relationship to a primary relationship"
    },
    EC00166: {
        errorCode: "EC00166",
        errorKey: "ERROR_CANNOT_CANNOT_REMOVE_A_PRIMARY_RELATIONSHIP",
        errorMessage: "Cannot remove a primary user-tenant relationship."
    },
    EC00167: {
        errorCode: "EC00167",
        errorKey: "ERROR_INVALID_USER_PROFILE",
        errorMessage: "Invalid user profile."
    },
    EC00168: {
        errorCode: "EC00168",
        errorKey: "ERROR_NO_RECOVERY_EMAIL_EXISTS",
        errorMessage: "No recovery email exists."
    },
    EC00169: {
        errorCode: "EC00169",
        errorKey: "ERROR_TOTP_ALREADY_CONFIGURED_FOR_THE_USER",
        errorMessage: "A time-based one-time password is already configured for this account."
    },
    EC00170: {
        errorCode: "EC00170",
        errorKey: "ERROR_UNABLE_TO_GENERATE_TOPT_SECRET",
        errorMessage: "Unable to generate a time-based one-time passcode secret."
    },
    EC00171: {
        errorCode: "EC00171",
        errorKey: "ERROR_NO_TOTP_ASSIGNED_TO_USER",
        errorMessage: "No time-based one-time passcode is configured for this account."
    },
    EC00172: {
        errorCode: "EC00172",
        errorKey: "ERROR_UNABLE_TO_DETERMINE_TOPT_SECRET",
        errorMessage: "Unable to retrieve the time-based one-time passcode."
    },
    EC00173: {
        errorCode: "EC00173",
        errorKey: "ERROR_NO_EXISTING_SECURITY_KEY_CHALLENGE_FOR_USER",
        errorMessage: "There is no existing security key challenge for this account."
    },
    EC00174: {
        errorCode: "EC00174",
        errorKey: "ERROR_SECURITY_KEY_CHALLENGE_HAS_EXPIRED",
        errorMessage: "The security key challenge has expired."
    },
    EC00175: {
        errorCode: "EC00175",
        errorKey: "ERROR_UNABLE_OBTAIN_REGISTRATION_INFO_FOR_THE_KEY",
        errorMessage: "The security key registration information cannot be found."
    },
    EC00176: {
        errorCode: "EC00176",
        errorKey: "ERROR_USER_IS_NOT_ENABLED_FOR_SECURITY_KEY_REGISTRATION",
        errorMessage: "This account is not enabled for security key registration"
    },
    EC00177: {
        errorCode: "EC00177",
        errorKey: "ERROR_NO_SECURITY_KEY_CONFIGURED_FOR_USER",
        errorMessage: "This is no security key configured for this account."
    },
    EC00178: {
        errorCode: "EC00178",
        errorKey: "ERROR_NO_EXISTING_SECURITY_KEY_CHALLENGE_FOR_USER",
        errorMessage: "There is no existing security key challenge for authentication."
    },
    EC00179: {
        errorCode: "EC00179",
        errorKey: "ERROR_SECURITY_KEY_NO_CREDENTIAL_ID_FOUND",
        errorMessage: "No credential ID was found for this security key."
    },
    EC00180: {
        errorCode: "EC00180",
        errorKey: "ERROR_INVALID_CREDENTIAL_ID",
        errorMessage: "The credential ID for the security is not valid."
    },
    EC00181: {
        errorCode: "EC00181",
        errorKey: "ERROR_CANNOT_OBTAIN_COUNTER_VALUE",
        errorMessage: "Unable to determin the counter value for the security key."
    },
    EC00182: {
        errorCode: "EC00182",
        errorKey: "ERROR_INVALID_PRE_AUTHENTICATION_TOKEN",
        errorMessage: "Your authorization session cannot be found."
    },
    EC00183: {
        errorCode: "EC00183",
        errorKey: "ERROR_PRE_AUTHENTICATION_TOKEN_IS_EXPIRED",
        errorMessage: "You authorization session has expired."
    },
    EC00184: {
        errorCode: "EC00184",
        errorKey: "ERROR_YOU_DO_NOT_HAVE_SUFFICIENT_PERMISSIONS_TO_VIEW_THIS_PAGE",
        errorMessage: "You do not have sufficient permission to view this page."
    },
    EC00186: {
        errorCode: "EC00185",
        errorKey: "ERROR_AUDIT_RECORD_RETENTION_PERIOD_MUST_BE_GREATER_THAN_0_DAYS",
        errorMessage: "The audit record retention period must be greater than 0 days."
    },
    EC00187: {
        errorCode: "EC00187",
        errorKey: "ERROR_SERVICE_ACCOUNT_INCOMPATABLE_WITH_OIDC",
        errorMessage: "A service account cannot be enabled for OIDC (SSO)"
    },
    EC00188: {
        errorCode: "EC00188",
        errorKey: "ERROR_PKCE_CANNOT_BE_ENABLED_BECAUSE_OIDC_IS_NOT_ENABLED",
        errorMessage: "PKCE cannot be enabled because OIDC (SSO) is not enabled."
    },
    EC00189: {
        errorCode: "EC00189",
        errorKey: "ERROR_AUTHENTICATION_GROUPS_CANNOT_BE_ADDED_TO_SERVICE_CLIENTS",
        errorMessage: "Authentication groups cannot be added to service account clients."
    },
    EC00190: {
        errorCode: "EC00190",
        errorKey: "ERROR_RECAPTCHA_NOT_CONFIGURED_FOR_TENANT_WHICH_REQUIRES_RECAPTCHA",
        errorMessage: "No Recaptcha has been configured for a tenant which requires Recaptcha for registration."
    },
    EC00191: {
        errorCode: "EC00191",
        errorKey: "ERROR_INVALID_RECAPTCHA_VERSION_EXPECTING_VERSION_3",
        errorMessage: "There was an error validating your registration."
    },
    EC00192: {
        errorCode: "EC00192",
        errorKey: "ERROR_INVALID_RECAPTCHA_TOKEN",
        errorMessage: "There was an error validating your registration."
    },
    EC00193: {
        errorCode: "EC00193",
        errorKey: "ERROR_RECAPTCHA_SCORE_LOWER_THAN_ALLOWED",
        errorMessage: "There was an error validating your registration This could be because you are a bot. Please wait 30 minutes or more before trying again."
    },
    EC00194: {
        errorCode: "EC00194",
        errorKey: "ERROR_V3_RECAPTCHA_REQUIRES_MINIMUM_SCORE_THRESHOLD_VALUE",
        errorMessage: "Version 3 of ReCaptcha requires a minimum score threshold value."
    },
    EC00195: {
        errorCode: "EC00195",
        errorKey: "ERROR_RECAPTCHA_MINIMUM_SCORE_MUST_BE_BETWEEN_1_AND_0",
        errorMessage: "The minimum threshold score must be between 0.0 and 1.0."
    },
    EC00196: {
        errorCode: "EC00196",
        errorKey: "ERROR_FAILURE_TO_ENCRYPT_THE_RECAPTCHA_API_KEY",
        errorMessage: "There was a failure encrypting the ReCaptcha API key."
    },
    EC00197: {
        errorCode: "EC00197",
        errorKey: "ERROR_TENANT_NAME_MIN_LENGTH",
        errorMessage: "The tenant name is too short."
    },
    EC00198: {
        errorCode: "EC00198",
        errorKey: "ERROR_CANNOT_CREATE_ANOTHER_ROOT_TENANT",
        errorMessage: "A root tenant already exists."
    },
    EC00199: {
        errorCode: "EC00199",
        errorKey: "ERROR_CANNOT_ASSIGN_AS_ROOT_TENANT",
        errorMessage: "The tenant cannot be assigned as a root tenant."
    },
    EC00200: {
        errorCode: "EC00200",
        errorKey: "ERROR_INVALID_URL_FOR_TERMS_AND_CONDITIONS",
        errorMessage: "The URL for the terms and conditions link is invalid."
    },
    EC00201: {
        errorCode: "EC00201",
        errorKey: "ERROR_NO_TERMS_AND_CONDITIONS_URL_WAS_SPECIFIED",
        errorMessage: "The terms and conditions URL is required."
    },
    EC00202: {
        errorCode: "EC00202",
        errorKey: "ERROR_NO_DEFAULT_RATE_LIMIT_SPECIFIED_FOR_LIMITED_API_RATE",
        errorMessage: "A rate limit value needs to be specified."
    },
    EC00203: {
        errorCode: "EC00203",
        errorKey: "ERROR_SYSTEM_INIT_FLAG_IS_NOT_SET",
        errorMessage: "The SYSTEM_INIT flag is either not set or is not set to true."
    },
    EC00204: {
        errorCode: "EC00204",
        errorKey: "ERROR_NO_SYSTEM_INIT_CERTIFICATE_IS_CONFIGURED",
        errorMessage: "The SYSTEM_INIT_CERTIFICATE_FILE configuration value is missing."
    },
    EC00205: {
        errorCode: "EC00205",
        errorKey: "ERROR_SYSTEM_INIT_CERTIFICATE_FILE_IS_MISSING_OR_IS_INVALID",
        errorMessage: "The file containing the system initialization certificate is missing or does not contain a valid certificate."
    },
    EC00206: {
        errorCode: "EC00206",
        errorKey: "ERROR_SYSTEM_INIT_ROOT_TENANT_ALREADY_EXISTS",
        errorMessage: "A root tenant already exists. No new root tenant can be created."
    },
    EC00207: {
        errorCode: "EC00207",
        errorKey: "ERROR_SYSTEM_INIT_UNKNOWN_DATABASE_ERROR",
        errorMessage: "There was an unknown database error during system initialization checks. See the logs for details."
    },
    EC00208: {
        errorCode: "EC00208",
        errorKey: "ERROR_SYSTEM_INIT_UNABLE_TO_QUERY_SEARCH_INDEX_FOR_OBJECTS",
        errorMessage: "There was an error querying the iam_object_search index. See the logs for details."
    },
    EC00209: {
        errorCode: "EC00209",
        errorKey: "ERROR_SYSTEM_INIT_UNABLE_TO_QUREY_SEARCH_INDEX_FOR_RELS",
        errorMessage: "There was an error querying the iam_rel_search index. See the logs for details."
    },
    EC00210: {
        errorCode: "EC00210",
        errorKey: "ERROR_SYSTEM_INIT_UNKNOWN_SEARCH_ENGINE_ERROR",
        errorMessage: "An unknown error occured when querying the search engine. See the logs for more details."
    },
    EC00211: {
        errorCode: "EC00211",
        errorKey: "ERROR_SYSTEM_INIT_INVALID_KMS_STRATEGY",
        errorMessage: "An unknown or invalid KSM_STRATEGY was specified in the configuration file."
    },
    EC00212: {
        errorCode: "EC00212",
        errorKey: "ERROR_SYSTEM_INIT_MISSING_AUTH_DOMAIN",
        errorMessage: "No AUTH_DOMAIN value is configured. See the product documentation on proper configuration."
    },
    EC00213: {
        errorCode: "EC00213",
        errorKey: "ERROR_SYSTEM_INIT_MISSING_MFA_CONFIGURATION",
        errorMessage: "For multifactor authentication, the MFA_ISSUER, MFA_ORIGIN, and MFA_ID values need to be set."
    },
    EC00214: {
        errorCode: "EC00214",
        errorKey: "WARN_SYSTEM_INIT_NO_SMTP_CONFIGURED",
        errorMessage: "The SMTP_ENABLED flag is either not configured or set to false. Email functionality will be disabled."
    },
    EC00215: {
        errorCode: "EC00215",
        errorKey: "WARN_SYSTEM_INIT_SMTP_ENABLED_INVALID_CONFIGURATION",
        errorMessage: "The SMTP_ENABLED flag is set to true, but no email host or port is configured. Email functionality will be disabled."
    },
    EC00216: {
        errorCode: "EC00216",
        errorKey: "WARN_SYSTEM_INIT_NO_SECURITY_EVENT_CALLBACK_URI_DEFINED",
        errorMessage: "No value for SECURITY_EVENT_CALLBACK_URI has been defined. Security events will only be logged to the local file system."
    },
    EC00217: {
        errorCode: "EC00217",
        errorKey: "ERROR_SYSTEM_INIT_INSUFFICIENT_PERMISSIONS_FOR_USER",
        errorMessage: "No permissions exist for this user to perform a system initialization."
    },
    EC00218: {
        errorCode: "EC00218",
        errorKey: "ERROR_SYSTEM_INIT_PRE_REQUISITES_NOT_MET_FOR_AUTHENTICATING_USER",
        errorMessage: "Authentication failed because the pre-requisites for system initialization were not met."
    },    
    EC00219: {
        errorCode: "EC00219",
        errorKey: "ERROR_SYSTEM_INIT_FAILED_TO_CREATE_AUTH_TOKEN",
        errorMessage: "There was a failure to create the auth token. See the logs for more details."
    },    
    EC00220: {
        errorCode: "EC00220",
        errorKey: "ERROR_SYSTEM_INIT_CUSTOM_KMS_WITHOUT_DEFINED_ENDPOINTS",
        errorMessage: "A custom KMS implementation is missing one or more of the endpoints defined by CUSTOM_KMS_ENCRYPTION_ENDPOINT and CUSTOM_KMS_DECRYPTION_ENDPOINT."
    },    
    EC00221: {
        errorCode: "EC00221",
        errorKey: "WARNING_SYSTEM_INIT_NO_KMS_DEFINED",
        errorMessage: "No KMS has been defined. If this is a PRODUCTION deployment, make sure that column-level or full-disc encryption is available by another means."
    },    
    EC00222: {
        errorCode: "EC00222",
        errorKey: "ERROR_SYSTEM_INIT_NOT_AUTHORIZED",
        errorMessage: "System initialization permission denied. Either no authorization token or an invalidation authorization token was provided."
    },    
    EC00223: {
        errorCode: "EC00223",
        errorKey: "ERROR_SYSTEM_INIT_EXPIRED_AUTHORIZATION_TOKEN",
        errorMessage: "System initialization permission denied. The authorization token has expired."
    },
    EC00224: {
        errorCode: "EC00224",
        errorKey: "ERROR_PHONE_NUMBER_ALREADY_IN_USE",
        errorMessage: "Phone number is not available"
    },
}

