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

    const mockGroupDaoImpl = {
        getAuthorizationGroups: jest.fn(),
        getAuthorizationGroupById: jest.fn(),
        createAuthorizationGroup: jest.fn(),
        updateAuthorizationGroup: jest.fn(),
        addUserToAuthorizationGroup: jest.fn(),
        removeUserFromAuthorizationGroup: jest.fn(),
        getUserAuthorizationGroups: jest.fn(),
        deleteUserAuthorizationGroupRels: jest.fn()
    };

    const mockIdentityDaoImpl = {
        getUserBy: jest.fn(),
        getUserTenantRel: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getTenantDao: () => mockTenantDaoImpl,
                getAuthorizationGroupDao: () => mockGroupDaoImpl,
                getIdentityDao: () => mockIdentityDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        __mockTenantDao: mockTenantDaoImpl,
        __mockGroupDao: mockGroupDaoImpl,
        __mockIdentityDao: mockIdentityDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

import GroupService from '@/lib/service/group-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { AuthorizationGroup, AuthorizationGroupUserRel, User, UserTenantRel, Tenant } from '@/graphql/generated/graphql-types';
import * as DaoFactoryModule from '@/lib/data-sources/dao-factory';
import * as OpenSearchModule from '@/lib/data-sources/search';

// Extract mocks
const mockTenantDao = (DaoFactoryModule as any).__mockTenantDao;
const mockGroupDao = (DaoFactoryModule as any).__mockGroupDao;
const mockIdentityDao = (DaoFactoryModule as any).__mockIdentityDao;
const mockChangeEventDao = (DaoFactoryModule as any).__mockChangeEventDao;
const mockSearchClient = (OpenSearchModule as any).__mockSearchClient;

describe('GroupService', () => {
    let groupService: GroupService;
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
                    { scopeName: 'authorizationgroup.read' },
                    { scopeName: 'authorizationgroup.create' },
                    { scopeName: 'authorizationgroup.update' },
                    { scopeName: 'authorizationgroup.user.assign' },
                    { scopeName: 'authorizationgroup.user.remove' },
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

        groupService = new GroupService(mockContext);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('getGroups', () => {
        it('should return groups for a specific tenant', async () => {
            const mockGroups: AuthorizationGroup[] = [
                {
                    groupId: 'group-1',
                    groupName: 'Test Group 1',
                    groupDescription: 'Description 1',
                    tenantId: 'tenant-123',
                    default: false
                },
                {
                    groupId: 'group-2',
                    groupName: 'Test Group 2',
                    groupDescription: 'Description 2',
                    tenantId: 'tenant-123',
                    default: true
                }
            ];

            mockGroupDao.getAuthorizationGroups.mockResolvedValue(mockGroups);

            const result = await groupService.getGroups('tenant-123');

            expect(result).toEqual(mockGroups);
            expect(mockGroupDao.getAuthorizationGroups).toHaveBeenCalledWith('tenant-123');
        });

        it('should return groups for management access tenant when no tenantId provided', async () => {
            const mockGroups: AuthorizationGroup[] = [
                {
                    groupId: 'group-1',
                    groupName: 'Test Group',
                    groupDescription: 'Description',
                    tenantId: 'tenant-123',
                    default: false
                }
            ];

            mockGroupDao.getAuthorizationGroups.mockResolvedValue(mockGroups);

            const result = await groupService.getGroups();

            expect(result).toEqual(mockGroups);
            expect(mockGroupDao.getAuthorizationGroups).toHaveBeenCalledWith('tenant-123');
        });

        it('should throw error when user lacks authorization', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            groupService = new GroupService(unauthorizedContext);

            await expect(groupService.getGroups('tenant-123')).rejects.toThrow();
        });

        it('should return empty array when no groups found', async () => {
            mockGroupDao.getAuthorizationGroups.mockResolvedValue([]);

            const result = await groupService.getGroups('tenant-123');

            expect(result).toEqual([]);
        });
    });

    describe('getGroupById', () => {
        it('should return group by id when authorized', async () => {
            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);

            const result = await groupService.getGroupById('group-1');

            expect(result).toEqual(mockGroup);
            expect(mockGroupDao.getAuthorizationGroupById).toHaveBeenCalledWith('group-1');
        });

        it('should return null when group not found', async () => {
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(null);

            const result = await groupService.getGroupById('nonexistent-group');

            expect(result).toBeNull();
        });

        it('should throw error when user lacks authorization', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            groupService = new GroupService(unauthorizedContext);

            await expect(groupService.getGroupById('group-1')).rejects.toThrow();
        });

        it('should throw error when group belongs to different tenant', async () => {
            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'different-tenant',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);

            await expect(groupService.getGroupById('group-1')).rejects.toThrow();
        });
    });

    describe('createGroup', () => {
        it('should create a new group with search indexing', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Description',
                enabled: true,
                markForDelete: false
            };

            const newGroup: AuthorizationGroup = {
                groupId: '',
                groupName: 'New Group',
                groupDescription: 'New Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockGroupDao.createAuthorizationGroup.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});

            const result = await groupService.createGroup(newGroup);

            expect(result.groupId).toBeTruthy();
            expect(result.groupName).toBe('New Group');
            expect(mockGroupDao.createAuthorizationGroup).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalledTimes(2); // Object and relationship search
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when tenant not found', async () => {
            const newGroup: AuthorizationGroup = {
                groupId: '',
                groupName: 'New Group',
                groupDescription: 'New Description',
                tenantId: 'nonexistent-tenant',
                default: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(groupService.createGroup(newGroup)).rejects.toThrow();
        });

        it('should throw error when tenant is disabled', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Description',
                enabled: false,
                markForDelete: false
            };

            const newGroup: AuthorizationGroup = {
                groupId: '',
                groupName: 'New Group',
                groupDescription: 'New Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(groupService.createGroup(newGroup)).rejects.toThrow();
        });

        it('should throw error when tenant is marked for delete', async () => {
            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Description',
                enabled: true,
                markForDelete: true
            };

            const newGroup: AuthorizationGroup = {
                groupId: '',
                groupName: 'New Group',
                groupDescription: 'New Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

            await expect(groupService.createGroup(newGroup)).rejects.toThrow();
        });

        it('should throw error when user lacks authorization', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            groupService = new GroupService(unauthorizedContext);

            const newGroup: AuthorizationGroup = {
                groupId: '',
                groupName: 'New Group',
                groupDescription: 'New Description',
                tenantId: 'tenant-123',
                default: false
            };

            await expect(groupService.createGroup(newGroup)).rejects.toThrow();
        });
    });

    describe('updateGroup', () => {
        it('should update an existing group', async () => {
            const existingGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Old Name',
                groupDescription: 'Old Description',
                tenantId: 'tenant-123',
                default: false
            };

            const updatedGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'New Name',
                groupDescription: 'New Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(existingGroup);
            mockGroupDao.updateAuthorizationGroup.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});

            const result = await groupService.updateGroup(updatedGroup);

            expect(result.groupName).toBe('New Name');
            expect(result.groupDescription).toBe('New Description');
            expect(mockGroupDao.updateAuthorizationGroup).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalledTimes(2);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when group not found', async () => {
            const updatedGroup: AuthorizationGroup = {
                groupId: 'nonexistent-group',
                groupName: 'New Name',
                groupDescription: 'New Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(null);

            await expect(groupService.updateGroup(updatedGroup)).rejects.toThrow();
        });

        it('should delete user relationships when changing to default group', async () => {
            const existingGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            const updatedGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: true
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(existingGroup);
            mockGroupDao.updateAuthorizationGroup.mockResolvedValue(undefined);
            mockGroupDao.deleteUserAuthorizationGroupRels.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});

            await groupService.updateGroup(updatedGroup);

            expect(mockGroupDao.deleteUserAuthorizationGroupRels).toHaveBeenCalledWith('group-1');
        });

        it('should not delete user relationships when already default', async () => {
            const existingGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: true
            };

            const updatedGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Updated Group',
                groupDescription: 'Updated Description',
                tenantId: 'tenant-123',
                default: true
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(existingGroup);
            mockGroupDao.updateAuthorizationGroup.mockResolvedValue(undefined);
            mockSearchClient.index.mockResolvedValue({});

            await groupService.updateGroup(updatedGroup);

            expect(mockGroupDao.deleteUserAuthorizationGroupRels).not.toHaveBeenCalled();
        });

        it('should throw error when user lacks authorization', async () => {
            const existingGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(existingGroup);

            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            groupService = new GroupService(unauthorizedContext);

            await expect(groupService.updateGroup(existingGroup)).rejects.toThrow();
        });
    });

    describe('addUserToGroup', () => {
        it('should add user to group with search indexing', async () => {
            const mockUser: User = {
                userId: 'user-456',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                nameOrder: 'WESTERN'
            };

            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            const mockUserTenantRel: UserTenantRel = {
                userId: 'user-456',
                tenantId: 'tenant-123'
            };

            const mockRel: AuthorizationGroupUserRel = {
                userId: 'user-456',
                groupId: 'group-1'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);
            mockGroupDao.addUserToAuthorizationGroup.mockResolvedValue(mockRel);
            mockSearchClient.index.mockResolvedValue({});

            const result = await groupService.addUserToGroup('user-456', 'group-1');

            expect(result).toEqual(mockRel);
            expect(mockGroupDao.addUserToAuthorizationGroup).toHaveBeenCalledWith('user-456', 'group-1');
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user not found', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            await expect(groupService.addUserToGroup('nonexistent-user', 'group-1')).rejects.toThrow();
        });

        it('should throw error when group not found', async () => {
            const mockUser: User = {
                userId: 'user-456',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                nameOrder: 'WESTERN'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(null);

            await expect(groupService.addUserToGroup('user-456', 'group-1')).rejects.toThrow();
        });

        it('should throw error when user not member of tenant', async () => {
            const mockUser: User = {
                userId: 'user-456',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                nameOrder: 'WESTERN'
            };

            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(null);

            await expect(groupService.addUserToGroup('user-456', 'group-1')).rejects.toThrow();
        });

        it('should throw error when trying to add user to default group', async () => {
            const mockUser: User = {
                userId: 'user-456',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                nameOrder: 'WESTERN'
            };

            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Default Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: true
            };

            const mockUserTenantRel: UserTenantRel = {
                userId: 'user-456',
                tenantId: 'tenant-123'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);

            await expect(groupService.addUserToGroup('user-456', 'group-1')).rejects.toThrow();
        });

        it('should throw error when user lacks authorization', async () => {
            const mockUser: User = {
                userId: 'user-456',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                nameOrder: 'WESTERN'
            };

            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            const mockUserTenantRel: UserTenantRel = {
                userId: 'user-456',
                tenantId: 'tenant-123'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);

            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            groupService = new GroupService(unauthorizedContext);

            await expect(groupService.addUserToGroup('user-456', 'group-1')).rejects.toThrow();
        });
    });

    describe('removeUserFromGroup', () => {
        it('should remove user from group with search cleanup', async () => {
            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);
            mockGroupDao.removeUserFromAuthorizationGroup.mockResolvedValue(undefined);
            mockSearchClient.delete.mockResolvedValue({});

            await groupService.removeUserFromGroup('user-456', 'group-1');

            expect(mockGroupDao.removeUserFromAuthorizationGroup).toHaveBeenCalledWith('user-456', 'group-1');
            expect(mockSearchClient.delete).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should still log change event when group not found', async () => {
            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(null);

            await groupService.removeUserFromGroup('user-456', 'group-1');

            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
            expect(mockGroupDao.removeUserFromAuthorizationGroup).not.toHaveBeenCalled();
        });

        it('should throw error when user lacks authorization', async () => {
            const mockGroup: AuthorizationGroup = {
                groupId: 'group-1',
                groupName: 'Test Group',
                groupDescription: 'Description',
                tenantId: 'tenant-123',
                default: false
            };

            mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockGroup);

            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            groupService = new GroupService(unauthorizedContext);

            await expect(groupService.removeUserFromGroup('user-456', 'group-1')).rejects.toThrow();
        });
    });

    describe('getUserAuthorizationGroups', () => {
        it('should return user authorization groups', async () => {
            const mockGroups: AuthorizationGroup[] = [
                {
                    groupId: 'group-1',
                    groupName: 'Test Group 1',
                    groupDescription: 'Description 1',
                    tenantId: 'tenant-123',
                    default: false
                },
                {
                    groupId: 'group-2',
                    groupName: 'Test Group 2',
                    groupDescription: 'Description 2',
                    tenantId: 'tenant-123',
                    default: true
                }
            ];

            mockGroupDao.getUserAuthorizationGroups.mockResolvedValue(mockGroups);

            const result = await groupService.getUserAuthorizationGroups('user-456');

            expect(result).toEqual(mockGroups);
            expect(mockGroupDao.getUserAuthorizationGroups).toHaveBeenCalledWith('user-456');
        });

        it('should filter groups by tenant when not root tenant user', async () => {
            const mockGroups: AuthorizationGroup[] = [
                {
                    groupId: 'group-1',
                    groupName: 'Test Group 1',
                    groupDescription: 'Description 1',
                    tenantId: 'tenant-123',
                    default: false
                }
            ];

            mockGroupDao.getUserAuthorizationGroups.mockResolvedValue(mockGroups);

            const result = await groupService.getUserAuthorizationGroups('user-456');

            expect(result).toEqual(mockGroups);
            expect(mockGroupDao.getUserAuthorizationGroups).toHaveBeenCalledWith('user-456');
        });

        it('should return all groups for root tenant user', async () => {
            const rootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'root-tenant'
                }
            } as OIDCContext;

            groupService = new GroupService(rootContext);

            const mockGroups: AuthorizationGroup[] = [
                {
                    groupId: 'group-1',
                    groupName: 'Test Group 1',
                    groupDescription: 'Description 1',
                    tenantId: 'tenant-123',
                    default: false
                },
                {
                    groupId: 'group-2',
                    groupName: 'Test Group 2',
                    groupDescription: 'Description 2',
                    tenantId: 'different-tenant',
                    default: false
                }
            ];

            mockGroupDao.getUserAuthorizationGroups.mockResolvedValue(mockGroups);

            const result = await groupService.getUserAuthorizationGroups('user-456');

            expect(result).toEqual(mockGroups);
            expect(result.length).toBe(2);
        });

        it('should return empty array when no groups found', async () => {
            mockGroupDao.getUserAuthorizationGroups.mockResolvedValue([]);

            const result = await groupService.getUserAuthorizationGroups('user-456');

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

            groupService = new GroupService(unauthorizedContext);

            await expect(groupService.getUserAuthorizationGroups('user-456')).rejects.toThrow();
        });
    });
});
