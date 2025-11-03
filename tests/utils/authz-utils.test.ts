/**
 * Tests for Authorization Utilities
 *
 * Tests the actual authorization utility functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  containsScope,
  authorizeByScopeAndTenant,
  filterResultsByTenant,
} from '@/utils/authz-utils';
import { createMockScope, createMockOIDCContext, createMockUser, createMockTenant, createMockPortalUserProfile } from '../utils/test-data-factory';
import { Scope } from '@/graphql/generated/graphql-types';

describe('Authorization Utilities', () => {
  describe('containsScope', () => {
    const mockScopes: Scope[] = [
      createMockScope({ scopeName: 'user:read' }),
      createMockScope({ scopeName: 'user:write' }),
      createMockScope({ scopeName: 'admin:read' }),
      createMockScope({ scopeName: 'admin:write' }),
    ];

    it('should return true when user has the required scope (string)', () => {
      const result = containsScope('user:read', mockScopes);
      expect(result).toBe(true);
    });

    it('should return false when user does not have the required scope (string)', () => {
      const result = containsScope('superadmin:write', mockScopes);
      expect(result).toBe(false);
    });

    it('should return true when user has at least one of the required scopes (array)', () => {
      const result = containsScope(['user:read', 'superadmin:write'], mockScopes);
      expect(result).toBe(true);
    });

    it('should return false when user has none of the required scopes (array)', () => {
      const result = containsScope(['superadmin:read', 'superadmin:write'], mockScopes);
      expect(result).toBe(false);
    });

    it('should return false when availableScopes is null', () => {
      const result = containsScope('user:read', null);
      expect(result).toBe(false);
    });

    it('should return false when availableScopes is undefined', () => {
      const result = containsScope('user:read', undefined);
      expect(result).toBe(false);
    });

    it('should return false when availableScopes is empty array', () => {
      const result = containsScope('user:read', []);
      expect(result).toBe(false);
    });

    it('should handle exact scope name matching', () => {
      expect(containsScope('user:read', mockScopes)).toBe(true);
      expect(containsScope('user:rea', mockScopes)).toBe(false);
      expect(containsScope('user:reads', mockScopes)).toBe(false);
    });

    it('should work with multiple scopes in array - all missing', () => {
      const result = containsScope(['missing:scope1', 'missing:scope2', 'missing:scope3'], mockScopes);
      expect(result).toBe(false);
    });

    it('should work with multiple scopes in array - first one matches', () => {
      const result = containsScope(['user:read', 'missing:scope'], mockScopes);
      expect(result).toBe(true);
    });

    it('should work with multiple scopes in array - last one matches', () => {
      const result = containsScope(['missing:scope', 'admin:write'], mockScopes);
      expect(result).toBe(true);
    });
  });

  describe('authorizeByScopeAndTenant', () => {
    const rootTenantId = 'root-tenant-id';
    const userTenantId = 'user-tenant-id';
    const targetTenantId = 'target-tenant-id';

    it('should authorize when user has required scope and is root tenant', () => {
      const mockUser = createMockUser({
        managementAccessTenantId: rootTenantId,
      });

      const mockContext = createMockOIDCContext({
        portalUserProfile: {
          ...mockUser,
          scope: [
            createMockScope({ scopeName: 'user:read' }),
            createMockScope({ scopeName: 'user:write' }),
          ],
          managementAccessTenantId: rootTenantId,
        } as any,
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(mockContext, 'user:read', targetTenantId);

      expect(result.isAuthorized).toBe(true);
      expect(result.errorDetail.errorCode).toBe('NULL'); // Error code is 'NULL' not 'NULL_ERROR'
    });

    it('should authorize when user has scope and accesses their own tenant', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: [createMockScope({ scopeName: 'user:read' })],
          managementAccessTenantId: userTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(mockContext, 'user:read', userTenantId);

      expect(result.isAuthorized).toBe(true);
    });

    it('should deny when user has no profile', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: null,
      });

      const result = authorizeByScopeAndTenant(mockContext, 'user:read', targetTenantId);

      expect(result.isAuthorized).toBe(false);
      expect(result.errorDetail.errorCode).toBe('EC00002');
    });

    it('should deny when user has no scopes', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: null,
        }),
      });

      const result = authorizeByScopeAndTenant(mockContext, 'user:read', targetTenantId);

      expect(result.isAuthorized).toBe(false);
      expect(result.errorDetail.errorCode).toBe('EC00002');
    });

    it('should deny when user does not have required scope', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: [createMockScope({ scopeName: 'user:read' })],
          managementAccessTenantId: rootTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(mockContext, 'admin:write', targetTenantId);

      expect(result.isAuthorized).toBe(false);
      expect(result.errorDetail.errorCode).toBe('EC00003');
    });

    it('should deny when non-root user tries to access different tenant', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: [createMockScope({ scopeName: 'user:read' })],
          managementAccessTenantId: userTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(mockContext, 'user:read', targetTenantId);

      expect(result.isAuthorized).toBe(false);
      expect(result.errorDetail.errorCode).toBe('EC00004');
    });

    it('should deny when non-root user does not provide target tenant', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: [createMockScope({ scopeName: 'user:read' })],
          managementAccessTenantId: userTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(mockContext, 'user:read', null);

      expect(result.isAuthorized).toBe(false);
      expect(result.errorDetail.errorCode).toBe('EC00005');
    });

    it('should authorize with array of scopes when user has at least one', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: [createMockScope({ scopeName: 'user:read' })],
          managementAccessTenantId: rootTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(
        mockContext,
        ['admin:write', 'user:read'],
        targetTenantId
      );

      expect(result.isAuthorized).toBe(true);
    });

    it('should deny with array of scopes when user has none', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          scope: [createMockScope({ scopeName: 'user:read' })],
          managementAccessTenantId: rootTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const result = authorizeByScopeAndTenant(
        mockContext,
        ['admin:write', 'admin:read'],
        targetTenantId
      );

      expect(result.isAuthorized).toBe(false);
      expect(result.errorDetail.errorCode).toBe('EC00003');
    });
  });

  describe('filterResultsByTenant', () => {
    interface TestItem {
      id: string;
      tenantId: string;
      name: string;
    }

    const rootTenantId = 'root-tenant-id';
    const userTenantId = 'user-tenant-id';
    const otherTenantId = 'other-tenant-id';

    const testItems: TestItem[] = [
      { id: '1', tenantId: userTenantId, name: 'Item 1' },
      { id: '2', tenantId: userTenantId, name: 'Item 2' },
      { id: '3', tenantId: otherTenantId, name: 'Item 3' },
      { id: '4', tenantId: rootTenantId, name: 'Item 4' },
    ];

    const getTenantId = (item: TestItem) => item.tenantId;

    it('should return all results for root tenant user', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: {
          ...createMockUser(),
          managementAccessTenantId: rootTenantId,
        } as any,
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const filtered = filterResultsByTenant(testItems, mockContext, getTenantId);

      expect(filtered).toHaveLength(4);
      expect(filtered).toEqual(testItems);
    });

    it('should filter results to only user tenant for non-root user', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          managementAccessTenantId: userTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const filtered = filterResultsByTenant(testItems, mockContext, getTenantId);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(item => item.tenantId === userTenantId)).toBe(true);
      expect(filtered.map(item => item.id)).toEqual(['1', '2']);
    });

    it('should return empty array when non-root user has no items in their tenant', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          managementAccessTenantId: 'tenant-with-no-items',
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const filtered = filterResultsByTenant(testItems, mockContext, getTenantId);

      expect(filtered).toHaveLength(0);
      expect(filtered).toEqual([]);
    });

    it('should handle empty input array', () => {
      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          managementAccessTenantId: userTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const filtered = filterResultsByTenant([], mockContext, getTenantId);

      expect(filtered).toEqual([]);
    });

    it('should work with different object structures using getTenantId function', () => {
      interface DifferentItem {
        identifier: string;
        tenant: string;
      }

      const differentItems: DifferentItem[] = [
        { identifier: 'a', tenant: userTenantId },
        { identifier: 'b', tenant: otherTenantId },
      ];

      const mockContext = createMockOIDCContext({
        portalUserProfile: createMockPortalUserProfile({
          managementAccessTenantId: userTenantId,
        }),
        rootTenant: createMockTenant({ tenantId: rootTenantId }),
      });

      const filtered = filterResultsByTenant(
        differentItems,
        mockContext,
        (item) => item.tenant
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].identifier).toBe('a');
    });
  });
});
