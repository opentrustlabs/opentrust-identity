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
    const mockFederatedOIDCProviderDaoImpl = {
        getFederatedOidcProviders: jest.fn(),
        getFederatedOidcProviderById: jest.fn(),
        createFederatedOidcProvider: jest.fn(),
        updateFederatedOidcProvider: jest.fn(),
        getFederatedOidcProviderTenantRels: jest.fn(),
        assignFederatedOidcProviderToTenant: jest.fn(),
        removeFederatedOidcProviderFromTenant: jest.fn(),
        getFederatedOidcProviderDomainRels: jest.fn(),
        assignFederatedOidcProviderToDomain: jest.fn(),
        removeFederatedOidcProviderFromDomain: jest.fn(),
        getFederatedOidcProviderByDomain: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn()
    };

    const mockKmsImpl = {
        encrypt: jest.fn(),
        decrypt: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getFederatedOIDCProvicerDao: () => mockFederatedOIDCProviderDaoImpl,
                getTenantDao: () => mockTenantDaoImpl,
                getKms: () => mockKmsImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

import FederatedOIDCProviderService from '@/lib/service/federated-oidc-provider-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { FederatedOidcProvider, FederatedOidcProviderTenantRel, FederatedOidcProviderDomainRel, Tenant } from '@/graphql/generated/graphql-types';
import * as DaoFactoryModule from '@/lib/data-sources/dao-factory';
import * as OpenSearchModule from '@/lib/data-sources/search';

// Extract mocks
const mockFederatedOIDCProviderDao = (DaoFactoryModule as any).__mockFederatedOIDCProviderDao;
const mockTenantDao = (DaoFactoryModule as any).__mockTenantDao;
const mockKms = (DaoFactoryModule as any).__mockKms;
const mockChangeEventDao = (DaoFactoryModule as any).__mockChangeEventDao;
const mockSearchClient = (OpenSearchModule as any).__mockSearchClient;

describe('FederatedOIDCProviderService', () => {
    let service: FederatedOIDCProviderService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        // Use root tenant user for operations that don't specify a target tenant
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'root-tenant',
                managementAccessTenantId: 'root-tenant',
                scope: [
                    { scopeName: 'federatedoidcprovider.read' },
                    { scopeName: 'federatedoidcprovider.create' },
                    { scopeName: 'federatedoidcprovider.update' },
                    { scopeName: 'federatedoidcprovider.tenant.assign' },
                    { scopeName: 'federatedoidcprovider.tenant.remove' },
                    { scopeName: 'tenant.all.read' },
                    { scopeName: 'tenant.read' },
                    { scopeName: 'tenant.update' }
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

        service = new FederatedOIDCProviderService(mockContext);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('getFederatedOIDCProviders', () => {
        it('should return federated OIDC providers with cleared secrets', async () => {
            const mockProviders: FederatedOidcProvider[] = [
                {
                    federatedOIDCProviderId: 'provider-1',
                    federatedOIDCProviderName: 'Test Provider',
                    federatedOIDCProviderDescription: 'Test Description',
                    federatedOIDCProviderClientId: 'client-123',
                    federatedOIDCProviderClientSecret: 'secret-123',
                    federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                    federatedOIDCProviderResponseType: 'code',
                    federatedOIDCProviderSubjectType: 'public',
                    federatedOIDCProviderType: 'SOCIAL'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviders.mockResolvedValue(mockProviders);

            const result = await service.getFederatedOIDCProviders('tenant-123');

            expect(result).toHaveLength(1);
            expect(result[0].federatedOIDCProviderClientSecret).toBe('');
            expect(mockFederatedOIDCProviderDao.getFederatedOidcProviders).toHaveBeenCalledWith('tenant-123');
        });

        it('should use management tenant when no tenantId provided for non-root user', async () => {
            // Create a non-root tenant context
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new FederatedOIDCProviderService(nonRootContext);

            const mockProviders: FederatedOidcProvider[] = [];
            mockFederatedOIDCProviderDao.getFederatedOidcProviders.mockResolvedValue(mockProviders);

            await service.getFederatedOIDCProviders();

            expect(mockFederatedOIDCProviderDao.getFederatedOidcProviders).toHaveBeenCalledWith('tenant-123');
        });

        it('should return empty array when no providers found', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviders.mockResolvedValue([]);

            const result = await service.getFederatedOIDCProviders('tenant-123');

            expect(result).toEqual([]);
        });

        it('should throw error when user lacks authorization', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new FederatedOIDCProviderService(unauthorizedContext);

            await expect(service.getFederatedOIDCProviders('tenant-123')).rejects.toThrow();
        });
    });

    describe('getFederatedOIDCProviderById', () => {
        it('should return provider with masked client secret', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Test Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret-123',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            const mockTenantRels: FederatedOidcProviderTenantRel[] = [
                {
                    federatedOIDCProviderId: 'provider-1',
                    tenantId: 'tenant-123'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue(mockTenantRels);

            const result = await service.getFederatedOIDCProviderById('provider-1');

            expect(result?.federatedOIDCProviderClientSecret).toBe(' ');
        });

        it('should return null when provider not found', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(null);

            const result = await service.getFederatedOIDCProviderById('nonexistent');

            expect(result).toBeNull();
        });

        it('should throw error when user does not have access to provider', async () => {
            // Create a non-root tenant context
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new FederatedOIDCProviderService(nonRootContext);

            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Test Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret-123',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([]);

            await expect(service.getFederatedOIDCProviderById('provider-1')).rejects.toThrow();
        });
    });

    describe('createFederatedOIDCProvider', () => {
        it('should create provider with encrypted secret', async () => {
            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: 'New Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'plain-secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockKms.encrypt.mockResolvedValue('encrypted-secret');
            mockFederatedOIDCProviderDao.createFederatedOidcProvider.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});

            const result = await service.createFederatedOIDCProvider(newProvider);

            expect(result.federatedOIDCProviderId).toBeTruthy();
            expect(mockKms.encrypt).toHaveBeenCalledWith('plain-secret');
            expect(mockFederatedOIDCProviderDao.createFederatedOidcProvider).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should create provider without secret', async () => {
            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: 'New Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: '',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockFederatedOIDCProviderDao.createFederatedOidcProvider.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});

            const result = await service.createFederatedOIDCProvider(newProvider);

            expect(result.federatedOIDCProviderId).toBeTruthy();
            expect(mockKms.encrypt).not.toHaveBeenCalled();
        });

        it('should throw error when encryption fails', async () => {
            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: 'New Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'plain-secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockKms.encrypt.mockResolvedValue(null);

            await expect(service.createFederatedOIDCProvider(newProvider)).rejects.toThrow();
        });

        it('should throw error when client ID is missing', async () => {
            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: 'New Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: '',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            await expect(service.createFederatedOIDCProvider(newProvider)).rejects.toThrow();
        });

        it('should throw error when well-known URI is missing', async () => {
            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: 'New Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: '',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            await expect(service.createFederatedOIDCProvider(newProvider)).rejects.toThrow();
        });

        it('should throw error when provider name is missing', async () => {
            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: '',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            await expect(service.createFederatedOIDCProvider(newProvider)).rejects.toThrow();
        });

        it('should throw error when user lacks authorization', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new FederatedOIDCProviderService(unauthorizedContext);

            const newProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: '',
                federatedOIDCProviderName: 'New Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            await expect(service.createFederatedOIDCProvider(newProvider)).rejects.toThrow();
        });
    });

    describe('updateFederatedOIDCProvider', () => {
        it('should update provider and preserve existing secret when not provided', async () => {
            const existingProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Old Name',
                federatedOIDCProviderDescription: 'Old Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'existing-encrypted-secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL',
                socialLoginProvider: 'GOOGLE'
            };

            const updatedProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'New Name',
                federatedOIDCProviderDescription: 'New Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: '',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'ENTERPRISE'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(existingProvider);
            mockFederatedOIDCProviderDao.updateFederatedOidcProvider.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});
            mockSearchClient.updateByQuery.mockResolvedValue({});

            const result = await service.updateFederatedOIDCProvider(updatedProvider);

            expect(result.federatedOIDCProviderClientSecret).toBe('existing-encrypted-secret');
            expect(result.federatedOIDCProviderType).toBe('SOCIAL'); // Preserved from existing
            expect(result.socialLoginProvider).toBe('GOOGLE'); // Preserved from existing
            expect(mockFederatedOIDCProviderDao.updateFederatedOidcProvider).toHaveBeenCalled();
            expect(mockSearchClient.updateByQuery).toHaveBeenCalled();
        });

        it('should update provider with new encrypted secret', async () => {
            const existingProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Old Name',
                federatedOIDCProviderDescription: 'Old Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'old-secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            const updatedProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'New Name',
                federatedOIDCProviderDescription: 'New Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'new-plain-secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(existingProvider);
            mockKms.encrypt.mockResolvedValue('new-encrypted-secret');
            mockFederatedOIDCProviderDao.updateFederatedOidcProvider.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});
            mockSearchClient.updateByQuery.mockResolvedValue({});

            const result = await service.updateFederatedOIDCProvider(updatedProvider);

            expect(mockKms.encrypt).toHaveBeenCalledWith('new-plain-secret');
            expect(result.federatedOIDCProviderClientSecret).toBe('new-encrypted-secret');
        });

        it('should throw error when provider not found', async () => {
            const updatedProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'nonexistent',
                federatedOIDCProviderName: 'Name',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(null);

            await expect(service.updateFederatedOIDCProvider(updatedProvider)).rejects.toThrow();
        });
    });

    describe('getFederatedOIDCProviderTenantRels', () => {
        it('should return tenant relationships', async () => {
            const mockRels: FederatedOidcProviderTenantRel[] = [
                {
                    federatedOIDCProviderId: 'provider-1',
                    tenantId: 'tenant-123'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue(mockRels);

            const result = await service.getFederatedOIDCProviderTenantRels('tenant-123');

            expect(result).toEqual(mockRels);
        });

        it('should return empty array when no relationships found', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([]);

            const result = await service.getFederatedOIDCProviderTenantRels('tenant-123');

            expect(result).toEqual([]);
        });
    });

    describe('assignFederatedOIDCProviderToTenant', () => {
        it('should assign social provider to tenant', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Description'
            };

            const mockRel: FederatedOidcProviderTenantRel = {
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([mockRel]);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockFederatedOIDCProviderDao.assignFederatedOidcProviderToTenant.mockResolvedValue(mockRel);
            mockSearchClient.index.mockResolvedValue({});

            const result = await service.assignFederatedOIDCProviderToTenant('provider-1', 'tenant-123');

            expect(result).toEqual(mockRel);
            expect(mockFederatedOIDCProviderDao.assignFederatedOidcProviderToTenant).toHaveBeenCalledWith('provider-1', 'tenant-123');
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when provider not found', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(null);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([]);

            await expect(service.assignFederatedOIDCProviderToTenant('provider-1', 'tenant-123')).rejects.toThrow();
        });

        it('should throw error when trying to assign enterprise provider', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'ENTERPRISE'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([{
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            }]);

            await expect(service.assignFederatedOIDCProviderToTenant('provider-1', 'tenant-123')).rejects.toThrow();
        });

        it('should throw error when tenant not found', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([{
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            }]);
            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(service.assignFederatedOIDCProviderToTenant('provider-1', 'tenant-123')).rejects.toThrow();
        });
    });

    describe('removeFederatedOIDCProviderFromTenant', () => {
        it('should remove provider from tenant', async () => {
            const mockRel: FederatedOidcProviderTenantRel = {
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            };

            mockFederatedOIDCProviderDao.removeFederatedOidcProviderFromTenant.mockResolvedValue(mockRel);
            mockSearchClient.delete.mockResolvedValue({});

            const result = await service.removeFederatedOIDCProviderFromTenant('provider-1', 'tenant-123');

            expect(result).toEqual(mockRel);
            expect(mockSearchClient.delete).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });
    });

    describe('getFederatedOIDCProviderDomainRels', () => {
        it('should return domain relationships', async () => {
            const mockRels: FederatedOidcProviderDomainRel[] = [
                {
                    federatedOIDCProviderId: 'provider-1',
                    domain: 'example.com'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviderDomainRels.mockResolvedValue(mockRels);

            const result = await service.getFederatedOIDCProviderDomainRels('provider-1', null);

            expect(result).toEqual(mockRels);
        });

        it('should return all domain relationships for root tenant users', async () => {
            const mockDomainRels: FederatedOidcProviderDomainRel[] = [
                {
                    federatedOIDCProviderId: 'provider-1',
                    domain: 'example.com'
                },
                {
                    federatedOIDCProviderId: 'provider-2',
                    domain: 'other.com'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviderDomainRels.mockResolvedValue(mockDomainRels);

            const result = await service.getFederatedOIDCProviderDomainRels(null, null);

            // Root tenant user should see all domain relationships without filtering
            expect(result).toHaveLength(2);
            expect(mockFederatedOIDCProviderDao.getFederatedOidcProviderDomainRels).toHaveBeenCalled();
        });
    });

    describe('assignFederatedOIDCProviderToDomain', () => {
        it('should assign enterprise provider to domain', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'ENTERPRISE'
            };

            const mockRel: FederatedOidcProviderDomainRel = {
                federatedOIDCProviderId: 'provider-1',
                domain: 'example.com'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([{
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            }]);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockFederatedOIDCProviderDao.assignFederatedOidcProviderToDomain.mockResolvedValue(mockRel);

            const result = await service.assignFederatedOIDCProviderToDomain('provider-1', 'example.com');

            expect(result).toEqual(mockRel);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when trying to assign social provider to domain', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'SOCIAL'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([{
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            }]);

            await expect(service.assignFederatedOIDCProviderToDomain('provider-1', 'example.com')).rejects.toThrow();
        });

        it('should throw error when domain already assigned to different provider', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'ENTERPRISE'
            };

            const existingProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-2',
                federatedOIDCProviderName: 'Other Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-456',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://other.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'ENTERPRISE'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([{
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            }]);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(existingProvider);

            await expect(service.assignFederatedOIDCProviderToDomain('provider-1', 'example.com')).rejects.toThrow();
        });

        it('should return existing relationship when domain already assigned to same provider', async () => {
            const mockProvider: FederatedOidcProvider = {
                federatedOIDCProviderId: 'provider-1',
                federatedOIDCProviderName: 'Test Provider',
                federatedOIDCProviderDescription: 'Description',
                federatedOIDCProviderClientId: 'client-123',
                federatedOIDCProviderClientSecret: 'secret',
                federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
                federatedOIDCProviderResponseType: 'code',
                federatedOIDCProviderSubjectType: 'public',
                federatedOIDCProviderType: 'ENTERPRISE'
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue([{
                federatedOIDCProviderId: 'provider-1',
                tenantId: 'tenant-123'
            }]);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(mockProvider);

            const result = await service.assignFederatedOIDCProviderToDomain('provider-1', 'example.com');

            expect(result.domain).toBe('example.com');
            expect(result.federatedOIDCProviderId).toBe('provider-1');
            expect(mockFederatedOIDCProviderDao.assignFederatedOidcProviderToDomain).not.toHaveBeenCalled();
        });
    });

    describe('removeFederatedOIDCProviderFromDomain', () => {
        it('should remove provider from domain', async () => {
            const mockRel: FederatedOidcProviderDomainRel = {
                federatedOIDCProviderId: 'provider-1',
                domain: 'example.com'
            };

            mockFederatedOIDCProviderDao.removeFederatedOidcProviderFromDomain.mockResolvedValue(mockRel);

            const result = await service.removeFederatedOIDCProviderFromDomain('provider-1', 'example.com');

            expect(result).toEqual(mockRel);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });
    });
});
