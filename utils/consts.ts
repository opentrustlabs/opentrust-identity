
// ************************************************************************** //
// 
//                    AUTH-TOKEN-RELATED CONSTANTS
// 

import { TenantLoginFailurePolicy, TenantLookAndFeel, TenantMetaData, TenantPasswordConfig } from "@/graphql/generated/graphql-types";

export const OPENTRUST_IDENTITY_VERSION="1.0.0";

// ************************************************************************** //
export const DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 600; // 10 minutes 
export const MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 1200; // 20 minutes
export const MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 120; // 2 minutes

export const DEFAULT_END_USER_TOKEN_TTL_SECONDS = 3600; // 1 hour
export const MAX_END_USER_TOKEN_TTL_SECONDS = 43200; // 12 hours
export const MIN_END_USER_TOKEN_TTL_SECONDS = 600; // 10 minutes
export const DEFAULT_PORTAL_AUTH_TOKEN_TTL_HOURS=12;

export const AUTH_TOKEN_LOCAL_STORAGE_KEY="auth-token";
export const TOKEN_EXPIRIES_AT_MS_LOCAL_KEY="token-expires-at-ms";
export const MANAGEMENT_TENANT_LOCAL_STORAGE_KEY="management-tenant-id";
export const SELECTED_LANUGAGE_CODE_STORAGE_KEY="selected-language-code";

// ************************************************************************** //
// 
//                  FILE-SYSTEM-BASED DAO CONSTANTS
// 
// ************************************************************************** //
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
export const GRANT_TYPE_DEVICE_CODE = "urn:ietf:params:oauth:grant-type:device_code";
export const GRANT_TYPES_SUPPORTED: Array<string> = [    
    GRANT_TYPE_AUTHORIZATION_CODE,
    GRANT_TYPE_REFRESH_TOKEN,
    GRANT_TYPE_CLIENT_CREDENTIALS,
    GRANT_TYPE_DEVICE_CODE
];
export const CLIENT_ASSERTION_TYPE_JWT_BEARER = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
// Standard token error codes
export const OIDC_TOKEN_ERROR_INVALID_REQUEST = "invalid_request";
export const OIDC_TOKEN_ERROR_INVALID_CLIENT = "invalid_client";
export const OIDC_TOKEN_ERROR_INVALID_GRANT = "invalid_grant";
export const OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT = "unauthorized_client";
export const OIDC_TOKEN_ERROR_UNSUPPORTED_GRANT_TYPE = "unsupported_grant_type";
export const OIDC_TOKEN_ERROR_INVALID_SCOPE = "invalid_scope";
export const OIDC_TOKEN_ERROR_AUTHORIZATION_PENDING="authorization_pending";
export const OIDC_TOKEN_ERROR_AUTHORIZATION_DECLINED="authorization_declined";
export const OIDC_TOKEN_ERROR_BAD_VERIFICATION_CODE="bad_verification_code";
export const OIDC_TOKEN_ERROR_EXPIRED_TOKEN="expired_token"


export type OidcTokenErrorType = typeof OIDC_TOKEN_ERROR_INVALID_REQUEST | typeof OIDC_TOKEN_ERROR_INVALID_CLIENT |
    typeof OIDC_TOKEN_ERROR_INVALID_GRANT | typeof OIDC_TOKEN_ERROR_UNAUTHORIZED_CLIENT | typeof OIDC_TOKEN_ERROR_UNSUPPORTED_GRANT_TYPE |
    typeof OIDC_TOKEN_ERROR_INVALID_SCOPE | typeof OIDC_TOKEN_ERROR_AUTHORIZATION_PENDING | typeof OIDC_TOKEN_ERROR_AUTHORIZATION_DECLINED
    | typeof OIDC_TOKEN_ERROR_BAD_VERIFICATION_CODE | typeof OIDC_TOKEN_ERROR_EXPIRED_TOKEN;

export const OIDC_AUTHORIZATION_ERROR_ACCESS_DENIED="access_denied";
export const OIDC_AUTHORIZATION_ERROR_INVALID_REQUEST="invalid_request";
export const OIDC_AUTHORIZATION_ERROR_UNSUPPORTED_RESPONSE_TYPE="unsupported_response_type";
export const OIDC_AUTHORIZATION_ERROR_INVALID_SCOPE = "invalid_scope";
export const OIDC_AUTHORIZATION_ERROR_UNAUTHORIZED_CLIENT="unauthorized_client";



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
//
// General-purpose tenant.read scope. It is a short-hand way of saying a user
// has read access to the entire tenant and all of the objects within, such 
// as clients, keys, authn/z groups, etc.
export const TENANT_READ_ALL_SCOPE="tenant.all.read";
export const TENANT_CREATE_SCOPE="tenant.create";
export const TENANT_UPDATE_SCOPE="tenant.update";
export const TENANT_DELETE_SCOPE="tenant.delete";
export const TENANT_READ_SCOPE="tenant.read";

export const CLIENT_CREATE_SCOPE="client.create";
export const CLIENT_UPDATE_SCOPE="client.update";
export const CLIENT_DELETE_SCOPE="client.delete";
export const CLIENT_READ_SCOPE="client.read";
// A scope specific to reading the client secret
export const CLIENT_SECRET_VIEW_SCOPE="client.secret.view";


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
export const SCOPE_USER_ASSIGN_SCOPE="scope.user.assign";
export const SCOPE_USER_REMOVE_SCOPE="scope.user.remove";

export const SCOPE_CONSTRAINT_SCHEMA_CREATE_SCOPE="scopeconstraintschema.create";
export const SCOPE_CONSTRAINT_SCHEMA_UPDATE_SCOPE="scopeconstraintschema.update";
export const SCOPE_CONSTRAINT_SCHEMA_DELETE_SCOPE="scopeconstraintschema.delete";
export const SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE="scopeconstraintschema.read";

export const ACCESS_RULE_CREATE_SCOPE="accessrule.create";
export const ACCESS_RULE_UPDATE_SCOPE="accessrule.update";
export const ACCESS_RULE_DELETE_SCOPE="accessrule.delete";
export const ACCESS_RULE_READ_SCOPE="accessrule.read";

export const KEY_CREATE_SCOPE="keys.create";
export const KEY_UPDATE_SCOPE="keys.update";
export const KEY_DELETE_SCOPE="keys.delete";
export const KEY_READ_SCOPE="keys.read";
// A scope specific to reading either the private key (if unencrypted)
// or the passcode for the private key (if encrypted)
export const KEY_SECRET_VIEW_SCOPE="keys.secret.view";

