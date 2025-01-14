
// ************************************************************************** //
// 
//                    AUTH-TOKEN-RELATED CONSTANTS
// 

import { TenantMetaData } from "@/graphql/generated/graphql-types";

// ************************************************************************** //
export const DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 600; // 10 minutes 
export const MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 1200; // 20 minutes
export const MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 120; // 2 minutes

export const DEFAULT_END_USER_TOKEN_TTL_SECONDS = 3600; // 1 hour
export const MAX_END_USER_TOKEN_TTL_SECONDS = 43200; // 12 hours
export const MIN_END_USER_TOKEN_TTL_SECONDS = 900; // 15 minutes



// ************************************************************************** //
// 
//                  FILE-SYSTEM-BASED DAO CONSTANTS
// 
// ************************************************************************** //
export const ROOT_TENANT_FILE = "root-tenant.json";
export const TENANT_FILE = "tenants.json";
export const TENANT_MANAGEMENT_DOMAIN_REL_FILE = "tenant-management-domain-rel.json";
export const CLIENT_FILE = "clients.json";
export const KEY_FILE = "keys.json";
export const RATE_LIMIT_FILE = "rate-limits.json";
export const TENANT_RATE_LIMIT_REL_FILE = "tenant-rate-limit-rel.json";
export const SCOPE_FILE = "scope.json";
export const TENANT_SCOPE_REL_FILE = "tenant-scope-rel.json";
export const CLIENT_TENANT_SCOPE_REL_FILE = "client-tenant-scope-rel.json";
export const AUTHENTICATION_GROUP_FILE = "authentication-groups.json";
export const AUTHENTICATION_GROUP_CLIENT_REL_FILE = "authentication-groups-client-rel.json";
export const GROUP_FILE = "groups.json";
export const FEDERATED_OIDC_PROVIDER_FILE = "federated-oidc-provider.json";
export const FEDERATED_OIDC_PROVIDER_TENANT_REL_FILE = "federated-oidc-provider-tenant-rel.json";
export const FEDERATED_OIDC_PROVIDER_DOMAIN_REL_FILE = "federated-oidc-provider-domain-rel.json";
export const PRE_AUTHENTICATION_STATE_FILE = "pre-authentication-state.json";
export const AUTHORIZATION_CODE_DATA_FILE = "authorization-code-data.json";
export const REFRESH_TOKEN_FILE = "refresh-token.json";
export const FEDERATED_OIDC_AUTHORIZATION_REL_FILE = "federated-oidc-authorization-rel.json";
export const CLIENT_AUTH_HISTORY_FILE = "client-auth-history.json";
export const KMS_KEYS_FILE = "kms-keys.json"


// ************************************************************************** //
// 
//                    OIDC-SPECIFIC VALUES
// 
// ************************************************************************** //
// These are just the scope values defined by the OIDC specification. They are
// not related to the scope values for managing this application or other
// services which are exposed to clients.
export const OIDC_OPENID_SCOPE="openid";
export const OIDC_EMAIL_SCOPE="email";
export const OIDC_PROFILE_SCOPE="profile";
export const OIDC_OFFLINE_ACCESS_SCOPE="offline_access";
export const ALL_OIDC_SUPPORTED_SCOPE_VALUES = [
    OIDC_OPENID_SCOPE,
    OIDC_EMAIL_SCOPE,
    OIDC_PROFILE_SCOPE,
    OIDC_OFFLINE_ACCESS_SCOPE
];
export const GRANT_TYPE_AUTHORIZATION_CODE = "authorization_code";
export const GRANT_TYPE_REFRESH_TOKEN = "refresh_token";
export const GRANT_TYPE_CLIENT_CREDENTIALS = "client_credentials";
// For future development work, support device code auth grants. Will need a /code endpoint for this
export const GRANT_TYPE_DEVICE_CODE = "urn:ietf:params:oauth:grant-type:device_code";
export const GRANT_TYPES_SUPPORTED: Array<string> = [
    GRANT_TYPE_AUTHORIZATION_CODE,
    GRANT_TYPE_REFRESH_TOKEN,
    GRANT_TYPE_CLIENT_CREDENTIALS
];
export const CLIENT_ASSERTION_TYPE_JWT_BEARER = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
// Standard token error codes
export const OIDC_TOKEN_ERROR_INVALID_REQUEST = "invalid_request";
export const OIDC_TOKEN_ERROR_INVALID_CLIENT = "invalid_client";
export const OIDC_TOKEN_ERROR_INVALID_GRANT = "invalid_grant";
export const OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT = "unauthorized_client";
export const OIDC_TOKEN_ERROR_UNSUPPORTED_GRANT_TYPE = "unsupported_grant_type";
export const OIDC_TOKEN_ERROR_INVALID_SCOPE = "invalid_scope";

