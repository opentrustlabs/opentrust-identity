// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock DAOs and utilities before imports
jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockKmsImpl = {
        decrypt: jest.fn(),
        encrypt: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockSigningKeysDaoImpl = {
        getSigningKeyById: jest.fn()
    };

    const mockFederatedOIDCProviderDaoImpl = {
        getFederatedOidcProviderById: jest.fn(),
        getFederatedOidcProviderTenantRels: jest.fn()
    };

    const mockTenantDaoImpl = {
        getCaptchaConfig: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getKms: () => mockKmsImpl,
                getClientDao: () => mockClientDaoImpl,
                getSigningKeysDao: () => mockSigningKeysDaoImpl,
                getFederatedOIDCProvicerDao: () => mockFederatedOIDCProviderDaoImpl,
                getTenantDao: () => mockTenantDaoImpl
            }))
        },
        __mockKms: mockKmsImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockSigningKeysDao: mockSigningKeysDaoImpl,
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockTenantDao: mockTenantDaoImpl
    };
});

jest.mock('@/lib/service/jwt-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        getAuthTokenForOutboundCalls: jest.fn().mockResolvedValue('mock-auth-token')
    }));
});

jest.mock('@/lib/service/oidc-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        fireSecurityEvent: jest.fn()
    }));
});

import ViewSecretService from '@/lib/service/view-secret-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { SecretObjectType, Client, SigningKey, FederatedOidcProvider, CaptchaConfig, FederatedOidcProviderTenantRel } from '@/graphql/generated/graphql-types';

// Import mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockKms = mockDaoFactoryModule.__mockKms;
const mockClientDao = mockDaoFactoryModule.__mockClientDao;
const mockSigningKeysDao = mockDaoFactoryModule.__mockSigningKeysDao;
const mockFederatedOIDCProviderDao = mockDaoFactoryModule.__mockFederatedOIDCProviderDao;
const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;

