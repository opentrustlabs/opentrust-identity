// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock OpenSearch client before any imports
jest.mock('@/lib/data-sources/search', () => {
    const mockSearchClientImpl = {
        index: jest.fn(),
        delete: jest.fn(),
        search: jest.fn(),
        updateByQuery: jest.fn()
    };

    return {
        getOpenSearchClient: jest.fn(() => mockSearchClientImpl),
        __mockSearchClient: mockSearchClientImpl
    };
});

jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockTenantDaoImpl = {
        getRootTenant: jest.fn(),
        updateRootTenant: jest.fn(),
        getTenants: jest.fn(),
        getTenantById: jest.fn(),
        createTenant: jest.fn(),
        updateTenant: jest.fn(),
        getTenantLookAndFeel: jest.fn(),
        createTenantLookAndFeel: jest.fn(),
        updateTenantLookAndFeel: jest.fn(),
        deleteTenantLookAndFeel: jest.fn(),
        getTenantPasswordConfig: jest.fn(),
        assignPasswordConfigToTenant: jest.fn(),
        updatePasswordConfig: jest.fn(),
        removePasswordConfigFromTenant: jest.fn(),
        getCaptchaConfig: jest.fn(),
        setCaptchaConfig: jest.fn(),
        removeCaptchaConfig: jest.fn(),
        getSystemSettings: jest.fn(),
        updateSystemSettings: jest.fn(),
        getDomainTenantManagementRels: jest.fn(),
        addDomainToTenantManagement: jest.fn(),
        removeDomainFromTenantManagement: jest.fn(),
        getDomainsForTenantRestrictedAuthentication: jest.fn(),
        addDomainToTenantRestrictedAuthentication: jest.fn(),
        removeDomainFromTenantRestrictedAuthentication: jest.fn(),
        getAnonymousUserConfiguration: jest.fn(),
        createAnonymousUserConfiguration: jest.fn(),
        updateAnonymousUserConfiguration: jest.fn(),
        deleteAnonymousUserConfiguration: jest.fn(),
        getLoginFailurePolicy: jest.fn(),
        createLoginFailurePolicy: jest.fn(),
        updateLoginFailurePolicy: jest.fn(),
        removeLoginFailurePolicy: jest.fn(),
        getLegacyUserMigrationConfiguration: jest.fn(),
        createTenantLegacyUserMigrationConfiguration: jest.fn(),
        updateTenantLegacyUserMigrationConfiguration: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockFederatedOIDCProviderDaoImpl = {
        getFederatedOidcProviderTenantRels: jest.fn(),
        removeFederatedOidcProviderFromTenant: jest.fn(),
        getFederatedOidcProviders: jest.fn()
    };

    const mockScopeDaoImpl = {
        getTenantAvailableScope: jest.fn()
    };

    const mockMarkForDeleteDaoImpl = {
        getLatestMarkForDeleteRecords: jest.fn()
    };

    const mockSchedulerDaoImpl = {
        getSchedulerLocks: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    const mockKmsImpl = {
        encrypt: jest.fn(),
        decrypt: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getTenantDao: () => mockTenantDaoImpl,
                getClientDao: () => mockClientDaoImpl,
                getFederatedOIDCProvicerDao: () => mockFederatedOIDCProviderDaoImpl,
                getScopeDao: () => mockScopeDaoImpl,
                getMarkForDeleteDao: () => mockMarkForDeleteDaoImpl,
                getSchedulerDao: () => mockSchedulerDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl,
                getKms: () => mockKmsImpl
            }))
        },
        __mockTenantDao: mockTenantDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockScopeDao: mockScopeDaoImpl,
        __mockMarkForDeleteDao: mockMarkForDeleteDaoImpl,
        __mockSchedulerDao: mockSchedulerDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl,
        __mockKms: mockKmsImpl
    };
});

import TenantService from '@/lib/service/tenant-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { Tenant, TenantLookAndFeel, TenantPasswordConfig, CaptchaConfig, SystemSettings, SystemSettingsUpdateInput, CaptchaConfigInput } from '@/graphql/generated/graphql-types';

// Import the mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockSearchModule = jest.requireMock('@/lib/data-sources/search');

const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;
const mockClientDao = mockDaoFactoryModule.__mockClientDao;
const mockFederatedOIDCProviderDao = mockDaoFactoryModule.__mockFederatedOIDCProviderDao;
const mockScopeDao = mockDaoFactoryModule.__mockScopeDao;
const mockMarkForDeleteDao = mockDaoFactoryModule.__mockMarkForDeleteDao;
const mockSchedulerDao = mockDaoFactoryModule.__mockSchedulerDao;
const mockChangeEventDao = mockDaoFactoryModule.__mockChangeEventDao;
const mockKms = mockDaoFactoryModule.__mockKms;
const mockSearchClient = mockSearchModule.__mockSearchClient;

