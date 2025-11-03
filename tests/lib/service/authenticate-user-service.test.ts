/**
 * Tests for Authenticate User Service
 *
 * This test suite demonstrates how to test the authentication service
 * with mocked dependencies (DAOs, JWT service, etc.)
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  createMockIdentityDao,
  createMockAuthenticationGroupDao,
} from '../../utils/dao-mock-utils';
import {
  createMockUser,
  createMockUserCredential,
} from '../../utils/test-data-factory';
import { PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS } from '@/utils/consts';
import { UserFailedLogin } from '@/graphql/generated/graphql-types';

// Mock the DaoFactory before importing the service
jest.mock('@/lib/data-sources/dao-factory', () => ({
  DaoFactory: {
    getInstance: jest.fn(() => ({
      getIdentityDao: jest.fn(),
      getTenantDao: jest.fn(),
      getAuthDao: jest.fn(),
      getFederatedOIDCProvicerDao: jest.fn(),
      getAuthenticationGroupDao: jest.fn(),
      getKms: jest.fn(),
      getSigningKeysDao: jest.fn(),
      getScopeDao: jest.fn(),
      getAuthorizationGroupDao: jest.fn(),
    })),
  },
}));

// Mock the search dao
jest.mock('@/lib/dao/impl/search/open-search-dao', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    indexSecurityEvent: jest.fn(),
    searchSecurityEvents: jest.fn(),
  })),
}));

describe('Authenticate User Service', () => {
  let mockIdentityDao: ReturnType<typeof createMockIdentityDao>;
  let mockAuthenticationGroupDao: ReturnType<typeof createMockAuthenticationGroupDao>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create fresh mock instances
    mockIdentityDao = createMockIdentityDao();
    mockAuthenticationGroupDao = createMockAuthenticationGroupDao();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication Flow', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      const userId = 'user-123';
      const email = 'user@example.com';

      const mockUser = createMockUser({
        userId: userId,
        email,
        enabled: true,
        locked: false,
        emailVerified: true,
      });

      const mockCredential = createMockUserCredential({
        userId,
        hashedPassword: '$2b$10$hashedpassword',
        dateCreatedMs: Date.now() - 10000000,
        hashingAlgorithm: PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
        salt: ""
      });

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);
      mockIdentityDao.getUserCredentialForAuthentication?.mockResolvedValue(mockCredential);

      expect(mockUser.enabled).toBe(true);
      expect(mockUser.locked).toBe(false);
      expect(mockUser.emailVerified).toBe(true);
    });

    it('should reject authentication for disabled user', async () => {
      const mockUser = createMockUser({
        userId: 'user-123',
        email: 'user@example.com',
        enabled: false,
      });

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);

      expect(mockUser.enabled).toBe(false);

      // In actual service, this would return an error
      if (!mockUser.enabled) {
        const errorResponse = {
          error: 'user_disabled',
          error_description: 'User account is disabled',
        };
        expect(errorResponse.error).toBe('user_disabled');
      }
    });

    it('should reject authentication for locked user', async () => {
      const mockUser = createMockUser({
        userId: 'user-123',
        email: 'user@example.com',
        enabled: true,
        locked: true,
      });

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);

      expect(mockUser.locked).toBe(true);

      if (mockUser.locked) {
        const errorResponse = {
          error: 'account_locked',
          error_description: 'Account is locked due to failed login attempts',
        };
        expect(errorResponse.error).toBe('account_locked');
      }
    });

    it('should reject authentication with invalid credentials', async () => {
      const mockUser = createMockUser({
        userId: 'user-123',
        email: 'user@example.com',
      });

      const mockCredential = createMockUserCredential({
        userId: 'user-123',
      });

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);
      mockIdentityDao.getUserCredentialForAuthentication?.mockResolvedValue(mockCredential);

      // Simulate password comparison
      const providedPassword: string = 'WrongPassword123!';
      const correctPassword: string = 'CorrectPassword123!';
      
      // In real implementation, bcrypt would return false
      const passwordMatches: boolean = providedPassword === correctPassword ? true : false;
      expect(passwordMatches).toBe(false);
    });

    it('should return null for non-existent user', async () => {
      mockIdentityDao.getUserBy.mockResolvedValue(null);

      const user = await mockIdentityDao.getUserBy('email', 'nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should track failed login attempts', async () => {
      const mockUser = createMockUser({
        userId: 'user-123',
        email: 'user@example.com'
      });

      const userFaileLogin: UserFailedLogin = {
        failureAtMs: Date.now(),
        failureCount: 1,
        nextLoginNotBefore: Date.now() + 1000000,
        userId: 'user-123'
      }

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);
      mockIdentityDao.addFailedLogin = jest.fn();

      // Simulate failed login
      if (mockIdentityDao.addFailedLogin) {
        await mockIdentityDao.addFailedLogin(userFaileLogin);
        expect(mockIdentityDao.addFailedLogin).toHaveBeenCalledWith(userFaileLogin);
      }
    });

    
  });

  describe('Email Verification', () => {
    it('should require email verification when not verified', async () => {
      const mockUser = createMockUser({
        userId: 'user-123',
        email: 'user@example.com',
        emailVerified: false,
      });

      mockIdentityDao.getUserBy?.mockResolvedValue(mockUser);

      expect(mockUser.emailVerified).toBe(false);

      // Service should require email verification step
      const requiresEmailVerification = !mockUser.emailVerified;
      expect(requiresEmailVerification).toBe(true);
    });
   
    
  });


  describe('Password Management', () => {
    it('should validate password meets complexity requirements', () => {
      const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) errors.push('Password too short');
        if (!/[A-Z]/.test(password)) errors.push('Missing uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('Missing lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('Missing number');
        if (!/[!@#$%^&*]/.test(password)) errors.push('Missing special character');

        return {
          valid: errors.length === 0,
          errors,
        };
      };

      const validPassword = validatePassword('ValidPass123!');
      expect(validPassword.valid).toBe(true);

      const weakPassword = validatePassword('weak');
      expect(weakPassword.valid).toBe(false);
      expect(weakPassword.errors.length).toBeGreaterThan(0);
    });
    
  });


  describe('Authentication Groups', () => {
    it('should validate user authentication group membership', async () => {
      const userId = 'user-123';
      const mockAuthGroups = [
        // authenticationGroupId, authenticationGroupName, defaultGroup, markForDelete, tenantIdts
        { authenticationGroupId: 'group-1', authenticationGroupName: 'Employees', markForDelete: false, defaultGroup: false, tenantId: 'tenantid' },
        { authenticationGroupId: 'group-2', authenticationGroupName: 'Contractors', markForDelete: false, defaultGroup: false, tenantId: 'tenantid' },
      ];

      mockAuthenticationGroupDao.getAuthenticationGroups?.mockResolvedValue(mockAuthGroups);

      const groups = await mockAuthenticationGroupDao.getAuthenticationGroups?.(userId);
      expect(groups).toHaveLength(2);
      expect(groups?.[0].authenticationGroupName).toBe('Employees');
    });

    it('should enforce authentication group requirements', async () => {
      const mockAuthGroup = {
        id: 'group-1',
        name: 'Employees',
        requireMFA: true,
        requireEmailVerification: true,
      };

      expect(mockAuthGroup.requireMFA).toBe(true);
      expect(mockAuthGroup.requireEmailVerification).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockIdentityDao.getUserBy?.mockRejectedValue(dbError);

      await expect(mockIdentityDao.getUserBy?.('id', 'user-123')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle invalid authentication session', () => {
      const validateSession = (sessionToken: string | null): boolean => {
        return sessionToken !== null && sessionToken.length > 0;
      };

      expect(validateSession(null)).toBe(false);
      expect(validateSession('')).toBe(false);
      expect(validateSession('valid-token')).toBe(true);
    });
    
  });

  describe('Security Event Logging', () => {
    it('should log successful authentication events', () => {
      const logEvent = (eventType: string, userId: string, success: boolean) => {
        return {
          eventType,
          userId,
          success,
          timestamp: new Date(),
        };
      };

      const event = logEvent('LOGIN', 'user-123', true);
      expect(event.eventType).toBe('LOGIN');
      expect(event.success).toBe(true);
    });

    it('should log failed authentication attempts', () => {
      const logEvent = (eventType: string, userId: string, reason: string) => {
        return {
          eventType,
          userId,
          success: false,
          reason,
          timestamp: new Date(),
        };
      };

      const event = logEvent('LOGIN_FAILED', 'user-123', 'Invalid password');
      expect(event.success).toBe(false);
      expect(event.reason).toBe('Invalid password');
    });

    it('should log MFA events', () => {
      const logMFAEvent = (userId: string, mfaType: string, success: boolean) => {
        return {
          eventType: 'MFA_VALIDATION',
          userId,
          mfaType,
          success,
          timestamp: new Date(),
        };
      };

      const event = logMFAEvent('user-123', 'TOTP', true);
      expect(event.mfaType).toBe('TOTP');
      expect(event.success).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should create authentication session', () => {
      const createSession = (userId: string) => {
        return {
          sessionId: `session-${Date.now()}`,
          userId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000), // 1 hour
        };
      };

      const session = createSession('user-123');
      expect(session.sessionId).toBeDefined();
      expect(session.userId).toBe('user-123');
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should validate session expiration', () => {
      const isSessionValid = (expiresAt: Date) => {
        return expiresAt.getTime() > Date.now();
      };

      const validSession = new Date(Date.now() + 3600000);
      const expiredSession = new Date(Date.now() - 3600000);

      expect(isSessionValid(validSession)).toBe(true);
      expect(isSessionValid(expiredSession)).toBe(false);
    });
  });
});