export type OidcTokenErrorType = typeof OIDC_TOKEN_ERROR_INVALID_REQUEST | typeof OIDC_TOKEN_ERROR_INVALID_CLIENT |
    typeof OIDC_TOKEN_ERROR_INVALID_GRANT | typeof OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT | typeof OIDC_TOKEN_ERROR_UNSUPPORTED_GRANT_TYPE |
    typeof OIDC_TOKEN_ERROR_INVALID_SCOPE;



// ************************************************************************** //
// 
//                          SCOPE CONSTANTS
// 
// ************************************************************************** //
// Allowed characters which can be used to define a scope name. No special characters
// or non-ASCII characters.
export const SCOPE_NAME_PATTERN="[A-Z,a-z,0-9_-\.]"

// These are ALL of the constants that are required for managing the application.
// Additional scope values can be created for the various services that your
// applications provide. The scope names are fixed and cannot be redefined. 
export const TENANT_CREATE_SCOPE="tenant.create";
export const TENANT_UPDATE_SCOPE="tenant.update";
export const TENANT_DELETE_SCOPE="tenant.delete";
export const TENANT_READ_SCOPE="tenant.read";

export const CLIENT_CREATE_SCOPE="client.create";
export const CLIENT_UPDATE_SCOPE="client.update";
export const CLIENT_DELETE_SCOPE="client.delete";
export const CLIENT_READ_SCOPE="client.read";

export const SCOPE_CREATE_SCOPE="scope.create";
export const SCOPE_UPDATE_SCOPE="scope.update";
export const SCOPE_DELETE_SCOPE="scope.delete";
export const SCOPE_READ_SCOPE="scope.read";
export const SCOPE_TENANT_ASSIGN_SCOPE="scope.tenant.assign";
export const SCOPE_TENANT_REMOVE_SCOPE="scope.tenant.remove";
export const SCOPE_CLIENT_ASSIGN_SCOPE="scope.client.assign"
export const SCOPE_CLIENT_REMOVE_SCOPE="scope.client.remove";
export const SCOPE_GROUP_ASSIGN_SCOPE="scope.group.assign";
export const SCOPE_GROUP_REMOVE_SCOPE="scope.group.remove";

export const SCOPE_CONSTRAINT_SCHEMA_CREATE_SCOPE="scopeconstraintschema.create";
export const SCOPE_CONSTRAINT_SCHEMA_UPDATE_SCOPE="scopeconstraintschema.update";
export const SCOPE_CONSTRAINT_SCHEMA_DELETE_SCOPE="scopeconstraintschema.delete";
export const SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE="scopeconstraintschema.read";

export const ACCESS_RULE_CREATE_SCOPE="accessrule.create";
export const ACCESS_RULE_UPDATE_SCOPE="accessrule.update";
export const ACCESS_RULE_DELETE_SCOPE="accessrule.delete";
export const ACCESS_RULE_READ_SCOPE="accessrule.read";

export const KEY_CREATE_SCOPE="keys.create";
export const KEY_DELETE_SCOPE="keys.delete";
export const KEY_READ_SCOPE="keys.read";

export const RATE_LIMIT_CREATE_SCOPE="ratelimit.create";
export const RATE_LIMIT_UPDATE_SCOPE="ratelimit.update";
export const RATE_LIMIT_DELETE_SCOPE="ratelimit.update";
export const RATE_LIMIT_READ_SCOPE="ratelimit.read";
export const RATE_LIMIT_TENANT_ASSIGN_SCOPE="ratelimit.tenant.assign";
export const RATE_LIMIT_TENANT_REMOVE_SCOPE="ratelimit.tenant.remove";
export const RATE_LIMIT_TENANT_UPDATE_SCOPE="ratelimit.tenant.update";

