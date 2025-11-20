import {
    containsScope,
    authorizeByScopeAndTenant,
    WithAuthorizationByScopeAndTenant,
    filterResultsByTenant,
    ServiceAuthorizationWrapper
} from '@/utils/authz-utils';
import { Scope, ErrorDetail } from '@/graphql/generated/graphql-types';
import { OIDCContext } from '@/graphql/graphql-context';
import { ERROR_CODES } from '@/lib/models/error';
import { GraphQLError } from 'graphql/error/GraphQLError';

describe('authz-utils', () => {
    describe('containsScope', () => {
        const mockScopes: Scope[] = [
            { scopeName: 'user.read', scopeDescription: 'Read users', scopeId: 'scope-1', scopeUsage: 'IAM_MANAGEMENT' },
            { scopeName: 'user.write', scopeDescription: 'Write users', scopeId: 'scope-2', scopeUsage: 'IAM_MANAGEMENT' },
            { scopeName: 'tenant.read', scopeDescription: 'Read tenants', scopeId: 'scope-3', scopeUsage: 'IAM_MANAGEMENT' }
        ];

        it('should return true when single scope string exists in available scopes', () => {
            const result = containsScope('user.read', mockScopes);
            expect(result).toBe(true);
        });

        it('should return false when single scope string does not exist in available scopes', () => {
            const result = containsScope('admin.delete', mockScopes);
            expect(result).toBe(false);
        });

        it('should return true when at least one scope from array exists in available scopes', () => {
            const result = containsScope(['user.read', 'admin.delete'], mockScopes);
            expect(result).toBe(true);
        });

        it('should return false when no scope from array exists in available scopes', () => {
            const result = containsScope(['admin.delete', 'system.admin'], mockScopes);
            expect(result).toBe(false);
        });

        it('should return false when available scopes is null', () => {
            const result = containsScope('user.read', null);
            expect(result).toBe(false);
        });

        it('should return false when available scopes is undefined', () => {
            const result = containsScope('user.read', undefined);
            expect(result).toBe(false);
        });

        it('should return false when available scopes is empty array', () => {
            const result = containsScope('user.read', []);
            expect(result).toBe(false);
        });

        it('should return true when first scope in array matches', () => {
            const result = containsScope(['user.read', 'user.write'], mockScopes);
            expect(result).toBe(true);
        });

        it('should return true when last scope in array matches', () => {
            const result = containsScope(['admin.delete', 'system.admin', 'tenant.read'], mockScopes);
            expect(result).toBe(true);
        });

        it('should handle empty array of allowed scopes', () => {
            const result = containsScope([], mockScopes);
            expect(result).toBe(false);
        });
    });

    describe('authorizeByScopeAndTenant', () => {
        const mockRootTenant = {
            tenantId: 'root-tenant',
            tenantName: 'Root Tenant',
            tenantDescription: 'Root Tenant'
        };

        const mockScopes: Scope[] = [
            { scopeName: 'user.read', scopeDescription: 'Read users', scopeId: 'scope-1', scopeUsage: 'IAM_MANAGEMENT' },
            { scopeName: 'user.write', scopeDescription: 'Write users', scopeId: 'scope-2', scopeUsage: 'IAM_MANAGEMENT' }
        ];

        it('should return EC00002 when portalUserProfile is missing', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: null,
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', null);

            expect(result.isAuthorized).toBe(false);
            expect(result.errorDetail).toEqual(ERROR_CODES.EC00002);
        });

        it('should return EC00002 when portalUserProfile scope is missing', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    scope: null
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', null);

            expect(result.isAuthorized).toBe(false);
            expect(result.errorDetail).toEqual(ERROR_CODES.EC00002);
        });

        it('should return EC00003 when user does not have required scope', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'admin.delete', null);

            expect(result.isAuthorized).toBe(false);
            expect(result.errorDetail).toEqual(ERROR_CODES.EC00003);
        });

        it('should return authorized when root tenant user has required scope and no target tenant', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', null);

            expect(result.isAuthorized).toBe(true);
            expect(result.errorDetail).toEqual(ERROR_CODES.NULL_ERROR);
        });

        it('should return authorized when root tenant user has required scope with target tenant', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', 'tenant-123');

            expect(result.isAuthorized).toBe(true);
            expect(result.errorDetail).toEqual(ERROR_CODES.NULL_ERROR);
        });

        it('should return EC00005 when non-root tenant user has no target tenant', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', null);

            expect(result.isAuthorized).toBe(false);
            expect(result.errorDetail).toEqual(ERROR_CODES.EC00005);
        });

        it('should return EC00004 when non-root tenant user accesses different tenant', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', 'tenant-456');

            expect(result.isAuthorized).toBe(false);
            expect(result.errorDetail).toEqual(ERROR_CODES.EC00004);
        });

        it('should return authorized when non-root tenant user accesses their own tenant', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, 'user.read', 'tenant-123');

            expect(result.isAuthorized).toBe(true);
            expect(result.errorDetail).toEqual(ERROR_CODES.NULL_ERROR);
        });

        it('should work with array of allowed scopes', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, ['user.read', 'user.write'], null);

            expect(result.isAuthorized).toBe(true);
            expect(result.errorDetail).toEqual(ERROR_CODES.NULL_ERROR);
        });

        it('should return EC00003 when none of the scopes in array match', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = authorizeByScopeAndTenant(oidcContext, ['admin.delete', 'system.admin'], null);

            expect(result.isAuthorized).toBe(false);
            expect(result.errorDetail).toEqual(ERROR_CODES.EC00003);
        });
    });

    describe('WithAuthorizationByScopeAndTenant', () => {
        const mockRootTenant = {
            tenantId: 'root-tenant',
            tenantName: 'Root Tenant',
            tenantDescription: 'Root Tenant'
        };

        const mockScopes: Scope[] = [
            { scopeName: 'user.read', scopeDescription: 'Read users', scopeId: 'scope-1', scopeUsage: 'IAM_MANAGEMENT' }
        ];

        it('should execute operation when authorized', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockOperation = jest.fn().mockResolvedValue({ data: 'test result' });

            const wrappedFunction = WithAuthorizationByScopeAndTenant({
                performOperation: mockOperation
            });

            const result = await wrappedFunction(oidcContext, 'user.read', null);

            expect(mockOperation).toHaveBeenCalledWith(oidcContext);
            expect(result).toEqual({ data: 'test result' });
        });

        it('should throw GraphQLError when not authorized due to missing profile', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: null,
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockOperation = jest.fn();

            const wrappedFunction = WithAuthorizationByScopeAndTenant({
                performOperation: mockOperation
            });

            await expect(wrappedFunction(oidcContext, 'user.read', null))
                .rejects
                .toThrow(GraphQLError);

            expect(mockOperation).not.toHaveBeenCalled();
        });

        it('should throw GraphQLError with correct error detail when missing scope', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockOperation = jest.fn();

            const wrappedFunction = WithAuthorizationByScopeAndTenant({
                performOperation: mockOperation
            });

            try {
                await wrappedFunction(oidcContext, 'admin.delete', null);
                fail('Should have thrown GraphQLError');
            } catch (error) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect((error as GraphQLError).extensions.errorDetail).toEqual(ERROR_CODES.EC00003);
            }

            expect(mockOperation).not.toHaveBeenCalled();
        });

        it('should throw GraphQLError when non-root tenant accesses wrong tenant', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockOperation = jest.fn();

            const wrappedFunction = WithAuthorizationByScopeAndTenant({
                performOperation: mockOperation
            });

            try {
                await wrappedFunction(oidcContext, 'user.read', 'tenant-456');
                fail('Should have thrown GraphQLError');
            } catch (error) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect((error as GraphQLError).extensions.errorDetail).toEqual(ERROR_CODES.EC00004);
            }

            expect(mockOperation).not.toHaveBeenCalled();
        });

        it('should return null when operation returns null', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockOperation = jest.fn().mockResolvedValue(null);

            const wrappedFunction = WithAuthorizationByScopeAndTenant({
                performOperation: mockOperation
            });

            const result = await wrappedFunction(oidcContext, 'user.read', null);

            expect(result).toBeNull();
        });
    });

    describe('filterResultsByTenant', () => {
        const mockRootTenant = {
            tenantId: 'root-tenant',
            tenantName: 'Root Tenant',
            tenantDescription: 'Root Tenant'
        };

        interface TestItem {
            id: string;
            tenantId: string;
            data: string;
        }

        const mockResults: TestItem[] = [
            { id: '1', tenantId: 'tenant-123', data: 'item1' },
            { id: '2', tenantId: 'tenant-456', data: 'item2' },
            { id: '3', tenantId: 'tenant-123', data: 'item3' },
            { id: '4', tenantId: 'tenant-789', data: 'item4' }
        ];

        const getTenantId = (item: TestItem) => item.tenantId;

        it('should return all results for root tenant user', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant'
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = filterResultsByTenant(mockResults, oidcContext, getTenantId);

            expect(result).toHaveLength(4);
            expect(result).toEqual(mockResults);
        });

        it('should filter results for non-root tenant user', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123'
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = filterResultsByTenant(mockResults, oidcContext, getTenantId);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('3');
            expect(result.every(item => item.tenantId === 'tenant-123')).toBe(true);
        });

        it('should return empty array when no results match non-root tenant', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-999'
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = filterResultsByTenant(mockResults, oidcContext, getTenantId);

            expect(result).toHaveLength(0);
        });

        it('should handle empty results array', () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123'
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = filterResultsByTenant([], oidcContext, getTenantId);

            expect(result).toHaveLength(0);
        });

        it('should work with different getTenantId functions', () => {
            interface DifferentItem {
                itemId: string;
                ownerTenantId: string;
            }

            const differentResults: DifferentItem[] = [
                { itemId: 'a', ownerTenantId: 'tenant-123' },
                { itemId: 'b', ownerTenantId: 'tenant-456' }
            ];

            const customGetTenantId = (item: DifferentItem) => item.ownerTenantId;

            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123'
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const result = filterResultsByTenant(differentResults, oidcContext, customGetTenantId);

            expect(result).toHaveLength(1);
            expect(result[0].itemId).toBe('a');
        });
    });

    describe('ServiceAuthorizationWrapper', () => {
        const mockRootTenant = {
            tenantId: 'root-tenant',
            tenantName: 'Root Tenant',
            tenantDescription: 'Root Tenant'
        };

        const mockScopes: Scope[] = [
            { scopeName: 'user.read', scopeDescription: 'Read users', scopeId: 'scope-1', scopeUsage: 'IAM_MANAGEMENT' }
        ];

        it('should execute operation when authorized with minimal options', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation
            });

            const result = await wrappedFunction(oidcContext, 'user.read', 'arg1', 'arg2');

            expect(mockPerformOperation).toHaveBeenCalledWith(oidcContext, 'arg1', 'arg2');
            expect(result).toEqual({ data: 'test' });
        });

        it('should throw error when portalUserProfile is missing', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: null,
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn();

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation
            });

            try {
                await wrappedFunction(oidcContext, 'user.read');
                fail('Should have thrown GraphQLError');
            } catch (error) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect((error as GraphQLError).message).toBe(ERROR_CODES.EC00002.errorMessage);
                expect((error as GraphQLError).extensions.errorDetail).toEqual(ERROR_CODES.EC00002);
            }

            expect(mockPerformOperation).not.toHaveBeenCalled();
        });

        it('should throw error when user does not have required scope', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn();

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation
            });

            try {
                await wrappedFunction(oidcContext, 'admin.delete');
                fail('Should have thrown GraphQLError');
            } catch (error) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect((error as GraphQLError).message).toBe(ERROR_CODES.EC00003.errorMessage);
                expect((error as GraphQLError).extensions.errorDetail).toEqual(ERROR_CODES.EC00003);
            }

            expect(mockPerformOperation).not.toHaveBeenCalled();
        });

        it('should call preProcess and use overridden arguments', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPreProcess = jest.fn().mockResolvedValue(['overridden-arg1', 'overridden-arg2']);
            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });

            const wrappedFunction = ServiceAuthorizationWrapper({
                preProcess: mockPreProcess,
                performOperation: mockPerformOperation
            });

            await wrappedFunction(oidcContext, 'user.read', 'original-arg1', 'original-arg2');

            expect(mockPreProcess).toHaveBeenCalledWith(oidcContext, 'original-arg1', 'original-arg2');
            expect(mockPerformOperation).toHaveBeenCalledWith(oidcContext, 'overridden-arg1', 'overridden-arg2');
        });

        it('should call preProcess and partially override arguments', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPreProcess = jest.fn().mockResolvedValue({ 1: 'overridden-arg2' });
            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });

            const wrappedFunction = ServiceAuthorizationWrapper({
                preProcess: mockPreProcess,
                performOperation: mockPerformOperation
            });

            await wrappedFunction(oidcContext, 'user.read', 'original-arg1', 'original-arg2');

            expect(mockPerformOperation).toHaveBeenCalledWith(oidcContext, 'original-arg1', 'overridden-arg2');
        });

        it('should call additionalConstraintCheck for non-root tenant users', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });
            const mockAdditionalConstraintCheck = jest.fn().mockResolvedValue({
                isAuthorized: true,
                errorDetail: ERROR_CODES.NULL_ERROR
            });

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation,
                additionalConstraintCheck: mockAdditionalConstraintCheck
            });

            await wrappedFunction(oidcContext, 'user.read');

            expect(mockAdditionalConstraintCheck).toHaveBeenCalledWith(oidcContext, { data: 'test' });
        });

        it('should NOT call additionalConstraintCheck for root tenant users', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });
            const mockAdditionalConstraintCheck = jest.fn();

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation,
                additionalConstraintCheck: mockAdditionalConstraintCheck
            });

            await wrappedFunction(oidcContext, 'user.read');

            expect(mockAdditionalConstraintCheck).not.toHaveBeenCalled();
        });

        it('should throw error when additionalConstraintCheck fails', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });
            const mockAdditionalConstraintCheck = jest.fn().mockResolvedValue({
                isAuthorized: false,
                errorDetail: ERROR_CODES.EC00004
            });

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation,
                additionalConstraintCheck: mockAdditionalConstraintCheck
            });

            try {
                await wrappedFunction(oidcContext, 'user.read');
                fail('Should have thrown GraphQLError');
            } catch (error) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect((error as GraphQLError).message).toBe(ERROR_CODES.EC00004.errorMessage);
                expect((error as GraphQLError).extensions.errorDetail).toEqual(ERROR_CODES.EC00004);
            }
        });

        it('should call postProcess when provided', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });
            const mockPostProcess = jest.fn().mockResolvedValue({ data: 'modified' });

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation,
                postProcess: mockPostProcess
            });

            const result = await wrappedFunction(oidcContext, 'user.read');

            expect(mockPostProcess).toHaveBeenCalledWith(oidcContext, { data: 'test' });
            // Note: postProcess return value is not used, original result is returned
            expect(result).toEqual({ data: 'test' });
        });

        it('should call all lifecycle hooks in correct order', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const callOrder: string[] = [];

            const mockPreProcess = jest.fn().mockImplementation(async () => {
                callOrder.push('preProcess');
                return {};
            });

            const mockPerformOperation = jest.fn().mockImplementation(async () => {
                callOrder.push('performOperation');
                return { data: 'test' };
            });

            const mockAdditionalConstraintCheck = jest.fn().mockImplementation(async () => {
                callOrder.push('additionalConstraintCheck');
                return { isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR };
            });

            const mockPostProcess = jest.fn().mockImplementation(async () => {
                callOrder.push('postProcess');
                return null;
            });

            const wrappedFunction = ServiceAuthorizationWrapper({
                preProcess: mockPreProcess,
                performOperation: mockPerformOperation,
                additionalConstraintCheck: mockAdditionalConstraintCheck,
                postProcess: mockPostProcess
            });

            await wrappedFunction(oidcContext, 'user.read', 'arg1');

            expect(callOrder).toEqual([
                'preProcess',
                'performOperation',
                'additionalConstraintCheck',
                'postProcess'
            ]);
        });

        it('should handle null result from operation', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue(null);

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation
            });

            const result = await wrappedFunction(oidcContext, 'user.read');

            expect(result).toBeNull();
        });

        it('should pass null result to additionalConstraintCheck', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'tenant-123',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue(null);
            const mockAdditionalConstraintCheck = jest.fn().mockResolvedValue({
                isAuthorized: true,
                errorDetail: ERROR_CODES.NULL_ERROR
            });

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation,
                additionalConstraintCheck: mockAdditionalConstraintCheck
            });

            await wrappedFunction(oidcContext, 'user.read');

            expect(mockAdditionalConstraintCheck).toHaveBeenCalledWith(oidcContext, null);
        });

        it('should work with array of allowed scopes', async () => {
            const oidcContext: OIDCContext = {
                portalUserProfile: {
                    userId: 'user-123',
                    managementAccessTenantId: 'root-tenant',
                    scope: mockScopes
                },
                rootTenant: mockRootTenant
            } as OIDCContext;

            const mockPerformOperation = jest.fn().mockResolvedValue({ data: 'test' });

            const wrappedFunction = ServiceAuthorizationWrapper({
                performOperation: mockPerformOperation
            });

            const result = await wrappedFunction(oidcContext, ['user.read', 'user.write']);

            expect(mockPerformOperation).toHaveBeenCalled();
            expect(result).toEqual({ data: 'test' });
        });
    });
});
