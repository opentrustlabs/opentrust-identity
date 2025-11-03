/**
 * Test Data Factory
 * Provides helper functions to create test data objects for testing
 */

import { AuthenticationGroup, AuthorizationGroup, Client, PortalUserProfile, Scope, Tenant, User, UserCredential, UserMfaRel } from '@/graphql/generated/graphql-types';
import { ALL_INTERNAL_SCOPE_NAMES_DISPLAY, CLIENT_TYPE_IDENTITY, NAME_ORDER_WESTERN, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PRINCIPAL_TYPE_IAM_PORTAL_USER, SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT } from '@/utils/consts';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a mock User/Identity object
 */
export function createMockUser(overrides?: Partial<User>) {
  return {
    userId: uuidv4(),
    tenantId: uuidv4(),
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    domain: "example.com",
    emailVerified: true,
    enabled: true,
    locked: false,
    failedLoginAttempts: 0,
    lastLoginDate: new Date(),
    createdDate: new Date(),
    modifiedDate: new Date(),
    markForDelete: false,
    nameOrder: NAME_ORDER_WESTERN,

    forcePasswordResetAfterAuthentication: false,    
    ...overrides,
  };
}

/**
 * Creates a mock Tenant object
 */
export function createMockTenant(overrides?: Partial<Tenant>) {
  const id = uuidv4();
  return {
    id,
    tenantId: id, // GraphQL type uses tenantId
    tenantName: 'Test Tenant',
    name: 'Test Tenant',
    domain: 'test.example.com',
    enabled: true,
    isRootTenant: false,
    // GraphQL Tenant required fields
    allowAnonymousUsers: false,
    allowForgotPassword: true,
    allowLoginByPhoneNumber: false,
    allowSocialLogin: false,
    allowUnlimitedRate: true,
    allowUserSelfRegistration: true,
    defaultRateLimit: null,
    defaultRateLimitPeriodMinutes: null,
    federatedAuthenticationConstraint: 'NONE',
    federatedauthenticationconstraintid: null,
    markForDelete: false,
    migrateLegacyUsers: false,
    registrationRequireCaptcha: false,
    registrationRequireTermsAndConditions: false,
    tenantDescription: 'Test Tenant Description',
    tenantType: 'STANDARD',
    tenanttypeid: null,
    termsAndConditionsUri: null,
    verifyEmailOnSelfRegistration: true,
    createdDate: new Date(),
    modifiedDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Root Tenant object
 */
export function createMockRootTenant(overrides?: Partial<any>) {
  return createMockTenant({
    tenantName: 'Root Tenant',
    tenantId: uuidv4(),
    tenantType: TENANT_TYPE_ROOT_TENANT,
    ...overrides,
  });
}

/**
 * Creates a mock Client object
 */
export function createMockClient(overrides?: Partial<Client>): Client {
  return {    
    clientId: `client-${uuidv4()}`,
    clientSecret: 'secret',
    tenantId: uuidv4(),
    name: 'Test Client',
    enabled: true,
    clientType: CLIENT_TYPE_IDENTITY,
    markForDelete: false,
    oidcEnabled: true,
    pkceEnabled: false,
    clientDescription: "Test Client Description",
    clientName: "Test Client",
    ...overrides,
  } as Client;
}

/**
 * Creates a mock Scope object
 */
export function createMockScope(overrides?: Partial<Scope>) {
  const id = uuidv4();
  return {
    scopeId: id, // GraphQL type uses scopeId
    scopeName: 'test:read',
    scopeDescription: 'Test scope', // GraphQL type uses scopeDescription
    description: 'Test scope',
    scopeUse: 'API_ACCESS', // GraphQL type requires scopeUse
    tenantId: uuidv4(),
    enabled: true,
    markForDelete: false, // GraphQL type requires markForDelete
    createdDate: new Date(),
    modifiedDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Authentication Group object
 */
export function createMockAuthenticationGroup(overrides?: Partial<AuthenticationGroup>) {
  return {
    authenticationGroupId: uuidv4(),
    name: 'Test Auth Group',
    tenantId: uuidv4(),
    description: 'Test authentication group',
    enabled: true,
    createdDate: new Date(),
    modifiedDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Authorization Group object
 */
export function createMockAuthorizationGroup(overrides?: Partial<AuthorizationGroup>) {
  return {
    groupId: uuidv4(),
    groupName: 'Test Authz Group',
    tenantId: uuidv4(),    
    enabled: true,
    allowForAnonymousUsers: false,
    default: false,
    markForDelete: false,
    ...overrides,
  };
}

/**
 * Creates a mock User Credential object
 */
export function createMockUserCredential(overrides?: Partial<UserCredential>) {
  return {
    userId: uuidv4(),
    hashedPassword: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', // Mock bcrypt hash
    salt: 'salt',
    createdDate: new Date(),
    modifiedDate: new Date(),
    dateCreatedMs: Date.now(),
    hashingAlgorithm: PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
    ...overrides,
  };
}

/**
 * Creates a mock MFA Relationship object
 */
export function createMockMFARel(overrides?: Partial<UserMfaRel>) {
  return {
    userId: uuidv4(),
    mfaType: 'TOTP',
    secret: 'JBSWY3DPEHPK3PXP',
    enabled: true,
    verified: true,
    createdDate: new Date(),
    modifiedDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock JWT token payload
 */
export function createMockJWTPayload(overrides?: Partial<any>) {
  return {
    sub: uuidv4(),
    email: 'test@example.com',
    email_verified: true,
    tenant_id: uuidv4(),
    iss: 'https://test.example.com',
    aud: 'client-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: 'openid profile email',
    ...overrides,
  };
}

/**
 * Creates a mock Authorization Code
 */
export function createMockAuthorizationCode(overrides?: Partial<any>) {
  return {
    code: uuidv4(),
    clientId: 'client-id',
    userId: uuidv4(),
    tenantId: uuidv4(),
    redirectUri: 'https://example.com/callback',
    scope: 'openid profile email',
    expiresAt: new Date(Date.now() + 600000), // 10 minutes
    createdDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Access Token
 */
export function createMockAccessToken(overrides?: Partial<any>) {
  return {
    token: uuidv4(),
    clientId: 'client-id',
    userId: uuidv4(),
    tenantId: uuidv4(),
    scope: 'openid profile email',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
    createdDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Refresh Token
 */
export function createMockRefreshToken(overrides?: Partial<any>) {
  return {
    token: uuidv4(),
    clientId: 'client-id',
    userId: uuidv4(),
    tenantId: uuidv4(),
    scope: 'openid profile email',
    expiresAt: new Date(Date.now() + 86400000), // 24 hours
    createdDate: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Portal User Profile (for GraphQL context)
 */
export function createMockPortalUserProfile(overrides?: Partial<any>): PortalUserProfile{

  return {
    userId: uuidv4(),
    email: 'test@example.com',
    emailVerified: true,
    domain: 'test.example.com',
    firstName: 'Test',
    lastName: 'User',
    middleName: null,
    phoneNumber: null,
    address: null,
    addressLine1: null,
    city: null,
    postalCode: null,
    stateRegionProvince: null,
    countryCode: 'US',
    preferredLanguageCode: 'en',
    locked: false,
    enabled: true,
    nameOrder: 'WESTERN',
    scope: mockAllManagementScope(),
    tenantId: overrides && overrides.managementAccessTenantId ? overrides.managementAccessTenantId : uuidv4(),
    tenantName: 'Test Tenant',
    expiresAtMs: Date.now() + 3600000, // 1 hour from now
    principalType: PRINCIPAL_TYPE_IAM_PORTAL_USER,
    managementAccessTenantId: overrides && overrides.managementAccessTenantId ? overrides.managementAccessTenantId : uuidv4(),
    federatedOIDCProviderSubjectId: null,
    recoveryEmail: null,
    ...overrides,
  };
}

let allManagementScopes: Array<Scope> | null = null;

export function mockAllManagementScope(): Array<Scope> {
    if(allManagementScopes){
        return allManagementScopes;
    }
    else{
        allManagementScopes = [];
        for(let i = 0; i < ALL_INTERNAL_SCOPE_NAMES_DISPLAY.length; i++){
            allManagementScopes.push({
                scopeDescription: ALL_INTERNAL_SCOPE_NAMES_DISPLAY[i].scopeDescription,
                scopeName: ALL_INTERNAL_SCOPE_NAMES_DISPLAY[i].scopeName,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeId: uuidv4()
            });
        }

        return allManagementScopes;
    }        
}


/**
 * Creates a mock OIDC Context for GraphQL resolvers
 */
export function createMockOIDCContext(overrides?: Partial<any>) {
  const rootTenantId = uuidv4();
  const rootTenant = createMockRootTenant({ tenantId: rootTenantId });

  return {
    authToken: 'mock-auth-token',
    portalUserProfile: createMockPortalUserProfile({
      managementAccessTenantId: rootTenantId,
    }),
    rootTenant,
    requestCache: new Map(),
    ipAddress: '127.0.0.1',
    geoLocation: 'US',
    deviceFingerPrint: 'mock-device-fingerprint',
    ...overrides,
  };
}

/**
 * Creates a mock Tenant Password Policy
 */
export function createMockPasswordPolicy(overrides?: Partial<any>) {
  return {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventPasswordReuse: true,
    passwordHistoryCount: 5,
    ...overrides,
  };
}

/**
 * Creates a mock Tenant Login Failure Policy
 */
export function createMockLoginFailurePolicy(overrides?: Partial<any>) {
  return {
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 30,
    resetFailedAttemptsAfterMinutes: 60,
    enabled: true,
    ...overrides,
  };
}