export const LOGIN_GROUP_CREATE_SCOPE="logingroup.create";
export const LOGIN_GROUP_UPDATE_SCOPE="logingroup.update";
export const LOGIN_GROUP_DELETE_SCOPE="logingroup.delete";
export const LOGIN_GROUP_READ_SCOPE="logingroup.read";
export const LOGIN_GROUP_CLIENT_ASSIGN_SCOPE="logingroup.client.assign";
export const LOGIN_GROUP_CLIENT_REMOVE_SCOPE="logingroup.client.remove";

export const GROUP_CREATE_SCOPE="group.create";
export const GROUP_UPDATE_SCOPE="group.update";
export const GROUP_DELETE_SCOPE="group.delete";
export const GROUP_READ_SCOPE="group.read";
export const GROUP_USER_ASSIGN_SCOPE="group.user.assign";
export const GROUP_USER_REMOVE_SCOPE="group.user.remove";

export const USER_CREATE_SCOPE="user.create";
export const USER_UPDATE_SCOPE="user.update";
export const USER_DELETE_SCOPE="user.delete";
export const USER_READ_SCOPE="user.read";

export const FEDERATED_OIDC_PROVIDER_CREATE_SCOPE="federatedoidcprovider.create";
export const FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE="federatedoidcprovider.update";
export const FEDERATED_OIDC_PROVIDER_DELETE_SCOPE="federatedoidcprovider.delete";
export const FEDERATED_OIDC_PROVIDER_READ_SCOPE="federatedoidcprovider.read";
export const FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE="federatedoidcprovider.tenant.assign";
export const FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE="federatedoidcprovider.tenant.remove";


// These are for the exclusive use of the application and cannot be changed. The names
// are globally unique (as are ALL scope names)
export const ALL_INTERNAL_SCOPE_NAMES = [
    // Tenant
    TENANT_CREATE_SCOPE, TENANT_UPDATE_SCOPE, TENANT_DELETE_SCOPE, TENANT_READ_SCOPE,
    // Client
    CLIENT_CREATE_SCOPE, CLIENT_UPDATE_SCOPE, CLIENT_DELETE_SCOPE, CLIENT_READ_SCOPE,
    // Scope itself
    SCOPE_CREATE_SCOPE, SCOPE_UPDATE_SCOPE, SCOPE_DELETE_SCOPE, SCOPE_READ_SCOPE, 
    SCOPE_TENANT_ASSIGN_SCOPE, SCOPE_TENANT_REMOVE_SCOPE, 
    SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE,
    SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE,
    // Scope constraints
    SCOPE_CONSTRAINT_SCHEMA_CREATE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_UPDATE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_DELETE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE,
    // Access rules
    ACCESS_RULE_CREATE_SCOPE, ACCESS_RULE_UPDATE_SCOPE, ACCESS_RULE_DELETE_SCOPE, ACCESS_RULE_READ_SCOPE,
    // Signing Keys
    KEY_CREATE_SCOPE, KEY_DELETE_SCOPE, KEY_READ_SCOPE,
    // Rate limits
    RATE_LIMIT_CREATE_SCOPE, RATE_LIMIT_UPDATE_SCOPE, RATE_LIMIT_DELETE_SCOPE, RATE_LIMIT_READ_SCOPE, RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE,
    // Login groups
    LOGIN_GROUP_CREATE_SCOPE, LOGIN_GROUP_UPDATE_SCOPE, LOGIN_GROUP_DELETE_SCOPE, LOGIN_GROUP_READ_SCOPE, LOGIN_GROUP_CLIENT_ASSIGN_SCOPE, LOGIN_GROUP_CLIENT_REMOVE_SCOPE,
    // Groups
    GROUP_CREATE_SCOPE, GROUP_UPDATE_SCOPE, GROUP_DELETE_SCOPE, GROUP_READ_SCOPE, GROUP_USER_ASSIGN_SCOPE, GROUP_USER_REMOVE_SCOPE,
    // Users
    USER_CREATE_SCOPE, USER_UPDATE_SCOPE, USER_DELETE_SCOPE, USER_READ_SCOPE,
    // External OIDC providers
    FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE
];



