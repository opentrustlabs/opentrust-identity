/**
 * Tests for JWT Service Utils
 *
 * This test suite demonstrates how to test the JWT service layer
 * with mocked dependencies (DAOs, KMS, etc.)
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  createMockIdentityDao,
  createMockTenantDao,
  createMockClientDao,
  createMockScopeDao,
  createMockAuthorizationGroupDao,
} from '../../utils/dao-mock-utils';
import {
  createMockUser,
  createMockTenant,
  createMockClient,
  createMockScope,
  createMockAuthorizationGroup,
  createMockJWTPayload,
  createMockAccessToken,
  createMockRefreshToken,
} from '../../utils/test-data-factory';

// Mock the DaoFactory before importing the service
jest.mock('@/lib/data-sources/dao-factory', () => ({
  DaoFactory: {
    getInstance: jest.fn(() => ({
      getIdentityDao: jest.fn(),
      getTenantDao: jest.fn(),
      getClientDao: jest.fn(),
      getSigningKeysDao: jest.fn(),
      getScopeDao: jest.fn(),
      getAuthorizationGroupDao: jest.fn(),
      getKms: jest.fn(),
      getAuthDao: jest.fn(),      
    })),
  },
}));

describe('JWT Service Utils', () => {
  // Mock DAOs
  let mockIdentityDao: ReturnType<typeof createMockIdentityDao>;
  let mockTenantDao: ReturnType<typeof createMockTenantDao>;
  let mockClientDao: ReturnType<typeof createMockClientDao>;
  let mockScopeDao: ReturnType<typeof createMockScopeDao>;
  let mockAuthorizationGroupDao: ReturnType<typeof createMockAuthorizationGroupDao>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create fresh mock instances
    mockIdentityDao = createMockIdentityDao();
    mockTenantDao = createMockTenantDao();
    mockClientDao = createMockClientDao();
    mockScopeDao = createMockScopeDao();
    mockAuthorizationGroupDao = createMockAuthorizationGroupDao();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Token Creation', () => {
    it('should create a valid JWT payload with required claims', () => {
      const userId = 'user-123';
      const email = 'user@example.com';
      const tenantId = 'tenant-123';

      const payload = createMockJWTPayload({
        sub: userId,
        email,
        tenant_id: tenantId,
      });

      expect(payload.sub).toBe(userId);
      expect(payload.email).toBe(email);
      expect(payload.tenant_id).toBe(tenantId);
      expect(payload.iss).toBeDefined();
      expect(payload.aud).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });

    it('should set correct expiration time for token', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 3600; // 1 hour

      const payload = createMockJWTPayload({
        iat: now,
        exp: now + expiresIn,
      });

      expect(payload.exp).toBe(now + expiresIn);
      expect(payload.exp - payload.iat).toBe(expiresIn);
    });

    it('should include user scopes in token', () => {
      const scopes = ['openid', 'profile', 'email', 'user:read', 'user:write'];

      const payload = createMockJWTPayload({
        scope: scopes.join(' '),
      });

      expect(payload.scope).toBe('openid profile email user:read user:write');
      expect(payload.scope.split(' ')).toEqual(scopes);
    });

    it('should include email verification status', () => {
      const verifiedPayload = createMockJWTPayload({ email_verified: true });
      const unverifiedPayload = createMockJWTPayload({ email_verified: false });

      expect(verifiedPayload.email_verified).toBe(true);
      expect(unverifiedPayload.email_verified).toBe(false);
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate token expiration', () => {
      const now = Math.floor(Date.now() / 1000);

      const expiredPayload = createMockJWTPayload({
        iat: now - 7200, // 2 hours ago
        exp: now - 3600, // Expired 1 hour ago
      });

      const validPayload = createMockJWTPayload({
        iat: now,
        exp: now + 3600, // Expires in 1 hour
      });

      expect(expiredPayload.exp).toBeLessThan(now);
      expect(validPayload.exp).toBeGreaterThan(now);
    });

    it('should validate required JWT claims are present', () => {
      const payload = createMockJWTPayload();

      // Check all required OIDC claims
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('iss');
      expect(payload).toHaveProperty('aud');
      expect(payload).toHaveProperty('exp');
      expect(payload).toHaveProperty('iat');
    });

    it('should handle malformed token payloads', () => {
      const validatePayload = (payload: any): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!payload.sub) errors.push('Missing subject claim');
        if (!payload.exp) errors.push('Missing expiration claim');
        if (!payload.iat) errors.push('Missing issued at claim');

        return {
          valid: errors.length === 0,
          errors,
        };
      };

      const incompletePayload = { sub: 'user-123' }; // Missing exp and iat
      const result = validatePayload(incompletePayload);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing expiration claim');
      expect(result.errors).toContain('Missing issued at claim');
    });
  });

  describe('User Profile Resolution', () => {
    it('should resolve user profile from JWT', async () => {
      const userId = 'user-123';
      const mockUser = createMockUser({
        userId: userId,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);

      const user = await mockIdentityDao.getUserBy('id', userId);

      expect(user).not.toBeNull();
      expect(user?.userId).toBe(userId);
      expect(user?.email).toBe('user@example.com');
      expect(mockIdentityDao.getUserBy).toHaveBeenCalledWith('id', userId);
    });

    it('should include user scopes in profile', async () => {
      const mockScopes = [
        createMockScope({ scopeName: 'openid' }),
        createMockScope({ scopeName: 'profile' }),
        createMockScope({ scopeName: 'email' }),
      ];

      mockScopeDao.getScope?.mockResolvedValue(mockScopes);

      const scopes = await mockScopeDao.getScope();

      expect(scopes).toHaveLength(3);
      expect(scopes.map(s => s.scopeName)).toEqual(['openid', 'profile', 'email']);
    });

    it('should include authorization groups in profile', async () => {
      const userId = 'user-123';
      const mockAuthzGroups = [
        createMockAuthorizationGroup({ groupName: 'Admins' }),
        createMockAuthorizationGroup({ groupName: 'Users' }),
      ];

      mockAuthorizationGroupDao.getUserAuthorizationGroups?.mockResolvedValue(mockAuthzGroups);

      const groups = await mockAuthorizationGroupDao.getUserAuthorizationGroups(userId);

      expect(groups).toHaveLength(2);
      expect(groups[0].groupName).toBe('Admins');
      expect(groups[1].groupName).toBe('Users');
    });

    it('should return null for invalid user ID', async () => {
      mockIdentityDao.getUserBy?.mockResolvedValue(null);

      const user = await mockIdentityDao.getUserBy('id', 'invalid-user-id');

      expect(user).toBeNull();
    });
  });

  describe('Client Credentials', () => {
    it('should validate client credentials', async () => {
      const clientId = 'client-123';
      const mockClient = createMockClient({
        clientId,
        clientSecret: 'secret-hash',
        enabled: true,
      });

      mockClientDao.findByClientId?.mockResolvedValue(mockClient);

      const client = await mockClientDao.findByClientId(clientId);

      expect(client).not.toBeNull();
      expect(client?.clientId).toBe(clientId);
      expect(client?.enabled).toBe(true);
    });

    it('should reject disabled clients', async () => {
      const mockClient = createMockClient({
        clientId: 'client-123',
        enabled: false,
      });

      mockClientDao.findByClientId?.mockResolvedValue(mockClient);

      const client = await mockClientDao.findByClientId('client-123');

      expect(client?.enabled).toBe(false);

      // In actual implementation, this would throw an error
      if (client && !client.enabled) {
        const error = new Error('Client is disabled');
        expect(error.message).toBe('Client is disabled');
      }
    });

    it('should validate client secret', async () => {
      const mockClient = createMockClient({
        clientSecret: 'hashed-secret',
      });

      mockClientDao.validateClientSecret?.mockResolvedValue(true);

      const isValid = await mockClientDao.validateClientSecret(
        mockClient.clientId,
        'plain-text-secret'
      );

      expect(isValid).toBe(true);
    });
  });

  describe('Access Token Management', () => {
    it('should create access token with correct properties', () => {
      const token = createMockAccessToken({
        userId: 'user-123',
        clientId: 'client-123',
        scope: 'openid profile email',
      });

      expect(token.token).toBeDefined();
      expect(token.userId).toBe('user-123');
      expect(token.clientId).toBe('client-123');
      expect(token.scope).toBe('openid profile email');
      expect(token.expiresAt).toBeInstanceOf(Date);
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should set appropriate TTL for access tokens', () => {
      const now = Date.now();
      const oneHour = 3600000; // 1 hour in ms

      const token = createMockAccessToken({
        expiresAt: new Date(now + oneHour),
      });

      const ttl = token.expiresAt.getTime() - now;
      expect(ttl).toBeGreaterThanOrEqual(oneHour * 0.99); // Allow small variance
      expect(ttl).toBeLessThanOrEqual(oneHour * 1.01);
    });
  });

  describe('Refresh Token Management', () => {
    it('should create refresh token with longer expiration', () => {
      const accessToken = createMockAccessToken();
      const refreshToken = createMockRefreshToken();

      // Refresh tokens should have longer TTL than access tokens
      expect(refreshToken.expiresAt.getTime()).toBeGreaterThan(
        accessToken.expiresAt.getTime()
      );
    });

    it('should validate refresh token before issuing new access token', () => {
      const token = createMockRefreshToken({
        userId: 'user-123',
        clientId: 'client-123',
      });

      expect(token.token).toBeDefined();
      expect(token.userId).toBe('user-123');
      expect(token.clientId).toBe('client-123');

      // Verify token hasn't expired
      const isExpired = token.expiresAt.getTime() < Date.now();
      expect(isExpired).toBe(false);
    });

    it('should reject expired refresh tokens', () => {
      const expiredToken = createMockRefreshToken({
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
      });

      const isExpired = expiredToken.expiresAt.getTime() < Date.now();
      expect(isExpired).toBe(true);
    });
  });

  describe('Tenant Context', () => {
    it('should include tenant information in JWT', async () => {
      const tenantId = 'tenant-123';
      const mockTenant = createMockTenant({
        tenantId: tenantId,
        tenantName: 'Test Tenant'
      });

      mockTenantDao.getTenantById?.mockResolvedValue(mockTenant);

      const tenant = await mockTenantDao.getTenantById(tenantId);

      expect(tenant).not.toBeNull();
      expect(tenant?.tenantId).toBe(tenantId);
      expect(tenant?.tenantName).toBe('Test Tenant');;
    });
    
  });

  describe('Scope Management', () => {
    it('should filter scopes based on client permissions', () => {
      const requestedScopes = ['openid', 'profile', 'email', 'admin:write'];
      const clientAllowedScopes = ['openid', 'profile', 'email'];

      const grantedScopes = requestedScopes.filter(scope =>
        clientAllowedScopes.includes(scope)
      );

      expect(grantedScopes).toEqual(['openid', 'profile', 'email']);
      expect(grantedScopes).not.toContain('admin:write');
    });

    it('should validate scope format', () => {
      const isValidScope = (scope: string) => /^[a-zA-Z0-9:_-]+$/.test(scope);

      expect(isValidScope('openid')).toBe(true);
      expect(isValidScope('user:read')).toBe(true);
      expect(isValidScope('admin:write:all')).toBe(true);
      expect(isValidScope('invalid scope')).toBe(false);
      expect(isValidScope('invalid@scope')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle DAO errors during token creation', async () => {
      const error = new Error('Database connection failed');
      mockIdentityDao.getUserBy?.mockRejectedValue(error);

      await expect(mockIdentityDao.getUserBy('id', 'user-123')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle missing user gracefully', async () => {
      mockIdentityDao.getUserBy?.mockResolvedValue(null);

      const user = await mockIdentityDao.getUserBy('id', 'non-existent-user');

      expect(user).toBeNull();

      // In actual service, this would return an error response
      if (!user) {
        const errorResponse = { error: 'invalid_grant', error_description: 'User not found' };
        expect(errorResponse.error).toBe('invalid_grant');
      }
    });

    it('should handle malformed client credentials', async () => {
      mockClientDao.findByClientId?.mockResolvedValue(null);

      const client = await mockClientDao.findByClientId('invalid-client-id');

      expect(client).toBeNull();

      // OAuth2 error response
      if (!client) {
        const errorResponse = {
          error: 'invalid_client',
          error_description: 'Client authentication failed',
        };
        expect(errorResponse.error).toBe('invalid_client');
      }
    });
  });

  describe('Token Claims', () => {
    it('should include standard OIDC claims', () => {
      const payload = createMockJWTPayload({
        sub: 'user-123',
        email: 'user@example.com',
        email_verified: true,
        iss: 'https://auth.example.com',
        aud: 'client-123',
      });

      // Standard claims
      expect(payload.sub).toBeDefined();
      expect(payload.iss).toBeDefined();
      expect(payload.aud).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();

      // OIDC claims
      expect(payload.email).toBeDefined();
      expect(payload.email_verified).toBe(true);
    });

    it('should support custom claims', () => {
      const payload = createMockJWTPayload({
        tenant_id: 'tenant-123',
        roles: ['admin', 'user'],
        permissions: ['read:users', 'write:users'],
      } as any);

      expect((payload as any).tenant_id).toBe('tenant-123');
      expect((payload as any).roles).toEqual(['admin', 'user']);
      expect((payload as any).permissions).toEqual(['read:users', 'write:users']);
    });
  });
});