describe('TenantService', () => {
    let service: TenantService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        // Use root tenant user by default
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'root-tenant',
                managementAccessTenantId: 'root-tenant',
                scope: [
                    { scopeName: 'tenant.read' },
                    { scopeName: 'tenant.create' },
                    { scopeName: 'tenant.update' },
                    { scopeName: 'tenant.all.read' },
                    { scopeName: 'system.settings.read' },
                    { scopeName: 'system.settings.update' },
                    { scopeName: 'captcha.config' },
                    { scopeName: 'jobs.read' }
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

        service = new TenantService(mockContext);
        jest.clearAllMocks();
    });

    describe('getRootTenant', () => {
        it('should return root tenant', async () => {
            const mockRootTenant: Tenant = {
                tenantId: 'root-tenant',
                tenantName: 'Root Tenant',
                tenantDescription: 'Root Description',
                tenantType: 'ROOT_TENANT',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: true
            };

            mockTenantDao.getRootTenant.mockResolvedValue(mockRootTenant);

            const result = await service.getRootTenant();

            expect(result).toEqual(mockRootTenant);
            expect(mockTenantDao.getRootTenant).toHaveBeenCalled();
        });

        it('should throw error when root tenant does not exist', async () => {
            mockTenantDao.getRootTenant.mockResolvedValue(null);

            await expect(service.getRootTenant()).rejects.toThrow('EC00035');
        });
    });

    describe('getTenantById', () => {
        it('should return tenant by id', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Test Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false,
                defaultRateLimit: 1000,
                defaultRateLimitPeriodMinutes: 60
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            // Update context to have access to tenant-123
            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            const result = await service.getTenantById('tenant-123');

            expect(result).toEqual(mockTenant);
            expect(mockTenantDao.getTenantById).toHaveBeenCalledWith('tenant-123');
        });

        it('should throw error when user not authorized', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'other-tenant',
                    scope: []
                }
            } as OIDCContext;

            service = new TenantService(unauthorizedContext);

            await expect(service.getTenantById('tenant-123')).rejects.toThrow();
        });
    });

    describe('createTenant', () => {
        it('should create tenant successfully', async () => {
            const newTenant: Tenant = {
                tenantId: '',
                tenantName: 'New Tenant',
                tenantDescription: 'New Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false,
                defaultRateLimit: 1000,
                defaultRateLimitPeriodMinutes: 60,
                registrationRequireCaptcha: false,
                registrationRequireTermsAndConditions: false
            };

            mockTenantDao.getCaptchaConfig.mockResolvedValue(null);
            mockTenantDao.createTenant.mockResolvedValue(undefined);
            mockTenantDao.getRootTenant.mockResolvedValue({
                tenantId: 'root-tenant',
                tenantName: 'Root'
            } as Tenant);

            const result = await service.createTenant(newTenant);

            expect(result).toBeDefined();
            expect(result?.tenantId).not.toBe('');
            expect(result?.tenantName).toBe('New Tenant');
            expect(mockTenantDao.createTenant).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error for tenant name too short', async () => {
            const newTenant: Tenant = {
                tenantId: '',
                tenantName: 'AB',
                tenantDescription: 'New Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false
            };

            await expect(service.createTenant(newTenant)).rejects.toThrow('EC00197');
        });

        it('should throw error for invalid tenant type', async () => {
            const newTenant: Tenant = {
                tenantId: '',
                tenantName: 'New Tenant',
                tenantDescription: 'New Description',
                tenantType: 'INVALID_TYPE',
                enabled: true,
                markForDelete: false
            };

            await expect(service.createTenant(newTenant)).rejects.toThrow('EC00008');
        });

        it('should throw error when creating root tenant', async () => {
            const newTenant: Tenant = {
                tenantId: '',
                tenantName: 'New Root Tenant',
                tenantDescription: 'New Description',
                tenantType: 'ROOT_TENANT',
                enabled: true,
                markForDelete: false
            };

            await expect(service.createTenant(newTenant)).rejects.toThrow('EC00198');
        });

        it('should throw error when allowUnlimitedRate is false but no defaultRateLimit', async () => {
            const newTenant: Tenant = {
                tenantId: '',
                tenantName: 'New Tenant',
                tenantDescription: 'New Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false
            };

            await expect(service.createTenant(newTenant)).rejects.toThrow('EC00202');
        });
    });

    describe('updateTenant', () => {
        it('should update tenant successfully', async () => {
            const existingTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Updated Tenant',
                tenantDescription: 'Updated Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false,
                defaultRateLimit: 1000,
                defaultRateLimitPeriodMinutes: 60,
                allowSocialLogin: false,
                registrationRequireCaptcha: false,
                registrationRequireTermsAndConditions: false
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            mockTenantDao.getCaptchaConfig.mockResolvedValue(null);
            mockTenantDao.updateTenant.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([]);
            mockTenantDao.getRootTenant.mockResolvedValue({
                tenantId: 'root-tenant',
                tenantName: 'Root'
            } as Tenant);

            const result = await service.updateTenant(existingTenant);

            expect(result).toEqual(existingTenant);
            expect(mockTenantDao.updateTenant).toHaveBeenCalledWith(existingTenant);
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should remove social providers when allowSocialLogin is false', async () => {
            const existingTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Updated Tenant',
                tenantDescription: 'Updated Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false,
                defaultRateLimit: 1000,
                defaultRateLimitPeriodMinutes: 60,
                allowSocialLogin: false,
                registrationRequireCaptcha: false,
                registrationRequireTermsAndConditions: false
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            const socialProviders = [
                { federatedOIDCProviderId: 'provider-1', tenantId: 'tenant-123' }
            ];

            mockTenantDao.getCaptchaConfig.mockResolvedValue(null);
            mockTenantDao.updateTenant.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue(socialProviders);
            mockFederatedOIDCProviderDao.removeFederatedOidcProviderFromTenant.mockResolvedValue(undefined);
            mockTenantDao.getRootTenant.mockResolvedValue({
                tenantId: 'root-tenant',
                tenantName: 'Root'
            } as Tenant);

            await service.updateTenant(existingTenant);

            expect(mockFederatedOIDCProviderDao.removeFederatedOidcProviderFromTenant).toHaveBeenCalledWith('provider-1', 'tenant-123');
        });
    });

    describe('getTenantLookAndFeel', () => {
        it('should return tenant look and feel', async () => {
            const mockLookAndFeel: TenantLookAndFeel = {
                tenantid: 'tenant-123',
                logo: 'logo.png',
                backgroundcolor: '#ffffff',
                foregroundcolor: '#000000'
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(mockLookAndFeel);

            const result = await service.getTenantLookAndFeel('tenant-123');

            expect(result).toEqual(mockLookAndFeel);
            expect(mockTenantDao.getTenantLookAndFeel).toHaveBeenCalledWith('tenant-123');
        });

        it('should return null when not found', async () => {
            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(null);

            const result = await service.getTenantLookAndFeel('tenant-123');

            expect(result).toBeNull();
        });
    });

    describe('setTenantLookAndFeel', () => {
        it('should create tenant look and feel when not exists', async () => {
            const newLookAndFeel: TenantLookAndFeel = {
                tenantid: 'tenant-123',
                logo: 'new-logo.png',
                backgroundcolor: '#ffffff',
                foregroundcolor: '#000000'
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(null);
            mockTenantDao.createTenantLookAndFeel.mockResolvedValue(newLookAndFeel);

            const result = await service.setTenantLookAndFeel(newLookAndFeel);

            expect(result).toEqual(newLookAndFeel);
            expect(mockTenantDao.createTenantLookAndFeel).toHaveBeenCalledWith(newLookAndFeel);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should update tenant look and feel when exists', async () => {
            const existingLookAndFeel: TenantLookAndFeel = {
                tenantid: 'tenant-123',
                logo: 'old-logo.png',
                backgroundcolor: '#ffffff',
                foregroundcolor: '#000000'
            };

            const updatedLookAndFeel: TenantLookAndFeel = {
                ...existingLookAndFeel,
                logo: 'new-logo.png'
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            mockTenantDao.getTenantLookAndFeel.mockResolvedValue(existingLookAndFeel);
            mockTenantDao.updateTenantLookAndFeel.mockResolvedValue(updatedLookAndFeel);

            const result = await service.setTenantLookAndFeel(updatedLookAndFeel);

            expect(result).toEqual(updatedLookAndFeel);
            expect(mockTenantDao.updateTenantLookAndFeel).toHaveBeenCalledWith(updatedLookAndFeel);
        });
    });

    describe('assignPasswordConfigToTenant', () => {
        it('should create password config when not exists', async () => {
            const passwordConfig: TenantPasswordConfig = {
                tenantId: 'tenant-123',
                passwordMinLength: 8,
                passwordMaxLength: 96,
                requireUpperCase: true,
                requireLowerCase: true,
                requireNumeric: true,
                requireSpecialCharacter: true,
                requireMfa: false,
                passwordHashingAlgorithm: 'password-hash-bcrypt-10-rounds'
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            mockTenantDao.getTenantById.mockResolvedValue({ tenantId: 'tenant-123' } as Tenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(null);
            mockTenantDao.assignPasswordConfigToTenant.mockResolvedValue(passwordConfig);

            const result = await service.assignPasswordConfigToTenant(passwordConfig);

            expect(result).toEqual(passwordConfig);
            expect(mockTenantDao.assignPasswordConfigToTenant).toHaveBeenCalledWith(passwordConfig);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error for password min length too short', async () => {
            const passwordConfig: TenantPasswordConfig = {
                tenantId: 'tenant-123',
                passwordMinLength: 3,
                passwordMaxLength: 128,
                requireUpperCase: true,
                requireLowerCase: true,
                requireNumeric: true,
                requireSpecialCharacter: true,
                requireMfa: false,
                passwordHashingAlgorithm: 'password-hash-bcrypt-10-rounds'
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            await expect(service.assignPasswordConfigToTenant(passwordConfig)).rejects.toThrow('EC00088');
        });

        it('should throw error for password max length too long', async () => {
            const passwordConfig: TenantPasswordConfig = {
                tenantId: 'tenant-123',
                passwordMinLength: 8,
                passwordMaxLength: 128,
                requireUpperCase: true,
                requireLowerCase: true,
                requireNumeric: true,
                requireSpecialCharacter: true,
                requireMfa: false,
                passwordHashingAlgorithm: 'password-hash-bcrypt-10-rounds'
            };

            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new TenantService(mockContext);

            await expect(service.assignPasswordConfigToTenant(passwordConfig)).rejects.toThrow('EC00089');
        });
    });

    describe('getSystemSettings', () => {
        it('should return system settings', async () => {
            const mockSettings: SystemSettings = {
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

            mockTenantDao.getSystemSettings.mockResolvedValue(mockSettings);

            const result = await service.getSystemSettings();

            expect(result).toEqual(mockSettings);
            expect(mockTenantDao.getSystemSettings).toHaveBeenCalled();
        });
    });

    describe('updateSystemSettings', () => {
        it('should update system settings successfully', async () => {
            const updateInput: SystemSettingsUpdateInput = {
                rootClientId: 'client-123',
                allowDuressPassword: false,
                allowRecoveryEmail: true,
                enablePortalAsLegacyIdp: false,
                auditRecordRetentionPeriodDays: 90,
                contactEmail: 'contact@example.com',
                noReplyEmail: 'noreply@example.com'
            };

            const mockClient = {
                clientId: 'client-123',
                tenantId: 'root-tenant'
            };

            const mockRootTenant = {
                tenantId: 'root-tenant',
                tenantName: 'Root'
            };

            const existingSettings: SystemSettings = {
                systemId: 'system-123',
                softwareVersion: '1.0.0',
                rootClientId: 'old-client',
                allowDuressPassword: true,
                allowRecoveryEmail: false,
                enablePortalAsLegacyIdp: true,
                systemCategories: [],
                auditRecordRetentionPeriodDays: 30,
                contactEmail: 'old@example.com',
                noReplyEmail: 'old-noreply@example.com'
            };

            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockTenantDao.getRootTenant.mockResolvedValue(mockRootTenant);
            mockTenantDao.getSystemSettings.mockResolvedValue(existingSettings);
            mockTenantDao.updateSystemSettings.mockResolvedValue(undefined);

            const result = await service.updateSystemSettings(updateInput);

            expect(result.rootClientId).toBe('client-123');
            expect(result.auditRecordRetentionPeriodDays).toBe(90);
            expect(mockTenantDao.updateSystemSettings).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when client does not exist', async () => {
            const updateInput: SystemSettingsUpdateInput = {
                rootClientId: 'nonexistent',
                allowDuressPassword: false,
                allowRecoveryEmail: true,
                enablePortalAsLegacyIdp: false,
                contactEmail: 'contact@example.com',
                noReplyEmail: 'noreply@example.com'
            };

            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.updateSystemSettings(updateInput)).rejects.toThrow('EC00093');
        });

        it('should throw error when client not in root tenant', async () => {
            const updateInput: SystemSettingsUpdateInput = {
                rootClientId: 'client-123',
                allowDuressPassword: false,
                allowRecoveryEmail: true,
                enablePortalAsLegacyIdp: false,
                contactEmail: 'contact@example.com',
                noReplyEmail: 'noreply@example.com'
            };

            const mockClient = {
                clientId: 'client-123',
                tenantId: 'other-tenant'
            };

            const mockRootTenant = {
                tenantId: 'root-tenant',
                tenantName: 'Root'
            };

            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockTenantDao.getRootTenant.mockResolvedValue(mockRootTenant);

            await expect(service.updateSystemSettings(updateInput)).rejects.toThrow('EC00094');
        });
    });

    describe('setCaptchaConfig', () => {
        it('should create captcha config with encrypted API key', async () => {
            const captchaInput: CaptchaConfigInput = {
                alias: 'recaptcha',
                apiKey: 'my-secret-key',
                siteKey: 'site-key-123',
                useCaptchaV3: true,
                minScoreThreshold: 0.5,
                projectId: 'project-123',
                useEnterpriseCaptcha: false
            };

            mockTenantDao.getCaptchaConfig.mockResolvedValue(null);
            mockKms.encrypt.mockResolvedValue('encrypted-api-key');
            mockTenantDao.setCaptchaConfig.mockResolvedValue(undefined);

            const result = await service.setCaptchaConfig(captchaInput);

            expect(result.apiKey).toBe('encrypted-api-key');
            expect(result.siteKey).toBe('site-key-123');
            expect(mockKms.encrypt).toHaveBeenCalledWith('my-secret-key');
            expect(mockTenantDao.setCaptchaConfig).toHaveBeenCalled();
        });

        it('should reuse existing API key when not changed', async () => {
            const captchaInput: CaptchaConfigInput = {
                alias: 'recaptcha',
                apiKey: '',
                siteKey: 'site-key-123',
                useCaptchaV3: true,
                minScoreThreshold: 0.5,
                projectId: 'project-123',
                useEnterpriseCaptcha: false
            };

            const existingConfig: CaptchaConfig = {
                alias: 'recaptcha',
                apiKey: 'existing-encrypted-key',
                siteKey: 'old-site-key',
                useCaptchaV3: false,
                minScoreThreshold: 0.3,
                projectId: 'old-project',
                useEnterpriseCaptcha: false
            };

            mockTenantDao.getCaptchaConfig.mockResolvedValue(existingConfig);
            mockTenantDao.setCaptchaConfig.mockResolvedValue(undefined);

            const result = await service.setCaptchaConfig(captchaInput);

            expect(result.apiKey).toBe('existing-encrypted-key');
            expect(mockKms.encrypt).not.toHaveBeenCalled();
        });

        it('should throw error when v3 enabled but no min score threshold', async () => {
            const captchaInput: CaptchaConfigInput = {
                alias: 'recaptcha',
                apiKey: 'my-secret-key',
                siteKey: 'site-key-123',
                useCaptchaV3: true,
                projectId: 'project-123',
                useEnterpriseCaptcha: false
            };

            await expect(service.setCaptchaConfig(captchaInput)).rejects.toThrow('EC00194');
        });

        it('should throw error for invalid min score threshold', async () => {
            const captchaInput: CaptchaConfigInput = {
                alias: 'recaptcha',
                apiKey: 'my-secret-key',
                siteKey: 'site-key-123',
                useCaptchaV3: true,
                minScoreThreshold: 1.5,
                projectId: 'project-123',
                useEnterpriseCaptcha: false
            };

            await expect(service.setCaptchaConfig(captchaInput)).rejects.toThrow('EC00195');
        });
    });

    describe('getJobData', () => {
        it('should return job data', async () => {
            const mockMarkForDelete = [{ id: '1', type: 'tenant' }];
            const mockSchedulerLocks = [{ lockId: 'lock-1', jobName: 'cleanup' }];

            mockMarkForDeleteDao.getLatestMarkForDeleteRecords.mockResolvedValue(mockMarkForDelete);
            mockSchedulerDao.getSchedulerLocks.mockResolvedValue(mockSchedulerLocks);

            const result = await service.getJobData();

            expect(result.markForDeleteItems).toEqual(mockMarkForDelete);
            expect(result.schedulerLocks).toEqual(mockSchedulerLocks);
            expect(mockMarkForDeleteDao.getLatestMarkForDeleteRecords).toHaveBeenCalledWith(500);
            expect(mockSchedulerDao.getSchedulerLocks).toHaveBeenCalledWith(500);
        });
    });
});
