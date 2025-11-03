/**
 * Mock utilities for Data Access Objects (DAOs)
 * Provides helper functions to create mock DAOs for testing services
 */

import { jest } from '@jest/globals';
import type IdentityDao from '@/lib/dao/identity-dao';
import type TenantDao from '@/lib/dao/tenant-dao';
import type ClientDao from '@/lib/dao/client-dao';
import type ScopeDao from '@/lib/dao/scope-dao';
import AuthenticationGroupDao from '@/lib/dao/authentication-group-dao';
import type AuthorizationGroupDao from '@/lib/dao/authorization-group-dao';
import type AuthDao from '@/lib/dao/auth-dao';
import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import ChangeEventDao from '@/lib/dao/change-event-dao';
import ContactDao from '@/lib/dao/contact-dao';
import RateLimitDao from '@/lib/dao/rate-limit-dao';
import SchedulerDao from '@/lib/dao/scheduler-dao';
import { getOpenSearchClient } from '@/lib/data-sources/search';
import { Client as SearchClient } from "@opensearch-project/opensearch";

jest.mock("@/lib/data-sources/search.ts", () => ({
    getOpenSearchClient: jest.fn()
}));

export const mockGetSearchClient = getOpenSearchClient as jest.MockedFunction<typeof getOpenSearchClient>;



/**
 * Creates a mock IdentityDao with default implementations
 */
export function createMockIdentityDao(overrides?: Partial<IdentityDao>): jest.Mocked<IdentityDao> {
  return {
    getFailedLogins: jest.fn(),
    addFailedLogin: jest.fn(),
    removeFailedLogin: jest.fn(),
    resetFailedLoginAttempts: jest.fn(),
    saveTOTP: jest.fn(),
    deleteTOTP: jest.fn(),
    getTOTP: jest.fn(),
    saveFIDOKey: jest.fn(),
    getFIDOKey: jest.fn(),
    deleteFIDOKey: jest.fn(),
    getFIDO2Challenge: jest.fn(),
    saveFIDO2Challenge: jest.fn(),
    deleteFIDO2Challenge: jest.fn(),
    getUserMFARels: jest.fn(),
    getFido2Count: jest.fn(),
    updateFido2Count: jest.fn(),
    initFidoCount: jest.fn(),
    deleteFido2Count: jest.fn(),
    getUserBy: jest.fn(),
    savePasswordResetToken: jest.fn(),
    getUserByPasswordResetToken: jest.fn(),
    deletePasswordResetToken: jest.fn(),
    saveEmailConfirmationToken: jest.fn(),
    getUserByEmailConfirmationToken: jest.fn(),
    deleteEmailConfirmationToken: jest.fn(),
    createUser: jest.fn(),
    getUserCredentials: jest.fn(),
    getUserCredentialForAuthentication: jest.fn(),
    addUserCredential: jest.fn(),
    deleteUserCredential: jest.fn(),
    updateUser: jest.fn(),
    unlockUser: jest.fn(),
    deleteUser: jest.fn(),
    passwordProhibited: jest.fn(),
    assignUserToTenant: jest.fn(),
    updateUserTenantRel: jest.fn(),
    removeUserFromTenant: jest.fn(),
    getUserTenantRel: jest.fn(),
    getUserTenantRelsByUserId: jest.fn(),
    createUserAuthenticationStates: jest.fn(),
    getUserAuthenticationStates: jest.fn(),
    updateUserAuthenticationState: jest.fn(),
    deleteUserAuthenticationState: jest.fn(),
    createUserRegistrationStates: jest.fn(),
    getUserRegistrationStates: jest.fn(),
    getUserRegistrationStatesByEmail: jest.fn(),
    updateUserRegistrationState: jest.fn(),
    deleteUserRegistrationState: jest.fn(),
    getProfileEmailChangeStates: jest.fn(),
    createProfileEmailChangeStates: jest.fn(),
    updateProfileEmailChangeState: jest.fn(),
    deleteProfileEmailChangeState: jest.fn(),
    deleteExpiredData: jest.fn(),
    addUserTermsAndConditionsAccepted: jest.fn(),
    getUserTermsAndConditionsAccepted: jest.fn(),
    deleteUserTermsAndConditionsAccepted: jest.fn(),
    getUserRecoveryEmail: jest.fn(),
    addRecoveryEmail: jest.fn(),
    updateRecoveryEmail: jest.fn(),
    deleteRecoveryEmail: jest.fn(),
    addUserDuressCredential: jest.fn(),
    getUserDuressCredential: jest.fn(),
    deleteUserDuressCredential: jest.fn(),
    addUserAuthenticationHistory: jest.fn(),
    ...overrides,
  } as jest.Mocked<IdentityDao>;
}