// These are scope values which CANNOT be assigned to any tenant or client OUTSIDE of the Root Tenant
export const ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES = [
    // Tenant
    TENANT_CREATE_SCOPE, TENANT_UPDATE_SCOPE, TENANT_DELETE_SCOPE, 
    // Scope itself
    SCOPE_CREATE_SCOPE, SCOPE_UPDATE_SCOPE, SCOPE_DELETE_SCOPE, SCOPE_TENANT_ASSIGN_SCOPE, SCOPE_TENANT_REMOVE_SCOPE,
    // Scope constraints
    SCOPE_CONSTRAINT_SCHEMA_CREATE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_UPDATE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_DELETE_SCOPE, 
    // Access rules
    ACCESS_RULE_CREATE_SCOPE, ACCESS_RULE_UPDATE_SCOPE, ACCESS_RULE_DELETE_SCOPE, 
    // Rate limits
    RATE_LIMIT_CREATE_SCOPE, RATE_LIMIT_UPDATE_SCOPE, RATE_LIMIT_DELETE_SCOPE, RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE,
    // External OIDC providers
    FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE
];

// These are the scope values which can be used WITHIN a tenant. So actions such as 
// creating/updating/deleting a group, creating/updating/deleting a client, etc.
// This does not apply to the Root Tenant, where any scope values assigned to a group
// in the Root Tenant apply both to the Root Tenant AND to all other Tenants.
// These are the minimum default scope names that will be applied to EVERY Tenant that
// is created. The admin who is creating the tenant will also be able to apply any other
// scope values that the various applications support, and can remove some of these 
// if they want.
export const DEFAULT_TENANT_BOUND_INTERNAL_SCOPE_NAMES = [
    // Tenant
    TENANT_READ_SCOPE,
    // Client
    CLIENT_CREATE_SCOPE, CLIENT_UPDATE_SCOPE, CLIENT_DELETE_SCOPE, CLIENT_READ_SCOPE,
    // Scope itself
    SCOPE_READ_SCOPE, SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE, SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE,
    // Scope constraints
    SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE,
    // Access rules
    ACCESS_RULE_READ_SCOPE,
    // Signing keys
    KEY_CREATE_SCOPE, KEY_DELETE_SCOPE, KEY_READ_SCOPE,
    // Rate limits
    RATE_LIMIT_READ_SCOPE,
    // Login groups
    LOGIN_GROUP_CREATE_SCOPE, LOGIN_GROUP_UPDATE_SCOPE, LOGIN_GROUP_DELETE_SCOPE, LOGIN_GROUP_READ_SCOPE, LOGIN_GROUP_CLIENT_ASSIGN_SCOPE, LOGIN_GROUP_CLIENT_REMOVE_SCOPE,
    // Groups
    GROUP_CREATE_SCOPE, GROUP_UPDATE_SCOPE, GROUP_DELETE_SCOPE, GROUP_READ_SCOPE, GROUP_USER_ASSIGN_SCOPE, GROUP_USER_REMOVE_SCOPE,
    // Users
    USER_CREATE_SCOPE, USER_UPDATE_SCOPE, USER_DELETE_SCOPE, USER_READ_SCOPE,
    // External OIDC providers
    FEDERATED_OIDC_PROVIDER_READ_SCOPE
];


// ************************************************************************** //
// 
//                  TENANT-RELATED CONSTANTS
// 
// ************************************************************************** //
// Globally unique group names
export const ROOT_TENANT_ADMIN_GROUP_NAME="Root Tenant Admin Group";
export const ROOT_TENANT_VIEW_GROUP_NAME="Root Tenant View Group";

export const GLOBALLY_UNIQUE_GROUP_NAMES = [
    ROOT_TENANT_ADMIN_GROUP_NAME,
    ROOT_TENANT_VIEW_GROUP_NAME
];

export const ROOT_TENANT_ADMIN_GROUP_SCOPE_NAMES = ALL_INTERNAL_SCOPE_NAMES;

export const ROOT_TENANT_VIEW_GROUP_SCOPE_NAMES = [
    TENANT_READ_SCOPE,
    CLIENT_READ_SCOPE,
    SCOPE_READ_SCOPE,
    SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE,
    ACCESS_RULE_READ_SCOPE,
    KEY_READ_SCOPE,
    RATE_LIMIT_READ_SCOPE,
    LOGIN_GROUP_READ_SCOPE,
    GROUP_READ_SCOPE,
    USER_READ_SCOPE,
    FEDERATED_OIDC_PROVIDER_READ_SCOPE
];


