import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthorizationGroup } from '@/graphql/generated/graphql-types';
import {
  createMockTenant,
  createMockAuthorizationGroup,
  createMockOIDCContext
} from '../../utils/test-data-factory';
import GroupService from '@/lib/service/group-service';

describe('Authorization Group Service Tests', () => {
  // Create mock objects that will replace the static members
  let mockTenantDao: any;
  let mockGroupDao: any;
  let mockSearchClient: any;
  let mockIdentityDao: any;
  let mockChangeEventDao: any;

  beforeEach(() => {
    // Create fresh mock instances
    mockTenantDao = {
      getTenantById: jest.fn(),
    };

    mockGroupDao = {
      getAuthorizationGroupById: jest.fn(),
      getAuthorizationGroups: jest.fn(),
      getUserAuthorizationGroups: jest.fn(),
      createAuthorizationGroup: jest.fn(),
      updateAuthorizationGroup: jest.fn(),
      deleteAuthorizationGroup: jest.fn(),
      addUserToAuthorizationGroup: jest.fn(),
      removeUserFromAuthorizationGroup: jest.fn(),
      deleteUserAuthorizationGroupRels: jest.fn(),
    };

    mockSearchClient = {
      index: jest.fn<any>().mockResolvedValue({ body: { result: 'created' } }),
      delete: jest.fn<any>().mockResolvedValue({ body: { result: 'deleted' } }),
      search: jest.fn<any>().mockResolvedValue({ body: { hits: { hits: [] } } }),
    };

    mockIdentityDao = {
      getUserBy: jest.fn(),
      getUserTenantRel: jest.fn(),
    };

    mockChangeEventDao = {
      addChangeEvent: jest.fn(),
      getChangeEvents: jest.fn(),
    };

    // Replace the static members with mocks
    GroupService.tenantDao = mockTenantDao;
    GroupService.groupDao = mockGroupDao;
    GroupService.searchClient = mockSearchClient;
    GroupService.identityDao = mockIdentityDao;
    GroupService.changeEventDao = mockChangeEventDao;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Get Authz Group By ID", () => {
    it("Should get an authz group by id", async () => {
      const testGroupId = 'testGroupId';
      const testTenantId = 'testTenantId';

      const mockedAuthzGroup = createMockAuthorizationGroup({
        groupId: testGroupId,
        tenantId: testTenantId,
      });

      mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockedAuthzGroup);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service: GroupService = new GroupService(oidcContext);
      const g: AuthorizationGroup | null = await service.getGroupById(testGroupId);

      expect(mockGroupDao.getAuthorizationGroupById).toHaveBeenCalledWith(testGroupId);
      expect(g?.groupId).toEqual(testGroupId);
      expect(g?.tenantId).toEqual(testTenantId);
    });

    it("Should return null when group does not exist", async () => {
      mockGroupDao.getAuthorizationGroupById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service: GroupService = new GroupService(oidcContext);
      const g: AuthorizationGroup | null = await service.getGroupById('non-existent-id');

      expect(g).toBeNull();
    });

    it("Should throw error when user tries to access group from different tenant", async () => {
      const userTenantId = 'user-tenant-id';
      const groupTenantId = 'different-tenant-id';

      const mockedAuthzGroup = createMockAuthorizationGroup({
        groupId: 'testGroupId',
        tenantId: groupTenantId,
      });

      mockGroupDao.getAuthorizationGroupById.mockResolvedValue(mockedAuthzGroup);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: userTenantId,
        },
        rootTenant: createMockTenant({ tenantId: 'root-tenant-id' }),
      });

      const service: GroupService = new GroupService(oidcContext);

      await expect(service.getGroupById('testGroupId')).rejects.toThrow();
    });
  });

  describe("Get Groups", () => {
    it("Should get all groups for a tenant", async () => {
      const testTenantId = 'testTenantId';

      const mockGroups = [
        createMockAuthorizationGroup({ groupId: 'group1', tenantId: testTenantId }),
        createMockAuthorizationGroup({ groupId: 'group2', tenantId: testTenantId }),
      ];

      mockGroupDao.getAuthorizationGroups.mockResolvedValue(mockGroups);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service: GroupService = new GroupService(oidcContext);
      const groups = await service.getGroups(testTenantId);

      expect(groups).toHaveLength(2);
      expect(groups[0].groupId).toEqual('group1');
      expect(groups[1].groupId).toEqual('group2');
    });

    it("Should return empty array when no groups exist", async () => {
      mockGroupDao.getAuthorizationGroups.mockResolvedValue([]);

      const oidcContext = createMockOIDCContext();
      const service: GroupService = new GroupService(oidcContext);
      const groups = await service.getGroups('testTenantId');

      expect(groups).toEqual([]);
    });
  });

  describe("Get User Authorization Groups", () => {
    it("Should get all groups for a user", async () => {
      const userId = 'user-123';
      const testTenantId = 'testTenantId';

      const mockGroups = [
        createMockAuthorizationGroup({ groupId: 'group1', tenantId: testTenantId }),
        createMockAuthorizationGroup({ groupId: 'group2', tenantId: testTenantId }),
      ];

      mockGroupDao.getUserAuthorizationGroups.mockResolvedValue(mockGroups);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service: GroupService = new GroupService(oidcContext);
      const groups = await service.getUserAuthorizationGroups(userId);

      expect(mockGroupDao.getUserAuthorizationGroups).toHaveBeenCalledWith(userId);
      expect(groups).toHaveLength(2);
    });

    it("Should get groups for user across multiple tenants", async () => {
      const userId = 'user-123';
      const userTenantId = 'user-tenant';
      const otherTenantId = 'other-tenant';

      const mockGroups = [
        createMockAuthorizationGroup({ groupId: 'group1', tenantId: userTenantId }),
        createMockAuthorizationGroup({ groupId: 'group2', tenantId: otherTenantId }),
      ];

      mockGroupDao.getUserAuthorizationGroups.mockResolvedValue(mockGroups);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: userTenantId,
        },
      });

      const service: GroupService = new GroupService(oidcContext);
      const groups = await service.getUserAuthorizationGroups(userId);

      // Verify the DAO method was called
      expect(mockGroupDao.getUserAuthorizationGroups).toHaveBeenCalledWith(userId);
      // Verify we get the groups back
      expect(groups).toHaveLength(2);
      expect(groups[0].groupId).toEqual('group1');
      expect(groups[1].groupId).toEqual('group2');
    });
  });
});
