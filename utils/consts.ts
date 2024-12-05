
// ************************************************************************** //
// 
//                    AUTH-TOKEN-RELATED CONSTANTS
// 
// ************************************************************************** //
export const DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS = 600; // 10 minutes 
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
export const EXTERNAL_OIDC_PROVIDER_FILE = "external-oidc-provider.json";
export const EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE = "external-oidc-provider-tenant-rel.json";
export const EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE = "external-oidc-provider-domain-rel.json";
export const PRE_AUTHENTICATION_STATE_FILE = "pre-authentication-state.json";
export const AUTHORIZATION_STATE_FILE = "authorization-state.json";
export const REFRESH_TOKEN_FILE = "refresh-token.json";
export const EXTERNAL_OIDC_AUTHORIZATION_REL_FILE = "external-oidc-authorization-rel.json";



// ************************************************************************** //
// 
//                    OIDC-SPECIFIC SCOPE CONSTANTS
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

export const EXTERNAL_OIDC_PROVIDER_CREATE_SCOPE="externaloidcprovider.create";
export const EXTERNAL_OIDC_PROVIDER_UPDATE_SCOPE="externaloidcprovider.update";
export const EXTERNAL_OIDC_PROVIDER_DELETE_SCOPE="externaloidcprovider.delete";
export const EXTERNAL_OIDC_PROVIDER_READ_SCOPE="externaloidcprovider.read";
export const EXTERNAL_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE="externaloidcprovider.tenant.assign";
export const EXTERNAL_OIDC_PROVIDER_TENANT_REMOVE_SCOPE="externaloidcprovider.tenant.remove";


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
    EXTERNAL_OIDC_PROVIDER_CREATE_SCOPE, EXTERNAL_OIDC_PROVIDER_UPDATE_SCOPE, EXTERNAL_OIDC_PROVIDER_DELETE_SCOPE, EXTERNAL_OIDC_PROVIDER_READ_SCOPE, EXTERNAL_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, EXTERNAL_OIDC_PROVIDER_TENANT_REMOVE_SCOPE
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
    EXTERNAL_OIDC_PROVIDER_CREATE_SCOPE, EXTERNAL_OIDC_PROVIDER_UPDATE_SCOPE, EXTERNAL_OIDC_PROVIDER_DELETE_SCOPE, EXTERNAL_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, EXTERNAL_OIDC_PROVIDER_TENANT_REMOVE_SCOPE
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
    EXTERNAL_OIDC_PROVIDER_READ_SCOPE
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
    EXTERNAL_OIDC_PROVIDER_READ_SCOPE
];


// ************************************************************************** //
// 
//                  IDENTITY-RELATED CONSTANTS
// 
// ************************************************************************** //
export const PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS="password-hash-sha-256-64k-iterations";
export const PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS="password-hash-sha-256-128k-iterations";
export const PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS="password-hash-bcrypt-10-rounds";
export const PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS="password-hash-bcrypt-12-rounds";
export const PASSWORD_HASHING_ALGORITHM_PBKDF2_10000_ITERATIONS="password-hash-pbkdf2-10000-iterations";
export const PASSWORD_HASHING_ALGORITHM_PBKDF2_20000_ITERATIONS="password-hash-pbkdf2-20000-iterations";
// 96 byte salt (minimum recommended by NIST is 32)
export const PASSWORD_SALT_LENGTH=96; 
export const PASSWORD_MINIMUM_LENGTH=10;
export const PASSWORD_MAXIMUM_LENGTH=64;
export const PASSWORD_PATTERN="[A-Za-z0-9_-!@#]";