// ************************************************************************** //
// 
//                  IDENTITY-RELATED CONSTANTS
// 
// ************************************************************************** //
export const PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS="password-hash-sha-256-64k-iterations";
export const PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS="password-hash-sha-256-128k-iterations";
export const PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS="password-hash-bcrypt-10-rounds";
export const PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS="password-hash-bcrypt-11-rounds";
export const PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS="password-hash-bcrypt-12-rounds";
export const PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS="password-hash-pbkdf2-128k-iterations";
export const PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS="password-hash-pbkdf2-256k-iterations";
// 16 byte salt (minimum recommended by NIST is 32 bits / 4 bytes)
export const PASSWORD_SALT_LENGTH=16; 
export const PASSWORD_MINIMUM_LENGTH=10;
export const PASSWORD_MAXIMUM_LENGTH=64;
export const PASSWORD_PATTERN="[A-Za-z0-9_-!@#]";

export const VERIFICATION_TOKEN_TYPE_PASSWORD_RESET="PASSWORD_RESET";
export const VERIFICATION_TOKEN_TYPE_VALIDATE_EMAIL="VALIDATE_EMAIL";

// Client-related constants
export const CLIENT_SECRET_ENCODING = "base64";


// ************************************************************************** //
// 
//                  CRYPTO-RELATED CONSTANTS
// 
// ************************************************************************** //
export const IV_LENGTH_IN_BYTES=16;
export const AUTH_TAG_LENGTH=16; // bits
export const AES_KEY_LENGTH=256;  // bits
// We may eventually support other ciphers (which SHOULD support authenticated data)
export const AES_GCM_CIPHER="aes-256-gcm";
export const MAX_ENCRYPTION_LENGTH = 65536;



// ************************************************************************** //
// 
//                  TENANT-MANAGEMENT-RELATED CONSTANTS
// 
// ************************************************************************** //
//
// NOT_ALLOWED - No federated OIDC provider can be attached to this tenant
// EXCLUSIVE   - Use ONLY the OIDC providers that are configured. Typically this will be a single OIDC provider,
//               but may be more than one in cases of collaboration within a tenant among many different
//               organizations.
// PERMISSIVE  - Allow many different federated OIDC providers to be attached to this tenant
export const FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED="NOT_ALLOWED";
export const FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE="EXCLUSIVE";
export const FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE="PERMISSIVE";
export const FEDERATED_AUTHN_CONSTRAINTS=[
    FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED,
    FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE,
    FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE
];

export const TENANT_TYPE_ROOT_TENANT="ROOT_TENANT";
export const TENANT_TYPE_IDENTITY_MANAGEMENT="IDENTITY_MANAGEMENT";
export const TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES="IDENTITY_MANAGEMENT_AND_SERVICES";
export const TENANT_TYPE_SERVICES="SERVICES";
export const TENANT_TYPES=[
    TENANT_TYPE_ROOT_TENANT,
    TENANT_TYPE_IDENTITY_MANAGEMENT,
    TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES,
    TENANT_TYPE_SERVICES
];

export const LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT="LOCK_USER_ACCOUNT";
export const LOGIN_FAILURE_POLICY_PAUSE="PAUSE";
export const LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK="PAUSE_THEN_LOCK";
export const LOGIN_FAILURE_POLICY_BACKOFF="BACKOFF";
export const LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK="BACKOFF_THEN_LOCK";
export const LOGIN_FAILURE_POLICY_TYPES=[
    LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT,
    LOGIN_FAILURE_POLICY_PAUSE,
    LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK,
    LOGIN_FAILURE_POLICY_BACKOFF,
    LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK
];

export const OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST="CLIENT_SECRET_POST";
export const OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC="CLIENT_SECRET_BASIC";
export const OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT="CLIENT_SECRET_JWT";
export const OIDC_CLIENT_AUTH_TYPE_NONE="NONE";
export const OIDC_CLIENT_AUTH_TYPES=[
    OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
    OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC,
    OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT,
    OIDC_CLIENT_AUTH_TYPE_NONE
];

export const CLIENT_TYPE_SERVICE_ACCOUNT_ONLY="SERVICE_ACCOUNT_ONLY";
export const CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS="SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS";
export const CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY="USER_DELEGATED_PERMISSIONS_ONLY";
export const CLIENT_TYPES=[
    CLIENT_TYPE_SERVICE_ACCOUNT_ONLY,
    CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS,
    CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY
];