export const RATE_LIMIT_CREATE_SCOPE="ratelimit.create";
export const RATE_LIMIT_UPDATE_SCOPE="ratelimit.update";
export const RATE_LIMIT_DELETE_SCOPE="ratelimit.delete";
export const RATE_LIMIT_READ_SCOPE="ratelimit.read";
export const RATE_LIMIT_TENANT_ASSIGN_SCOPE="ratelimit.tenant.assign";
export const RATE_LIMIT_TENANT_REMOVE_SCOPE="ratelimit.tenant.remove";
export const RATE_LIMIT_TENANT_UPDATE_SCOPE="ratelimit.tenant.update";

export const AUTHENTICATION_GROUP_CREATE_SCOPE="authenticationgroup.create";
export const AUTHENTICATION_GROUP_UPDATE_SCOPE="authenticationgroup.update";
export const AUTHENTICATION_GROUP_DELETE_SCOPE="authenticationgroup.delete";
export const AUTHENTICATION_GROUP_READ_SCOPE="authenticationgroup.read";
export const AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE="authenticationgroup.client.assign";
export const AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE="authenticationgroup.client.remove";
export const AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE="authenticationgroup.user.assign";
export const AUTHENTICATION_GROUP_USER_REMOVE_SCOPE="authenticationgroup.user.remove";

export const AUTHORIZATION_GROUP_CREATE_SCOPE="authorizationgroup.create";
export const AUTHORIZATION_GROUP_UPDATE_SCOPE="authorizationgroup.update";
export const AUTHORIZATION_GROUP_DELETE_SCOPE="authorizationgroup.delete";
export const AUTHORIZATION_GROUP_READ_SCOPE="authorizationgroup.read";
export const AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE="authorizationgroup.user.assign";
export const AUTHORIZATION_GROUP_USER_REMOVE_SCOPE="authorizationgroup.user.remove";

export const ANONYMOUS_USER_CREATE_SCOPE="anonymous.user.create";
export const USER_CREATE_SCOPE="user.create";
export const USER_UPDATE_SCOPE="user.update";
export const USER_DELETE_SCOPE="user.delete";
export const USER_READ_SCOPE="user.read";
export const MY_PROFILE_READ_SCOPE="myprofile.read";
export const USER_SESSION_READ_SCOPE="usersession.read";
export const USER_SESSION_DELETE_SCOPE="usersession.delete";
export const USER_UNLOCK_SCOPE="user.unlock";
export const TENANT_USER_ASSIGN_SCOPE="tenant.user.assign";
export const TENANT_USER_REMOVE_SCOPE="tenant.user.remove";

export const FEDERATED_OIDC_PROVIDER_CREATE_SCOPE="federatedoidcprovider.create";
export const FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE="federatedoidcprovider.update";
export const FEDERATED_OIDC_PROVIDER_DELETE_SCOPE="federatedoidcprovider.delete";
export const FEDERATED_OIDC_PROVIDER_READ_SCOPE="federatedoidcprovider.read";
export const FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE="federatedoidcprovider.tenant.assign";
export const FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE="federatedoidcprovider.tenant.remove";
// A scope specific to reading the oidc provider client secret
// or the passcode for the private key (if encrypted)
export const FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE="federatedoidcprovider.secret.view";
export const CAPTCHA_CONFIG_SCOPE="captcha.config";
export const SYSTEM_SETTINGS_UPDATE_SCOPE="system.settings.update";
export const SYSTEM_SETTINGS_READ_SCOPE="system.settings.read";
export const JOBS_READ_SCOPE="jobs.read";
export const JOBS_UPDATE_SCOPE="jobs.update";
// Scopes specific to communicating with certain external services
// such as the security event web hook or the legacy user migration
// services, if they exist. These should ONLY be made available to 
// CLIENTS in the root tenant.
export const LEGACY_USER_MIGRATION_SCOPE="legacy.user.migrate";
export const SECURITY_EVENT_WRITE_SCOPE="security.event.write";
// Allows a user to defer to somebody else to enter a secret
// value for an object. This may mean sending that person
// an email with a time-limited otp.
export const SECRET_ENTRY_DELEGATE_SCOPE="secret.entry.delegate";
// Allows a client to invoke custom encryption/decryption services
// This is for implementations which use a KMS_STRATEGY of "custom"
export const CUSTOM_ENCRYP_DECRYPT_SCOPE="custom.encryptdecrypt";


export const SCOPE_USE_IAM_MANAGEMENT="IAM_MANAGEMENT";
export const SCOPE_USE_APPLICATION_MANAGEMENT="APPLICATION_MANAGEMENT";
export const SCOPE_USES = [
    SCOPE_USE_IAM_MANAGEMENT,
    SCOPE_USE_APPLICATION_MANAGEMENT
];
export const SCOPE_USE_DISPLAY = new Map<string, string>([
    [SCOPE_USE_IAM_MANAGEMENT, "IAM Management"],
    [SCOPE_USE_APPLICATION_MANAGEMENT, "Application Management"]
]);


// These are for the exclusive use of the application and cannot be changed. The names
// are globally unique (as are ALL scope names)
export const ALL_INTERNAL_SCOPE_NAMES = [
    // Tenant
    TENANT_CREATE_SCOPE, TENANT_UPDATE_SCOPE, TENANT_DELETE_SCOPE, TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE,
    // Client
    CLIENT_CREATE_SCOPE, CLIENT_UPDATE_SCOPE, CLIENT_DELETE_SCOPE, CLIENT_READ_SCOPE, CLIENT_SECRET_VIEW_SCOPE,
    // Scope itself
    SCOPE_CREATE_SCOPE, SCOPE_UPDATE_SCOPE, SCOPE_DELETE_SCOPE, SCOPE_READ_SCOPE, 
    SCOPE_TENANT_ASSIGN_SCOPE, SCOPE_TENANT_REMOVE_SCOPE, 
    SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE,
    SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE, SCOPE_USER_ASSIGN_SCOPE, SCOPE_USER_REMOVE_SCOPE,
    // Scope constraints
    SCOPE_CONSTRAINT_SCHEMA_CREATE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_UPDATE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_DELETE_SCOPE, SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE,
    // Access rules
    ACCESS_RULE_CREATE_SCOPE, ACCESS_RULE_UPDATE_SCOPE, ACCESS_RULE_DELETE_SCOPE, ACCESS_RULE_READ_SCOPE,
    // Signing Keys
    KEY_CREATE_SCOPE, KEY_UPDATE_SCOPE, KEY_DELETE_SCOPE, KEY_READ_SCOPE, KEY_SECRET_VIEW_SCOPE,
    // Rate limits
    RATE_LIMIT_CREATE_SCOPE, RATE_LIMIT_UPDATE_SCOPE, RATE_LIMIT_DELETE_SCOPE, RATE_LIMIT_READ_SCOPE, RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE,
    // Login groups
    AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_UPDATE_SCOPE, AUTHENTICATION_GROUP_DELETE_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE, 
    AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE,
    AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE,
    // Groups
    AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHORIZATION_GROUP_UPDATE_SCOPE, AUTHORIZATION_GROUP_DELETE_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE,
    // Users
    ANONYMOUS_USER_CREATE_SCOPE, USER_CREATE_SCOPE, USER_UPDATE_SCOPE, USER_DELETE_SCOPE, USER_READ_SCOPE, USER_UNLOCK_SCOPE,
    USER_SESSION_READ_SCOPE, USER_SESSION_DELETE_SCOPE, TENANT_USER_ASSIGN_SCOPE, TENANT_USER_REMOVE_SCOPE, MY_PROFILE_READ_SCOPE,
    // External OIDC providers
    FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE,
    // Captcha
    CAPTCHA_CONFIG_SCOPE,
    // System
    SYSTEM_SETTINGS_UPDATE_SCOPE, SYSTEM_SETTINGS_READ_SCOPE, JOBS_READ_SCOPE, JOBS_UPDATE_SCOPE,
    LEGACY_USER_MIGRATION_SCOPE, SECURITY_EVENT_WRITE_SCOPE,
    // Secret entry
    SECRET_ENTRY_DELEGATE_SCOPE,
    // Custom encryption/decryption
    CUSTOM_ENCRYP_DECRYPT_SCOPE
];

