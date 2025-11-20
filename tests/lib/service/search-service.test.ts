// IMPORTANT: Set up setImmediate polyfill BEFORE any imports
// This is required for the OpenSearch client library
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
    (global as any).clearImmediate = (id: any) => clearTimeout(id);
}

// Mock the entire OpenSearch module to avoid loading it
jest.mock('@opensearch-project/opensearch', () => ({
    Client: jest.fn()
}));

// Mock the data sources that depend on OpenSearch
jest.mock('@/lib/data-sources/search', () => ({
    searchClient: {},
    getOpenSearchClient: jest.fn(() => ({}))
}));

// Mock SearchDao before imports
jest.mock('@/lib/dao/impl/search/open-search-dao', () => {
    const mockImpl = {
        objectSearch: jest.fn(),
        relSearch: jest.fn(),
        getObjectSearchByIds: jest.fn()
    };
    // Store reference for later access
    (global as any).__mockSearchDaoImpl = mockImpl;
    return jest.fn().mockImplementation(() => mockImpl);
});

import SearchService from '@/lib/service/search-service';
import { OIDCContext } from '@/graphql/graphql-context';
import {
    SearchInput,
    ObjectSearchResults,
    RelSearchInput,
    RelSearchResults,
    SearchResultType,
    ObjectSearchResultItem
} from '@/graphql/generated/graphql-types';

// Get the mock implementation
const mockSearchDaoImpl = (global as any).__mockSearchDaoImpl;

