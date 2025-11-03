import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Client } from '@/graphql/generated/graphql-types';
import {
  createMockTenant,
  createMockClient,
  createMockOIDCContext,
  createMockScope
} from '../../utils/test-data-factory';
import ClientService from '@/lib/service/client-service';

describe('Client Service Tests', () => {
  // Create mock objects that will replace the static members
  let mockClientDao: any;
  let mockTenantDao: any;
  let mockSearchClient: any;
  let mockKms: any;
  let mockScopeDao: any;
  let mockChangeEventDao: any;
  let mockAuthDao: any;

  beforeEach(() => {
    // Create fresh mock instances
    mockClientDao = {
      getClientById: jest.fn(),
      getClients: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      getRedirectURIs: jest.fn(),
      addRedirectURI: jest.fn(),
      removeRedirectURI: jest.fn(),
    };

    mockTenantDao = {
      getTenantById: jest.fn(),
    };

    mockSearchClient = {
      index: jest.fn<any>().mockResolvedValue({ body: { result: 'created' } }),
      delete: jest.fn<any>().mockResolvedValue({ body: { result: 'deleted' } }),
      search: jest.fn<any>().mockResolvedValue({ body: { hits: { hits: [] } } }),
    };

    mockKms = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    mockScopeDao = {
      getClientScopeRels: jest.fn(),
      getScope: jest.fn(),
      removeScopeFromClient: jest.fn(),
      addScopeToClient: jest.fn(),
    };

    mockChangeEventDao = {
      addChangeEvent: jest.fn(),
      getChangeEvents: jest.fn(),
    };

    mockAuthDao = {
      getPreAuthenticationState: jest.fn(),
    };

    // Replace the static members with mocks
    ClientService.clientDao = mockClientDao;
    ClientService.tenantDao = mockTenantDao;
    ClientService.searchClient = mockSearchClient;
    ClientService.kms = mockKms;
    ClientService.scopeDao = mockScopeDao;
    ClientService.changeEventDao = mockChangeEventDao;
    ClientService.authDao = mockAuthDao;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Get Client By ID", () => {
    it("Should get a client by id", async () => {
      const testClientId = 'test-client-id';
      const testTenantId = 'test-tenant-id';

      const mockedClient = createMockClient({
        clientId: testClientId,
        tenantId: testTenantId,
        clientName: 'Test Client',
      });

      mockClientDao.getClientById.mockResolvedValue(mockedClient);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service = new ClientService(oidcContext);
      const client = await service.getClientById(testClientId);

      expect(mockClientDao.getClientById).toHaveBeenCalledWith(testClientId);
      expect(client?.clientId).toEqual(testClientId);
      expect(client?.tenantId).toEqual(testTenantId);
      // Client secret should be cleared in the response
      expect(client?.clientSecret).toEqual("");
    });

    it("Should return null when client does not exist", async () => {
      mockClientDao.getClientById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);
      const client = await service.getClientById('non-existent-id');

      expect(client).toBeNull();
    });

    it("Should throw error when user tries to access client from different tenant", async () => {
      const userTenantId = 'user-tenant-id';
      const clientTenantId = 'different-tenant-id';

      const mockedClient = createMockClient({
        clientId: 'test-client-id',
        tenantId: clientTenantId,
      });

      mockClientDao.getClientById.mockResolvedValue(mockedClient);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: userTenantId,
        },
        rootTenant: createMockTenant({ tenantId: 'root-tenant-id' }),
      });

      const service = new ClientService(oidcContext);

      await expect(service.getClientById('test-client-id')).rejects.toThrow();
    });
  });

  describe("Create Client", () => {
    it("Should create a new client successfully", async () => {
      const testTenantId = 'test-tenant-id';
      const mockTenant = createMockTenant({
        tenantId: testTenantId,
        enabled: true,
        markForDelete: false,
      });

      const newClient = createMockClient({
        tenantId: testTenantId,
        clientName: 'New Test Client',
      });

      mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
      mockKms.encrypt.mockResolvedValue('encrypted-secret');
      mockClientDao.createClient.mockResolvedValue(newClient);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service = new ClientService(oidcContext);
      const createdClient = await service.createClient(newClient);

      expect(mockTenantDao.getTenantById).toHaveBeenCalledWith(testTenantId);
      expect(mockKms.encrypt).toHaveBeenCalled();
      expect(mockClientDao.createClient).toHaveBeenCalled();
      expect(mockSearchClient.index).toHaveBeenCalledTimes(2); // Object and relation indices
      expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
      expect(createdClient.clientId).toBeTruthy();
      // The unencrypted secret should be returned for display to user
      expect(createdClient.clientSecret).toBeTruthy();
      expect(createdClient.clientSecret).not.toEqual('encrypted-secret');
    });

    it("Should throw error when tenant does not exist", async () => {
      const newClient = createMockClient({
        tenantId: 'non-existent-tenant',
      });

      mockTenantDao.getTenantById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);

      await expect(service.createClient(newClient)).rejects.toThrow();
    });

    it("Should throw error when tenant is disabled", async () => {
      const testTenantId = 'test-tenant-id';
      const mockTenant = createMockTenant({
        tenantId: testTenantId,
        enabled: false,
      });

      const newClient = createMockClient({
        tenantId: testTenantId,
      });

      mockTenantDao.getTenantById.mockResolvedValue(mockTenant);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);

      await expect(service.createClient(newClient)).rejects.toThrow();
    });

    it("Should throw error when encryption fails", async () => {
      const testTenantId = 'test-tenant-id';
      const mockTenant = createMockTenant({
        tenantId: testTenantId,
        enabled: true,
      });

      const newClient = createMockClient({
        tenantId: testTenantId,
      });

      mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
      mockKms.encrypt.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });
      const service = new ClientService(oidcContext);

      await expect(service.createClient(newClient)).rejects.toThrow();
    });
  });

  describe("Update Client", () => {
    it("Should update an existing client successfully", async () => {
      const testClientId = 'test-client-id';
      const testTenantId = 'test-tenant-id';

      const existingClient = createMockClient({
        clientId: testClientId,
        tenantId: testTenantId,
        clientName: 'Old Name',
      });

      const updatedClientData = createMockClient({
        clientId: testClientId,
        tenantId: testTenantId,
        clientName: 'New Name',
      });

      mockClientDao.getClientById.mockResolvedValue(existingClient);
      mockClientDao.updateClient.mockResolvedValue(updatedClientData);
      mockScopeDao.getClientScopeRels.mockResolvedValue([]);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service = new ClientService(oidcContext);
      await service.updateClient(updatedClientData);

      expect(mockClientDao.getClientById).toHaveBeenCalledWith(testClientId);
      expect(mockClientDao.updateClient).toHaveBeenCalled();
      expect(mockSearchClient.index).toHaveBeenCalledTimes(2);
      expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
    });

    it("Should throw error when client does not exist", async () => {
      const updatedClientData = createMockClient({
        clientId: 'non-existent-id',
      });

      mockClientDao.getClientById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);

      await expect(service.updateClient(updatedClientData)).rejects.toThrow();
    });
  });

  describe("Redirect URI Management", () => {
    it("Should get redirect URIs for a client", async () => {
      const testClientId = 'test-client-id';
      const testTenantId = 'test-tenant-id';
      const mockURIs = ['https://example.com/callback', 'https://example.com/callback2'];

      const mockClient = createMockClient({
        clientId: testClientId,
        tenantId: testTenantId,
      });

      mockClientDao.getClientById.mockResolvedValue(mockClient);
      mockClientDao.getRedirectURIs.mockResolvedValue(mockURIs);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service = new ClientService(oidcContext);
      const uris = await service.getRedirectURIs(testClientId);

      expect(mockClientDao.getRedirectURIs).toHaveBeenCalledWith(testClientId);
      expect(uris).toEqual(mockURIs);
    });

    it("Should return empty array when client does not exist", async () => {
      mockClientDao.getClientById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);
      const uris = await service.getRedirectURIs('non-existent-id');

      expect(uris).toEqual([]);
    });

    it("Should add a redirect URI to a client", async () => {
      const testClientId = 'test-client-id';
      const testTenantId = 'test-tenant-id';
      const newURI = 'https://example.com/callback';

      const mockClient = createMockClient({
        clientId: testClientId,
        tenantId: testTenantId,
      });

      mockClientDao.getClientById.mockResolvedValue(mockClient);
      mockClientDao.addRedirectURI.mockResolvedValue(newURI);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service = new ClientService(oidcContext);
      const result = await service.addRedirectURI(testClientId, newURI);

      expect(mockClientDao.addRedirectURI).toHaveBeenCalledWith(testClientId, newURI);
      expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
      expect(result).toEqual(newURI);
    });

    it("Should throw error when adding redirect URI to non-existent client", async () => {
      mockClientDao.getClientById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);

      await expect(
        service.addRedirectURI('non-existent-id', 'https://example.com')
      ).rejects.toThrow();
    });

    it("Should remove a redirect URI from a client", async () => {
      const testClientId = 'test-client-id';
      const testTenantId = 'test-tenant-id';
      const uriToRemove = 'https://example.com/callback';

      const mockClient = createMockClient({
        clientId: testClientId,
        tenantId: testTenantId,
      });

      mockClientDao.getClientById.mockResolvedValue(mockClient);
      mockClientDao.removeRedirectURI.mockResolvedValue(undefined);

      const oidcContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockOIDCContext().portalUserProfile,
          managementAccessTenantId: testTenantId,
        },
      });

      const service = new ClientService(oidcContext);
      await service.removeRedirectURI(testClientId, uriToRemove);

      expect(mockClientDao.removeRedirectURI).toHaveBeenCalledWith(testClientId, uriToRemove);
      expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
    });

    it("Should throw error when removing redirect URI from non-existent client", async () => {
      mockClientDao.getClientById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);

      await expect(
        service.removeRedirectURI('non-existent-id', 'https://example.com')
      ).rejects.toThrow();
    });
  });

  describe("Authorization Scope Approval", () => {
    it("Should return approval data for valid pre-auth token", async () => {
      const testClientId = 'test-client-id';
      const preAuthToken = 'valid-pre-auth-token';

      const mockPreAuthState = {
        clientId: testClientId,
        redirectUri: 'https://example.com/callback',
        scope: 'openid profile',
        state: 'test-state',
      };

      const mockClient = createMockClient({
        clientId: testClientId,
        clientName: 'Test Client',
      });

      const mockClientScopeRels = [
        { clientId: testClientId, scopeId: 'scope-1', tenantId: 'tenant-1' },
        { clientId: testClientId, scopeId: 'scope-2', tenantId: 'tenant-1' },
      ];

      const mockScopes = [
        createMockScope({ scopeId: 'scope-1', scopeName: 'openid' }),
        createMockScope({ scopeId: 'scope-2', scopeName: 'profile' }),
      ];

      mockAuthDao.getPreAuthenticationState.mockResolvedValue(mockPreAuthState);
      mockClientDao.getClientById.mockResolvedValue(mockClient);
      mockScopeDao.getClientScopeRels.mockResolvedValue(mockClientScopeRels);
      mockScopeDao.getScope.mockResolvedValue(mockScopes);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);
      const approvalData = await service.getAuthorizationScopeApprovalData(preAuthToken);

      expect(mockAuthDao.getPreAuthenticationState).toHaveBeenCalledWith(preAuthToken);
      expect(approvalData.clientId).toEqual(testClientId);
      expect(approvalData.requestedScope).toHaveLength(2);
    });

    it("Should return empty approval data for invalid pre-auth token", async () => {
      mockAuthDao.getPreAuthenticationState.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);
      const approvalData = await service.getAuthorizationScopeApprovalData('invalid-token');

      expect(approvalData.clientId).toEqual("");
      expect(approvalData.requestedScope).toEqual([]);
      expect(approvalData.requiresUserApproval).toBe(false);
    });

    it("Should return empty approval data when client does not exist", async () => {
      const mockPreAuthState = {
        clientId: 'non-existent-client',
        redirectUri: 'https://example.com/callback',
        scope: 'openid',
        state: 'test-state',
      };

      mockAuthDao.getPreAuthenticationState.mockResolvedValue(mockPreAuthState);
      mockClientDao.getClientById.mockResolvedValue(null);

      const oidcContext = createMockOIDCContext();
      const service = new ClientService(oidcContext);
      const approvalData = await service.getAuthorizationScopeApprovalData('valid-token');

      expect(approvalData.clientId).toEqual("");
    });
  });
});
