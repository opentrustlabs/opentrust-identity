// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock all the dependencies BEFORE importing the service
// This is critical because the service file instantiates DAOs at the file level
// We need to create the mocks inline so they're available when the service module loads

jest.mock('@/lib/data-sources/dao-factory', () => {
    // Create mock DAO implementations that will be returned by the factory
    const mockTenantDaoImpl = {
        getTenantById: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockSigningKeysDaoImpl = {
        getSigningKeyById: jest.fn()
    };

    const mockContactDaoImpl = {
        getContacts: jest.fn(),
        getContactById: jest.fn(),
        addContact: jest.fn(),
        removeContact: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getTenantDao: () => mockTenantDaoImpl,
                getClientDao: () => mockClientDaoImpl,
                getSigningKeysDao: () => mockSigningKeysDaoImpl,
                getContactDao: () => mockContactDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        // Export the mocks so we can access them in tests
        __mockTenantDao: mockTenantDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockSigningKeysDao: mockSigningKeysDaoImpl,
        __mockContactDao: mockContactDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

import ContactService from '@/lib/service/contact-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { Contact, Tenant, Client, SigningKey } from '@/graphql/generated/graphql-types';
import {
    TENANT_READ_SCOPE,
    TENANT_UPDATE_SCOPE,
    TENANT_READ_ALL_SCOPE,
    CLIENT_READ_SCOPE,
    CLIENT_UPDATE_SCOPE,
    KEY_READ_SCOPE,
    KEY_UPDATE_SCOPE,
    CONTACT_TYPE_FOR_TENANT,
    CONTACT_TYPE_FOR_CLIENT,
    CONTACT_TYPE_FOR_SIGNING_KEY
} from '@/utils/consts';
import { GraphQLError } from 'graphql/error/GraphQLError';

// Import the mocked modules to access the exported mock objects
import * as DaoFactoryModule from '@/lib/data-sources/dao-factory';

// Extract the mock implementations
const mockTenantDao = (DaoFactoryModule as any).__mockTenantDao;
const mockClientDao = (DaoFactoryModule as any).__mockClientDao;
const mockSigningKeysDao = (DaoFactoryModule as any).__mockSigningKeysDao;
const mockContactDao = (DaoFactoryModule as any).__mockContactDao;
const mockChangeEventDao = (DaoFactoryModule as any).__mockChangeEventDao;

describe('ContactService', () => {
    let service: ContactService;
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

    const mockClient: Client = {
        clientId: 'client-123',
        tenantId: 'tenant-123',
        clientName: 'Test Client',
        enabled: true,
        markForDelete: false
    };

    const mockSigningKey: SigningKey = {
        keyId: 'key-123',
        tenantId: 'tenant-123',
        keyName: 'Test Key',
        keyType: 'RSA',
        keyUse: 'KEY_USE_JWT_SIGNING',
        keyStatus: 'ACTIVE',
        privateKeyPkcs8: '',
        keyCertificate: 'mock-certificate',
        keyPassword: '',
        publicKey: '',
        createdAtMs: Date.now(),
        expiresAtMs: Date.now() + 10000000,
        markForDelete: false
    };

    const mockTenantContact: Contact = {
        contactid: 'contact-1',
        objectid: 'tenant-123',
        objecttype: CONTACT_TYPE_FOR_TENANT,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phonenumber: '+1234567890',
        purpose: 'Technical Support'
    };

    const mockClientContact: Contact = {
        contactid: 'contact-2',
        objectid: 'client-123',
        objecttype: CONTACT_TYPE_FOR_CLIENT,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phonenumber: '+0987654321',
        purpose: 'Business Contact'
    };

    const mockKeyContact: Contact = {
        contactid: 'contact-3',
        objectid: 'key-123',
        objecttype: CONTACT_TYPE_FOR_SIGNING_KEY,
        name: 'Security Team',
        email: 'security@example.com',
        phonenumber: '+1122334455',
        purpose: 'Key Management'
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
                    { scopeName: TENANT_READ_SCOPE },
                    { scopeName: TENANT_UPDATE_SCOPE },
                    { scopeName: TENANT_READ_ALL_SCOPE },
                    { scopeName: CLIENT_READ_SCOPE },
                    { scopeName: CLIENT_UPDATE_SCOPE },
                    { scopeName: KEY_READ_SCOPE },
                    { scopeName: KEY_UPDATE_SCOPE }
                ]
            }
        } as OIDCContext;

        service = new ContactService(mockContext);

        // Setup default successful mock responses
        mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);
    });

    describe('getContacts', () => {
        it('should return tenant contacts for authorized user', async () => {
            const mockContacts = [mockTenantContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const result = await service.getContacts('tenant-123');

            expect(result).toHaveLength(1);
            expect(result[0].contactid).toBe('contact-1');
            expect(result[0].email).toBe('john.doe@example.com');
        });

        it('should return client contacts for authorized user', async () => {
            const mockContacts = [mockClientContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockClientDao.getClientById.mockResolvedValue(mockClient);

            const result = await service.getContacts('client-123');

            expect(result).toHaveLength(1);
            expect(result[0].contactid).toBe('contact-2');
            expect(result[0].email).toBe('jane.smith@example.com');
        });

        it('should return signing key contacts for authorized user', async () => {
            const mockContacts = [mockKeyContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

            const result = await service.getContacts('key-123');

            expect(result).toHaveLength(1);
            expect(result[0].contactid).toBe('contact-3');
            expect(result[0].email).toBe('security@example.com');
        });

        it('should return empty array when no contacts found', async () => {
            mockContactDao.getContacts.mockResolvedValue([]);

            const result = await service.getContacts('tenant-123');

            expect(result).toEqual([]);
        });

        it('should throw error when tenant not found', async () => {
            const mockContacts = [mockTenantContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(service.getContacts('tenant-123')).rejects.toThrow(GraphQLError);
        });

        it('should throw error when client not found', async () => {
            const mockContacts = [mockClientContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.getContacts('client-123')).rejects.toThrow(GraphQLError);
        });

        it('should throw error when signing key not found', async () => {
            const mockContacts = [mockKeyContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

            await expect(service.getContacts('key-123')).rejects.toThrow(GraphQLError);
        });

        it('should throw error when user lacks tenant read permission', async () => {
            mockContext.portalUserProfile!.scope = [
                { scopeName: CLIENT_READ_SCOPE }
            ];

            const mockContacts = [mockTenantContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(service.getContacts('tenant-123')).rejects.toThrow(GraphQLError);
        });

        it('should allow access with TENANT_READ_ALL_SCOPE', async () => {
            mockContext.portalUserProfile!.scope = [
                { scopeName: TENANT_READ_ALL_SCOPE }
            ];

            const mockContacts = [mockTenantContact];
            mockContactDao.getContacts.mockResolvedValue(mockContacts);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            const result = await service.getContacts('tenant-123');

            expect(result).toHaveLength(1);
        });
    });

    describe('addContact', () => {
        describe('Tenant Contacts', () => {
            it('should add tenant contact successfully', async () => {
                mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
                mockContactDao.addContact.mockResolvedValue(undefined);

                const newContact: Contact = {
                    ...mockTenantContact,
                    contactid: ''
                };

                const result = await service.addContact(newContact);

                expect(result.contactid).toBeTruthy();
                expect(result.email).toBe('john.doe@example.com');
                expect(mockContactDao.addContact).toHaveBeenCalled();
                expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            });

            it('should throw error when tenant not found', async () => {
                mockTenantDao.getTenantById.mockResolvedValue(null);

                const newContact: Contact = {
                    ...mockTenantContact,
                    contactid: ''
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });

            it('should throw error when user lacks tenant update permission', async () => {
                mockContext.portalUserProfile!.scope = [
                    { scopeName: TENANT_READ_SCOPE }
                ];
                mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

                const newContact: Contact = {
                    ...mockTenantContact,
                    contactid: ''
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });
        });

        describe('Client Contacts', () => {
            it('should add client contact successfully', async () => {
                mockClientDao.getClientById.mockResolvedValue(mockClient);
                mockContactDao.addContact.mockResolvedValue(undefined);

                const newContact: Contact = {
                    ...mockClientContact,
                    contactid: ''
                };

                const result = await service.addContact(newContact);

                expect(result.contactid).toBeTruthy();
                expect(result.email).toBe('jane.smith@example.com');
                expect(mockContactDao.addContact).toHaveBeenCalled();
                expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            });

            it('should throw error when client not found', async () => {
                mockClientDao.getClientById.mockResolvedValue(null);

                const newContact: Contact = {
                    ...mockClientContact,
                    contactid: ''
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });

            it('should throw error when user lacks client update permission', async () => {
                mockContext.portalUserProfile!.scope = [
                    { scopeName: CLIENT_READ_SCOPE }
                ];
                mockClientDao.getClientById.mockResolvedValue(mockClient);

                const newContact: Contact = {
                    ...mockClientContact,
                    contactid: ''
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });
        });

        describe('Signing Key Contacts', () => {
            it('should add signing key contact successfully', async () => {
                mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);
                mockContactDao.addContact.mockResolvedValue(undefined);

                const newContact: Contact = {
                    ...mockKeyContact,
                    contactid: ''
                };

                const result = await service.addContact(newContact);

                expect(result.contactid).toBeTruthy();
                expect(result.email).toBe('security@example.com');
                expect(mockContactDao.addContact).toHaveBeenCalled();
                expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            });

            it('should throw error when signing key not found', async () => {
                mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

                const newContact: Contact = {
                    ...mockKeyContact,
                    contactid: ''
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });

            it('should throw error when user lacks key update permission', async () => {
                mockContext.portalUserProfile!.scope = [
                    { scopeName: KEY_READ_SCOPE }
                ];
                mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

                const newContact: Contact = {
                    ...mockKeyContact,
                    contactid: ''
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });
        });

        describe('Validation', () => {
            it('should throw error when email is invalid (too short)', async () => {
                mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

                const newContact: Contact = {
                    ...mockTenantContact,
                    contactid: '',
                    email: 'ab'
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });

            it('should throw error when email is missing @ symbol', async () => {
                mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

                const newContact: Contact = {
                    ...mockTenantContact,
                    contactid: '',
                    email: 'invalidemail.com'
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });

            it('should throw error when objecttype is invalid', async () => {
                const newContact: Contact = {
                    ...mockTenantContact,
                    contactid: '',
                    objecttype: 'INVALID_TYPE'
                };

                await expect(service.addContact(newContact)).rejects.toThrow(GraphQLError);
            });
        });
    });

    describe('removeContact', () => {
        describe('Tenant Contacts', () => {
            it('should remove tenant contact successfully', async () => {
                mockContactDao.getContactById.mockResolvedValue(mockTenantContact);
                mockContactDao.removeContact.mockResolvedValue(undefined);

                await service.removeContact('contact-1');

                expect(mockContactDao.removeContact).toHaveBeenCalledWith('contact-1');
                expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            });

            it('should throw error when user lacks tenant update permission', async () => {
                mockContext.portalUserProfile!.scope = [
                    { scopeName: TENANT_READ_SCOPE }
                ];
                mockContactDao.getContactById.mockResolvedValue(mockTenantContact);

                await expect(service.removeContact('contact-1')).rejects.toThrow(GraphQLError);
            });
        });

        describe('Client Contacts', () => {
            it('should remove client contact successfully', async () => {
                mockContactDao.getContactById.mockResolvedValue(mockClientContact);
                mockClientDao.getClientById.mockResolvedValue(mockClient);
                mockContactDao.removeContact.mockResolvedValue(undefined);

                await service.removeContact('contact-2');

                expect(mockContactDao.removeContact).toHaveBeenCalledWith('contact-2');
                expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            });

            it('should throw error when client not found', async () => {
                mockContactDao.getContactById.mockResolvedValue(mockClientContact);
                mockClientDao.getClientById.mockResolvedValue(null);

                await expect(service.removeContact('contact-2')).rejects.toThrow(GraphQLError);
            });

            it('should throw error when user lacks client update permission', async () => {
                mockContext.portalUserProfile!.scope = [
                    { scopeName: CLIENT_READ_SCOPE }
                ];
                mockContactDao.getContactById.mockResolvedValue(mockClientContact);
                mockClientDao.getClientById.mockResolvedValue(mockClient);

                await expect(service.removeContact('contact-2')).rejects.toThrow(GraphQLError);
            });
        });

        describe('Signing Key Contacts', () => {
            it('should remove signing key contact successfully', async () => {
                mockContactDao.getContactById.mockResolvedValue(mockKeyContact);
                mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);
                mockContactDao.removeContact.mockResolvedValue(undefined);

                await service.removeContact('contact-3');

                expect(mockContactDao.removeContact).toHaveBeenCalledWith('contact-3');
                expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            });

            it('should throw error when signing key not found', async () => {
                mockContactDao.getContactById.mockResolvedValue(mockKeyContact);
                mockSigningKeysDao.getSigningKeyById.mockResolvedValue(null);

                await expect(service.removeContact('contact-3')).rejects.toThrow(GraphQLError);
            });

            it('should throw error when user lacks key update permission', async () => {
                mockContext.portalUserProfile!.scope = [
                    { scopeName: KEY_READ_SCOPE }
                ];
                mockContactDao.getContactById.mockResolvedValue(mockKeyContact);
                mockSigningKeysDao.getSigningKeyById.mockResolvedValue(mockSigningKey);

                await expect(service.removeContact('contact-3')).rejects.toThrow(GraphQLError);
            });
        });

        it('should handle removing non-existent contact gracefully', async () => {
            mockContactDao.getContactById.mockResolvedValue(null);

            await expect(service.removeContact('non-existent')).resolves.not.toThrow();
            expect(mockContactDao.removeContact).not.toHaveBeenCalled();
        });
    });
});
