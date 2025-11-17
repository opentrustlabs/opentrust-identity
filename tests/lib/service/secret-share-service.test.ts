// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock environment variables
process.env.AUTH_DOMAIN = 'https://test.example.com';

// Mock DAOs and utilities before imports
jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockSecretShareDaoImpl = {
        createSecretShare: jest.fn(),
        getSecretShareBy: jest.fn(),
        deleteSecretShare: jest.fn()
    };

    const mockFederatedOIDCProviderDaoImpl = {
        getFederatedOidcProviderById: jest.fn(),
        updateFederatedOidcProvider: jest.fn()
    };

    const mockTenantDaoImpl = {
        getSystemSettings: jest.fn(),
        getTenantLookAndFeel: jest.fn()
    };

    const mockKmsImpl = {
        encrypt: jest.fn(),
        decrypt: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getSecretShareDao: () => mockSecretShareDaoImpl,
                getFederatedOIDCProvicerDao: () => mockFederatedOIDCProviderDaoImpl,
                getKms: () => mockKmsImpl,
                getTenantDao: () => mockTenantDaoImpl
            }))
        },
        __mockSecretShareDao: mockSecretShareDaoImpl,
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl
    };
});

jest.mock('@/lib/service/jwt-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        getAuthTokenForOutboundCalls: jest.fn().mockResolvedValue('mock-auth-token')
    }));
});

jest.mock('@/lib/service/oidc-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        fireSecurityEvent: jest.fn(),
        sendSecretEntryEmail: jest.fn()
    }));
});

// Mock crypto functions
jest.mock('@/utils/dao-utils', () => ({
    generateRandomToken: jest.fn((length: number, encoding: string) => 'mock-random-token'),
    generateHash: jest.fn((value: string) => `hashed-${value}`)
}));

import SecretShareService from '@/lib/service/secret-share-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { FederatedOidcProvider, SecretShare, SystemSettings, TenantLookAndFeel } from '@/graphql/generated/graphql-types';

// Import mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockSecretShareDao = mockDaoFactoryModule.__mockSecretShareDao;
const mockFederatedOIDCProviderDao = mockDaoFactoryModule.__mockFederatedOIDCProviderDao;
const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;
const mockKms = mockDaoFactoryModule.__mockKms;