/**
 * Creates a mock TenantDao with default implementations
 */
export function createMockTenantDao(overrides?: Partial<TenantDao>): jest.Mocked<TenantDao>{
  return {
    getRootTenant: jest.fn(),
    createRootTenant: jest.fn(),
    updateRootTenant: jest.fn(),
    getTenants: jest.fn(),
    getTenantById: jest.fn(),
    getTenantLookAndFeel: jest.fn(),
    createTenant: jest.fn(),
    updateTenant: jest.fn(),
    deleteTenant: jest.fn(),
    getDomainTenantManagementRels: jest.fn(),
    addDomainToTenantManagement: jest.fn(),
    removeDomainFromTenantManagement: jest.fn(),
    getAnonymousUserConfiguration: jest.fn(),
    createAnonymousUserConfiguration: jest.fn(),
    updateAnonymousUserConfiguration: jest.fn(),
    deleteAnonymousUserConfiguration: jest.fn(),
    createTenantLookAndFeel: jest.fn(),
    updateTenantLookAndFeel: jest.fn(),
    deleteTenantLookAndFeel: jest.fn(),
    assignPasswordConfigToTenant: jest.fn(),
    updatePasswordConfig: jest.fn(),
    getTenantPasswordConfig: jest.fn(),
    removePasswordConfigFromTenant: jest.fn(),
    getLoginFailurePolicy: jest.fn(),
    createLoginFailurePolicy: jest.fn(),
    updateLoginFailurePolicy: jest.fn(),
    removeLoginFailurePolicy: jest.fn(),
    getLegacyUserMigrationConfiguration: jest.fn(),
    createTenantLegacyUserMigrationConfiguration: jest.fn(),
    updateTenantLegacyUserMigrationConfiguration: jest.fn(),
    removeLegacyUserMigrationConfiguration: jest.fn(),
    getDomainsForTenantRestrictedAuthentication: jest.fn(),
    addDomainToTenantRestrictedAuthentication: jest.fn(),
    removeDomainFromTenantRestrictedAuthentication: jest.fn(),
    removeAllUsersFromTenant: jest.fn(),
    removeAllAuthStateFromTenant: jest.fn(),
    getCaptchaConfig: jest.fn(),
    setCaptchaConfig: jest.fn(),
    removeCaptchaConfig: jest.fn(),
    getSystemSettings: jest.fn(),
    updateSystemSettings: jest.fn(),
    ...overrides,
  } as jest.Mocked<TenantDao>;
}

/**
 * Creates a mock ClientDao with default implementations
 */
export function createMockClientDao(overrides?: Partial<ClientDao>) {
  return {
    findById: jest.fn(),
    findByClientId: jest.fn(),
    findByTenant: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    validateClientSecret: jest.fn(),
    ...overrides,
  } as any;
}

/**
 * Creates a mock ScopeDao with default implementations
 */
