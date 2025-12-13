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
    const mockClientDaoImpl = {
        getClientById: jest.fn(),
        createClient: jest.fn(),
        updateClient: jest.fn(),
        getRedirectURIs: jest.fn(),
        addRedirectURI: jest.fn(),
        removeRedirectURI: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn()
    };

    const mockKmsImpl = {
        encrypt: jest.fn(),
        decrypt: jest.fn()
    };

    const mockScopeDaoImpl = {
        getClientScopeRels: jest.fn(),
        removeScopeFromClient: jest.fn(),
        getScope: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    const mockAuthDaoImpl = {
        getPreAuthenticationState: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getClientDao: () => mockClientDaoImpl,
                getTenantDao: () => mockTenantDaoImpl,
                getKms: () => mockKmsImpl,
                getScopeDao: () => mockScopeDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl,
                getAuthDao: () => mockAuthDaoImpl
            }))
        },
        __mockClientDao: mockClientDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl,
        __mockScopeDao: mockScopeDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl,
        __mockAuthDao: mockAuthDaoImpl
    };
});

import ClientService from '@/lib/service/client-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { Client, ClientScopeRel, PreAuthenticationState, Scope, Tenant } from '@/graphql/generated/graphql-types';

// Import the mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockSearchModule = jest.requireMock('@/lib/data-sources/search');

const mockClientDao = mockDaoFactoryModule.__mockClientDao;
const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;
const mockKms = mockDaoFactoryModule.__mockKms;
const mockScopeDao = mockDaoFactoryModule.__mockScopeDao;
const mockChangeEventDao = mockDaoFactoryModule.__mockChangeEventDao;
const mockAuthDao = mockDaoFactoryModule.__mockAuthDao;
const mockSearchClient = mockSearchModule.__mockSearchClient;