describe('SecretShareService', () => {
    let service: SecretShareService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'root-tenant',
                managementAccessTenantId: 'root-tenant',
                preferredLanguageCode: 'en',
                scope: [
                    { scopeName: 'secret.entry.delegate' }
                ]
            },
            rootTenant: {
                tenantId: 'root-tenant',
                tenantName: 'Root Tenant',
                tenantDescription: 'Root Tenant'
            },
            requestScopes: [
                { scopeName: 'openid' },
                { scopeName: 'profile' }
            ]
        } as OIDCContext;

        service = new SecretShareService(mockContext);
        jest.clearAllMocks();
    });

    describe('generateSecretShareLink', () => {
        const mockProvider: FederatedOidcProvider = {
            federatedOIDCProviderId: 'provider-1',
            federatedOIDCProviderName: 'Test Provider',
            federatedOIDCProviderDescription: 'Test Description',
            federatedOIDCProviderClientId: 'client-123',
            federatedOIDCProviderClientSecret: 'secret-123',
            federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
            federatedOIDCProviderResponseType: 'code',
            federatedOIDCProviderScope: 'openid profile',
            markForDelete: false,
            isSocialProvider: false,
            isEnterpriseProvider: true
        };

        const mockSystemSettings: SystemSettings = {
            systemId: 'system-123',
            softwareVersion: '1.0.0',
            rootClientId: 'client-123',
            allowDuressPassword: false,
            allowRecoveryEmail: true,
            enablePortalAsLegacyIdp: false,
            systemCategories: [],
            auditRecordRetentionPeriodDays: 90,
            contactEmail: 'contact@example.com',
            noReplyEmail: 'noreply@example.com'
        };

        const mockLookAndFeel: TenantLookAndFeel = {
            tenantid: 'root-tenant',
            logo: 'logo.png',
            backgroundcolor: '#ffffff',
            foregroundcolor: '#000000'
        };

        it('should generate secret share link successfully', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockTenantDao.getSystemSettings.mockResolvedValue(mockSystemSettings);
            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(mockLookAndFeel);
            mockSecretShareDao.createSecretShare.mockResolvedValue(undefined);

            const result = await service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com');

            expect(result).toBe(true);
            expect(mockFederatedOIDCProviderDao.getFederatedOidcProviderById).toHaveBeenCalledWith('provider-1');
            expect(mockSecretShareDao.createSecretShare).toHaveBeenCalled();
            expect(mockTenantDao.getSystemSettings).toHaveBeenCalled();
            expect(mockTenantDao.getTenantLookAndFeel).toHaveBeenCalledWith('root-tenant');
        });

        it('should throw error when user lacks required scope', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new SecretShareService(unauthorizedContext);

            await expect(
                service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com')
            ).rejects.toThrow();
        });

        it('should throw error for invalid email (too short)', async () => {
            await expect(
                service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'ab@c')
            ).rejects.toThrow('EC00017');
        });

        it('should throw error for invalid email (no @ symbol)', async () => {
            await expect(
                service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'invalidemail.com')
            ).rejects.toThrow('EC00017');
        });

        it('should throw error for invalid email (@ at beginning)', async () => {
            await expect(
                service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', '@example.com')
            ).rejects.toThrow('EC00017');
        });

        it('should throw error when provider does not exist', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(null);

            await expect(
                service.generateSecretShareLink('nonexistent', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com')
            ).rejects.toThrow('EC00023');
        });

        it('should throw error when provider is marked for delete', async () => {
            const deletedProvider = {
                ...mockProvider,
                markForDelete: true
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(deletedProvider);

            await expect(
                service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com')
            ).rejects.toThrow('EC00046');
        });

        it('should use default no-reply email when system settings has no noReplyEmail', async () => {
            const settingsWithoutNoReply = {
                ...mockSystemSettings,
                noReplyEmail: null
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockTenantDao.getSystemSettings.mockResolvedValue(settingsWithoutNoReply);
            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(mockLookAndFeel);
            mockSecretShareDao.createSecretShare.mockResolvedValue(undefined);

            const result = await service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com');

            expect(result).toBe(true);
        });

        it('should use default look and feel when tenant has none', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockTenantDao.getSystemSettings.mockResolvedValue(mockSystemSettings);
            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(null);
            mockSecretShareDao.createSecretShare.mockResolvedValue(undefined);

            const result = await service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com');

            expect(result).toBe(true);
        });

        it('should use preferred language code from user profile', async () => {
            const contextWithSpanish = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    preferredLanguageCode: 'es'
                }
            } as OIDCContext;

            service = new SecretShareService(contextWithSpanish);

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockTenantDao.getSystemSettings.mockResolvedValue(mockSystemSettings);
            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(mockLookAndFeel);
            mockSecretShareDao.createSecretShare.mockResolvedValue(undefined);

            const result = await service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com');

            expect(result).toBe(true);
        });

        it('should default to "en" language when user has no preferred language', async () => {
            const contextWithoutLanguage = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    preferredLanguageCode: undefined
                }
            } as OIDCContext;

            service = new SecretShareService(contextWithoutLanguage);

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockTenantDao.getSystemSettings.mockResolvedValue(mockSystemSettings);
            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(mockLookAndFeel);
            mockSecretShareDao.createSecretShare.mockResolvedValue(undefined);

            const result = await service.generateSecretShareLink('provider-1', 'FEDERATED_OIDC_PROVIDER', 'recipient@example.com');

            expect(result).toBe(true);
        });
    });

    describe('enterSecretValue', () => {
        const mockSecretShare: SecretShare = {
            secretShareId: 'share-123',
            objectId: 'provider-1',
            otp: 'hashed-mock-otp',
            secretShareObjectType: 'FEDERATED_OIDC_PROVIDER',
            expiresAtMs: Date.now() + (60 * 60 * 1000) // 1 hour from now
        };

        const mockProvider: FederatedOidcProvider = {
            federatedOIDCProviderId: 'provider-1',
            federatedOIDCProviderName: 'Test Provider',
            federatedOIDCProviderDescription: 'Test Description',
            federatedOIDCProviderClientId: 'client-123',
            federatedOIDCProviderClientSecret: 'old-secret',
            federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
            federatedOIDCProviderResponseType: 'code',
            federatedOIDCProviderScope: 'openid profile',
            markForDelete: false,
            isSocialProvider: false,
            isEnterpriseProvider: true
        };

        it('should enter secret value successfully', async () => {
            mockSecretShareDao.getSecretShareBy.mockResolvedValue(mockSecretShare);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockKms.encrypt.mockResolvedValue('encrypted-new-secret');
            mockFederatedOIDCProviderDao.updateFederatedOidcProvider.mockResolvedValue(undefined);
            mockSecretShareDao.deleteSecretShare.mockResolvedValue(undefined);

            const result = await service.enterSecretValue('mock-otp', 'new-secret-value');

            expect(result).toBe(true);
            expect(mockSecretShareDao.getSecretShareBy).toHaveBeenCalledWith('hashed-mock-otp', 'otp');
            expect(mockKms.encrypt).toHaveBeenCalledWith('new-secret-value');
            expect(mockFederatedOIDCProviderDao.updateFederatedOidcProvider).toHaveBeenCalled();
            expect(mockSecretShareDao.deleteSecretShare).toHaveBeenCalledWith('share-123');
        });

        it('should throw error when secret share does not exist', async () => {
            mockSecretShareDao.getSecretShareBy.mockResolvedValue(null);

            await expect(
                service.enterSecretValue('invalid-otp', 'new-secret-value')
            ).rejects.toThrow('EC00047');
        });

        it('should throw error and delete when secret share is expired', async () => {
            const expiredShare = {
                ...mockSecretShare,
                expiresAtMs: Date.now() - (60 * 60 * 1000) // 1 hour ago
            };

            mockSecretShareDao.getSecretShareBy.mockResolvedValue(expiredShare);
            mockSecretShareDao.deleteSecretShare.mockResolvedValue(undefined);

            await expect(
                service.enterSecretValue('mock-otp', 'new-secret-value')
            ).rejects.toThrow('EC00048');

            expect(mockSecretShareDao.deleteSecretShare).toHaveBeenCalledWith('share-123');
        });

        it('should throw error when provider does not exist', async () => {
            mockSecretShareDao.getSecretShareBy.mockResolvedValue(mockSecretShare);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(null);

            await expect(
                service.enterSecretValue('mock-otp', 'new-secret-value')
            ).rejects.toThrow('EC00023');
        });

        it('should throw error when provider is marked for delete', async () => {
            const deletedProvider = {
                ...mockProvider,
                markForDelete: true
            };

            mockSecretShareDao.getSecretShareBy.mockResolvedValue(mockSecretShare);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(deletedProvider);

            await expect(
                service.enterSecretValue('mock-otp', 'new-secret-value')
            ).rejects.toThrow('EC00046');
        });

        it('should update provider with encrypted secret value', async () => {
            mockSecretShareDao.getSecretShareBy.mockResolvedValue(mockSecretShare);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockKms.encrypt.mockResolvedValue('encrypted-new-secret');
            mockFederatedOIDCProviderDao.updateFederatedOidcProvider.mockResolvedValue(undefined);
            mockSecretShareDao.deleteSecretShare.mockResolvedValue(undefined);

            await service.enterSecretValue('mock-otp', 'new-secret-value');

            const updateCall = mockFederatedOIDCProviderDao.updateFederatedOidcProvider.mock.calls[0][0];
            expect(updateCall.federatedOIDCProviderClientSecret).toBe('encrypted-new-secret');
        });
    });
});
