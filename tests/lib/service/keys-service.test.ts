// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock all the dependencies BEFORE importing the service
// This is critical because the service file instantiates DAOs at the file level
// We need to create the mocks inline so they're available when the service module loads

jest.mock('@/lib/data-sources/dao-factory', () => {
    // Create mock DAO implementations that will be returned by the factory
    const mockSigningKeysDaoImpl = {
        getSigningKeys: jest.fn(),
        getSigningKeyById: jest.fn(),
        createSigningKey: jest.fn(),
        updateSigningKey: jest.fn()
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
                getSigningKeysDao: () => mockSigningKeysDaoImpl,
                getTenantDao: () => mockTenantDaoImpl,
                getKms: () => mockKmsImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        // Export the mocks so we can access them in tests
        __mockSigningKeysDao: mockSigningKeysDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

// Mock the search module to prevent OpenSearch from being loaded
jest.mock('@/lib/data-sources/search', () => {
    const mockSearchClientImpl = {
        index: jest.fn()
    };

    return {
        getOpenSearchClient: jest.fn(() => mockSearchClientImpl),
        __mockSearchClient: mockSearchClientImpl
    };
});

import SigningKeysService from '@/lib/service/keys-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { SigningKey, Tenant, AutoCreateSigningKeyInput } from '@/graphql/generated/graphql-types';
import {
    KEY_CREATE_SCOPE,
    KEY_READ_SCOPE,
    KEY_UPDATE_SCOPE,
    TENANT_READ_ALL_SCOPE,
    SIGNING_KEY_STATUS_ACTIVE,
    SIGNING_KEY_STATUS_REVOKED,
    KEY_TYPE_RSA,
    KEY_USE_JWT_SIGNING,
    PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER
} from '@/utils/consts';
import { GraphQLError } from 'graphql/error/GraphQLError';

// Import the mocked modules to access the exported mock objects
import * as DaoFactoryModule from '@/lib/data-sources/dao-factory';
import * as SearchModule from '@/lib/data-sources/search';

// Extract the mock implementations
const mockSigningKeysDao = (DaoFactoryModule as any).__mockSigningKeysDao;
const mockTenantDao = (DaoFactoryModule as any).__mockTenantDao;
const mockKms = (DaoFactoryModule as any).__mockKms;
const mockChangeEventDao = (DaoFactoryModule as any).__mockChangeEventDao;
const mockSearchClient = (SearchModule as any).__mockSearchClient;

describe('SigningKeysService', () => {
    let service: SigningKeysService;
    let mockContext: OIDCContext;

    const mockRootTenant: Tenant = {
        tenantId: 'root-tenant-id',
        tenantName: 'Root Tenant',
        enabled: true,
        markForDelete: false,
        tenantType: 'ROOT'
    };

    const mockTenant: Tenant = {
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
        enabled: true,
        markForDelete: false,
        tenantType: 'SERVICES'
    };

    const mockSigningKey: SigningKey = {
        keyId: 'key-123',
        tenantId: 'tenant-123',
        keyName: 'Test Key',
        keyType: KEY_TYPE_RSA,
        keyUse: KEY_USE_JWT_SIGNING,
        keyStatus: SIGNING_KEY_STATUS_ACTIVE,
        privateKeyPkcs8: 'mock-private-key',
        keyCertificate: 'mock-certificate',
        keyPassword: '',
        publicKey: '',
        createdAtMs: Date.now(),
        expiresAtMs: Date.now() + 10000000,
        markForDelete: false
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockContext = {
            rootTenant: mockRootTenant,
            portalUserProfile: {
                userId: 'user-123',
                firstName: 'Test',
                lastName: 'User',
                managementAccessTenantId: 'tenant-123',
                scope: [
                    { scopeName: KEY_READ_SCOPE },
                    { scopeName: KEY_CREATE_SCOPE },
                    { scopeName: KEY_UPDATE_SCOPE },
                    { scopeName: TENANT_READ_ALL_SCOPE }
                ]
            }
        } as OIDCContext;

        service = new SigningKeysService(mockContext);

        // Setup default successful mock responses
        mockSearchClient.index.mockResolvedValue({ result: 'created' });
        mockKms.encrypt.mockResolvedValue('encrypted-data');
        mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);
    });

    describe('getSigningKeys', () => {
        it('should return signing keys for authorized user', async () => {
            const mockKeys = [mockSigningKey];
            mockSigningKeysDao.getSigningKeys.mockResolvedValue(mockKeys);

            const result = await service.getSigningKeys('tenant-123');

            expect(result).toHaveLength(1);
            expect(result[0].keyId).toBe('key-123');
            // Private data should be removed
            expect(result[0].privateKeyPkcs8).toBe('');
            expect(result[0].keyPassword).toBe('');
        });

        it('should return empty array when no keys found', async () => {
            mockSigningKeysDao.getSigningKeys.mockResolvedValue([]);

            const result = await service.getSigningKeys('tenant-123');

            expect(result).toEqual([]);
        });

        it('should strip private key and password from results', async () => {
            const keyWithPrivateData: SigningKey = {
                ...mockSigningKey,
                privateKeyPkcs8: 'secret-private-key',
                keyPassword: 'secret-password'
            };
            mockSigningKeysDao.getSigningKeys.mockResolvedValue([keyWithPrivateData]);

            const result = await service.getSigningKeys('tenant-123');

            expect(result[0].privateKeyPkcs8).toBe('');
            expect(result[0].keyPassword).toBe('');
        });

        it('should restrict to user managementAccessTenantId when not root tenant', async () => {
            mockContext.portalUserProfile!.managementAccessTenantId = 'user-tenant';
            mockSigningKeysDao.getSigningKeys.mockResolvedValue([]);

            await service.getSigningKeys('tenant-123');

            expect(mockSigningKeysDao.getSigningKeys).toHaveBeenCalledWith('user-tenant');
        });
    });

    describe('createSigningKey', () => {
        it('should create a signing key successfully', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockSigningKeysDao.createSigningKey.mockResolvedValue(undefined);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                privateKeyPkcs8: 'plain-private-key',
                keyPassword: '',
                keyCertificate: '',
                publicKey: 'mock-public-key'
            };

            const result = await service.createSigningKey(newKey);

            expect(result.keyId).toBeTruthy();
            expect(result.keyStatus).toBe(SIGNING_KEY_STATUS_ACTIVE);
            expect(mockSigningKeysDao.createSigningKey).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalledTimes(2); // Object and Rel search
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should encrypt private key when no password provided', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockSigningKeysDao.createSigningKey.mockResolvedValue(undefined);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                privateKeyPkcs8: 'plain-private-key',
                keyPassword: '',
                keyCertificate: '',
                publicKey: 'mock-public-key'
            };

            await service.createSigningKey(newKey);

            expect(mockKms.encrypt).toHaveBeenCalledWith('plain-private-key');
        });

        it('should encrypt password when provided', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockSigningKeysDao.createSigningKey.mockResolvedValue(undefined);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                privateKeyPkcs8: `${PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER}encrypted-key`,
                keyPassword: 'my-secure-password-16chars',
                keyCertificate: '',
                publicKey: 'mock-public-key'
            };

            await service.createSigningKey(newKey);

            expect(mockKms.encrypt).toHaveBeenCalledWith('my-secure-password-16chars');
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [];

            const newKey: SigningKey = { ...mockSigningKey, keyId: '' };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when tenant not found', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(null);

            const newKey: SigningKey = { ...mockSigningKey, keyId: '' };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when tenant is disabled', async () => {
            mockTenantDao.getTenantById.mockResolvedValue({
                ...mockTenant,
                enabled: false
            });

            const newKey: SigningKey = { ...mockSigningKey, keyId: '' };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when tenant is marked for delete', async () => {
            mockTenantDao.getTenantById.mockResolvedValue({
                ...mockTenant,
                markForDelete: true
            });

            const newKey: SigningKey = { ...mockSigningKey, keyId: '' };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when keyName is empty', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                keyName: ''
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when privateKeyPkcs8 is empty', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                privateKeyPkcs8: ''
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when both certificate and publicKey are empty', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                keyCertificate: '',
                publicKey: ''
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when encrypted key has no password', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                privateKeyPkcs8: `${PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER}encrypted-key`,
                keyPassword: ''
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when password is too short', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                keyPassword: 'short'
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when keyType is invalid', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                keyType: 'INVALID'
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when keyUse is invalid', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                keyUse: 'invalid'
            };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when encryption fails', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockKms.encrypt.mockResolvedValue(null);

            const newKey: SigningKey = { ...mockSigningKey, keyId: '' };

            await expect(service.createSigningKey(newKey)).rejects.toThrow(GraphQLError);
        });
    });

    describe('autoCreateSigningKey', () => {
        const mockKeyInput: AutoCreateSigningKeyInput = {
            tenantId: 'tenant-123',
            keyName: 'Auto Generated Key',
            keyType: KEY_TYPE_RSA,
            keyUse: KEY_USE_JWT_SIGNING,
            commonName: 'test.example.com',
            organizationName: 'Test Org',
            expiresAtMs: Date.now() + 10000000,
            password: 'strong-password-12345'
        };

        it('should auto-create a signing key successfully', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockSigningKeysDao.createSigningKey.mockResolvedValue(undefined);

            const result = await service.autoCreateSigningKey(mockKeyInput);

            expect(result.keyId).toBeTruthy();
            expect(result.keyName).toBe('Auto Generated Key');
            expect(result.keyStatus).toBe(SIGNING_KEY_STATUS_ACTIVE);
            expect(mockSigningKeysDao.createSigningKey).toHaveBeenCalled();
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [];

            await expect(service.autoCreateSigningKey(mockKeyInput)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when tenant not found', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(service.autoCreateSigningKey(mockKeyInput)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when commonName is empty', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const input = { ...mockKeyInput, commonName: '' };

            await expect(service.autoCreateSigningKey(input)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when organizationName is empty', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const input = { ...mockKeyInput, organizationName: '' };

            await expect(service.autoCreateSigningKey(input)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when expiresAtMs is in the past', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const input = {
                ...mockKeyInput,
                expiresAtMs: Date.now() - 1000
            };

            await expect(service.autoCreateSigningKey(input)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when expiresAtMs is more than a year in future', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const input = {
                ...mockKeyInput,
                expiresAtMs: Date.now() + 32000000000 // More than a year
            };

            await expect(service.autoCreateSigningKey(input)).rejects.toThrow(GraphQLError);
        });
    });

    describe('updateSigningKey', () => {
        it('should update a signing key successfully', async () => {
            const existingKey = { ...mockSigningKey };
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(existingKey);
            mockSigningKeysDao.updateSigningKey.mockResolvedValue(undefined);

            const updatedKey: SigningKey = {
                ...mockSigningKey,
                keyName: 'Updated Key Name'
            };

            const result = await service.updateSigningKey(updatedKey);

            expect(result.keyName).toBe('Updated Key Name');
            expect(mockSigningKeysDao.updateSigningKey).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when key not found', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

            const updatedKey = { ...mockSigningKey };

            await expect(service.updateSigningKey(updatedKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [];
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            const updatedKey = { ...mockSigningKey };

            await expect(service.updateSigningKey(updatedKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when trying to update revoked key', async () => {
            const revokedKey = {
                ...mockSigningKey,
                keyStatus: SIGNING_KEY_STATUS_REVOKED
            };
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(revokedKey);

            const updatedKey = { ...mockSigningKey };

            await expect(service.updateSigningKey(updatedKey)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when keyStatus is invalid', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            const updatedKey = {
                ...mockSigningKey,
                keyStatus: 'INVALID_STATUS' as any
            };

            await expect(service.updateSigningKey(updatedKey)).rejects.toThrow(GraphQLError);
        });

        it('should allow revoking an active key', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);
            mockSigningKeysDao.updateSigningKey.mockResolvedValue(undefined);

            const updatedKey = {
                ...mockSigningKey,
                keyStatus: SIGNING_KEY_STATUS_REVOKED
            };

            const result = await service.updateSigningKey(updatedKey);

            expect(result.keyStatus).toBe(SIGNING_KEY_STATUS_REVOKED);
        });
    });

    describe('getSigningKeyById', () => {
        it('should return signing key by id', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            const result = await service.getSigningKeyById('key-123');

            expect(result).toBeTruthy();
            expect(result!.keyId).toBe('key-123');
        });

        it('should return null when key not found', async () => {
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

            const result = await service.getSigningKeyById('non-existent');

            expect(result).toBeNull();
        });

        it('should strip private key from plain text key', async () => {
            const keyWithPlainPrivate: SigningKey = {
                ...mockSigningKey,
                privateKeyPkcs8: 'plain-private-key',
                keyPassword: ''
            };
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(keyWithPlainPrivate);

            const result = await service.getSigningKeyById('key-123');

            expect(result!.privateKeyPkcs8).toBe('');
        });

        it('should strip password from encrypted key', async () => {
            const keyWithPassword: SigningKey = {
                ...mockSigningKey,
                keyPassword: 'encrypted-password'
            };
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(keyWithPassword);

            const result = await service.getSigningKeyById('key-123');

            expect(result!.keyPassword).toBe('');
        });

        it('should throw error when user tenant does not match key tenant', async () => {
            mockContext.portalUserProfile!.managementAccessTenantId = 'different-tenant';
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            await expect(service.getSigningKeyById('key-123')).rejects.toThrow(GraphQLError);
        });
    });

    describe('updateSearchIndex (protected method)', () => {
        it('should update both object and rel search indexes when creating key', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockSigningKeysDao.createSigningKey.mockResolvedValue(undefined);

            const newKey: SigningKey = {
                ...mockSigningKey,
                keyId: '',
                privateKeyPkcs8: 'plain-private-key',
                keyPassword: '',
                keyCertificate: '',
                publicKey: 'mock-public-key'
            };

            await service.createSigningKey(newKey);

            expect(mockSearchClient.index).toHaveBeenCalledTimes(2);

            // Check object search index call
            const firstCall = mockSearchClient.index.mock.calls[0][0];
            expect(firstCall.index).toBe('iam_object_search');
            expect(firstCall.body.objecttype).toBe('KEY');

            // Check rel search index call
            const secondCall = mockSearchClient.index.mock.calls[1][0];
            expect(secondCall.index).toBe('iam_rel_search');
            expect(secondCall.body.childtype).toBe('KEY');
        });
    });
});