export const ALL_INTERNAL_SCOPE_NAMES_DISPLAY: Array<{scopeName: string, scopeDescription: string}> = [
    {scopeName: TENANT_CREATE_SCOPE, scopeDescription: "Create a tenant"},
    {scopeName: TENANT_UPDATE_SCOPE, scopeDescription: "Update a tenant"},
    {scopeName: TENANT_DELETE_SCOPE, scopeDescription: "Delete a tenant"},
    {scopeName: TENANT_READ_SCOPE, scopeDescription: "Read and query tenants"},
    {scopeName: TENANT_READ_ALL_SCOPE, scopeDescription: "Read only view of tenants and related information"},
    {scopeName: CLIENT_CREATE_SCOPE, scopeDescription: "Create a client"},
    {scopeName: CLIENT_UPDATE_SCOPE, scopeDescription: "Update a client"},
    {scopeName: CLIENT_DELETE_SCOPE, scopeDescription: "Delete a client"},
    {scopeName: CLIENT_READ_SCOPE, scopeDescription: "Read and query clients"},
    {scopeName: CLIENT_SECRET_VIEW_SCOPE, scopeDescription: "View client secrets"},
    {scopeName: SCOPE_CREATE_SCOPE, scopeDescription: "Create scope"},
    {scopeName: SCOPE_UPDATE_SCOPE, scopeDescription: "Update scope"},
    {scopeName: SCOPE_DELETE_SCOPE, scopeDescription: "Delete scope"},
    {scopeName: SCOPE_READ_SCOPE, scopeDescription: "Read and query scope"},
    {scopeName: SCOPE_TENANT_ASSIGN_SCOPE, scopeDescription: "Assign scope to tenants"},
    {scopeName: SCOPE_TENANT_REMOVE_SCOPE, scopeDescription: "Remove scope from tennats"},
    {scopeName: SCOPE_CLIENT_ASSIGN_SCOPE, scopeDescription: "Assign scope to clients"},
    {scopeName: SCOPE_CLIENT_REMOVE_SCOPE, scopeDescription: "Remove scope from clients"},
    {scopeName: SCOPE_GROUP_ASSIGN_SCOPE, scopeDescription: "Assign scope to authorization groups"},
    {scopeName: SCOPE_GROUP_REMOVE_SCOPE, scopeDescription: "Remove scope from authorization groups"},
    {scopeName: SCOPE_USER_ASSIGN_SCOPE, scopeDescription: "Assign scope to users"},
    {scopeName: SCOPE_USER_REMOVE_SCOPE, scopeDescription: "Remove scope from users"},
    {scopeName: SCOPE_CONSTRAINT_SCHEMA_CREATE_SCOPE, scopeDescription: "Create scope-constraint schemas"},
    {scopeName: SCOPE_CONSTRAINT_SCHEMA_UPDATE_SCOPE, scopeDescription: "Update scope-constraint schemas"},
    {scopeName: SCOPE_CONSTRAINT_SCHEMA_DELETE_SCOPE, scopeDescription: "Delete scope-constraint schemas"},
    {scopeName: SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE, scopeDescription: "Read and query scope-constraint schemas"},
    {scopeName: ACCESS_RULE_CREATE_SCOPE, scopeDescription: "Create access rule"},
    {scopeName: ACCESS_RULE_UPDATE_SCOPE, scopeDescription: "Update access rule"},
    {scopeName: ACCESS_RULE_DELETE_SCOPE, scopeDescription: "Delete access rule"},
    {scopeName: ACCESS_RULE_READ_SCOPE, scopeDescription: "Read and query access rules"},
    {scopeName: KEY_CREATE_SCOPE, scopeDescription: "Create key"},
    {scopeName: KEY_UPDATE_SCOPE, scopeDescription: "Update key"},
    {scopeName: KEY_DELETE_SCOPE, scopeDescription: "Delete key"},
    {scopeName: KEY_READ_SCOPE, scopeDescription: "Read and query keys"},
    {scopeName: KEY_SECRET_VIEW_SCOPE, scopeDescription: "View private keys and passcodes"},
    {scopeName: RATE_LIMIT_CREATE_SCOPE, scopeDescription: "Create rate limit"},
    {scopeName: RATE_LIMIT_UPDATE_SCOPE, scopeDescription: "Update rate limit"},
    {scopeName: RATE_LIMIT_DELETE_SCOPE, scopeDescription: "Delete rate limit"},
    {scopeName: RATE_LIMIT_READ_SCOPE, scopeDescription: "Read and query rate limits"},
    {scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE, scopeDescription: "Assign rate limits to tenants"},
    {scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE, scopeDescription: "Remote rate limits from tenants"},
    {scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE, scopeDescription: "Update rate limits for tenants"},
    {scopeName: AUTHENTICATION_GROUP_CREATE_SCOPE, scopeDescription: "Create authentication group"},
    {scopeName: AUTHENTICATION_GROUP_UPDATE_SCOPE, scopeDescription: "Update authentication group"},
    {scopeName: AUTHENTICATION_GROUP_DELETE_SCOPE, scopeDescription: "Delete authentication group"},
    {scopeName: AUTHENTICATION_GROUP_READ_SCOPE, scopeDescription: "Read and query authentication groups"},
    {scopeName: AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, scopeDescription: "Assign authentication groups to clients"},
    {scopeName: AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE, scopeDescription: "Remove authentication groups from clients"},
    {scopeName: AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, scopeDescription: "Assign authentication groups to users"},
    {scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, scopeDescription: "Remove authentication groups from users"},
    {scopeName: AUTHORIZATION_GROUP_CREATE_SCOPE, scopeDescription: "Create authorization group"},
    {scopeName: AUTHORIZATION_GROUP_UPDATE_SCOPE, scopeDescription: "Update authorization group"},
    {scopeName: AUTHORIZATION_GROUP_DELETE_SCOPE, scopeDescription: "Delete authorization group"},
    {scopeName: AUTHORIZATION_GROUP_READ_SCOPE, scopeDescription: "Read and query authorization groups"},
    {scopeName: AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, scopeDescription: "Assign authorization groups to users"},
    {scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, scopeDescription: "Remove authorization groups from users"},
    {scopeName: ANONYMOUS_USER_CREATE_SCOPE, scopeDescription: "Ability to issue auth tokens for anonymous users"},
    {scopeName: USER_CREATE_SCOPE, scopeDescription: "Create user"},
    {scopeName: USER_UPDATE_SCOPE, scopeDescription: "Update user"},
    {scopeName: USER_DELETE_SCOPE, scopeDescription: "Delete user"},
    {scopeName: USER_READ_SCOPE, scopeDescription: "Read and query users"},
    {scopeName: USER_UNLOCK_SCOPE, scopeDescription: "Unlock users"},
    {scopeName: USER_SESSION_READ_SCOPE, scopeDescription: "Read user sessions"},
    {scopeName: USER_SESSION_DELETE_SCOPE, scopeDescription: "Delete user sessions"},
    {scopeName: TENANT_USER_ASSIGN_SCOPE, scopeDescription: "Assign a user to a tenant"},
    {scopeName: TENANT_USER_REMOVE_SCOPE, scopeDescription: "Remove a user from a tenant"},
    {scopeName: MY_PROFILE_READ_SCOPE, scopeDescription: "Read my profile"},
    {scopeName: FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, scopeDescription: "Create federated OIDC provider"},
    {scopeName: FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, scopeDescription: "Update federated OIDC provider"},
    {scopeName: FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, scopeDescription: "Delete federated OIDC provider"},
    {scopeName: FEDERATED_OIDC_PROVIDER_READ_SCOPE, scopeDescription: "Read and query federated OIDC providers"},
    {scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, scopeDescription: "Assign federated OIDC providers to tenants"},
    {scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, scopeDescription: "Remove federated OIDC providers from tenants"},
    {scopeName: FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, scopeDescription: "View federated OIDC provider client secrets"},
    {scopeName: CAPTCHA_CONFIG_SCOPE, scopeDescription: "Add, remove, and configure ReCaptcha"},
    {scopeName: SYSTEM_SETTINGS_UPDATE_SCOPE, scopeDescription: "Update system settings"},
    {scopeName: SYSTEM_SETTINGS_READ_SCOPE, scopeDescription: "Read system settings"},
    {scopeName: JOBS_READ_SCOPE, scopeDescription: "Read the status of background jobs in the IAM portal"},
    {scopeName: JOBS_UPDATE_SCOPE, scopeDescription: "Update the status of background jobs in the IAM portal"},
    {scopeName: LEGACY_USER_MIGRATION_SCOPE, scopeDescription: "Ability to invoke legacy user migration endpoints"},
    {scopeName: SECURITY_EVENT_WRITE_SCOPE, scopeDescription: "Ability to write to the security webhook endpoint"},
    {scopeName: SECRET_ENTRY_DELEGATE_SCOPE, scopeDescription: "Allows a user to delegate the entry of a secret value to an arbitrary person"},
    {scopeName: CUSTOM_ENCRYP_DECRYPT_SCOPE, scopeDescription: "Ability to use a custom KMS implementation"},
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
    RATE_LIMIT_CREATE_SCOPE, RATE_LIMIT_UPDATE_SCOPE, RATE_LIMIT_DELETE_SCOPE, RATE_LIMIT_TENANT_ASSIGN_SCOPE, 
    RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE,
    // Users
    USER_DELETE_SCOPE, USER_SESSION_READ_SCOPE, USER_SESSION_DELETE_SCOPE, TENANT_USER_ASSIGN_SCOPE, USER_UNLOCK_SCOPE,
    // External OIDC providers
    FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE,
    // Captcha
    CAPTCHA_CONFIG_SCOPE,
    // System
    SYSTEM_SETTINGS_UPDATE_SCOPE, SYSTEM_SETTINGS_READ_SCOPE, JOBS_READ_SCOPE, JOBS_UPDATE_SCOPE,
    LEGACY_USER_MIGRATION_SCOPE, SECURITY_EVENT_WRITE_SCOPE,
    // Secret entry
    SECRET_ENTRY_DELEGATE_SCOPE,
    // Custom encryption/decryption
    CUSTOM_ENCRYP_DECRYPT_SCOPE
];

