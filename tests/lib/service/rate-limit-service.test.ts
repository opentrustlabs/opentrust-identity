// Add global polyfills needed for Node.js modules in Jest environment
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
}

// Mock OpenSearch client before any imports
jest.mock('@/lib/data-sources/search', () => {
    const mockSearchClientImpl = {
        index: jest.fn(),
        delete: jest.fn(),
        search: jest.fn(),
        updateByQuery: jest.fn()
    };

    return {
        getOpenSearchClient: jest.fn(() => mockSearchClientImpl),
        __mockSearchClient: mockSearchClientImpl
    };
});

jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockRateLimitDaoImpl = {
        getRateLimitServiceGroups: jest.fn(),
        getRateLimitServiceGroupById: jest.fn(),
        createRateLimitServiceGroup: jest.fn(),
        updateRateLimitServiceGroup: jest.fn(),
        getRateLimitTenantRel: jest.fn(),
        getRateLimitTenantRelViews: jest.fn(),
        assignRateLimitToTenant: jest.fn(),
        updateRateLimitForTenant: jest.fn(),
        removeRateLimitFromTenant: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getRateLimitDao: () => mockRateLimitDaoImpl,
                getTenantDao: () => mockTenantDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        __mockRateLimitDao: mockRateLimitDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

import RateLimitService from '@/lib/service/rate-limit-service';
import { OIDCContext } from '@/graphql/graphql-context';
import { RateLimitServiceGroup, Tenant, TenantRateLimitRel, TenantRateLimitRelView } from '@/graphql/generated/graphql-types';

// Import the mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockSearchModule = jest.requireMock('@/lib/data-sources/search');

const mockRateLimitDao = mockDaoFactoryModule.__mockRateLimitDao;
const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;
const mockChangeEventDao = mockDaoFactoryModule.__mockChangeEventDao;
const mockSearchClient = mockSearchModule.__mockSearchClient;

describe('RateLimitService', () => {
    let service: RateLimitService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        // Use root tenant user for operations with null tenantId
        mockContext = {
            portalUserProfile: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userId: 'user-123',
                tenantId: 'root-tenant',
                managementAccessTenantId: 'root-tenant',
                scope: [
                    { scopeName: 'ratelimit.read' },
                    { scopeName: 'ratelimit.create' },
                    { scopeName: 'ratelimit.update' },
                    { scopeName: 'ratelimit.tenant.assign' },
                    { scopeName: 'ratelimit.tenant.update' },
                    { scopeName: 'ratelimit.tenant.remove' },
                    { scopeName: 'tenant.all.read' },
                    { scopeName: 'tenant.read' }
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

        service = new RateLimitService(mockContext);
        jest.clearAllMocks();
    });

    describe('getRateLimitServiceGroups', () => {
        it('should return rate limit service groups for root tenant user', async () => {
            const mockGroups: RateLimitServiceGroup[] = [
                {
                    servicegroupid: 'group-1',
                    servicegroupname: 'API Calls',
                    servicegroupdescription: 'Rate limit for API calls'
                },
                {
                    servicegroupid: 'group-2',
                    servicegroupname: 'Auth Requests',
                    servicegroupdescription: 'Rate limit for auth requests'
                }
            ];

            mockRateLimitDao.getRateLimitServiceGroups.mockResolvedValue(mockGroups);

            const result = await service.getRateLimitServiceGroups(null);

            expect(result).toEqual(mockGroups);
            expect(mockRateLimitDao.getRateLimitServiceGroups).toHaveBeenCalledWith(null);
        });

        it('should filter by tenant for non-root user', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new RateLimitService(nonRootContext);

            const mockGroups: RateLimitServiceGroup[] = [
                {
                    servicegroupid: 'group-1',
                    servicegroupname: 'API Calls',
                    servicegroupdescription: 'Rate limit for API calls'
                }
            ];

            mockRateLimitDao.getRateLimitServiceGroups.mockResolvedValue(mockGroups);

            const result = await service.getRateLimitServiceGroups(null);

            expect(result).toEqual(mockGroups);
            expect(mockRateLimitDao.getRateLimitServiceGroups).toHaveBeenCalledWith('tenant-123');
        });

        it('should return empty array when no groups found', async () => {
            mockRateLimitDao.getRateLimitServiceGroups.mockResolvedValue([]);

            const result = await service.getRateLimitServiceGroups('tenant-123');

            expect(result).toEqual([]);
        });
    });

    describe('getRateLimitServiceGroupById', () => {
        it('should return rate limit service group by id', async () => {
            const mockGroup: RateLimitServiceGroup = {
                servicegroupid: 'group-1',
                servicegroupname: 'API Calls',
                servicegroupdescription: 'Rate limit for API calls'
            };

            const mockRels: TenantRateLimitRel[] = [
                {
                    tenantId: 'root-tenant',
                    servicegroupid: 'group-1',
                    allowUnlimitedRate: false,
                    rateLimit: 100,
                    rateLimitPeriodMinutes: 60
                }
            ];

            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue(mockRels);

            const result = await service.getRateLimitServiceGroupById('group-1');

            expect(result).toEqual(mockGroup);
            expect(mockRateLimitDao.getRateLimitServiceGroupById).toHaveBeenCalledWith('group-1');
        });

        it('should return null when group does not exist', async () => {
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(null);

            const result = await service.getRateLimitServiceGroupById('nonexistent');

            expect(result).toBeNull();
        });

        it('should throw error when user has no rate limit relationships', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new RateLimitService(nonRootContext);

            const mockGroup: RateLimitServiceGroup = {
                servicegroupid: 'group-1',
                servicegroupname: 'API Calls',
                servicegroupdescription: 'Rate limit for API calls'
            };

            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([]);

            await expect(service.getRateLimitServiceGroupById('group-1')).rejects.toThrow('You do not have permissions to view the rate limits assigned to this tenant');
        });
    });

    describe('createRateLimitServiceGroup', () => {
        it('should create rate limit service group', async () => {
            const newGroup: RateLimitServiceGroup = {
                servicegroupid: '',
                servicegroupname: 'New Rate Limit',
                servicegroupdescription: 'New Description'
            };

            mockRateLimitDao.createRateLimitServiceGroup.mockResolvedValue(undefined);

            const result = await service.createRateLimitServiceGroup(newGroup);

            expect(result.servicegroupid).toBeDefined();
            expect(result.servicegroupid).not.toBe('');
            expect(result.servicegroupname).toBe('New Rate Limit');
            expect(mockRateLimitDao.createRateLimitServiceGroup).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user not authorized', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new RateLimitService(unauthorizedContext);

            const newGroup: RateLimitServiceGroup = {
                servicegroupid: '',
                servicegroupname: 'New Rate Limit',
                servicegroupdescription: 'New Description'
            };

            await expect(service.createRateLimitServiceGroup(newGroup)).rejects.toThrow();
        });
    });

    describe('updateRateLimitServiceGroup', () => {
        it('should update rate limit service group', async () => {
            const existingGroup: RateLimitServiceGroup = {
                servicegroupid: 'group-1',
                servicegroupname: 'Original Name',
                servicegroupdescription: 'Original Description'
            };

            const updatedGroup: RateLimitServiceGroup = {
                servicegroupid: 'group-1',
                servicegroupname: 'Updated Name',
                servicegroupdescription: 'Updated Description'
            };

            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(existingGroup);
            mockRateLimitDao.updateRateLimitServiceGroup.mockResolvedValue(undefined);

            const result = await service.updateRateLimitServiceGroup(updatedGroup);

            expect(result).toEqual(updatedGroup);
            expect(mockRateLimitDao.updateRateLimitServiceGroup).toHaveBeenCalledWith(updatedGroup);
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockSearchClient.updateByQuery).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when group does not exist', async () => {
            const updatedGroup: RateLimitServiceGroup = {
                servicegroupid: 'nonexistent',
                servicegroupname: 'Updated Name',
                servicegroupdescription: 'Updated Description'
            };

            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(null);

            await expect(service.updateRateLimitServiceGroup(updatedGroup)).rejects.toThrow('EC00042');
        });

        it('should not trigger bulk update when name and description unchanged', async () => {
            const existingGroup: RateLimitServiceGroup = {
                servicegroupid: 'group-1',
                servicegroupname: 'Same Name',
                servicegroupdescription: 'Same Description'
            };

            const updatedGroup: RateLimitServiceGroup = {
                servicegroupid: 'group-1',
                servicegroupname: 'Same Name',
                servicegroupdescription: 'Same Description'
            };

            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(existingGroup);
            mockRateLimitDao.updateRateLimitServiceGroup.mockResolvedValue(undefined);

            await service.updateRateLimitServiceGroup(updatedGroup);

            expect(mockSearchClient.updateByQuery).not.toHaveBeenCalled();
        });
    });

    describe('getRateLimitTenantRel', () => {
        it('should return tenant rate limit relationships', async () => {
            const mockRels: TenantRateLimitRel[] = [
                {
                    tenantId: 'tenant-123',
                    servicegroupid: 'group-1',
                    allowUnlimitedRate: false,
                    rateLimit: 100,
                    rateLimitPeriodMinutes: 60
                }
            ];

            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue(mockRels);

            const result = await service.getRateLimitTenantRel('tenant-123', null);

            expect(result).toEqual(mockRels);
            expect(mockRateLimitDao.getRateLimitTenantRel).toHaveBeenCalledWith('tenant-123', null);
        });

        it('should filter by management tenant for non-root users', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new RateLimitService(nonRootContext);

            const mockRels: TenantRateLimitRel[] = [];
            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue(mockRels);

            await service.getRateLimitTenantRel(null, 'group-1');

            expect(mockRateLimitDao.getRateLimitTenantRel).toHaveBeenCalledWith('tenant-123', 'group-1');
        });
    });

    describe('getRateLimitTenantRelViews', () => {
        it('should return tenant rate limit relationship views', async () => {
            const mockViews: TenantRateLimitRelView[] = [
                {
                    tenantId: 'tenant-123',
                    tenantName: 'Test Tenant',
                    servicegroupid: 'group-1',
                    servicegroupname: 'API Calls',
                    servicegroupdescription: 'Rate limit for API calls',
                    allowUnlimitedRate: false,
                    rateLimit: 100,
                    rateLimitPeriodMinutes: 60
                }
            ];

            mockRateLimitDao.getRateLimitTenantRelViews.mockResolvedValue(mockViews);

            const result = await service.getRateLimitTenantRelViews('group-1', null);

            expect(result).toEqual(mockViews);
            expect(mockRateLimitDao.getRateLimitTenantRelViews).toHaveBeenCalledWith('group-1', null);
        });
    });

    describe('assignRateLimitToTenant', () => {
        const mockTenant: Tenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant',
            tenantDescription: 'Test Description',
            enabled: true,
            markForDelete: false,
            allowUnlimitedRate: false,
            defaultRateLimit: 1000,
            defaultRateLimitPeriodMinutes: 60
        };

        const mockGroup: RateLimitServiceGroup = {
            servicegroupid: 'group-1',
            servicegroupname: 'API Calls',
            servicegroupdescription: 'Rate limit for API calls'
        };

        beforeEach(() => {
            // Update context for tenant-specific operations
            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new RateLimitService(mockContext);
        });

        it('should assign rate limit to tenant', async () => {
            const mockRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 100,
                rateLimitPeriodMinutes: 60
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            // First call is for getRateLimitServiceGroupById additionalConstraintCheck
            // Second call is for checking existing relationships
            mockRateLimitDao.getRateLimitTenantRel
                .mockResolvedValueOnce([mockRel]) // For additionalConstraintCheck
                .mockResolvedValueOnce([]); // For existingRels check
            mockRateLimitDao.assignRateLimitToTenant.mockResolvedValue(mockRel);

            const result = await service.assignRateLimitToTenant('tenant-123', 'group-1', false, 100, 60);

            expect(result).toEqual(mockRel);
            expect(mockRateLimitDao.assignRateLimitToTenant).toHaveBeenCalled();
            expect(mockSearchClient.index).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should allow unlimited rate limit', async () => {
            const mockRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: true,
                rateLimit: null,
                rateLimitPeriodMinutes: null
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            mockRateLimitDao.getRateLimitTenantRel
                .mockResolvedValueOnce([mockRel]) // For additionalConstraintCheck
                .mockResolvedValueOnce([]); // For existingRels check
            mockRateLimitDao.assignRateLimitToTenant.mockResolvedValue(mockRel);

            const result = await service.assignRateLimitToTenant('tenant-123', 'group-1', true, 0, 60);

            expect(result.allowUnlimitedRate).toBe(true);
            expect(result.rateLimit).toBeNull();
        });

        it('should throw error when tenant does not exist', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(null);

            await expect(
                service.assignRateLimitToTenant('tenant-123', 'group-1', false, 100, 60)
            ).rejects.toThrow('EC00008');
        });

        it('should throw error when rate limit group does not exist', async () => {
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(null);

            await expect(
                service.assignRateLimitToTenant('tenant-123', 'group-1', false, 100, 60)
            ).rejects.toThrow('EC00042');
        });

        it('should throw error when relationship already exists', async () => {
            const existingRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 50,
                rateLimitPeriodMinutes: 60
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([mockGroup]); // For check
            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([existingRel]); // For assign

            await expect(
                service.assignRateLimitToTenant('tenant-123', 'group-1', false, 100, 60)
            ).rejects.toThrow('EC00043');
        });

        it('should clamp limit to minimum of 15', async () => {
            const mockRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 15,
                rateLimitPeriodMinutes: 60
            };

            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            mockRateLimitDao.getRateLimitTenantRel
                .mockResolvedValueOnce([mockRel]) // For additionalConstraintCheck
                .mockResolvedValueOnce([]); // For existingRels check
            mockRateLimitDao.assignRateLimitToTenant.mockResolvedValue(mockRel);

            await service.assignRateLimitToTenant('tenant-123', 'group-1', false, -10, 60);

            expect(mockRateLimitDao.assignRateLimitToTenant).toHaveBeenCalledWith(
                'tenant-123',
                'group-1',
                false,
                15,
                15 // DEFAULT_RATE_LIMIT_PERIOD_MINUTES is always used
            );
        });

        it('should clamp limit to maximum of 15 when over 1000000', async () => {
            const mockRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 15,
                rateLimitPeriodMinutes: 15
            };

            // Tenant needs allowUnlimitedRate=true to bypass the total limit check
            // since the check happens before clamping
            const tenantWithUnlimited: Tenant = {
                ...mockTenant,
                allowUnlimitedRate: true,
                defaultRateLimitPeriodMinutes: 15
            };

            mockTenantDao.getTenantById.mockResolvedValue(tenantWithUnlimited);
            mockRateLimitDao.getRateLimitServiceGroupById.mockResolvedValue(mockGroup);
            mockRateLimitDao.getRateLimitTenantRel
                .mockResolvedValueOnce([mockRel]) // For additionalConstraintCheck
                .mockResolvedValueOnce([]); // For existingRels check
            mockRateLimitDao.assignRateLimitToTenant.mockResolvedValue(mockRel);

            await service.assignRateLimitToTenant('tenant-123', 'group-1', false, 2000000, 15);

            expect(mockRateLimitDao.assignRateLimitToTenant).toHaveBeenCalledWith(
                'tenant-123',
                'group-1',
                false,
                15,
                15 // DEFAULT_RATE_LIMIT_PERIOD_MINUTES is always used
            );
        });
    });

    describe('updateRateLimitForTenant', () => {
        beforeEach(() => {
            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new RateLimitService(mockContext);
        });

        it('should update rate limit for tenant', async () => {
            const existingRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 100,
                rateLimitPeriodMinutes: 60
            };

            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Test Description',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false,
                defaultRateLimit: 1000,
                defaultRateLimitPeriodMinutes: 60
            };

            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([existingRel]);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.updateRateLimitForTenant.mockResolvedValue(undefined);

            const result = await service.updateRateLimitForTenant('tenant-123', 'group-1', false, 200, 60);

            expect(result.rateLimit).toBe(200);
            expect(mockRateLimitDao.updateRateLimitForTenant).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when relationship does not exist', async () => {
            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([]);

            await expect(
                service.updateRateLimitForTenant('tenant-123', 'group-1', false, 200, 60)
            ).rejects.toThrow('EC00045');
        });

        it('should allow updating to unlimited', async () => {
            const existingRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 100,
                rateLimitPeriodMinutes: 60
            };

            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([existingRel]);
            mockRateLimitDao.updateRateLimitForTenant.mockResolvedValue(undefined);

            const result = await service.updateRateLimitForTenant('tenant-123', 'group-1', true, null, null);

            expect(result.allowUnlimitedRate).toBe(true);
            expect(result.rateLimit).toBeNull();
        });

        it('should clamp updated limit values', async () => {
            const existingRel: TenantRateLimitRel = {
                tenantId: 'tenant-123',
                servicegroupid: 'group-1',
                allowUnlimitedRate: false,
                rateLimit: 100,
                rateLimitPeriodMinutes: 60
            };

            const mockTenant: Tenant = {
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                tenantDescription: 'Test Description',
                enabled: true,
                markForDelete: false,
                allowUnlimitedRate: false,
                defaultRateLimit: 1000,
                defaultRateLimitPeriodMinutes: 60
            };

            mockRateLimitDao.getRateLimitTenantRel.mockResolvedValue([existingRel]);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockRateLimitDao.updateRateLimitForTenant.mockResolvedValue(undefined);

            const result = await service.updateRateLimitForTenant('tenant-123', 'group-1', false, -50, 60);

            expect(result.rateLimit).toBe(15);
        });
    });

    describe('removeRateLimitFromTenant', () => {
        beforeEach(() => {
            mockContext.portalUserProfile!.managementAccessTenantId = 'tenant-123';
            service = new RateLimitService(mockContext);
        });

        it('should remove rate limit from tenant', async () => {
            mockRateLimitDao.removeRateLimitFromTenant.mockResolvedValue(undefined);

            await service.removeRateLimitFromTenant('tenant-123', 'group-1');

            expect(mockRateLimitDao.removeRateLimitFromTenant).toHaveBeenCalledWith('tenant-123', 'group-1');
            expect(mockSearchClient.delete).toHaveBeenCalled();
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when not authorized', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'other-tenant',
                    scope: []
                }
            } as OIDCContext;

            service = new RateLimitService(unauthorizedContext);

            await expect(
                service.removeRateLimitFromTenant('tenant-123', 'group-1')
            ).rejects.toThrow();
        });
    });
});