export const TOKEN_TYPE_SERVICE_ACCOUNT_TOKEN="SERVICE_ACCOUNT_TOKEN";
export const TOKEN_TYPE_END_USER_TOKEN="END_USER_TOKEN";
export const TOKEN_TYPE_ANONYMOUS_USER="ANONYMOUS_USER";
export const TOKEN_TYPES=[
    TOKEN_TYPE_SERVICE_ACCOUNT_TOKEN,
    TOKEN_TYPE_END_USER_TOKEN,
    TOKEN_TYPE_ANONYMOUS_USER
];

export const MFA_FACTOR_AUTH_TYPE_NONE="NONE";
export const MFA_FACTOR_AUTH_TYPE_SMS="SMS";
export const MFA_FACTOR_AUTH_TYPE_EMAIL="EMAIL";
export const MFA_FACTOR_AUTH_TYPE_TIME_BASED_OTP="TIME_BASED_OTP";
export const MFA_FACTOR_AUTH_TYPE_FIDO2="FIDO2";
export const MFA_FACTOR_AUTH_TYPES=[
    MFA_FACTOR_AUTH_TYPE_NONE,
    MFA_FACTOR_AUTH_TYPE_SMS,
    MFA_FACTOR_AUTH_TYPE_EMAIL,
    MFA_FACTOR_AUTH_TYPE_TIME_BASED_OTP,
    MFA_FACTOR_AUTH_TYPE_FIDO2
];

export const NAME_ORDER_EASTERN="EASTER_NAME_ORDER";
export const NAME_ORDER_WESTERN="WESTERN_NAME_ORDER";
export const NAME_ORDERS=[
    NAME_ORDER_EASTERN,
    NAME_ORDER_WESTERN
];

export const KEY_TYPE_RSA="RSA";
export const KEY_TYPE_EC="EC";
export const KEY_TYPES=[
    KEY_TYPE_RSA,
    KEY_TYPE_EC
];

export const SIGNING_KEY_STATUS_ACTIVE="ACTIVE";
export const SIGNING_KEY_STATUS_REVOKED="REVOKED";
export const SIGNING_KEY_STATUSES=[
    SIGNING_KEY_STATUS_ACTIVE,
    SIGNING_KEY_STATUS_REVOKED
];

export const REFRESH_TOKEN_CLIENT_TYPE_PKCE="PKCE";
export const REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT="SECURE_CLIENT";
export const REFRESH_TOKEN_CLIENT_TYPES=[
    REFRESH_TOKEN_CLIENT_TYPE_PKCE,
    REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT
];

export const CHANGE_EVENT_TYPE_CREATE="CREATE";
export const CHANGE_EVENT_TYPE_UPDATE="UPDATE";
export const CHANGE_EVENT_TYPE_DELETE="DELETE";
export const CHANGE_EVENT_TYPE_CREATE_REL="CREATE_REL";
export const CHANGE_EVENT_TYPE_REMOVE_REL="REMOVE_REL";
export const CHANGE_EVENT_TYPES=[
    CHANGE_EVENT_TYPE_CREATE,
    CHANGE_EVENT_TYPE_UPDATE,
    CHANGE_EVENT_TYPE_DELETE,
    CHANGE_EVENT_TYPE_CREATE_REL,
    CHANGE_EVENT_TYPE_REMOVE_REL
]