describe('ViewSecretService', () => {
    let service: ViewSecretService;
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
                scope: [
                    { scopeName: 'client.secret.view' },
                    { scopeName: 'keys.secret.view' },
                    { scopeName: 'federatedoidcprovider.secret.view' },
                    { scopeName: 'captcha.config' }
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

        service = new ViewSecretService(mockContext);
        jest.clearAllMocks();
    });

    describe('viewSecret - ClientSecret', () => {
        const mockClient: Client = {
            clientId: 'client-123',
            clientName: 'Test Client',
            clientDescription: 'Test Description',
            clientSecret: 'encrypted-secret',
            tenantId: 'root-tenant',
            enabled: true,
            oidcEnabled: true,
            pkceEnabled: false,
            clientType: 'CLIENT_TYPE_USER_DELEGATED_PERMISSIONS',
            clientTokenTTLSeconds: 3600,
            userTokenTTLSeconds: 3600,
            maxRefreshTokenCount: 5,
            audience: 'test-audience'
        };

        it('should decrypt and return client secret successfully', async () => {
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockKms.decrypt.mockResolvedValue('decrypted-secret');

            const result = await service.viewSecret('client-123', SecretObjectType.ClientSecret);

            expect(result).toBe('decrypted-secret');
            expect(mockClientDao.getClientById).toHaveBeenCalledWith('client-123');
            expect(mockKms.decrypt).toHaveBeenCalledWith('encrypted-secret');
        });

        it('should return null when client does not exist', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            const result = await service.viewSecret('nonexistent', SecretObjectType.ClientSecret);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should throw error when user lacks required scope', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new ViewSecretService(unauthorizedContext);
            mockClientDao.getClientById.mockResolvedValue(mockClient);

            await expect(
                service.viewSecret('client-123', SecretObjectType.ClientSecret)
            ).rejects.toThrow();
        });

        it('should throw error when user does not have access to client tenant', async () => {
            const clientInDifferentTenant = {
                ...mockClient,
                tenantId: 'other-tenant'
            };

            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new ViewSecretService(nonRootContext);
            mockClientDao.getClientById.mockResolvedValue(clientInDifferentTenant);

            await expect(
                service.viewSecret('client-123', SecretObjectType.ClientSecret)
            ).rejects.toThrow();
        });
    });

    describe('viewSecret - PrivateKey', () => {
        const mockSigningKey: SigningKey = {
            keyId: 'key-123',
            tenantId: 'root-tenant',
            privateKeyPkcs8: 'encrypted-private-key',
            publicKeyPem: 'public-key-pem',
            keyPassword: 'encrypted-password',
            certificatePem: 'cert-pem',
            algorithm: 'RS256',
            enabled: true
        };

        it('should decrypt and return private key successfully', async () => {
            // Ensure context has the tenant.all.read scope for root tenant access
            const contextWithTenantAllRead = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'keys.secret.view' },
                        { scopeName: 'tenant.all.read' }
                    ]
                }
            } as OIDCContext;

            service = new ViewSecretService(contextWithTenantAllRead);

            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);
            mockKms.decrypt.mockResolvedValue('decrypted-private-key');

            const result = await service.viewSecret('key-123', SecretObjectType.PrivateKey);

            expect(result).toBe('decrypted-private-key');
            expect(mockSigningKeysDao.getSigningKeyById).toHaveBeenCalledWith('key-123');
            expect(mockKms.decrypt).toHaveBeenCalledWith('encrypted-private-key');
        });

        it('should return null when signing key does not exist', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

            const result = await service.viewSecret('nonexistent', SecretObjectType.PrivateKey);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should throw error when user lacks required scope', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new ViewSecretService(unauthorizedContext);
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            await expect(
                service.viewSecret('key-123', SecretObjectType.PrivateKey)
            ).rejects.toThrow();
        });
    });

    describe('viewSecret - PrivateKeyPassword', () => {
        const mockSigningKey: SigningKey = {
            keyId: 'key-123',
            tenantId: 'root-tenant',
            privateKeyPkcs8: 'encrypted-private-key',
            publicKeyPem: 'public-key-pem',
            keyPassword: 'encrypted-password',
            certificatePem: 'cert-pem',
            algorithm: 'RS256',
            enabled: true
        };

        it('should decrypt and return private key password successfully', async () => {
            // Ensure context has the tenant.all.read scope for root tenant access
            const contextWithTenantAllRead = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'keys.secret.view' },
                        { scopeName: 'tenant.all.read' }
                    ]
                }
            } as OIDCContext;

            service = new ViewSecretService(contextWithTenantAllRead);

            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);
            mockKms.decrypt.mockResolvedValue('decrypted-password');

            const result = await service.viewSecret('key-123', SecretObjectType.PrivateKeyPassword);

            expect(result).toBe('decrypted-password');
            expect(mockSigningKeysDao.getSigningKeyById).toHaveBeenCalledWith('key-123');
            expect(mockKms.decrypt).toHaveBeenCalledWith('encrypted-password');
        });

        it('should return null when signing key has no password', async () => {
            const contextWithTenantAllRead = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'keys.secret.view' },
                        { scopeName: 'tenant.all.read' }
                    ]
                }
            } as OIDCContext;

            service = new ViewSecretService(contextWithTenantAllRead);

            const keyWithoutPassword = {
                ...mockSigningKey,
                keyPassword: undefined
            };

            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(keyWithoutPassword);

            const result = await service.viewSecret('key-123', SecretObjectType.PrivateKeyPassword);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should return null when signing key does not exist', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

            const result = await service.viewSecret('nonexistent', SecretObjectType.PrivateKeyPassword);

            expect(result).toBeNull();
        });

        it('should throw error when user lacks required scope', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new ViewSecretService(unauthorizedContext);
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            await expect(
                service.viewSecret('key-123', SecretObjectType.PrivateKeyPassword)
            ).rejects.toThrow();
        });
    });

    describe('viewSecret - OidcProviderClientSecret', () => {
        const mockProvider: FederatedOidcProvider = {
            federatedOIDCProviderId: 'provider-1',
            federatedOIDCProviderName: 'Test Provider',
            federatedOIDCProviderDescription: 'Test Description',
            federatedOIDCProviderClientId: 'client-123',
            federatedOIDCProviderClientSecret: 'encrypted-provider-secret',
            federatedOIDCProviderWellKnownUri: 'https://provider.com/.well-known',
            federatedOIDCProviderResponseType: 'code',
            federatedOIDCProviderScope: 'openid profile',
            markForDelete: false,
            isSocialProvider: false,
            isEnterpriseProvider: true
        };

        it('should decrypt and return provider secret for root tenant user', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockKms.decrypt.mockResolvedValue('decrypted-provider-secret');

            const result = await service.viewSecret('provider-1', SecretObjectType.OidcProviderClientSecret);

            expect(result).toBe('decrypted-provider-secret');
            expect(mockFederatedOIDCProviderDao.getFederatedOidcProviderById).toHaveBeenCalledWith('provider-1');
            expect(mockKms.decrypt).toHaveBeenCalledWith('encrypted-provider-secret');
        });

        it('should decrypt provider secret for non-root user with access', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new ViewSecretService(nonRootContext);

            const mockRels: FederatedOidcProviderTenantRel[] = [
                {
                    tenantId: 'tenant-123',
                    federatedOIDCProviderId: 'provider-1'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue(mockRels);
            mockKms.decrypt.mockResolvedValue('decrypted-provider-secret');

            const result = await service.viewSecret('provider-1', SecretObjectType.OidcProviderClientSecret);

            expect(result).toBe('decrypted-provider-secret');
            expect(mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels).toHaveBeenCalledWith(undefined, 'provider-1');
        });

        it('should throw error when non-root user has no relationship to provider', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new ViewSecretService(nonRootContext);

            const mockRels: FederatedOidcProviderTenantRel[] = [
                {
                    tenantId: 'other-tenant',
                    federatedOIDCProviderId: 'provider-1'
                }
            ];

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderTenantRels.mockResolvedValue(mockRels);

            await expect(
                service.viewSecret('provider-1', SecretObjectType.OidcProviderClientSecret)
            ).rejects.toThrow('EC00049');
        });

        it('should return null when provider does not exist', async () => {
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(null);

            const result = await service.viewSecret('nonexistent', SecretObjectType.OidcProviderClientSecret);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should return null when provider has no client secret', async () => {
            const providerWithoutSecret = {
                ...mockProvider,
                federatedOIDCProviderClientSecret: undefined
            };

            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(providerWithoutSecret);

            const result = await service.viewSecret('provider-1', SecretObjectType.OidcProviderClientSecret);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should throw error when user lacks required scope', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new ViewSecretService(unauthorizedContext);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderById.mockResolvedValue(mockProvider);

            await expect(
                service.viewSecret('provider-1', SecretObjectType.OidcProviderClientSecret)
            ).rejects.toThrow();
        });
    });

    describe('viewSecret - CaptchaApiKey', () => {
        const mockCaptchaConfig: CaptchaConfig = {
            alias: 'recaptcha',
            apiKey: 'encrypted-api-key',
            siteKey: 'site-key-123',
            useCaptchaV3: true,
            minScoreThreshold: 0.5,
            projectId: 'project-123',
            useEnterpriseCaptcha: false
        };

        it('should decrypt and return captcha API key successfully', async () => {
            mockTenantDao.getCaptchaConfig.mockResolvedValue(mockCaptchaConfig);
            mockKms.decrypt.mockResolvedValue('decrypted-api-key');

            const result = await service.viewSecret('captcha-id', SecretObjectType.CaptchaApiKey);

            expect(result).toBe('decrypted-api-key');
            expect(mockTenantDao.getCaptchaConfig).toHaveBeenCalled();
            expect(mockKms.decrypt).toHaveBeenCalledWith('encrypted-api-key');
        });

        it('should return null when captcha config does not exist', async () => {
            mockTenantDao.getCaptchaConfig.mockResolvedValue(null);

            const result = await service.viewSecret('captcha-id', SecretObjectType.CaptchaApiKey);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should return null when captcha config has no API key', async () => {
            const configWithoutKey = {
                ...mockCaptchaConfig,
                apiKey: undefined
            };

            mockTenantDao.getCaptchaConfig.mockResolvedValue(configWithoutKey);

            const result = await service.viewSecret('captcha-id', SecretObjectType.CaptchaApiKey);

            expect(result).toBeNull();
            expect(mockKms.decrypt).not.toHaveBeenCalled();
        });

        it('should throw error when user lacks required scope', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new ViewSecretService(unauthorizedContext);
            mockTenantDao.getCaptchaConfig.mockResolvedValue(mockCaptchaConfig);

            await expect(
                service.viewSecret('captcha-id', SecretObjectType.CaptchaApiKey)
            ).rejects.toThrow();
        });
    });
});
