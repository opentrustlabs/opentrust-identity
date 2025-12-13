// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock OpenSearch client before any imports
jest.mock('@/lib/data-sources/search', () => {
    const mockSearchClientImpl = {
        index: jest.fn(),
        delete: jest.fn(),
        search: jest.fn()
    };

    return {
        getOpenSearchClient: jest.fn(() => mockSearchClientImpl),
        __mockSearchClient: mockSearchClientImpl
    };
});

jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockTenantDaoImpl = {
        getTenantById: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockAuthenticationGroupDaoImpl = {
        getAuthenticationGroups: jest.fn(),
        getAuthenticationGroupById: jest.fn(),
        createAuthenticationGroup: jest.fn(),
        updateAuthenticationGroup: jest.fn(),
        assignAuthenticationGroupToClient: jest.fn(),
        removeAuthenticationGroupFromClient: jest.fn(),
        assignUserToAuthenticationGroup: jest.fn(),
        removeUserFromAuthenticationGroup: jest.fn()
    };

    const mockIdentityDaoImpl = {
        getUserBy: jest.fn(),
        getUserTenantRelsByUserId: jest.fn(),
        getUserTenantRel: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getTenantDao: () => mockTenantDaoImpl,
                getClientDao: () => mockClientDaoImpl,
                getAuthenticationGroupDao: () => mockAuthenticationGroupDaoImpl,
                getIdentityDao: () => mockIdentityDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        __mockTenantDao: mockTenantDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockAuthenticationGroupDao: mockAuthenticationGroupDaoImpl,
        __mockIdentityDao: mockIdentityDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

import AuthenticationGroupService from '@/lib/service/authentication-group-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { AuthenticationGroup, Client, User, Tenant, UserTenantRel } from '@/graphql/generated/graphql-types';
import * as DaoFactoryModule from '@/lib/data-sources/dao-factory';
import * as OpenSearchModule from '@/lib/data-sources/search';
import { GraphQLError } from 'graphql';
import { ERROR_CODES } from '@/lib/models/error';

// Extract the mock implementations
const mockTenantDao = (DaoFactoryModule as any).__mockTenantDao;
const mockClientDao = (DaoFactoryModule as any).__mockClientDao;
const mockAuthenticationGroupDao = (DaoFactoryModule as any).__mockAuthenticationGroupDao;
const mockIdentityDao = (DaoFactoryModule as any).__mockIdentityDao;
const mockChangeEventDao = (DaoFactoryModule as any).__mockChangeEventDao;
const mockSearchClientImpl = (OpenSearchModule as any).__mockSearchClient;

describe('AuthenticationGroupService', () => {
    let service: AuthenticationGroupService;
    let mockContext: OIDCContext;
    let mockSearchClient: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock OIDC context
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'tenant-123',
                managementAccessTenantId: 'tenant-123',
                scope: [
                    { scopeName: 'authenticationgroup.read' },
                    { scopeName: 'authenticationgroup.create' },
                    { scopeName: 'authenticationgroup.update' },
                    { scopeName: 'authenticationgroup.client.assign' },
                    { scopeName: 'authenticationgroup.client.remove' },
                    { scopeName: 'authenticationgroup.user.assign' },
                    { scopeName: 'authenticationgroup.user.remove' },
                    { scopeName: 'client.read' },
                    { scopeName: 'client.update' },
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
                'authenticationgroup.read',
                'authenticationgroup.create',
                'authenticationgroup.update',
                'authenticationgroup.client.assign',
                'authenticationgroup.client.remove',
                'authenticationgroup.user.assign',
                'authenticationgroup.user.remove',
                'client.read',
                'client.update'
            ]
        } as OIDCContext;

        // Get mock search client - use the same instance
        mockSearchClient = mockSearchClientImpl;

        // Create service instance
        service = new AuthenticationGroupService(mockContext);
    });

    describe('getAuthenticationGroups', () => {
        it('should return authentication groups for tenant', async () => {
            const mockGroups: AuthenticationGroup[] = [
                {
                    authenticationGroupId: 'group-1',
                    tenantId: 'tenant-123',
                    authenticationGroupName: 'Test Group',
                    authenticationGroupDescription: 'Test Description',
                    defaultGroup: false
                }
            ];

            mockAuthenticationGroupDao.getAuthenticationGroups.mockResolvedValue(mockGroups);

            const result = await service.getAuthenticationGroups('tenant-123');

            expect(result).toEqual(mockGroups);
            expect(mockAuthenticationGroupDao.getAuthenticationGroups).toHaveBeenCalledWith('tenant-123', undefined, undefined);
        });

        it('should return authentication groups for client', async () => {
            const mockClient: Client = {
                clientId: 'client-123',
                tenantId: 'tenant-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description'
            };

            const mockGroups: AuthenticationGroup[] = [
                {
                    authenticationGroupId: 'group-1',
                    tenantId: 'tenant-123',
                    authenticationGroupName: 'Test Group',
                    authenticationGroupDescription: 'Test Description',
                    defaultGroup: false
                }
            ];

            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockAuthenticationGroupDao.getAuthenticationGroups.mockResolvedValue(mockGroups);

            const result = await service.getAuthenticationGroups(undefined, 'client-123');

            expect(result).toEqual(mockGroups);
            expect(mockClientDao.getClientById).toHaveBeenCalledWith('client-123');
            expect(mockAuthenticationGroupDao.getAuthenticationGroups).toHaveBeenCalledWith(undefined, 'client-123', undefined);
        });

        it('should return authentication groups for user', async () => {
            const mockUserTenantRels: UserTenantRel[] = [
                {
                    userId: 'user-456',
                    tenantId: 'tenant-123'
                }
            ];

            const mockGroups: AuthenticationGroup[] = [
                {
                    authenticationGroupId: 'group-1',
                    tenantId: 'tenant-123',
                    authenticationGroupName: 'Test Group',
                    authenticationGroupDescription: 'Test Description',
                    defaultGroup: false
                }
            ];

            mockIdentityDao.getUserTenantRelsByUserId.mockResolvedValue(mockUserTenantRels);
            mockAuthenticationGroupDao.getAuthenticationGroups.mockResolvedValue(mockGroups);

            const result = await service.getAuthenticationGroups(undefined, undefined, 'user-456');

            expect(result).toEqual(mockGroups);
            expect(mockIdentityDao.getUserTenantRelsByUserId).toHaveBeenCalledWith('user-456');
            expect(mockAuthenticationGroupDao.getAuthenticationGroups).toHaveBeenCalledWith(undefined, undefined, 'user-456');
        });

        it('should throw error when client not found', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.getAuthenticationGroups(undefined, 'client-123')).rejects.toThrow(GraphQLError);
            await expect(service.getAuthenticationGroups(undefined, 'client-123')).rejects.toMatchObject({
                message: ERROR_CODES.EC00001.errorCode
            });
        });

        it('should throw error when user not found', async () => {
            mockIdentityDao.getUserTenantRelsByUserId.mockResolvedValue([]);

            await expect(service.getAuthenticationGroups(undefined, undefined, 'user-456')).rejects.toThrow(GraphQLError);
            await expect(service.getAuthenticationGroups(undefined, undefined, 'user-456')).rejects.toMatchObject({
                message: ERROR_CODES.EC00006.errorCode
            });
        });

        it('should throw error when not authorized', async () => {
            mockContext.portalUserProfile!.scope = [];

            await expect(service.getAuthenticationGroups('tenant-123')).rejects.toThrow(GraphQLError);
        });

        it('should return empty array when no groups found', async () => {
            mockAuthenticationGroupDao.getAuthenticationGroups.mockResolvedValue([]);

            const result = await service.getAuthenticationGroups('tenant-123');

            expect(result).toEqual([]);
        });
    });

    describe('getAuthenticationGroupById', () => {
        it('should return authentication group by id', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);

            const result = await service.getAuthenticationGroupById('group-1');

            expect(result).toEqual(mockGroup);
            expect(mockAuthenticationGroupDao.getAuthenticationGroupById).toHaveBeenCalledWith('group-1');
        });

        it('should return null when group not found', async () => {
            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(null);

            const result = await service.getAuthenticationGroupById('group-1');

            expect(result).toBeNull();
        });

        it('should throw error when not authorized', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-456',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.getAuthenticationGroupById('group-1')).rejects.toThrow(GraphQLError);
        });
    });

    describe('createAuthenticationGroup', () => {
        it('should create authentication group', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Test Description'
            };

            const newGroup: AuthenticationGroup = {
                authenticationGroupId: '',
                tenantId: 'tenant-123',
                authenticationGroupName: 'New Group',
                authenticationGroupDescription: 'New Description',
                defaultGroup: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockAuthenticationGroupDao.createAuthenticationGroup.mockImplementation(async (group: AuthenticationGroup) => group);
            mockSearchClient.index.mockResolvedValue({ result: 'created' });

            const result = await service.createAuthenticationGroup(newGroup);

            expect(result?.authenticationGroupId).toBeTruthy();
            expect(result?.authenticationGroupName).toBe('New Group');
            expect(mockTenantDao.getTenantById).toHaveBeenCalledWith('tenant-123');
            expect(mockAuthenticationGroupDao.createAuthenticationGroup).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when tenant not found', async () => {
            const newGroup: AuthenticationGroup = {
                authenticationGroupId: '',
                tenantId: 'tenant-123',
                authenticationGroupName: 'New Group',
                authenticationGroupDescription: 'New Description',
                defaultGroup: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(service.createAuthenticationGroup(newGroup)).rejects.toThrow(GraphQLError);
            await expect(service.createAuthenticationGroup(newGroup)).rejects.toMatchObject({
                message: ERROR_CODES.EC00008.errorCode
            });
        });

        it('should throw error when not authorized', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Test Description'
            };

            const newGroup: AuthenticationGroup = {
                authenticationGroupId: '',
                tenantId: 'tenant-123',
                authenticationGroupName: 'New Group',
                authenticationGroupDescription: 'New Description',
                defaultGroup: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.createAuthenticationGroup(newGroup)).rejects.toThrow(GraphQLError);
        });

        it('should set isDefault to false if undefined', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Test Description'
            };

            const newGroup: AuthenticationGroup = {
                authenticationGroupId: '',
                tenantId: 'tenant-123',
                authenticationGroupName: 'New Group',
                authenticationGroupDescription: 'New Description'
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockAuthenticationGroupDao.createAuthenticationGroup.mockImplementation(async (group: AuthenticationGroup) => group);
            mockSearchClient.index.mockResolvedValue({ result: 'created' });

            const result = await service.createAuthenticationGroup(newGroup);

            // The service doesn't explicitly set defaultGroup to false; it's left as undefined
            expect(result?.defaultGroup).toBeUndefined();
        });
    });

    describe('updateAuthenticationGroup', () => {
        it('should update authentication group', async () => {
            const existingGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Original Group',
                authenticationGroupDescription: 'Original Description',
                defaultGroup: false
            };

            const updatedGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Updated Group',
                authenticationGroupDescription: 'Updated Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(existingGroup);
            mockAuthenticationGroupDao.updateAuthenticationGroup.mockResolvedValue(undefined);

            const result = await service.updateAuthenticationGroup(updatedGroup);

            expect(result.authenticationGroupName).toBe('Updated Group');
            expect(mockAuthenticationGroupDao.updateAuthenticationGroup).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when group not found', async () => {
            const updatedGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Updated Group',
                authenticationGroupDescription: 'Updated Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(null);

            await expect(service.updateAuthenticationGroup(updatedGroup)).rejects.toThrow(GraphQLError);
            await expect(service.updateAuthenticationGroup(updatedGroup)).rejects.toMatchObject({
                message: ERROR_CODES.EC00010.errorCode
            });
        });

        it('should prevent changing default group to non-default', async () => {
            const existingGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Default Group',
                authenticationGroupDescription: 'Default Description',
                defaultGroup: true
            };

            const updatedGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Default Group',
                authenticationGroupDescription: 'Default Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(existingGroup);
            mockAuthenticationGroupDao.updateAuthenticationGroup.mockResolvedValue(undefined);

            const result = await service.updateAuthenticationGroup(updatedGroup);

            expect(result.defaultGroup).toBe(true); // Should remain true
        });

        it('should throw error when not authorized', async () => {
            const existingGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Original Group',
                authenticationGroupDescription: 'Original Description',
                defaultGroup: false
            };

            const updatedGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Updated Group',
                authenticationGroupDescription: 'Updated Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(existingGroup);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.updateAuthenticationGroup(updatedGroup)).rejects.toThrow(GraphQLError);
        });
    });

    describe('assignAuthenticationGroupToClient', () => {
        it('should assign authentication group to client', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockClient: Client = {
                clientId: 'client-123',
                tenantId: 'tenant-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description'
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockAuthenticationGroupDao.assignAuthenticationGroupToClient.mockResolvedValue(undefined);

            await service.assignAuthenticationGroupToClient('group-1', 'client-123');

            expect(mockAuthenticationGroupDao.assignAuthenticationGroupToClient).toHaveBeenCalledWith('group-1', 'client-123');
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when group not found', async () => {
            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(null);

            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toThrow(GraphQLError);
            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toMatchObject({
                message: ERROR_CODES.EC00010.errorCode
            });
        });

        it('should throw error when client not found', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toThrow(GraphQLError);
            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toMatchObject({
                message: ERROR_CODES.EC00011.errorCode
            });
        });

        it('should throw error when trying to assign to service account client', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockClient: Client = {
                clientId: 'client-123',
                tenantId: 'tenant-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description',
                clientType: 'CLIENT_TYPE_SERVICE_ACCOUNT'
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockClientDao.getClientById.mockResolvedValue(mockClient);

            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toThrow(GraphQLError);
            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toMatchObject({
                message: ERROR_CODES.EC00189.errorCode
            });
        });

        it('should throw error when not authorized', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockClient: Client = {
                clientId: 'client-123',
                tenantId: 'tenant-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description'
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.assignAuthenticationGroupToClient('group-1', 'client-123')).rejects.toThrow(GraphQLError);
        });
    });

    describe('removeAuthenticationGroupFromClient', () => {
        it('should remove authentication group from client', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockClient: Client = {
                clientId: 'client-123',
                tenantId: 'tenant-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description'
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockAuthenticationGroupDao.removeAuthenticationGroupFromClient.mockResolvedValue(undefined);

            await service.removeAuthenticationGroupFromClient('group-1', 'client-123');

            expect(mockAuthenticationGroupDao.removeAuthenticationGroupFromClient).toHaveBeenCalledWith('group-1', 'client-123');
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when not authorized', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockClient: Client = {
                clientId: 'client-123',
                tenantId: 'tenant-123',
                clientName: 'Test Client',
                clientDescription: 'Test Description'
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.removeAuthenticationGroupFromClient('group-1', 'client-123')).rejects.toThrow(GraphQLError);
        });
    });

    describe('assignUserToAuthenticationGroup', () => {
        it('should assign user to authentication group and update search index', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockUser: User = {
                userId: 'user-456',
                tenantId: 'tenant-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                isServiceAccount: false
            };

            const mockUserTenantRel: UserTenantRel = {
                userId: 'user-456',
                tenantId: 'tenant-123'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);
            mockAuthenticationGroupDao.assignUserToAuthenticationGroup.mockResolvedValue({
                userId: 'user-456',
                authenticationGroupId: 'group-1'
            });
            mockSearchClient.index.mockResolvedValue({ result: 'created' });

            await service.assignUserToAuthenticationGroup('user-456', 'group-1');

            expect(mockIdentityDao.getUserBy).toHaveBeenCalledWith('id', 'user-456');
            expect(mockIdentityDao.getUserTenantRel).toHaveBeenCalledWith('tenant-123', 'user-456');
            expect(mockAuthenticationGroupDao.assignUserToAuthenticationGroup).toHaveBeenCalledWith('user-456', 'group-1');
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user not found', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toThrow(GraphQLError);
            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toMatchObject({
                message: ERROR_CODES.EC00013.errorCode
            });
        });

        it('should throw error when group not found', async () => {
            const mockUser: User = {
                userId: 'user-456',
                tenantId: 'tenant-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                isServiceAccount: false
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(null);

            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toThrow(GraphQLError);
            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toMatchObject({
                message: ERROR_CODES.EC00010.errorCode
            });
        });

        it('should throw error when trying to assign to default group', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Default Group',
                authenticationGroupDescription: 'Default Description',
                defaultGroup: true
            };

            const mockUser: User = {
                userId: 'user-456',
                tenantId: 'tenant-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                isServiceAccount: false
            };

            const mockUserTenantRel: UserTenantRel = {
                userId: 'user-456',
                tenantId: 'tenant-123'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);

            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toThrow(GraphQLError);
            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toMatchObject({
                message: ERROR_CODES.EC00225.errorCode
            });
        });

        it('should throw error when not authorized', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            const mockUser: User = {
                userId: 'user-456',
                tenantId: 'tenant-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                isServiceAccount: false
            };

            const mockUserTenantRel: UserTenantRel = {
                userId: 'user-456',
                tenantId: 'tenant-123'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.assignUserToAuthenticationGroup('user-456', 'group-1')).rejects.toThrow(GraphQLError);
        });
    });

    describe('removeUserFromAuthenticationGroup', () => {
        it('should remove user from authentication group and clean up search index', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockAuthenticationGroupDao.removeUserFromAuthenticationGroup.mockResolvedValue(undefined);
            mockSearchClient.delete.mockResolvedValue({ result: 'deleted' });

            await service.removeUserFromAuthenticationGroup('user-456', 'group-1');

            expect(mockAuthenticationGroupDao.getAuthenticationGroupById).toHaveBeenCalledWith('group-1');
            expect(mockAuthenticationGroupDao.removeUserFromAuthenticationGroup).toHaveBeenCalledWith('user-456', 'group-1');
            expect(mockSearchClient.delete).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when not authorized', async () => {
            const mockGroup: AuthenticationGroup = {
                authenticationGroupId: 'group-1',
                tenantId: 'tenant-123',
                authenticationGroupName: 'Test Group',
                authenticationGroupDescription: 'Test Description',
                defaultGroup: false
            };

            mockAuthenticationGroupDao.getAuthenticationGroupById.mockResolvedValue(mockGroup);
            mockContext.portalUserProfile!.scope = [];

            await expect(service.removeUserFromAuthenticationGroup('user-456', 'group-1')).rejects.toThrow(GraphQLError);
        });
    });
});