export const CHANGE_EVENT_CLASS_LOGIN_FAILURE_POLICY="LOGIN_FAILURE_POLICY";
export const CHANGE_EVENT_CLASS_TENANT="TENANT";
export const CHANGE_EVENT_CLASS_TENANT_MANAGEMENT_DOMAIN_REL="TENANT_MANAGEMENT_DOMAIN_REL";
export const CHANGE_EVENT_CLASS_CLIENT="CLIENT";
export const CHANGE_EVENT_CLASS_OIDC_PROVIDER="OIDC_PROVIDER";
export const CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL="OIDC_PROVIDER_TENANT_REL";
export const CHANGE_EVENT_CLASS_SOCIAL_OIDC_PROVIDER_TENANT_REL="SOCIAL_OIDC_PROVIDER_TENANT_REL";
export const CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL="OIDC_PROVIDER_DOMAIN_REL";
export const CHANGE_EVENT_CLASS_USER="USER";
export const CHANGE_EVENT_CLASS_GROUP="GROUP";
export const CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP="AUTHENTICATION_GROUP";
export const CHANGE_EVENT_CLASS_USER_GROUP_REL="USER_GROUP_REL";
export const CHANGE_EVENT_CLASS_SIGNING_KEY="SIGNING_KEY";
export const CHANGE_EVENT_CLASS_RATE_LIMIT="RATE_LIMIT";
export const CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL="TENANT_RATE_LIMIT_REL";
export const CHANGE_EVENT_CLASS_SCOPE="SCOPE";
export const CHANGE_EVENT_CLASS_TENANT_SCOPE_REL="TENANT_SCOPE_REL";
export const CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL="CLIENT_TENANT_SCOPE_REL";
export const CHANGE_EVENT_CLASS_SCOPE_CONSTRAINT_SCHEMA="SCOPE_CONSTRAINT_SCHEMA";
export const CHANGE_EVENT_CLASS_ACCESS_RULE="ACCESS_RULE";
export const CHANGE_EVENT_CLASSES=[
    CHANGE_EVENT_CLASS_LOGIN_FAILURE_POLICY,
    CHANGE_EVENT_CLASS_TENANT,
    CHANGE_EVENT_CLASS_TENANT_MANAGEMENT_DOMAIN_REL,
    CHANGE_EVENT_CLASS_CLIENT,
    CHANGE_EVENT_CLASS_OIDC_PROVIDER,
    CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL,
    CHANGE_EVENT_CLASS_SOCIAL_OIDC_PROVIDER_TENANT_REL,
    CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL,
    CHANGE_EVENT_CLASS_USER,
    CHANGE_EVENT_CLASS_GROUP,
    CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP,
    CHANGE_EVENT_CLASS_USER_GROUP_REL,
    CHANGE_EVENT_CLASS_SIGNING_KEY,
    CHANGE_EVENT_CLASS_RATE_LIMIT,
    CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL,
    CHANGE_EVENT_CLASS_SCOPE,
    CHANGE_EVENT_CLASS_TENANT_SCOPE_REL,
    CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL,
    CHANGE_EVENT_CLASS_SCOPE_CONSTRAINT_SCHEMA,
    CHANGE_EVENT_CLASS_ACCESS_RULE
];


export const FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL="SOCIAL";
export const FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE="ENTERPRISE";
export const FEDERATED_OIDC_PROVIDER_TYEPS=[
    FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
    FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE
];

export const CONTACT_TYPE_FOR_TENANT="TENANT_CONTACT";
export const CONTACT_TYPE_FOR_CLIENT="CLIENT_CONTACT";
export const CONTACT_TYPE_FOR_SIGNING_KEY="SIGNING_KEY_CONTACT"


// ************************************************************************** //
// 
//                  URI QUERY CONSTANTS
// 
// ************************************************************************** //
export const QUERY_PARAM_PREAUTHN_TOKEN="_tk";
export const QUERY_PARAM_PREAUTH_TENANT_ID="_tid";
export const QUERY_PARAM_PREAUTH_REDIRECT_URI="redirect_uri";
export const QUERY_PARAM_AUTHENTICATE_TO_PORTAL="_pa";
export const QUERY_PARAM_COUNTRY_CODE="country_code";
export const QUERY_PARAM_LANGUAGE_CODE="language_code";



export const AUTHENTICATION_LAYOUT_PAGES = [
    "/authorize/login",
    "/authorize/forgot-password",
    "/authorize/register"
]



// ************************************************************************** //
// 
//                  DEFAULT CONSTANTS
// 
// ************************************************************************** //
export const DEFAULT_TENANT_META_DATA: TenantMetaData = {
    tenant: {
        __typename: undefined,
        allowAnonymousUsers: false,
        allowForgotPassword: false,
        allowLoginByPhoneNumber: false,
        allowSocialLogin: false,
        allowUnlimitedRate: false,
        allowUserSelfRegistration: false,
        claimsSupported: [],
        enabled: true,
        federatedAuthenticationConstraint: "",
        federatedauthenticationconstraintid: undefined,
        markForDelete: false,
        migrateLegacyUsers: false,
        tenantDescription: undefined,
        tenantId: "",
        tenantName: "",
        tenantType: "",
        tenanttypeid: undefined,
        verifyEmailOnSelfRegistration: true
    },
    tenantLookAndFeel: {
        tenantid: "",
        adminheaderbackgroundcolor: "",
        adminheadertextcolor: "white",
        adminlogo: null,
        adminheadertext: "",
        authenticationheaderbackgroundcolor: "#1976d2",
        authenticationheadertextcolor: "white",
        authenticationlogo: null,
        authenticationheadertext: "",
        footerlinks: []
    }
}