// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock all the dependencies BEFORE importing the service
// This is critical because the service file instantiates DAOs at the file level

jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockScopeDaoImpl = {
        getScope: jest.fn(),
        getScopeById: jest.fn(),
        getScopeByScopeName: jest.fn(),
        createScope: jest.fn(),
        updateScope: jest.fn(),
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
        removeScopeFromUser: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockAccessRuleDaoImpl = {
        getAccessRuleById: jest.fn()
    };

    const mockAuthorizationGroupDaoImpl = {
        getAuthorizationGroupById: jest.fn()
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
                getScopeDao: () => mockScopeDaoImpl,
                getTenantDao: () => mockTenantDaoImpl,
                getClientDao: () => mockClientDaoImpl,
                getAccessRuleDao: () => mockAccessRuleDaoImpl,
                getAuthorizationGroupDao: () => mockAuthorizationGroupDaoImpl,
                getIdentityDao: () => mockIdentityDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        __mockScopeDao: mockScopeDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockAccessRuleDao: mockAccessRuleDaoImpl,
        __mockAuthorizationGroupDao: mockAuthorizationGroupDaoImpl,
        __mockIdentityDao: mockIdentityDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

// Mock the search module
jest.mock('@/lib/data-sources/search', () => {
    const mockSearchClientImpl = {
        index: jest.fn(),
        delete: jest.fn(),
        updateByQuery: jest.fn()
    };

    return {
        getOpenSearchClient: jest.fn(() => mockSearchClientImpl),
        __mockSearchClient: mockSearchClientImpl
    };
});

import ScopeService from '@/lib/service/scope-service';
import { OIDCContext } from '@/graphql/graphql-context';
import {
    Scope,
    Tenant,
    Client,
    AccessRule,
    AuthorizationGroup,
    User,
    UserTenantRel,
    TenantAvailableScope,
    ScopeFilterCriteria
} from '@/graphql/generated/graphql-types';
import {
    SCOPE_READ_SCOPE,
    SCOPE_CREATE_SCOPE,
    SCOPE_UPDATE_SCOPE,
    SCOPE_TENANT_ASSIGN_SCOPE,
    SCOPE_TENANT_REMOVE_SCOPE,
    SCOPE_CLIENT_ASSIGN_SCOPE,
    SCOPE_CLIENT_REMOVE_SCOPE,
    SCOPE_GROUP_ASSIGN_SCOPE,
    SCOPE_GROUP_REMOVE_SCOPE,
    SCOPE_USER_ASSIGN_SCOPE,
    SCOPE_USER_REMOVE_SCOPE,
    SCOPE_USE_APPLICATION_MANAGEMENT,
    SCOPE_USE_IAM_MANAGEMENT,
    TENANT_READ_ALL_SCOPE,
    TENANT_TYPE_ROOT_TENANT,
    CLIENT_TYPE_IDENTITY
} from '@/utils/consts';
import { GraphQLError } from 'graphql/error/GraphQLError';

// Import the mocked modules
import * as DaoFactoryModule from '@/lib/data-sources/dao-factory';
import * as SearchModule from '@/lib/data-sources/search';

// Extract the mock implementations
const mockScopeDao = (DaoFactoryModule as any).__mockScopeDao;
const mockTenantDao = (DaoFactoryModule as any).__mockTenantDao;
const mockClientDao = (DaoFactoryModule as any).__mockClientDao;
const mockAccessRuleDao = (DaoFactoryModule as any).__mockAccessRuleDao;
const mockAuthorizationGroupDao = (DaoFactoryModule as any).__mockAuthorizationGroupDao;
const mockIdentityDao = (DaoFactoryModule as any).__mockIdentityDao;
const mockChangeEventDao = (DaoFactoryModule as any).__mockChangeEventDao;
const mockSearchClient = (SearchModule as any).__mockSearchClient;

describe('ScopeService', () => {
    let service: ScopeService;
    let mockContext: OIDCContext;

    const mockRootTenant: Tenant = {
        tenantId: 'root-tenant-id',
        tenantName: 'Root Tenant',
        enabled: true,
        markForDelete: false,
        tenantType: TENANT_TYPE_ROOT_TENANT
    };

    const mockServicesTenant: Tenant = {
        tenantId: 'tenant-123',
        tenantName: 'Services Tenant',
        enabled: true,
        markForDelete: false,
        tenantType: 'SERVICES'
    };

    const mockApplicationScope: Scope = {
        scopeId: 'scope-1',
        scopeName: 'app:read',
        scopeDescription: 'Application read access',
        scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT
    };

    const mockIAMScope: Scope = {
        scopeId: 'scope-2',
        scopeName: 'iam:manage',
        scopeDescription: 'IAM management access',
        scopeUse: SCOPE_USE_IAM_MANAGEMENT
    };

    const mockClient: Client = {
        clientId: 'client-123',
        tenantId: 'tenant-123',
        clientName: 'Test Client',
        clientType: 'SERVICE',
        enabled: true,
        markForDelete: false
    };

    const mockAuthorizationGroup: AuthorizationGroup = {
        groupId: 'group-123',
        tenantId: 'tenant-123',
        groupName: 'Test Group',
        groupDescription: 'Test authorization group',
        markForDelete: false,
        allowForAnonymousUsers: false,
        default: false
    };

    const mockUser: User = {
        userId: 'user-456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        markForDelete: false
    };

    const mockUserTenantRel: UserTenantRel = {
        userId: 'user-456',
        tenantId: 'tenant-123',
        relType: 'STANDARD'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockContext = {
            rootTenant: mockRootTenant,
            portalUserProfile: {
                userId: 'user-123',
                firstName: 'Admin',
                lastName: 'User',
                managementAccessTenantId: mockRootTenant.tenantId,
                scope: [
                    { scopeName: TENANT_READ_ALL_SCOPE },
                    { scopeName: SCOPE_READ_SCOPE },
                    { scopeName: SCOPE_CREATE_SCOPE },
                    { scopeName: SCOPE_UPDATE_SCOPE },
                    { scopeName: SCOPE_TENANT_ASSIGN_SCOPE },
                    { scopeName: SCOPE_TENANT_REMOVE_SCOPE },
                    { scopeName: SCOPE_CLIENT_ASSIGN_SCOPE },
                    { scopeName: SCOPE_CLIENT_REMOVE_SCOPE },
                    { scopeName: SCOPE_GROUP_ASSIGN_SCOPE },
                    { scopeName: SCOPE_GROUP_REMOVE_SCOPE },
                    { scopeName: SCOPE_USER_ASSIGN_SCOPE },
                    { scopeName: SCOPE_USER_REMOVE_SCOPE }
                ]
            }
        } as OIDCContext;

        service = new ScopeService(mockContext);

        // Setup default successful mock responses
        mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);
        mockSearchClient.index.mockResolvedValue({ result: 'created' });
        mockSearchClient.delete.mockResolvedValue({ result: 'deleted' });
        mockSearchClient.updateByQuery.mockResolvedValue({ updated: 1 });
    });

    describe('getScope', () => {
        it('should return all scopes for root tenant without filter', async () => {
            const mockScopes = [mockApplicationScope, mockIAMScope];
            mockScopeDao.getScope.mockResolvedValue(mockScopes);

            const result = await service.getScope(mockRootTenant.tenantId, null as any);

            expect(result).toHaveLength(2);
            expect(mockScopeDao.getScope).toHaveBeenCalledWith();
        });

        it('should return existing scopes for root tenant', async () => {
            const mockScopes = [mockApplicationScope];
            mockScopeDao.getScope.mockResolvedValue(mockScopes);

            const result = await service.getScope(
                mockRootTenant.tenantId,
                ScopeFilterCriteria.Existing
            );

            expect(result).toHaveLength(1);
            expect(mockScopeDao.getScope).toHaveBeenCalledWith(mockRootTenant.tenantId);
        });

        it('should return tenant-specific scopes for non-root tenant', async () => {
            const mockScopes = [mockApplicationScope];
            mockScopeDao.getScope.mockResolvedValue(mockScopes);

            const result = await service.getScope('tenant-123', ScopeFilterCriteria.Existing);

            expect(result).toHaveLength(1);
            expect(mockScopeDao.getScope).toHaveBeenCalledWith('tenant-123');
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [];

            await expect(
                service.getScope(mockRootTenant.tenantId, null as any)
            ).rejects.toThrow(GraphQLError);
        });

        it('should throw error when non-root user accesses different tenant', async () => {
            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';

            await expect(
                service.getScope('tenant-456', ScopeFilterCriteria.Existing)
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('getScopeById', () => {
        it('should return scope by id for authorized user', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);

            const result = await service.getScopeById('scope-1');

            expect(result).toEqual(mockApplicationScope);
            expect(mockScopeDao.getScopeById).toHaveBeenCalledWith('scope-1');
        });

        it('should return null when scope not found', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(null);

            const result = await service.getScopeById('non-existent');

            expect(result).toBeNull();
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [];

            await expect(service.getScopeById('scope-1')).rejects.toThrow(GraphQLError);
        });
    });

    describe('createScope', () => {
        it('should create application scope successfully', async () => {
            mockScopeDao.getScopeByScopeName.mockResolvedValue(null);
            mockScopeDao.createScope.mockResolvedValue(undefined);

            const newScope: Scope = {
                ...mockApplicationScope,
                scopeId: ''
            };

            const result = await service.createScope(newScope);

            expect(result.scopeId).toBeTruthy();
            expect(result.scopeName).toBe('app:read');
            expect(mockScopeDao.createScope).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [{ scopeName: SCOPE_READ_SCOPE }];

            const newScope: Scope = { ...mockApplicationScope, scopeId: '' };

            await expect(service.createScope(newScope)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when trying to create IAM scope', async () => {
            const newScope: Scope = {
                ...mockIAMScope,
                scopeId: ''
            };

            await expect(service.createScope(newScope)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when scope name is empty', async () => {
            const newScope: Scope = {
                ...mockApplicationScope,
                scopeId: '',
                scopeName: ''
            };

            await expect(service.createScope(newScope)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when scope name already exists', async () => {
            mockScopeDao.getScopeByScopeName.mockResolvedValue(mockApplicationScope);

            const newScope: Scope = { ...mockApplicationScope, scopeId: '' };

            await expect(service.createScope(newScope)).rejects.toThrow(GraphQLError);
        });
    });

    describe('updateScope', () => {
        it('should update scope successfully', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getScopeByScopeName.mockResolvedValue(null);
            mockScopeDao.updateScope.mockResolvedValue(undefined);

            const updatedScope: Scope = {
                ...mockApplicationScope,
                scopeDescription: 'Updated description'
            };

            const result = await service.updateScope(updatedScope);

            expect(result.scopeDescription).toBe('Updated description');
            expect(mockScopeDao.updateScope).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when scope not found', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(null);

            const updatedScope: Scope = { ...mockApplicationScope };

            await expect(service.updateScope(updatedScope)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when trying to update IAM scope', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockIAMScope);

            const updatedScope: Scope = { ...mockIAMScope };

            await expect(service.updateScope(updatedScope)).rejects.toThrow(GraphQLError);
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [{ scopeName: SCOPE_READ_SCOPE }];

            const updatedScope: Scope = { ...mockApplicationScope };

            await expect(service.updateScope(updatedScope)).rejects.toThrow(GraphQLError);
        });
    });

    describe('assignScopeToTenant', () => {
        it('should assign scope to tenant successfully', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockServicesTenant);
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.assignScopeToTenant.mockResolvedValue({
                tenantId: 'tenant-123',
                scopeId: 'scope-1'
            } as TenantAvailableScope);

            const result = await service.assignScopeToTenant('tenant-123', 'scope-1', null);

            expect(result.tenantId).toBe('tenant-123');
            expect(result.scopeId).toBe('scope-1');
            expect(mockScopeDao.assignScopeToTenant).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when tenant not found', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(
                service.assignScopeToTenant('tenant-123', 'scope-1', null)
            ).rejects.toThrow(GraphQLError);
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [{ scopeName: SCOPE_READ_SCOPE }];

            await expect(
                service.assignScopeToTenant('tenant-123', 'scope-1', null)
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('removeScopeFromTenant', () => {
        it('should remove scope from tenant successfully', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockServicesTenant);
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.removeScopeFromTenant.mockResolvedValue(undefined);

            await service.removeScopeFromTenant('tenant-123', 'scope-1');

            expect(mockScopeDao.removeScopeFromTenant).toHaveBeenCalledWith(
                'tenant-123',
                'scope-1'
            );
            expect(mockSearchClient.delete).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when trying to remove IAM scope from root tenant', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockRootTenant);
            mockScopeDao.getScopeById.mockResolvedValue(mockIAMScope);

            await expect(
                service.removeScopeFromTenant(mockRootTenant.tenantId, 'scope-2')
            ).rejects.toThrow(GraphQLError);
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [{ scopeName: SCOPE_READ_SCOPE }];

            await expect(
                service.removeScopeFromTenant('tenant-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('getClientScopes', () => {
        it('should return client scopes for authorized user', async () => {
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockScopeDao.getClientScopeRels.mockResolvedValue([
                { clientId: 'client-123', scopeId: 'scope-1', tenantId: 'tenant-123' }
            ]);
            mockScopeDao.getScope.mockResolvedValue([mockApplicationScope]);

            const result = await service.getClientScopes('client-123');

            expect(result).toHaveLength(1);
            expect(result[0].scopeId).toBe('scope-1');
        });

        it('should return empty array when no scopes assigned', async () => {
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockScopeDao.getClientScopeRels.mockResolvedValue([]);

            const result = await service.getClientScopes('client-123');

            expect(result).toEqual([]);
        });

        it('should throw error when client not found', async () => {
            mockClientDao.getClientById.mockResolvedValue(null);

            await expect(service.getClientScopes('client-123')).rejects.toThrow(GraphQLError);
        });
    });

    describe('assignScopeToClient', () => {
        it('should assign scope to client successfully', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            mockClientDao.getClientById.mockResolvedValue(mockClient);
            mockScopeDao.assignScopeToClient.mockResolvedValue({
                clientId: 'client-123',
                scopeId: 'scope-1',
                tenantId: 'tenant-123'
            });

            const result = await service.assignScopeToClient('tenant-123', 'client-123', 'scope-1');

            expect(result.clientId).toBe('client-123');
            expect(mockScopeDao.assignScopeToClient).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when scope not assigned to tenant', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([]);

            await expect(
                service.assignScopeToClient('tenant-123', 'client-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });

        it('should throw error when client type is IDENTITY', async () => {
            const identityClient: Client = {
                ...mockClient,
                clientType: CLIENT_TYPE_IDENTITY
            };
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            mockClientDao.getClientById.mockResolvedValue(identityClient);

            await expect(
                service.assignScopeToClient('tenant-123', 'client-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('removeScopeFromClient', () => {
        it('should remove scope from client successfully', async () => {
            mockScopeDao.removeScopeFromClient.mockResolvedValue(undefined);

            await service.removeScopeFromClient('tenant-123', 'client-123', 'scope-1');

            expect(mockScopeDao.removeScopeFromClient).toHaveBeenCalledWith(
                'tenant-123',
                'client-123',
                'scope-1'
            );
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [{ scopeName: SCOPE_READ_SCOPE }];

            await expect(
                service.removeScopeFromClient('tenant-123', 'client-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('getAuthorizationGroupScopes', () => {
        it('should return authorization group scopes', async () => {
            mockAuthorizationGroupDao.getAuthorizationGroupById.mockResolvedValue(
                mockAuthorizationGroup
            );
            mockScopeDao.getAuthorizationGroupScopeRels.mockResolvedValue([
                { groupId: 'group-123', scopeId: 'scope-1', tenantId: 'tenant-123' }
            ]);
            mockScopeDao.getScope.mockResolvedValue([mockApplicationScope]);

            const result = await service.getAuthorizationGroupScopes('group-123');

            expect(result).toHaveLength(1);
            expect(result[0].scopeId).toBe('scope-1');
        });

        it('should throw error when group not found', async () => {
            mockAuthorizationGroupDao.getAuthorizationGroupById.mockResolvedValue(null);

            await expect(service.getAuthorizationGroupScopes('group-123')).rejects.toThrow(
                GraphQLError
            );
        });
    });

    describe('assignScopeToAuthorizationGroup', () => {
        it('should assign scope to authorization group successfully', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            mockAuthorizationGroupDao.getAuthorizationGroupById.mockResolvedValue(
                mockAuthorizationGroup
            );
            mockScopeDao.assignScopeToAuthorizationGroup.mockResolvedValue({
                groupId: 'group-123',
                scopeId: 'scope-1',
                tenantId: 'tenant-123'
            });

            const result = await service.assignScopeToAuthorizationGroup(
                'group-123',
                'scope-1',
                'tenant-123'
            );

            expect(result.groupId).toBe('group-123');
            expect(mockScopeDao.assignScopeToAuthorizationGroup).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when group belongs to different tenant', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            const differentTenantGroup: AuthorizationGroup = {
                ...mockAuthorizationGroup,
                tenantId: 'tenant-456'
            };
            mockAuthorizationGroupDao.getAuthorizationGroupById.mockResolvedValue(
                differentTenantGroup
            );

            await expect(
                service.assignScopeToAuthorizationGroup('group-123', 'scope-1', 'tenant-123')
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('removeScopeFromAuthorizationGroup', () => {
        it('should remove scope from authorization group successfully', async () => {
            mockScopeDao.removeScopeFromAuthorizationGroup.mockResolvedValue(undefined);

            await service.removeScopeFromAuthorizationGroup('group-123', 'scope-1', 'tenant-123');

            expect(mockScopeDao.removeScopeFromAuthorizationGroup).toHaveBeenCalledWith(
                'tenant-123',
                'group-123',
                'scope-1'
            );
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });
    });

    describe('getUserScopes', () => {
        it('should return user scopes', async () => {
            mockScopeDao.getUserScopeRels.mockResolvedValue([
                { userId: 'user-456', scopeId: 'scope-1', tenantId: 'tenant-123' }
            ]);
            mockScopeDao.getScope.mockResolvedValue([mockApplicationScope]);

            const result = await service.getUserScopes('user-456', 'tenant-123');

            expect(result).toHaveLength(1);
            expect(result[0].scopeId).toBe('scope-1');
        });

        it('should return empty array when no scopes assigned', async () => {
            mockScopeDao.getUserScopeRels.mockResolvedValue([]);

            const result = await service.getUserScopes('user-456', 'tenant-123');

            expect(result).toEqual([]);
        });
    });

    describe('assignScopeToUser', () => {
        it('should assign scope to user successfully', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(mockUserTenantRel);
            mockScopeDao.assignScopeToUser.mockResolvedValue({
                userId: 'user-456',
                scopeId: 'scope-1',
                tenantId: 'tenant-123'
            });

            const result = await service.assignScopeToUser('user-456', 'tenant-123', 'scope-1');

            expect(result.userId).toBe('user-456');
            expect(mockScopeDao.assignScopeToUser).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user not found', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            await expect(
                service.assignScopeToUser('user-456', 'tenant-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });

        it('should throw error when user not assigned to tenant', async () => {
            mockScopeDao.getScopeById.mockResolvedValue(mockApplicationScope);
            mockScopeDao.getTenantAvailableScope.mockResolvedValue([
                { tenantId: 'tenant-123', scopeId: 'scope-1' } as TenantAvailableScope
            ]);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.getUserTenantRel.mockResolvedValue(null);

            await expect(
                service.assignScopeToUser('user-456', 'tenant-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });
    });

    describe('removeScopeFromUser', () => {
        it('should remove scope from user successfully', async () => {
            mockScopeDao.removeScopeFromUser.mockResolvedValue(undefined);

            await service.removeScopeFromUser('user-456', 'tenant-123', 'scope-1');

            expect(mockScopeDao.removeScopeFromUser).toHaveBeenCalledWith(
                'tenant-123',
                'user-456',
                'scope-1'
            );
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user lacks permission', async () => {
            mockContext.portalUserProfile!.scope = [{ scopeName: SCOPE_READ_SCOPE }];

            await expect(
                service.removeScopeFromUser('user-456', 'tenant-123', 'scope-1')
            ).rejects.toThrow(GraphQLError);
        });
    });
});