describe('SearchService', () => {
    let service: SearchService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'root-tenant',
                managementAccessTenantId: 'root-tenant',
                preferredLanguageCode: 'en',
                scope: [
                    { scopeName: 'tenant.all.read' },
                    { scopeName: 'tenant.read' },
                    { scopeName: 'client.read' },
                    { scopeName: 'user.read' },
                    { scopeName: 'keys.read' },
                    { scopeName: 'authz.group.read' },
                    { scopeName: 'authn.group.read' },
                    { scopeName: 'federated.oidc.provider.read' },
                    { scopeName: 'scope.read' },
                    { scopeName: 'rate.limit.read' }
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

        service = new SearchService(mockContext);
        jest.clearAllMocks();
    });

    describe('search', () => {
        const mockSearchInput: SearchInput = {
            page: 1,
            perPage: 20,
            term: 'test',
            sortDirection: 'asc',
            sortField: 'name',
            resultType: SearchResultType.Client
        };

        const mockObjectSearchResults: ObjectSearchResults = {
            endtime: Date.now(),
            page: 1,
            perpage: 20,
            starttime: Date.now() - 1000,
            took: 50,
            total: 2,
            resultlist: [
                {
                    objectid: 'client-1',
                    name: 'Test Client 1',
                    objecttype: SearchResultType.Client,
                    owningtenantid: 'root-tenant'
                },
                {
                    objectid: 'client-2',
                    name: 'Test Client 2',
                    objecttype: SearchResultType.Client,
                    owningtenantid: 'root-tenant'
                }
            ]
        };

        it('should perform object search for root tenant user', async () => {
            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            const result = await service.search(mockSearchInput);

            expect(result).toEqual(mockObjectSearchResults);
            expect(mockSearchDaoImpl.objectSearch).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    perPage: 20,
                    term: 'test',
                    resultType: SearchResultType.Client
                }),
                []
            );
        });

        it('should perform rel search for non-root tenant user', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new SearchService(nonRootContext);

            const mockRelSearchResults: RelSearchResults = {
                endtime: Date.now(),
                page: 1,
                perpage: 20,
                starttime: Date.now() - 1000,
                took: 50,
                total: 2,
                resultlist: [
                    {
                        childid: 'client-1',
                        childname: 'Test Client 1',
                        childtype: SearchResultType.Client,
                        owningtenantid: 'tenant-123',
                        parentid: 'tenant-123'
                    }
                ]
            };

            const mockObjects: ObjectSearchResultItem[] = [
                {
                    objectid: 'client-1',
                    name: 'Test Client 1',
                    objecttype: SearchResultType.Client,
                    owningtenantid: 'tenant-123'
                }
            ];

            mockSearchDaoImpl.relSearch.mockResolvedValue(mockRelSearchResults);
            mockSearchDaoImpl.getObjectSearchByIds.mockResolvedValue(mockObjects);

            const result = await service.search(mockSearchInput);

            expect(result.total).toBe(2);
            expect(result.resultlist).toEqual(mockObjects);
            expect(mockSearchDaoImpl.relSearch).toHaveBeenCalled();
            expect(mockSearchDaoImpl.getObjectSearchByIds).toHaveBeenCalledWith(['client-1']);
        });

        it('should throw error when user lacks minimum required scopes', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'some.other.scope' }
                    ]
                }
            } as OIDCContext;

            service = new SearchService(unauthorizedContext);

            await expect(
                service.search(mockSearchInput)
            ).rejects.toThrow('EC00085');
        });

        it('should throw error when user lacks scope for specific result type', async () => {
            const limitedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'tenant.read' },
                        { scopeName: 'user.read' },
                        { scopeName: 'keys.read' },
                        { scopeName: 'authz.group.read' },
                        { scopeName: 'authn.group.read' },
                        { scopeName: 'federated.oidc.provider.read' },
                        { scopeName: 'scope.read' },
                        { scopeName: 'rate.limit.read' }
                        // Missing client.read scope AND tenant.all.read scope
                    ]
                }
            } as OIDCContext;

            service = new SearchService(limitedContext);

            await expect(
                service.search(mockSearchInput)
            ).rejects.toThrow('EC00087');
        });

        it('should clamp page to maximum allowed value', async () => {
            const inputWithLargePage = {
                ...mockSearchInput,
                page: 10001
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.search(inputWithLargePage);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.page).toBe(1);
        });

        it('should clamp page to minimum allowed value', async () => {
            const inputWithSmallPage = {
                ...mockSearchInput,
                page: 0
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.search(inputWithSmallPage);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.page).toBe(1);
        });

        it('should clamp perPage to maximum allowed value', async () => {
            const inputWithLargePerPage = {
                ...mockSearchInput,
                perPage: 2000
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.search(inputWithLargePerPage);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.perPage).toBe(1000);
        });

        it('should clamp perPage to minimum allowed value', async () => {
            const inputWithSmallPerPage = {
                ...mockSearchInput,
                perPage: 1
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.search(inputWithSmallPerPage);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.perPage).toBe(5);
        });

        it('should set sortDirection to null if invalid', async () => {
            const inputWithInvalidSort = {
                ...mockSearchInput,
                sortDirection: 'invalid' as any
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.search(inputWithInvalidSort);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.sortDirection).toBeNull();
        });

        it('should set sortField to null if invalid', async () => {
            const inputWithInvalidField = {
                ...mockSearchInput,
                sortField: 'invalid' as any
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.search(inputWithInvalidField);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.sortField).toBeNull();
        });

        it('should omit search types user does not have access to', async () => {
            const limitedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'tenant.read' },
                        { scopeName: 'client.read' },
                        { scopeName: 'user.read' },
                        { scopeName: 'keys.read' },
                        { scopeName: 'scope.read' }
                        // Missing: tenant.all.read, authz.group.read, authn.group.read, federated.oidc.provider.read, rate.limit.read
                    ]
                }
            } as OIDCContext;

            service = new SearchService(limitedContext);
            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            const inputWithoutResultType = {
                page: 1,
                perPage: 20,
                term: 'test'
            };

            await service.search(inputWithoutResultType);

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][1];
            // Should omit: AuthorizationGroup, AuthenticationGroup, OidcProvider, RateLimit
            expect(callArgs).toContain(SearchResultType.AuthorizationGroup);
            expect(callArgs).toContain(SearchResultType.AuthenticationGroup);
            expect(callArgs).toContain(SearchResultType.OidcProvider);
            expect(callArgs).toContain(SearchResultType.RateLimit);
            expect(callArgs.length).toBe(4);
        });
    });

    describe('relSearch', () => {
        const mockRelSearchInput: RelSearchInput = {
            page: 1,
            perPage: 20,
            owningtenantid: 'tenant-123',
            parentid: 'tenant-123',
            term: 'test',
            sortDirection: 'asc',
            sortField: 'childname',
            childtype: SearchResultType.Client
        };

        const mockRelSearchResults: RelSearchResults = {
            endtime: Date.now(),
            page: 1,
            perpage: 20,
            starttime: Date.now() - 1000,
            took: 50,
            total: 1,
            resultlist: [
                {
                    childid: 'client-1',
                    childname: 'Test Client 1',
                    childtype: SearchResultType.Client,
                    owningtenantid: 'tenant-123',
                    parentid: 'tenant-123'
                }
            ]
        };

        it('should perform rel search successfully', async () => {
            mockSearchDaoImpl.relSearch.mockResolvedValue(mockRelSearchResults);

            const result = await service.relSearch(mockRelSearchInput);

            expect(result).toEqual(mockRelSearchResults);
            expect(mockSearchDaoImpl.relSearch).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    perPage: 20,
                    term: 'test',
                    childtype: SearchResultType.Client
                }),
                []
            );
        });

        it('should throw error when user lacks minimum required scopes', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'some.other.scope' }
                    ]
                }
            } as OIDCContext;

            service = new SearchService(unauthorizedContext);

            await expect(
                service.relSearch(mockRelSearchInput)
            ).rejects.toThrow('EC00085');
        });

        it('should throw error when user lacks scope for specific child type', async () => {
            const limitedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'tenant.read' },
                        { scopeName: 'user.read' },
                        { scopeName: 'keys.read' },
                        { scopeName: 'authz.group.read' },
                        { scopeName: 'authn.group.read' },
                        { scopeName: 'federated.oidc.provider.read' },
                        { scopeName: 'scope.read' },
                        { scopeName: 'rate.limit.read' }
                        // Missing client.read scope AND tenant.all.read scope
                    ]
                }
            } as OIDCContext;

            service = new SearchService(limitedContext);

            await expect(
                service.relSearch(mockRelSearchInput)
            ).rejects.toThrow('EC00087');
        });

        it('should clamp page values', async () => {
            const inputWithInvalidPage = {
                ...mockRelSearchInput,
                page: 10001
            };

            mockSearchDaoImpl.relSearch.mockResolvedValue(mockRelSearchResults);

            await service.relSearch(inputWithInvalidPage);

            const callArgs = mockSearchDaoImpl.relSearch.mock.calls[0][0];
            expect(callArgs.page).toBe(1);
        });

        it('should clamp perPage values', async () => {
            const inputWithInvalidPerPage = {
                ...mockRelSearchInput,
                perPage: 2000
            };

            mockSearchDaoImpl.relSearch.mockResolvedValue(mockRelSearchResults);

            await service.relSearch(inputWithInvalidPerPage);

            const callArgs = mockSearchDaoImpl.relSearch.mock.calls[0][0];
            expect(callArgs.perPage).toBe(1000);
        });

        it('should default sortDirection to "asc" if invalid', async () => {
            const inputWithInvalidSort = {
                ...mockRelSearchInput,
                sortDirection: 'invalid' as any
            };

            mockSearchDaoImpl.relSearch.mockResolvedValue(mockRelSearchResults);

            await service.relSearch(inputWithInvalidSort);

            const callArgs = mockSearchDaoImpl.relSearch.mock.calls[0][0];
            expect(callArgs.sortDirection).toBe('asc');
        });

        it('should default sortField to "childname" if invalid', async () => {
            const inputWithInvalidField = {
                ...mockRelSearchInput,
                sortField: 'invalid' as any
            };

            mockSearchDaoImpl.relSearch.mockResolvedValue(mockRelSearchResults);

            await service.relSearch(inputWithInvalidField);

            const callArgs = mockSearchDaoImpl.relSearch.mock.calls[0][0];
            expect(callArgs.sortField).toBe('childname');
        });
    });

    describe('lookahead', () => {
        const mockObjectSearchResults: ObjectSearchResults = {
            endtime: Date.now(),
            page: 1,
            perpage: 10,
            starttime: Date.now() - 1000,
            took: 50,
            total: 3,
            resultlist: [
                {
                    objectid: 'client-1',
                    name: 'Test Client 1',
                    objecttype: SearchResultType.Client,
                    owningtenantid: 'root-tenant'
                },
                {
                    objectid: 'client-2',
                    name: 'Test Client 2',
                    objecttype: SearchResultType.Client,
                    owningtenantid: 'root-tenant'
                },
                {
                    objectid: 'user-1',
                    name: 'Test User',
                    objecttype: SearchResultType.User,
                    owningtenantid: 'root-tenant'
                }
            ]
        };

        it('should return lookahead results grouped by type', async () => {
            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            const result = await service.lookahead('test');

            expect(result).toHaveLength(2); // Client and User types

            const clientResults = result.find((r: any) => r.category === SearchResultType.Client);
            expect(clientResults).toBeDefined();
            expect(clientResults?.resultList).toHaveLength(2);
            expect(clientResults?.resultList[0].displayValue).toBe('Test Client 1');
            expect(clientResults?.resultList[0].id).toBe('client-1');

            const userResults = result.find((r: any) => r.category === SearchResultType.User);
            expect(userResults).toBeDefined();
            expect(userResults?.resultList).toHaveLength(1);
            expect(userResults?.resultList[0].displayValue).toBe('Test User');
        });

        it('should return empty array when no results found', async () => {
            const emptyResults: ObjectSearchResults = {
                ...mockObjectSearchResults,
                total: 0,
                resultlist: []
            };

            mockSearchDaoImpl.objectSearch.mockResolvedValue(emptyResults);

            const result = await service.lookahead('nonexistent');

            expect(result).toEqual([]);
        });

        it('should use fixed page size of 10', async () => {
            mockSearchDaoImpl.objectSearch.mockResolvedValue(mockObjectSearchResults);

            await service.lookahead('test');

            const callArgs = mockSearchDaoImpl.objectSearch.mock.calls[0][0];
            expect(callArgs.page).toBe(1);
            expect(callArgs.perPage).toBe(10);
        });

        it('should throw error when user lacks permissions', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'some.other.scope' }
                    ]
                }
            } as OIDCContext;

            service = new SearchService(unauthorizedContext);

            await expect(
                service.lookahead('test')
            ).rejects.toThrow('EC00085');
        });
    });

    describe('validatePermissions', () => {
        it('should return permitted for user with all required scopes', () => {
            const result = (service as any).validatePermissions(SearchResultType.Client);

            expect(result.isPermitted).toBe(true);
        });

        it('should return not permitted when user lacks minimum scopes', () => {
            const limitedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'some.other.scope' }
                    ]
                }
            } as OIDCContext;

            const limitedService = new SearchService(limitedContext);
            const result = (limitedService as any).validatePermissions(SearchResultType.Client);

            expect(result.isPermitted).toBe(false);
            expect(result.errorDetail.errorCode).toBe('EC00085');
        });

        it('should return not permitted when user lacks scope for specific result type', () => {
            const limitedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'tenant.read' },
                        { scopeName: 'user.read' },
                        { scopeName: 'keys.read' },
                        { scopeName: 'authz.group.read' },
                        { scopeName: 'authn.group.read' },
                        { scopeName: 'federated.oidc.provider.read' },
                        { scopeName: 'scope.read' },
                        { scopeName: 'rate.limit.read' }
                        // Missing client.read scope AND tenant.all.read scope
                    ]
                }
            } as OIDCContext;

            const limitedService = new SearchService(limitedContext);
            const result = (limitedService as any).validatePermissions(SearchResultType.Client);

            expect(result.isPermitted).toBe(false);
            expect(result.errorDetail.errorCode).toBe('EC00087');
        });

        it('should return permitted when resultType is null and user has minimum scopes', () => {
            const result = (service as any).validatePermissions(null);

            expect(result.isPermitted).toBe(true);
        });

        it('should return permitted when user has tenant.all.read scope', () => {
            const result = (service as any).validatePermissions(SearchResultType.Client);

            expect(result.isPermitted).toBe(true);
        });
    });

    describe('getSearchTypesToOmit', () => {
        it('should return empty array for user with tenant.all.read scope', () => {
            const result = (service as any).getSearchTypesToOmit();

            expect(result).toEqual([]);
        });

        it('should return array of types user lacks access to', () => {
            const limitedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [
                        { scopeName: 'tenant.read' },
                        { scopeName: 'client.read' },
                        { scopeName: 'user.read' }
                        // Missing: keys.read, authz.group.read, authn.group.read, federated.oidc.provider.read, scope.read, rate.limit.read
                    ]
                }
            } as OIDCContext;

            service = new SearchService(limitedContext);
            const result = (service as any).getSearchTypesToOmit();

            expect(result).toContain(SearchResultType.Key);
            expect(result).toContain(SearchResultType.AuthorizationGroup);
            expect(result).toContain(SearchResultType.AuthenticationGroup);
            expect(result).toContain(SearchResultType.OidcProvider);
            expect(result).toContain(SearchResultType.AccessControl);
            expect(result).toContain(SearchResultType.RateLimit);
            expect(result).not.toContain(SearchResultType.Client);
            expect(result).not.toContain(SearchResultType.User);
            expect(result).not.toContain(SearchResultType.Tenant);
        });
    });
});