export function createMockScopeDao(overrides?: Partial<ScopeDao>): jest.Mocked<ScopeDao> {
  return {
    getScope: jest.fn(),
    getScopeById: jest.fn(),
    getScopeByScopeName: jest.fn(),
    createScope: jest.fn(),
    updateScope: jest.fn(),
    deleteScope: jest.fn(),
    getTenantAvailableScope: jest.fn(),
    assignScopeToTenant: jest.fn(),
    removeScopeFromTenant: jest.fn(),
    getClientScopeRels: jest.fn(),
    assignScopeToClient: jest.fn(),
    removeScopeFromClient: jest.fn(),
    getAuthorizationGroupScopeRels: jest.fn(),
    assignScopeToAuthorizationGroup: jest.fn(),
    removeScopeFromAuthorizationGroup: jest.fn(),
    getUserScopeRels: jest.fn(),
    assignScopeToUser: jest.fn(),
    removeScopeFromUser: jest.fn(),
    ...overrides,
  } as jest.Mocked<ScopeDao>;
}

/**
 * Creates a mock AuthenticationGroupDao with default implementations
 */
export function createMockAuthenticationGroupDao(overrides?: Partial<AuthenticationGroupDao>): jest.Mocked<AuthenticationGroupDao> {
  return {
    getAuthenticationGroups: jest.fn(),
    getDefaultAuthenticationGroups: jest.fn(),
    getAuthenticationGroupById: jest.fn(),
    createAuthenticationGroup: jest.fn(),
    updateAuthenticationGroup: jest.fn(),
    deleteAuthenticationGroup: jest.fn(),
    deleteUserAuthenticationGroupRels: jest.fn(),
    assignAuthenticationGroupToClient: jest.fn(),
    removeAuthenticationGroupFromClient: jest.fn(),
    assignUserToAuthenticationGroup: jest.fn(),
    removeUserFromAuthenticationGroup: jest.fn(),
    ...overrides,
  } as jest.Mocked<AuthenticationGroupDao>;
}

/**
 * Creates a mock AuthorizationGroupDao with default implementations
 */
export function createMockAuthorizationGroupDao(overrides?: Partial<AuthorizationGroupDao>): jest.Mocked<AuthorizationGroupDao> {
  return {
    getAuthorizationGroups: jest.fn(),
    getDefaultAuthorizationGroups: jest.fn(),
    getAuthorizationGroupById: jest.fn(),
    createAuthorizationGroup: jest.fn(),
    updateAuthorizationGroup: jest.fn(),
    deleteAuthorizationGroup: jest.fn(),
    deleteUserAuthorizationGroupRels: jest.fn(),
    addUserToAuthorizationGroup: jest.fn(),
    removeUserFromAuthorizationGroup: jest.fn(),
    getUserAuthorizationGroups: jest.fn(),
    ...overrides,
  } as jest.Mocked<AuthorizationGroupDao>;
}



/**
 * Creates a mock AuthDao with default implementations
 */
export function createMockAuthDao(overrides?: Partial<AuthDao>) {
  return {
    createAuthorizationCode: jest.fn(),
    findAuthorizationCode: jest.fn(),
    deleteAuthorizationCode: jest.fn(),
    createAccessToken: jest.fn(),
    findAccessToken: jest.fn(),
    deleteAccessToken: jest.fn(),
    createRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
    createDeviceCode: jest.fn(),
    findDeviceCode: jest.fn(),
    updateDeviceCode: jest.fn(),
    deleteDeviceCode: jest.fn(),
    verifyEmailToken: jest.fn(),
    validateTOTP: jest.fn(),
    generateTOTPSecret: jest.fn(),
    validateFIDO2: jest.fn(),
    generatePasswordResetToken: jest.fn(),
    validatePasswordResetToken: jest.fn(),
    ...overrides,
  } as AuthDao;
}

/**
 * Creates a mock FederatedOIDCProviderDao with default implementations
 */