describe('ClientService', () => {
    let service: ClientService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'tenant-123',
                managementAccessTenantId: 'tenant-123',
                scope: [
                    { scopeName: 'client.read' },
                    { scopeName: 'client.create' },
                    { scopeName: 'client.update' },
                    { scopeName: 'tenant.all.read' },
                    { scopeName: 'tenant.read' }
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

        service = new ClientService(mockContext);
        jest.clearAllMocks();
    });

    describe('getClientById', () => {
        it('should return client with cleared secret', async () => {
            const mockClient: Client = {
                clientId: 'client-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description',
                clientSecret: 'encrypted-secret',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockClientDao.getClientById.mockResolvedValue(mockClient);

            const result = await service.getClientById('client-123');

            expect(result).toBeDefined();
            expect(result?.clientSecret).toBe('');
            expect(result?.clientName).toBe('Test Client');
            expect(mockClientDao.getClientById).toHaveBeenCalledWith('client-123');
        });

        it('should return null when client does not exist', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            const result = await service.getClientById('nonexistent');

            expect(result).toBeNull();
        });

        it('should throw error when user does not have access to client tenant', async () => {
            const mockClient: Client = {
                clientId: 'client-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description',
                clientSecret: 'encrypted-secret',
                tenantId: 'other-tenant',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockClientDao.getClientById.mockResolvedValue(mockClient);

            await expect(service.getClientById('client-123')).rejects.toThrow('You do not have permissions to view this tenant');
        });
    });

    describe('createClient', () => {
        const mockTenant: Tenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant',
            tenantDescription: 'Test Description',
            enabled: true,
            markForDelete: false
        };

        it('should create client with encrypted secret', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockKms.encrypt.mockResolvedValue('encrypted-secret');
            mockClientDao.createClient.mockResolvedValue(undefined);

            const result = await service.createClient(newClient);

            expect(result.clientId).toBeDefined();
            expect(result.clientId).not.toBe('');
            expect(result.clientSecret).toBeDefined();
            expect(result.clientSecret).not.toBe('encrypted-secret'); // Should be plain secret
            expect(mockKms.encrypt).toHaveBeenCalled();
            expect(mockClientDao.createClient).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalledTimes(2); // object and rel indexes
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when tenant does not exist', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'nonexistent-tenant',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00008');
        });

        it('should throw error when tenant is disabled', async () => {
            const disabledTenant: Tenant = {
                ...mockTenant,
                enabled: false
            };

            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(disabledTenant);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00009');
        });

        it('should throw error when tenant is marked for deletion', async () => {
            const deletedTenant: Tenant = {
                ...mockTenant,
                markForDelete: true
            };

            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(deletedTenant);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00009');
        });

        it('should throw error for invalid client type', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'invalid_type',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00031');
        });

        it('should throw error when PKCE is enabled but OIDC is disabled', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: false,
                pkceEnabled: true,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00188');
        });

        it('should throw error when service account has OIDC enabled', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_SERVICE_ACCOUNT',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00187');
        });

        it('should throw error when service account has PKCE enabled', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: false,
                pkceEnabled: true,
                clientType: 'CLIENT_TYPE_SERVICE_ACCOUNT',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00188'); // PKCE requires OIDC check comes first
        });

        it('should throw error when encryption fails', async () => {
            const newClient: Client = {
                clientId: '',
                clientName: 'New Client',
                clientDescription: 'New Description',
                clientSecret: '',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockKms.encrypt.mockResolvedValue(null);

            await expect(service.createClient(newClient)).rejects.toThrow('EC00032');
        });
    });

    describe('updateClient', () => {
        const existingClient: Client = {
            clientId: 'client-123',
            clientName: 'Existing Client',
            clientDescription: 'Existing Description',
            clientSecret: 'encrypted-secret',
            tenantId: 'tenant-123',
            enabled: true,
            oidcEnabled: true,
            pkceEnabled: false,
            clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
            clientTokenTTLSeconds: 3600,
            userTokenTTLSeconds: 3600,
            maxRefreshTokenCount: 5,
            audience: 'test-audience'
        };

        it('should update client successfully', async () => {
            const updatedClient: Client = {
                ...existingClient,
                clientName: 'Updated Client',
                clientDescription: 'Updated Description',
                enabled: false
            };

            // Create a deep copy for the mock to avoid mutation issues
            const existingClientCopy = JSON.parse(JSON.stringify(existingClient));
            mockClientDao.getClientById.mockResolvedValue(existingClientCopy);
            mockClientDao.updateClient.mockResolvedValue(undefined);

            const result = await service.updateClient(updatedClient);

            expect(result.clientName).toBe('Updated Client');
            expect(result.clientDescription).toBe('Updated Description');
            expect(result.enabled).toBe(false);
            expect(mockClientDao.updateClient).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalledTimes(2);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when client does not exist', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.updateClient(existingClient)).rejects.toThrow('EC00011');
        });

        it('should throw error for invalid client type', async () => {
            const updatedClient: Client = {
                ...existingClient,
                clientType: 'invalid_type'
            };

            mockClientDao.getClientById.mockResolvedValue(existingClient);

            await expect(service.updateClient(updatedClient)).rejects.toThrow('EC00031');
        });

        it('should throw error when PKCE is enabled but OIDC is disabled', async () => {
            const updatedClient: Client = {
                ...existingClient,
                oidcEnabled: false,
                pkceEnabled: true,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS'
            };

            const existingClientCopy = JSON.parse(JSON.stringify(existingClient));
            mockClientDao.getClientById.mockResolvedValue(existingClientCopy);

            await expect(service.updateClient(updatedClient)).rejects.toThrow('EC00188');
        });

        it('should throw error when service account has OIDC enabled', async () => {
            const updatedClient: Client = {
                ...existingClient,
                clientType: 'CLIENT_TYPE_SERVICE_ACCOUNT',
                oidcEnabled: true
            };

            mockClientDao.getClientById.mockResolvedValue(existingClient);

            await expect(service.updateClient(updatedClient)).rejects.toThrow('EC00187');
        });

        it('should remove scopes when client type changes', async () => {
            const updatedClient: Client = {
                ...existingClient,
                clientType: 'CLIENT_TYPE_DEVICE'
            };

            const mockScopeRels: ClientScopeRel[] = [
                { tenantId: 'tenant-123', clientId: 'client-123', scopeId: 'scope-1' },
                { tenantId: 'tenant-123', clientId: 'client-123', scopeId: 'scope-2' }
            ];

            mockClientDao.getClientById.mockResolvedValue(existingClient);
            mockScopeDao.getClientScopeRels.mockResolvedValue(mockScopeRels);
            mockScopeDao.removeScopeFromClient.mockResolvedValue(undefined);
            mockClientDao.updateClient.mockResolvedValue(undefined);

            await service.updateClient(updatedClient);

            expect(mockScopeDao.getClientScopeRels).toHaveBeenCalledWith('client-123');
            expect(mockScopeDao.removeScopeFromClient).toHaveBeenCalledTimes(2);
        });

        it('should not remove scopes when client type remains the same', async () => {
            const updatedClient: Client = {
                ...existingClient,
                clientName: 'Updated Name'
            };

            mockClientDao.getClientById.mockResolvedValue(existingClient);
            mockClientDao.updateClient.mockResolvedValue(undefined);

            await service.updateClient(updatedClient);

            expect(mockScopeDao.getClientScopeRels).not.toHaveBeenCalled();
            expect(mockScopeDao.removeScopeFromClient).not.toHaveBeenCalled();
        });

        it('should disable PKCE when OIDC is disabled', async () => {
            const updatedClient: Client = {
                ...existingClient,
                oidcEnabled: false,
                pkceEnabled: false
            };

            mockClientDao.getClientById.mockResolvedValue({ ...existingClient, pkceEnabled: true });
            mockClientDao.updateClient.mockResolvedValue(undefined);

            const result = await service.updateClient(updatedClient);

            expect(result.pkceEnabled).toBe(false);
        });
    });

    describe('getRedirectURIs', () => {
        it('should return redirect URIs for existing client', async () => {
            const mockClient: Client = {
                clientId: 'client-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description',
                clientSecret: 'encrypted-secret',
                tenantId: 'tenant-123',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            const mockURIs = ['https://example.com/callback', 'https://example.com/callback2'];

            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockClientDao.getRedirectURIs.mockResolvedValue(mockURIs);

            const result = await service.getRedirectURIs('client-123');

            expect(result).toEqual(mockURIs);
            expect(mockClientDao.getRedirectURIs).toHaveBeenCalledWith('client-123');
        });

        it('should return empty array when client does not exist', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            const result = await service.getRedirectURIs('nonexistent');

            expect(result).toEqual([]);
        });

        it('should throw error when user does not have access', async () => {
            const mockClient: Client = {
                clientId: 'client-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description',
                clientSecret: 'encrypted-secret',
                tenantId: 'other-tenant',
                enabled: true,
                oidcEnabled: true,
                pkceEnabled: false,
                clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
                clientTokenTTLSeconds: 3600,
                userTokenTTLSeconds: 3600,
                maxRefreshTokenCount: 5,
                audience: 'test-audience'
            };

            mockClientDao.getClientById.mockResolvedValue(mockClient);

            await expect(service.getRedirectURIs('client-123')).rejects.toThrow();
        });
    });

    describe('addRedirectURI', () => {
        const mockClient: Client = {
            clientId: 'client-123',
            clientName: 'Test Client',
            clientDescription: 'Test Description',
            clientSecret: 'encrypted-secret',
            tenantId: 'tenant-123',
            enabled: true,
            oidcEnabled: true,
            pkceEnabled: false,
            clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
            clientTokenTTLSeconds: 3600,
            userTokenTTLSeconds: 3600,
            maxRefreshTokenCount: 5,
            audience: 'test-audience'
        };

        it('should add valid redirect URI', async () => {
            const uri = 'https://example.com/callback';

            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockClientDao.addRedirectURI.mockResolvedValue(uri);

            const result = await service.addRedirectURI('client-123', uri);

            expect(result).toBe(uri);
            expect(mockClientDao.addRedirectURI).toHaveBeenCalledWith('client-123', uri);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when client does not exist', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.addRedirectURI('nonexistent', 'https://example.com/callback')).rejects.toThrow('EC00031');
        });

        it('should throw error when OIDC is not enabled', async () => {
            const nonOidcClient: Client = {
                ...mockClient,
                oidcEnabled: false
            };

            mockClientDao.getClientById.mockResolvedValue(nonOidcClient);

            await expect(service.addRedirectURI('client-123', 'https://example.com/callback')).rejects.toThrow('EC00033');
        });

        it('should throw error for invalid redirect URI', async () => {
            mockClientDao.getClientById.mockResolvedValue(mockClient);

            await expect(service.addRedirectURI('client-123', 'not-a-valid-uri')).rejects.toThrow('EC00034');
        });
    });

    describe('removeRedirectURI', () => {
        const mockClient: Client = {
            clientId: 'client-123',
            clientName: 'Test Client',
            clientDescription: 'Test Description',
            clientSecret: 'encrypted-secret',
            tenantId: 'tenant-123',
            enabled: true,
            oidcEnabled: true,
            pkceEnabled: false,
            clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
            clientTokenTTLSeconds: 3600,
            userTokenTTLSeconds: 3600,
            maxRefreshTokenCount: 5,
            audience: 'test-audience'
        };

        it('should remove redirect URI', async () => {
            const uri = 'https://example.com/callback';

            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockClientDao.removeRedirectURI.mockResolvedValue(undefined);

            await service.removeRedirectURI('client-123', uri);

            expect(mockClientDao.removeRedirectURI).toHaveBeenCalledWith('client-123', uri);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when client does not exist', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.removeRedirectURI('nonexistent', 'https://example.com/callback')).rejects.toThrow('EC00031');
        });

        it('should throw error when user does not have access', async () => {
            const otherTenantClient: Client = {
                ...mockClient,
                tenantId: 'other-tenant'
            };

            mockClientDao.getClientById.mockResolvedValue(otherTenantClient);

            await expect(service.removeRedirectURI('client-123', 'https://example.com/callback')).rejects.toThrow();
        });
    });

    describe('getAuthorizationScopeApprovalData', () => {
        const mockPreAuthState: PreAuthenticationState = {
            preAuthToken: 'token-123',
            clientId: 'client-123',
            state: 'state-123',
            codeChallenge: 'challenge',
            codeChallengeMethod: 'S256',
            redirectUri: 'https://example.com/callback',
            scope: 'openid profile',
            nonce: 'nonce-123',
            responseType: 'code',
            userId: 'user-123'
        };

        const mockClient: Client = {
            clientId: 'client-123',
            clientName: 'Test Client',
            clientDescription: 'Test Description',
            clientSecret: 'encrypted-secret',
            tenantId: 'tenant-123',
            enabled: true,
            oidcEnabled: true,
            pkceEnabled: false,
            clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
            clientTokenTTLSeconds: 3600,
            userTokenTTLSeconds: 3600,
            maxRefreshTokenCount: 5,
            audience: 'test-audience'
        };

        const mockScopeRels: ClientScopeRel[] = [
            { tenantId: 'tenant-123', clientId: 'client-123', scopeId: 'scope-1' },
            { tenantId: 'tenant-123', clientId: 'client-123', scopeId: 'scope-2' }
        ];

        const mockScopes: Scope[] = [
            { scopeId: 'scope-1', scopeName: 'openid', scopeDescription: 'OpenID scope', tenantId: 'tenant-123' },
            { scopeId: 'scope-2', scopeName: 'profile', scopeDescription: 'Profile scope', tenantId: 'tenant-123' }
        ];

        it('should return approval data for user delegated permissions client', async () => {
            mockAuthDao.getPreAuthenticationState.mockResolvedValue(mockPreAuthState);
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockScopeDao.getClientScopeRels.mockResolvedValue(mockScopeRels);
            mockScopeDao.getScope.mockResolvedValue(mockScopes);

            const result = await service.getAuthorizationScopeApprovalData('token-123');

            expect(result.clientId).toBe('client-123');
            expect(result.clientName).toBe('Test Client');
            expect(result.requestedScope).toEqual(mockScopes);
            expect(result.requiresUserApproval).toBe(true);
        });

        it('should return approval data for device client', async () => {
            const deviceClient: Client = {
                ...mockClient,
                clientType: 'CLIENT_TYPE_DEVICE'
            };

            mockAuthDao.getPreAuthenticationState.mockResolvedValue(mockPreAuthState);
            mockClientDao.getClientById.mockResolvedValue(deviceClient);
            mockScopeDao.getClientScopeRels.mockResolvedValue(mockScopeRels);
            mockScopeDao.getScope.mockResolvedValue(mockScopes);

            const result = await service.getAuthorizationScopeApprovalData('token-123');

            expect(result.requiresUserApproval).toBe(true);
        });

        it('should not require approval for service account client', async () => {
            const serviceAccountClient: Client = {
                ...mockClient,
                clientType: 'service_account'
            };

            mockAuthDao.getPreAuthenticationState.mockResolvedValue(mockPreAuthState);
            mockClientDao.getClientById.mockResolvedValue(serviceAccountClient);
            mockScopeDao.getClientScopeRels.mockResolvedValue(mockScopeRels);
            mockScopeDao.getScope.mockResolvedValue(mockScopes);

            const result = await service.getAuthorizationScopeApprovalData('token-123');

            expect(result.requiresUserApproval).toBe(false);
        });

        it('should return empty approval data when pre-auth state does not exist', async () => {
            mockAuthDao.getPreAuthenticationState.mockResolvedValue(null);

            const result = await service.getAuthorizationScopeApprovalData('invalid-token');

            expect(result.clientId).toBe('');
            expect(result.clientName).toBe('');
            expect(result.requestedScope).toEqual([]);
            expect(result.requiresUserApproval).toBe(false);
        });

        it('should return empty approval data when client does not exist', async () => {
            mockAuthDao.getPreAuthenticationState.mockResolvedValue(mockPreAuthState);
            mockClientDao.getClientById.mockResolvedValue(null);

            const result = await service.getAuthorizationScopeApprovalData('token-123');

            expect(result.clientId).toBe('');
            expect(result.clientName).toBe('');
            expect(result.requestedScope).toEqual([]);
            expect(result.requiresUserApproval).toBe(false);
        });
    });
});