// These are the scope values which can be used WITHIN a non-root tenant. So actions such as 
// creating/updating/deleting a group, creating/updating/deleting a client, etc.
// This does not apply to the Root Tenant, where any scope values assigned to a group
// in the Root Tenant apply both to the Root Tenant AND to all other Tenants.
// These are the minimum default scope names that can be applied to EVERY Tenant that
// is created. The admin who is creating the tenant will also be able to apply any other
// scope values that the various applications support, and can remove some of these 
// if they want.
export const DEFAULT_TENANT_BOUND_INTERNAL_SCOPE_NAMES = [
    // Tenant
    TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE,
    // Client
    CLIENT_CREATE_SCOPE, CLIENT_UPDATE_SCOPE, CLIENT_DELETE_SCOPE, CLIENT_READ_SCOPE, CLIENT_SECRET_VIEW_SCOPE,
    // Scope itself
    SCOPE_READ_SCOPE, SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE, SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE, SCOPE_USER_ASSIGN_SCOPE, SCOPE_USER_REMOVE_SCOPE,
    // Scope constraints
    SCOPE_CONSTRAINT_SCHEMA_READ_SCOPE,
    // Access rules
    ACCESS_RULE_READ_SCOPE,
    // Signing keys
    KEY_CREATE_SCOPE, KEY_UPDATE_SCOPE, KEY_DELETE_SCOPE, KEY_READ_SCOPE, KEY_SECRET_VIEW_SCOPE,
    // Rate limits
    RATE_LIMIT_READ_SCOPE,
    // Authentication groups
    AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_UPDATE_SCOPE, AUTHENTICATION_GROUP_DELETE_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE, 
    AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE,
    AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE,
    // Authorization Groups
    AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHORIZATION_GROUP_UPDATE_SCOPE, AUTHORIZATION_GROUP_DELETE_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE,
    // Users
    ANONYMOUS_USER_CREATE_SCOPE, USER_CREATE_SCOPE, USER_READ_SCOPE, USER_UPDATE_SCOPE, MY_PROFILE_READ_SCOPE, TENANT_USER_REMOVE_SCOPE,
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
    AUTHENTICATION_GROUP_READ_SCOPE,
    AUTHORIZATION_GROUP_READ_SCOPE,
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

export const PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS="password-hash-scrypt-32k-iterations";
export const PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS="password-hash-scrypt-64k-iterations";
export const PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS="password-hash-scrypt-128k-iterations";

export const PASSWORD_HASHING_ALGORITHMS = [
    PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS
];
export const PASSWORD_HASHING_ALGORITHMS_DISPLAY: Map<string, string> = new Map([
    [PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, "SHA256 64K Iterations"],
    [PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, "SHA256 128K Iterations"],
    [PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, "BCrypt 10 Rounds"],
    [PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, "BCrypt 11 Rounds"],
    [PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, "BCrypt 12 Rounds"],
    [PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, "PBKDF2 128K Iterations"],
    [PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, "PBKDF2 256K Iterations"],
    [PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, "Scrypt 32K Iterations"],
    [PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, "Scrypt 64K Iterations"],
    [PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS, "Scrypt 128K Iterations"]
]);
export const PASSWORD_HASH_ITERATION_32K=32768
export const PASSWORD_HASH_ITERATION_64K=65536;
export const PASSWORD_HASH_ITERATION_128K=131072;
export const PASSWORD_HASH_ITERATION_256K=262144;
export const RANKED_DESCENDING_HASHING_ALGORITHS = [
    PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS,    
    PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
    PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS,    
    PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS,    
    PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS,
    PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS
]


// 16 byte salt (minimum recommended by NIST is 32 bits / 4 bytes)
export const PASSWORD_SALT_LENGTH=16; 
export const PASSWORD_MINIMUM_LENGTH=8;
export const PASSWORD_MAXIMUM_LENGTH=96;
export const PASSWORD_PATTERN="[A-Za-z0-9_-!@#[]<>=?+*.,%/:;]";
export const DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED="_-!@#[]<>=?+*.,%/:;";

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
export const MIN_PRIVATE_KEY_PASSWORD_LENGTH=16;
export const DEFAULT_PRIVATE_KEY_PASSWORD_LENGTH=20;



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

export const FEDERATED_AUTHN_CONSTRAINT_DISPLAY = new Map<string, string>(
    [
        [FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, "Not Allowed"],
        [FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, "Exclusive"],
        [FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, "Permissive"]
    ]
)

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
export const TENANT_TYPES_DISPLAY = new Map<string, string>(
    [
        [TENANT_TYPE_ROOT_TENANT, "Root Tenant"],
        [TENANT_TYPE_IDENTITY_MANAGEMENT, "Identity Management Only"],
        [TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, "Identity Management And Services"],
        [TENANT_TYPE_SERVICES, "Services Only"]
    ]
);

export const DEFAULT_LOGIN_FAILURE_LOCK_THRESHOLD=8;
export const DEFAULT_MAXIMUM_LOGIN_FAILURES=100;
export const DEFAULT_LOGIN_PAUSE_TIME_MINUTES=30;
export const DEFAULT_PASSWORD_HISTORY_PERIOD=8;
export const LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT="LOCK_USER_ACCOUNT";
export const LOGIN_FAILURE_POLICY_PAUSE="PAUSE";
export const LOGIN_FAILURE_POLICY_TYPES=[
    LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT,
    LOGIN_FAILURE_POLICY_PAUSE
];
export const LOGIN_FAILURE_POLICY_TYPE_DISPLAY = new Map<string, string>(
    [
        [LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, "Lock"],
        [LOGIN_FAILURE_POLICY_PAUSE, "Pause"]
    ]
)

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
export const OIDC_CLIENT_AUTH_TYPE_DISPLAY: Map<string, string> = new Map([
    [OIDC_CLIENT_AUTH_TYPE_NONE, "None (Use PKCE must be selected)"],
    [OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, "Client Secret Post"],
    [OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, "Client Secret JWT"],
    [OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, "Client Secret Basic"]
]);


export const CLIENT_TYPE_SERVICE_ACCOUNT="CLIENT_TYPE_SERVICE_ACCOUNT";
export const CLIENT_TYPE_USER_DELEGATED_PERMISSIONS="CLIENT_TYPE_USER_DELEGATED_PERMISSIONS";
export const CLIENT_TYPE_IDENTITY="CLIENT_TYPE_IDENTITY";
export const CLIENT_TYPE_DEVICE="CLIENT_TYPE_DEVICE";
export const CLIENT_TYPES=[
    CLIENT_TYPE_IDENTITY,
    CLIENT_TYPE_USER_DELEGATED_PERMISSIONS,
    CLIENT_TYPE_SERVICE_ACCOUNT,
    CLIENT_TYPE_DEVICE
];

export const CLIENT_TYPES_DISPLAY = new Map<string, string>(
    [ 
        [CLIENT_TYPE_SERVICE_ACCOUNT, "Service Account"],
        [CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, "User Delegated Permissions"],
        [CLIENT_TYPE_IDENTITY, "Identity"],
        [CLIENT_TYPE_DEVICE, "Device"]
    ]
);

export const PRINCIPAL_TYPE_SYSTEM_INIT_USER="SYSTEM_INIT_USER";
export const PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN="SERVICE_ACCOUNT";
export const PRINCIPAL_TYPE_END_USER="END_USER";
export const PRINCIPAL_TYPE_ANONYMOUS_USER="ANONYMOUS_USER";
export const PRINCIPAL_TYPE_IAM_PORTAL_USER="IAM_PORTAL_USER";
export const PRINCIPAL_TYPES=[
    PRINCIPAL_TYPE_SERVICE_ACCOUNT_TOKEN,
    PRINCIPAL_TYPE_END_USER,
    PRINCIPAL_TYPE_ANONYMOUS_USER,
    PRINCIPAL_TYPE_IAM_PORTAL_USER
];

export const SESSION_TOKEN_TYPE_REGISTRATION="REGISTRATION";
export const SESSION_TOKEN_TYPE_AUTHENTICATION="AUTHENTICATION";

export const MFA_AUTH_TYPE_NONE="NONE";
export const MFA_AUTH_TYPE_TIME_BASED_OTP="TIME_BASED_OTP";
export const MFA_AUTH_TYPE_FIDO2="FIDO2";
export const MFA_AUTH_TYPES=[
    MFA_AUTH_TYPE_NONE,   
    MFA_AUTH_TYPE_TIME_BASED_OTP,
    MFA_AUTH_TYPE_FIDO2
];

export const TOTP_HASH_ALGORITHM_SHA256="SHA256";
export const TOTP_HASH_ALGORITHM_SHA1="SHA1"

export const MFA_AUTH_TYPE_DISPLAY: Map<string, string> = new Map([
    [MFA_AUTH_TYPE_NONE, "None"],    
    [MFA_AUTH_TYPE_TIME_BASED_OTP, "TOTP - Requires an authenticator app"],
    [MFA_AUTH_TYPE_FIDO2, "Security Key"]
]);

export const NAME_ORDER_EASTERN="EASTER_NAME_ORDER";
export const NAME_ORDER_WESTERN="WESTERN_NAME_ORDER";
export const NAME_ORDERS=[
    NAME_ORDER_EASTERN,
    NAME_ORDER_WESTERN
];
export const NAME_ORDER_DISPLAY: Map<string, string> = new Map([
    [NAME_ORDER_EASTERN, "Eastern name order"],
    [NAME_ORDER_WESTERN, "Western name order"]
]);

export const USER_TENANT_REL_TYPE_PRIMARY = "PRIMARY";
export const USER_TENANT_REL_TYPE_GUEST = "GUEST";
export const USER_TENANT_REL_TYPES = [
    USER_TENANT_REL_TYPE_PRIMARY,
    USER_TENANT_REL_TYPE_GUEST
];
export const USER_TENANT_REL_TYPES_DISPLAY: Map<string, string> = new Map([
    [USER_TENANT_REL_TYPE_PRIMARY, "Primary"],
    [USER_TENANT_REL_TYPE_GUEST, "Guest"]
]);

export const KEY_TYPE_RSA="RSA";
export const KEY_TYPE_EC="EC";
export const KEY_TYPES=[
    KEY_TYPE_RSA,
    KEY_TYPE_EC
];

export const KEY_USE_JWT_SIGNING="KEY_USE_JWT_SIGNING";
export const KEY_USE_DIGITAL_SIGNING="KEY_USE_DIGITAL_SIGNING";
export const KEY_USE_ENCRYPTION="KEY_USE_ENCRYPTION";
export const KEY_USE_KEY_AGREEMENT="KEY_USE_KEY_AGREEMENT";
export const KEY_USE_CERTIFICATE_SIGNING="KEY_USE_CERTIFICATE_SIGNING";
export const KEY_USES=[
    KEY_USE_JWT_SIGNING,
    KEY_USE_DIGITAL_SIGNING,
    KEY_USE_ENCRYPTION,
    KEY_USE_KEY_AGREEMENT,
    KEY_USE_CERTIFICATE_SIGNING
];
export const KEY_USE_DISPLAY = new Map<string, string>([
    [KEY_USE_JWT_SIGNING, "JWT Signing"],
    [KEY_USE_DIGITAL_SIGNING, "Digital Signing"],
    [KEY_USE_ENCRYPTION, "Encryption"],
    [KEY_USE_KEY_AGREEMENT, "Key Agreement"],
    [KEY_USE_CERTIFICATE_SIGNING, "Certificate Signing"]
]);

export const PKCS8_PRIVATE_KEY_HEADER="-----BEGIN PRIVATE KEY-----";
export const PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER="-----BEGIN ENCRYPTED PRIVATE KEY-----";
export const PKCS8_PUBLIC_KEY_HEADER="-----BEGIN PUBLIC KEY-----";
export const CERTIFICATE_HEADER="-----BEGIN CERTIFICATE-----";

export const SIGNING_KEY_STATUS_ACTIVE="ACTIVE";
export const SIGNING_KEY_STATUS_REVOKED="REVOKED";
export const SIGNING_KEY_STATUSES=[
    SIGNING_KEY_STATUS_ACTIVE,
    SIGNING_KEY_STATUS_REVOKED
];

export const SIGNING_KEY_DISPLAY = new Map<string, string>([
    [SIGNING_KEY_STATUS_ACTIVE, "Active"],
    [SIGNING_KEY_STATUS_REVOKED, "Revoked"]
]);

export const STATUS_COMPLETE="COMPLETE";
export const STATUS_INCOMPLETE="INCOMPLETE";
export const STATUS_OMITTED="OMITTED";

export const REFRESH_TOKEN_CLIENT_TYPE_PKCE="PKCE";
export const REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT="SECURE_CLIENT";
export const REFRESH_TOKEN_CLIENT_TYPE_DEVICE="DEVICE";
export const REFRESH_TOKEN_CLIENT_TYPES=[
    REFRESH_TOKEN_CLIENT_TYPE_PKCE,
    REFRESH_TOKEN_CLIENT_TYPE_SECURE_CLIENT,
    REFRESH_TOKEN_CLIENT_TYPE_DEVICE
];

export const CHANGE_EVENT_TYPE_CREATE="CREATE";
export const CHANGE_EVENT_TYPE_UPDATE="UPDATE";
export const CHANGE_EVENT_TYPE_DELETE="DELETE";
export const CHANGE_EVENT_TYPE_CREATE_REL="CREATE_REL";
export const CHANGE_EVENT_TYPE_REMOVE_REL="REMOVE_REL";
export const CHANGE_EVENT_TYPE_UPDATE_REL="UPDATE_REL"
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
export const CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_USER_CONFIGURATION="TENANT_ANONYMOUS_USER_CONFIGURATION";
export const CHANGE_EVENT_CLASS_TENANT_LOOK_AND_FEEL="TENANT_LOOK_AND_FEEL";
export const CHANGE_EVENT_CLASS_TENANT_PASSWORD_CONFIGURATION="TENANT_PASSWORD_CONFIGURATION";
export const CHANGE_EVENT_CLASS_TENANT_LEGACY_USER_MIGRATION_CONFIGURATION="TENANT_LEGACY_USER_MIGRATION_CONFIGURATION";
export const CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_="TENANT_AUTHENTICATION_DOMAIN_REL";
export const CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL="TENANT_AUTHENTICATION_DOMAIN_REL";
export const CHANGE_EVENT_CLASS_TENANT_USER_REL="TENANT_USER_REL";
export const CHANGE_EVENT_CLASS_TENANT_LOGIN_FAILURE_POLICY="TENANT_LOGIN_FAILURE_POLICY";
export const CHANGE_EVENT_CLASS_SYSTEM_SETTINGS="SYSTEM_SETTINGS";
export const CHANGE_EVENT_CLASS_CLIENT="CLIENT";
export const CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI="CLIENT_REDIRECT_URI";
export const CHANGE_EVENT_CLASS_CLIENT_AUTHENTICATION_GROUP="CLIENT_AUTHENTICATION_GROUP";
export const CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP_USER_REL="AUTHENTICATION_USER_REL";
export const CHANGE_EVENT_CLASS_OIDC_PROVIDER="OIDC_PROVIDER";
export const CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL="OIDC_PROVIDER_TENANT_REL";
export const CHANGE_EVENT_CLASS_SOCIAL_OIDC_PROVIDER_TENANT_REL="SOCIAL_OIDC_PROVIDER_TENANT_REL";
export const CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL="OIDC_PROVIDER_DOMAIN_REL";
export const CHANGE_EVENT_CLASS_USER="USER";
export const CHANGE_EVENT_CLASS_USER_UNLOCKED="USER_UNLOCKED";
export const CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP="AUTHORIZATION_GROUP";
export const CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_USER_REL="AUTHORIZATION_GROUP_USER_REL";
export const CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP="AUTHENTICATION_GROUP";
export const CHANGE_EVENT_CLASS_SIGNING_KEY="SIGNING_KEY";
export const CHANGE_EVENT_CLASS_RATE_LIMIT="RATE_LIMIT";
export const CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL="TENANT_RATE_LIMIT_REL";
export const CHANGE_EVENT_CLASS_SCOPE="SCOPE";
export const CHANGE_EVENT_CLASS_TENANT_SCOPE_REL="TENANT_SCOPE_REL";
export const CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL="CLIENT_TENANT_SCOPE_REL";
export const CHANGE_EVENT_CLASS_USER_TENANT_SCOPE_REL="USER_TENANT_SCOPE_REL";
export const CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_TENANT_SCOPE_REL="AUTHORIZATION_GROUP_TENANT_SCOPE_REL";
export const CHANGE_EVENT_CLASS_SCOPE_CONSTRAINT_SCHEMA="SCOPE_CONSTRAINT_SCHEMA";
export const CHANGE_EVENT_CLASS_ACCESS_RULE="ACCESS_RULE";
export const CHANGE_EVENT_CLASS_CONTACT="CONTACT";
export const CHANGE_EVENT_CLASS_MARK_FOR_DELETE="MARK_FOR_DELETE";
export const CHANGE_EVENT_CLASSES=[
    CHANGE_EVENT_CLASS_LOGIN_FAILURE_POLICY,
    CHANGE_EVENT_CLASS_TENANT,
    CHANGE_EVENT_CLASS_TENANT_MANAGEMENT_DOMAIN_REL,
    CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL,
    CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_USER_CONFIGURATION,
    CHANGE_EVENT_CLASS_TENANT_LOOK_AND_FEEL,
    CHANGE_EVENT_CLASS_TENANT_PASSWORD_CONFIGURATION,
    CHANGE_EVENT_CLASS_TENANT_LEGACY_USER_MIGRATION_CONFIGURATION,
    CHANGE_EVENT_CLASS_TENANT_USER_REL,
    CHANGE_EVENT_CLASS_CLIENT,
    CHANGE_EVENT_CLASS_OIDC_PROVIDER,
    CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL,
    CHANGE_EVENT_CLASS_SOCIAL_OIDC_PROVIDER_TENANT_REL,
    CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL,
    CHANGE_EVENT_CLASS_USER,
    CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP,
    CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_USER_REL,
    CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP,
    CHANGE_EVENT_CLASS_SIGNING_KEY,
    CHANGE_EVENT_CLASS_RATE_LIMIT,
    CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL,
    CHANGE_EVENT_CLASS_SCOPE,
    CHANGE_EVENT_CLASS_TENANT_SCOPE_REL,
    CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL,
    CHANGE_EVENT_CLASS_USER_TENANT_SCOPE_REL,
    CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_TENANT_SCOPE_REL,
    CHANGE_EVENT_CLASS_SCOPE_CONSTRAINT_SCHEMA,
    CHANGE_EVENT_CLASS_ACCESS_RULE,
    CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI,
    CHANGE_EVENT_CLASS_CLIENT_AUTHENTICATION_GROUP,
    CHANGE_EVENT_CLASS_AUTHENTICATION_GROUP_USER_REL,
    CHANGE_EVENT_CLASS_CONTACT,
    CHANGE_EVENT_CLASS_MARK_FOR_DELETE
];


export const FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL="SOCIAL";
export const FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE="ENTERPRISE";
export const FEDERATED_OIDC_PROVIDER_TYEPS=[
    FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
    FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE
];
export const FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY = new Map<string, string>(
    [
        [FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, "Social"],
        [FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, "Enterprise"]
    ]
);

export const SOCIAL_OIDC_PROVIDER_GOOGLE="Google";
export const SOCIAL_OIDC_PROVIDER_FACEBOOK="Facebook";
export const SOCIAL_OIDC_PROVIDER_APPLE="Apple";
export const SOCIAL_OIDC_PROVIDER_LINKEDIN="LinkedIn";
export const SOCIAL_OIDC_PROVIDER_SALESFORCE="Salesforce"
export const SOCIAL_OIDC_PROVIDERS = [
    SOCIAL_OIDC_PROVIDER_APPLE,
    SOCIAL_OIDC_PROVIDER_FACEBOOK,
    SOCIAL_OIDC_PROVIDER_GOOGLE,
    SOCIAL_OIDC_PROVIDER_LINKEDIN,
    SOCIAL_OIDC_PROVIDER_SALESFORCE
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
export const QUERY_PARAM_TENANT_ID="_tid";
export const QUERY_PARAM_REDIRECT_URI="redirect_uri";
export const QUERY_PARAM_AUTHENTICATE_TO_PORTAL="_pa";
export const QUERY_PARAM_COUNTRY_CODE="country_code";
export const QUERY_PARAM_LANGUAGE_CODE="language_code";
export const QUERY_PARAM_RETURN_URI="return_uri";
export const QUERY_PARAM_USERNAME="username";
export const QUERY_PARAM_DEVICE_CODE_ID="devicecodeid";
export const QUERY_PARAM_SECRET_ENTRY_OTP="_seotp";
export const QUERY_PARAM_ERROR="error";
export const QUERY_PARAM_ERROR_DESCRIPTION="error_description";
export const HASH_PARAM_AUTH_TOKEN="_atk";


export const AUTHORIZATION_LAYOUT_PAGES = [
    "/authorize/login",
    "/authorize/auth-successful",
    "/authorize/register",
    "/access-error",
    "/device",
    "/device/registered",
    "/my-profile",
    "/secret-entry",
    "/system-init"
];

export const PROFILE_LAYOUT_PAGES =[
    "/my-profile"
];



// ************************************************************************** //
// 
//                  DEFAULT CONSTANTS
// 
// ************************************************************************** //

export const DEFAULT_TENANT_LOOK_AND_FEEL: TenantLookAndFeel = {
    tenantid: "",
    adminheaderbackgroundcolor: "",
    adminheadertextcolor: "white",
    adminheadertext: "",
    authenticationheaderbackgroundcolor: "#1976d2",
    authenticationheadertextcolor: "white",
    authenticationlogo: null,
    authenticationheadertext: "",
    footerlinks: []
};

export const DEFAULT_TENANT_META_DATA: TenantMetaData = {
    tenant: {
        __typename: undefined,
        allowAnonymousUsers: false,
        allowForgotPassword: false,
        allowLoginByPhoneNumber: false,
        allowSocialLogin: false,
        allowUnlimitedRate: false,
        allowUserSelfRegistration: false,
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
        verifyEmailOnSelfRegistration: true,
        registrationRequireCaptcha: false,
        registrationRequireTermsAndConditions: false,
        termsAndConditionsUri: ""
    },
    tenantLookAndFeel: DEFAULT_TENANT_LOOK_AND_FEEL,
    systemSettings: {
        systemId: "",
        allowRecoveryEmail: false,
        allowDuressPassword: false,
        rootClientId: "",
        enablePortalAsLegacyIdp: false,
        softwareVersion: OPENTRUST_IDENTITY_VERSION,
        systemCategories: []
    },
    socialOIDCProviders: []

}

export const DEFAULT_TENANT_PASSWORD_CONFIGURATION: TenantPasswordConfig = {
    passwordHashingAlgorithm: PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
    passwordMaxLength: PASSWORD_MAXIMUM_LENGTH,
    passwordMinLength: PASSWORD_MINIMUM_LENGTH,
    requireLowerCase: true,
    requireMfa: false,
    requireNumbers: true,
    requireSpecialCharacters: false,
    requireUpperCase: true,
    tenantId: "",
    mfaTypesRequired: "",
    specialCharactersAllowed: DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED,
    maxRepeatingCharacterLength: 2,
    passwordHistoryPeriod: null,
    passwordRotationPeriodDays: null
}

export const DEFAULT_LOGIN_FAILURE_POLICY: TenantLoginFailurePolicy = {
    failureThreshold: DEFAULT_LOGIN_FAILURE_LOCK_THRESHOLD,
    loginFailurePolicyType: LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT,
    tenantId: "",
    pauseDurationMinutes: null,
    maximumLoginFailures: null
}

export const DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS=90;
export const TENANT_NAME_MINIMUM_LENGTH=4;


// ************************************************************************** //
// 
//                  SEARCH CONSTANTS
// 
// ************************************************************************** //
export const MAX_SEARCH_PAGE_SIZE=1000;
export const MIN_SEARCH_PAGE_SIZE=5;
export const MAX_SEARCH_PAGE=1000
export const ALLOWED_OBJECT_SEARCH_SORT_FIELDS = ["name", "description", "email"];
export const ALLOWED_SEARCH_DIRECTIONS=["asc", "desc"];
export const SEARCH_INDEX_OBJECT_SEARCH="iam_object_search";
export const SEARCH_INDEX_REL_SEARCH="iam_rel_search";



// ************************************************************************** //
// 
//                  TENANT LOOK AND FEEL CONSTANTS
// 
// ************************************************************************** //

export const DEFAULT_BACKGROUND_COLOR = "#1976d2";
export const DEFAULT_TEXT_COLOR = "white";

export const IMAGE_EXTENSION_TYPES = [
    "svg",
    "png",
    "gif",
    "jpeg",
    "jpg",
    "tif",
    "tiff",
    "bmp",
    "webp",
    "apng",
    "avif"
]

export const IMAGE_MIME_TYPES_MAP: Map<string, string> = new Map([
    ["svg", "image/svg+xml"],
    ["png", "image/png"],
    ["gif", "image/gif"],
    ["jpeg", "image/jpeg"],
    ["jpg", "image/jpeg"],
    ["tif", "image/tiff"],
    ["tiff", "image/tiff"],    
    ["bmp", "image/bmp"],
    ["webp", "image/webp"],
    ["apng", "image/apng"],
    ["avif", "image/avif"]
]);

export const IMAGE_MINE_TYPES_DISPLAY: Map<string, string> = new Map([
    ["svg", "svg"],
    ["png", "png"],
    ["gif", "gif"],
    ["jpeg", "jpg"],
    ["jpg", "jpg"],
    ["tif", "tiff"],
    ["tiff", "tiff"],
    ["bmp", "bmp"],
    ["webp", "webp"],
    ["apng", "apng"],
    ["avif", "avif"]    
]);

// ************************************************************************** //
// 
//                  RATE LIMIT CONSTANTS
// 
// ************************************************************************** //
export const MAX_RATE_LIMIT_PERIOD_MINUTES=1440;
export const MIN_RATE_LIMIT_PERIOD_MINUTES=1;
export const DEFAULT_RATE_LIMIT_PERIOD_MINUTES=15;


// ************************************************************************** //
// 
//                  SCHEDULER CONSTANTS
// 
// ************************************************************************** //
export const CREATE_NEW_SIGNING_KEY_LOCK_NAME="CREATE_NEW_SIGNING_KEY";
export const DELETE_EXPIRED_DATA_LOCK_NAME="DELETE_EXPIRED_DATA";
export const MARK_FOR_DELETE_LOCK_NAME_PREFIX="DELETE_MARK_FOR_DELETE";


// ************************************************************************** //
// 
//                  CUSTOM HTTP HEADERS
// 
// ************************************************************************** //
export const HTTP_HEADER_X_IP_ADDRESS="x-ip-address";
export const HTTP_HEADER_X_GEO_LOCATION="x-geo-location";

export const DEFAULT_HTTP_TIMEOUT_MS=60000;

// ************************************************************************** //
// 
//                  CAPTCHA DEFAULTS
// 
// ************************************************************************** //
// For Version 3 of captcha, default to a score of 0.7 for bot detection
export const DEFAULT_CAPTCHA_V3_MINIMUM_SCORE=0.7;

// ************************************************************************** //
// 
//                  INITIALIZATION CONSTANTS
// 
// ************************************************************************** //
export const SYSTEM_INITIALIZATION_KEY_ID="6b9f3310-0be9-4b5f-8f92-701109bc8f43";
export const VALID_KMS_STRATEGIES = ["googlekms", "awskms", "azurekms", "tencentkms", "custom", "filesystem", "none"];
export const FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX="oidctest-";


// ************************************************************************** //
// 
//                  DATABASE-RELATED CONSTANTS
// 
// ************************************************************************** //
export const RDB_SUPPORTED_DIALECTS: Array<string> = ["mysql", "postgres", "mssql"];