export function createMockFederatedOIDCProviderDao(overrides?: Partial<FederatedOIDCProviderDao>): jest.Mocked<FederatedOIDCProviderDao> {
  return {
    getFederatedOidcProviders: jest.fn(),
    getFederatedOidcProviderById: jest.fn(),
    createFederatedOidcProvider: jest.fn(),
    updateFederatedOidcProvider: jest.fn(),
    getFederatedOidcProviderTenantRels: jest.fn(),
    getFederatedOidcProviderByDomain: jest.fn(),
    assignFederatedOidcProviderToTenant: jest.fn(),
    removeFederatedOidcProviderFromTenant: jest.fn(),
    getFederatedOidcProviderDomainRels: jest.fn(),
    assignFederatedOidcProviderToDomain: jest.fn(),
    removeFederatedOidcProviderFromDomain: jest.fn(),
    deleteFederatedOidcProvider: jest.fn(),
    ...overrides,
  } as jest.Mocked<FederatedOIDCProviderDao>;
}


/**
 * Helper to reset all mocks in a DAO
 */
export function resetDaoMocks(dao: any): void {
  Object.keys(dao).forEach((key) => {
    if (typeof dao[key]?.mockReset === 'function') {
      dao[key].mockReset();
    }
  });
}

export function createMockChangeEventDao(overrides?: Partial<ChangeEventDao>): jest.Mocked<ChangeEventDao> {
    return {
        getChangeEventHistory: jest.fn(),
        addChangeEvent: jest.fn(),
        deleteExpiredData: jest.fn(),
        ...overrides
    } as jest.Mocked<ChangeEventDao>;
}

export function createMockContactDao(overrides?: Partial<ContactDao>): jest.Mocked<ContactDao> {
    return {
        getContacts: jest.fn(),
        getContactById: jest.fn(),
        addContact: jest.fn(),
        removeContact: jest.fn(),
        ...overrides
    } as jest.Mocked<ContactDao>;
}

export function createMockRateLimitDao(overrides?: Partial<RateLimitDao>): jest.Mocked<RateLimitDao> {
    return {
        getRateLimitServiceGroups: jest.fn(),
        getRateLimitServiceGroupById: jest.fn(),
        getRateLimitTenantRelViews: jest.fn(),
        createRateLimitServiceGroup: jest.fn(),
        updateRateLimitServiceGroup: jest.fn(),
        deleteRateLimitServiceGroup: jest.fn(),
        getRateLimitTenantRel: jest.fn(),
        assignRateLimitToTenant: jest.fn(),
        updateRateLimitForTenant: jest.fn(),
        removeRateLimitFromTenant: jest.fn(),
        ...overrides
    } as jest.Mocked<RateLimitDao>;
}

export function createMockSchedulerDao(overrides?: Partial<SchedulerDao>): jest.Mocked<SchedulerDao> {
    return {
        getSchedulerLocks: jest.fn(),
        getSchedulerLocksByName: jest.fn(),
        getSchedulerLockByInstanceId: jest.fn(),
        createSchedulerLock: jest.fn(),
        updateSchedulerLock: jest.fn(),
        deleteSchedulerLock: jest.fn(),
        deleteExpiredData: jest.fn(),
        ...overrides
    } as jest.Mocked<SchedulerDao>;
}

/**
 * Helper to create a complete mock DAO factory
 * Returns all common DAOs with mock implementations
 */
export function createMockDaoFactory() {
  return {
    identityDao: createMockIdentityDao(),
    tenantDao: createMockTenantDao(),
    clientDao: createMockClientDao(),
    scopeDao: createMockScopeDao(),
    authenticationGroupDao: createMockAuthenticationGroupDao(),
    authorizationGroupDao: createMockAuthorizationGroupDao(),
    authDao: createMockAuthDao(),
    changeEventDao: createMockChangeEventDao(),
    contactDao: createMockContactDao(),
    federatedOIDCProviderDao: createMockFederatedOIDCProviderDao(),
    rateLimitDao: createMockRateLimitDao(),
    schedulerDao: createMockSchedulerDao()
  };
}
