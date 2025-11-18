// Mock environment variables
process.env.MFA_ISSUER = 'Test Issuer';
process.env.MFA_ORIGIN = 'https://test.example.com';
process.env.MFA_ID = 'test.example.com';
process.env.AUTH_DOMAIN = 'https://test.example.com';
process.env.PORTAL_AUTH_TOKEN_TTL_HOURS = '24';

// Mock the OpenSearch dependencies
jest.mock('@opensearch-project/opensearch', () => ({
    Client: jest.fn()
}));

jest.mock('@/lib/data-sources/search', () => ({
    searchClient: {},
    getOpenSearchClient: jest.fn(() => ({}))
}));

jest.mock('@/lib/dao/impl/search/open-search-dao');

// Mock dao-utils with bcrypt and other password functions
jest.mock('@/utils/dao-utils', () => ({
    bcryptValidatePassword: jest.fn((password: string, hash: string) => {
        // Mock implementation for testing - matches bcrypt.compareSync behavior
        return password === 'test' && hash === '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    }),
    sha256HashPassword: jest.fn(),
    pbkdf2HashPassword: jest.fn(),
    scryptHashPassword: jest.fn(),
    generateRandomToken: jest.fn(),
    generateCodeVerifierAndChallenge: jest.fn()
}));

// Mock DAOs and utilities before imports
jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockIdentityDaoImpl = {
        getUserBy: jest.fn(),
        updateUser: jest.fn(),
        getUserTenantRelsByUserId: jest.fn(),
        getUserTenantRel: jest.fn(),
        assignUserToTenant: jest.fn(),
        updateUserTenantRel: jest.fn(),
        removeUserFromTenant: jest.fn(),
        getTOTP: jest.fn(),
        saveTOTP: jest.fn(),
        deleteTOTP: jest.fn(),
        getUserMFARels: jest.fn(),
        getFIDOKey: jest.fn(),
        saveFIDOKey: jest.fn(),
        deleteFIDOKey: jest.fn(),
        getFIDO2Challenge: jest.fn(),
        saveFIDO2Challenge: jest.fn(),
        deleteFIDO2Challenge: jest.fn(),
        initFidoCount: jest.fn(),
        getFido2Count: jest.fn(),
        updateFido2Count: jest.fn(),
        deleteFido2Count: jest.fn(),
        passwordProhibited: jest.fn(),
        getUserRecoveryEmail: jest.fn(),
        updateRecoveryEmail: jest.fn(),
        deleteRecoveryEmail: jest.fn(),
        getUserRegistrationStates: jest.fn(),
        getUserAuthenticationStates: jest.fn(),
        getUserByEmailConfirmationToken: jest.fn(),
        deleteEmailConfirmationToken: jest.fn(),
        saveEmailConfirmationToken: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn(),
        getRootTenant: jest.fn(),
        getSystemSettings: jest.fn(),
        getTenantLookAndFeel: jest.fn(),
        getTenantPasswordConfig: jest.fn(),
        getDomainsForTenantRestrictedAuthentication: jest.fn()
    };

    const mockKmsImpl = {
        encrypt: jest.fn(),
        decrypt: jest.fn()
    };

    const mockAuthDaoImpl = {
        getRefreshDataByUserId: jest.fn(),
        deleteRefreshData: jest.fn(),
        getPreAuthenticationState: jest.fn(),
        deletePreAuthenticationState: jest.fn(),
        saveAuthorizationCodeData: jest.fn(),
        saveFederatedOIDCAuthorizationRel: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockFederatedOIDCProviderDaoImpl = {
        getFederatedOidcProviderByDomain: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    return {
        DaoFactory: {
            getInstance: jest.fn(() => ({
                getIdentityDao: () => mockIdentityDaoImpl,
                getTenantDao: () => mockTenantDaoImpl,
                getKms: () => mockKmsImpl,
                getAuthDao: () => mockAuthDaoImpl,
                getClientDao: () => mockClientDaoImpl,
                getFederatedOIDCProvicerDao: () => mockFederatedOIDCProviderDaoImpl,
                getChangeEventDao: () => mockChangeEventDaoImpl
            }))
        },
        __mockIdentityDao: mockIdentityDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl,
        __mockAuthDao: mockAuthDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl
    };
});

jest.mock('@/lib/service/oidc-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        fireSecurityEvent: jest.fn(),
        getWellKnownConfig: jest.fn(),
        sendEmailVerificationEmail: jest.fn()
    }));
});

jest.mock('@/lib/service/jwt-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        getAuthTokenForOutboundCalls: jest.fn().mockResolvedValue('mock-auth-token')
    }));
});

import IdentityService from '@/lib/service/identity-service';
import { OIDCContext } from '@/graphql/graphql-context';
import {
    User,
    TenantPasswordConfig,
    UserCredential,
    UserSession,
    RefreshData,
    Tenant,
    Client,
    UserTenantRel,
    UserMfaRel,
    TotpResponse,
    UserRecoveryEmail
} from '@/graphql/generated/graphql-types';

// Import mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockIdentityDao = mockDaoFactoryModule.__mockIdentityDao;
const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;
const mockKms = mockDaoFactoryModule.__mockKms;
const mockAuthDao = mockDaoFactoryModule.__mockAuthDao;
const mockClientDao = mockDaoFactoryModule.__mockClientDao;
const mockFederatedOIDCProviderDao = mockDaoFactoryModule.__mockFederatedOIDCProviderDao;
const mockChangeEventDao = mockDaoFactoryModule.__mockChangeEventDao;

describe('IdentityService', () => {
    let service: IdentityService;
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
                    { scopeName: 'user.read' },
                    { scopeName: 'user.update' },
                    { scopeName: 'usersession.read' },
                    { scopeName: 'usersession.delete' },
                    { scopeName: 'user.unlock' },
                    { scopeName: 'tenant.all.read' },
                    { scopeName: 'tenant.user.assign' },
                    { scopeName: 'tenant.user.remove' }
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

        service = new IdentityService(mockContext);
        jest.clearAllMocks();
    });

    describe('Utility Methods', () => {
        describe('formatEmail', () => {
            it('should convert email to lowercase', () => {
                const result = (service as any).formatEmail('Test@Example.COM');
                expect(result).toBe('test@example.com');
            });

            it('should handle already lowercase emails', () => {
                const result = (service as any).formatEmail('test@example.com');
                expect(result).toBe('test@example.com');
            });
        });

        describe('formatPhoneNumber', () => {
            it('should format phone number with plus sign', () => {
                const result = (service as any).formatPhoneNumber('(555) 123-4567');
                expect(result).toBe('+5551234567');
            });

            it('should remove all non-numeric characters', () => {
                const result = (service as any).formatPhoneNumber('+1-555-123-4567');
                expect(result).toBe('+15551234567');
            });

            it('should handle international format', () => {
                const result = (service as any).formatPhoneNumber('44 20 1234 5678');
                expect(result).toBe('+442012345678');
            });
        });

        describe('checkPassword', () => {
            const mockPasswordConfig: TenantPasswordConfig = {
                tenantId: 'tenant-123',
                passwordMinLength: 8,
                passwordMaxLength: 96,
                requireUpperCase: true,
                requireLowerCase: true,
                requireNumeric: true,
                requireSpecialCharacter: true,
                requireMfa: false,
                passwordHashingAlgorithm: 'password-hash-bcrypt-10-rounds'
            };

            it('should return false for prohibited password', async () => {
                mockIdentityDao.passwordProhibited.mockResolvedValue(true);

                const result = await service.checkPassword('password123', mockPasswordConfig);

                expect(result).toBe(false);
                expect(mockIdentityDao.passwordProhibited).toHaveBeenCalledWith('password123');
            });

            it('should return true for valid password', async () => {
                mockIdentityDao.passwordProhibited.mockResolvedValue(false);

                const result = await service.checkPassword('ValidPass123!', mockPasswordConfig);

                expect(result).toBe(true);
            });

            it('should return false for invalid password format', async () => {
                mockIdentityDao.passwordProhibited.mockResolvedValue(false);

                const result = await service.checkPassword('weak', mockPasswordConfig);

                expect(result).toBe(false);
            });
        });

        describe('validateUserCredentials', () => {
            it('should validate bcrypt 10 rounds password correctly', () => {
                const userCredential: UserCredential = {
                    userId: 'user-123',
                    hashedPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // "test"
                    salt: '',
                    hashingAlgorithm: 'password-hash-bcrypt-10-rounds',
                    dateCreated: '2024-01-01T00:00:00.000Z'
                };

                const result = service.validateUserCredentials(userCredential, 'test');

                expect(result).toBe(true);
            });

            it('should reject incorrect bcrypt password', () => {
                const userCredential: UserCredential = {
                    userId: 'user-123',
                    hashedPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // "test"
                    salt: '',
                    hashingAlgorithm: 'password-hash-bcrypt-10-rounds',
                    dateCreated: '2024-01-01T00:00:00.000Z'
                };

                const result = service.validateUserCredentials(userCredential, 'wrong-password');

                expect(result).toBe(false);
            });
        });
    });

    describe('getUserById', () => {
        const mockUser: User = {
            userId: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            enabled: true,
            emailVerified: true,
            locked: false,
            markForDelete: false,
            domain: 'example.com',
            nameOrder: 'WESTERN',
            forcePasswordResetAfterAuthentication: false
        };

        it('should return user for root tenant member', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);

            const result = await service.getUserById('user-123');

            expect(result).toEqual(mockUser);
            expect(mockIdentityDao.getUserBy).toHaveBeenCalledWith('id', 'user-123');
        });

        it('should return user for non-root tenant member with valid relationship', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new IdentityService(nonRootContext);

            const mockRels: UserTenantRel[] = [
                {
                    userId: 'user-123',
                    tenantId: 'tenant-123',
                    relType: 'PRIMARY',
                    enabled: true
                }
            ];

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.getUserTenantRelsByUserId.mockResolvedValue(mockRels);

            const result = await service.getUserById('user-123');

            expect(result).toEqual(mockUser);
        });

        it('should throw error when non-root tenant member has no relationship', async () => {
            const nonRootContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    managementAccessTenantId: 'tenant-123'
                }
            } as OIDCContext;

            service = new IdentityService(nonRootContext);

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.getUserTenantRelsByUserId.mockResolvedValue([]);

            await expect(service.getUserById('user-123')).rejects.toThrow('Access to user details is not permitted');
        });

        it('should return null when user does not exist', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            const result = await service.getUserById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('getUserSessions', () => {
        it('should return user sessions with tenant and client names', async () => {
            const mockRefreshData: RefreshData[] = [
                {
                    userId: 'user-123',
                    tenantId: 'tenant-1',
                    clientId: 'client-1',
                    refreshToken: 'token-1'
                }
            ];

            const mockTenant: Tenant = {
                tenantId: 'tenant-1',
                tenantName: 'Test Tenant',
                tenantDescription: 'Description',
                tenantType: 'IDENTITY_MANAGEMENT',
                enabled: true,
                markForDelete: false
            };

            const mockClient: Client = {
                clientId: 'client-1',
                clientName: 'Test Client',
                clientType: 'CONFIDENTIAL',
                redirectUri: 'https://example.com/callback',
                tenantId: 'tenant-1',
                enabled: true
            };

            mockAuthDao.getRefreshDataByUserId.mockResolvedValue(mockRefreshData);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockClientDao.getClientById.mockResolvedValue(mockClient);

            const result = await service.getUserSessions('user-123');

            expect(result).toHaveLength(1);
            expect(result[0].userId).toBe('user-123');
            expect(result[0].tenantId).toBe('tenant-1');
            expect(result[0].tenantName).toBe('Test Tenant');
            expect(result[0].clientId).toBe('client-1');
            expect(result[0].clientName).toBe('Test Client');
        });

        it('should handle missing tenant gracefully', async () => {
            const mockRefreshData: RefreshData[] = [
                {
                    userId: 'user-123',
                    tenantId: 'tenant-1',
                    clientId: 'client-1',
                    refreshToken: 'token-1'
                }
            ];

            mockAuthDao.getRefreshDataByUserId.mockResolvedValue(mockRefreshData);
            mockTenantDao.getTenantById.mockResolvedValue(null);
            mockClientDao.getClientById.mockResolvedValue(null);

            const result = await service.getUserSessions('user-123');

            expect(result).toHaveLength(1);
            expect(result[0].tenantName).toBe('Unknown');
            expect(result[0].clientName).toBe('Unknown');
        });

        it('should return empty array when no sessions exist', async () => {
            mockAuthDao.getRefreshDataByUserId.mockResolvedValue([]);

            const result = await service.getUserSessions('user-123');

            expect(result).toEqual([]);
        });
    });

    describe('deleteUserSession', () => {
        it('should delete user session successfully', async () => {
            mockAuthDao.deleteRefreshData.mockResolvedValue(undefined);

            await service.deleteUserSession('user-123', 'client-1', 'tenant-1');

            expect(mockAuthDao.deleteRefreshData).toHaveBeenCalledWith('user-123', 'tenant-1', 'client-1');
        });

        it('should throw error when user lacks permissions', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: []
                }
            } as OIDCContext;

            service = new IdentityService(unauthorizedContext);

            await expect(
                service.deleteUserSession('user-123', 'client-1', 'tenant-1')
            ).rejects.toThrow();
        });
    });

    describe('unlockUser', () => {
        const mockUser: User = {
            userId: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            enabled: true,
            emailVerified: true,
            locked: true,
            markForDelete: false,
            domain: 'example.com',
            nameOrder: 'WESTERN',
            forcePasswordResetAfterAuthentication: false
        };

        it('should unlock user successfully', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            await service.unlockUser('user-123');

            expect(mockIdentityDao.updateUser).toHaveBeenCalled();
            const updatedUser = mockIdentityDao.updateUser.mock.calls[0][0];
            expect(updatedUser.locked).toBe(false);
            expect(mockChangeEventDao.addChangeEvent).toHaveBeenCalled();
        });

        it('should throw error when user does not exist', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            await expect(service.unlockUser('nonexistent')).rejects.toThrow('EC00013');
        });
    });

    describe('getRecoveryEmail', () => {
        const mockRecoveryEmail: UserRecoveryEmail = {
            userId: 'user-123',
            email: 'recovery@example.com',
            emailVerified: true
        };

        it('should return recovery email for same user', async () => {
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(mockRecoveryEmail);

            const result = await service.getRecoveryEmail('user-123');

            expect(result).toEqual(mockRecoveryEmail);
        });

        it('should return recovery email for authorized user viewing others', async () => {
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(mockRecoveryEmail);

            const result = await service.getRecoveryEmail('other-user-123');

            expect(result).toEqual(mockRecoveryEmail);
        });

        it('should return null when no recovery email exists', async () => {
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(null);

            const result = await service.getRecoveryEmail('user-123');

            expect(result).toBeNull();
        });
    });

    describe('deleteRecoveryEmail', () => {
        it('should delete recovery email for same user', async () => {
            mockIdentityDao.deleteRecoveryEmail.mockResolvedValue(undefined);

            await service.deleteRecoveryEmail('user-123');

            expect(mockIdentityDao.deleteRecoveryEmail).toHaveBeenCalledWith('user-123');
        });

        it('should delete recovery email when authorized', async () => {
            mockIdentityDao.deleteRecoveryEmail.mockResolvedValue(undefined);

            await service.deleteRecoveryEmail('other-user-123');

            expect(mockIdentityDao.deleteRecoveryEmail).toHaveBeenCalledWith('other-user-123');
        });

        it('should throw error when user lacks permissions', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    userId: 'different-user',
                    scope: []
                }
            } as OIDCContext;

            service = new IdentityService(unauthorizedContext);

            await expect(
                service.deleteRecoveryEmail('user-123')
            ).rejects.toThrow('Insufficient permissions to perform operation');
        });
    });

    describe('updateUser', () => {
        const mockUser: User = {
            userId: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            enabled: true,
            emailVerified: true,
            domain: 'example.com',
            phoneNumber: null,
            middleName: null,
            federatedOIDCProviderSubjectId: null,
            markForDelete: false,
            forcePasswordResetAfterAuthentication: false
        };

        it('should update user successfully when user updates themselves', async () => {
            const updatedUser = { ...mockUser, firstName: 'Updated' };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.firstName).toBe('Updated');
            expect(mockIdentityDao.updateUser).toHaveBeenCalledWith(expect.objectContaining({
                firstName: 'Updated'
            }));
        });

        it('should update user successfully when authorized admin updates user', async () => {
            const updatedUser = { ...mockUser, userId: 'other-user-123', firstName: 'Updated' };
            const otherUser = { ...mockUser, userId: 'other-user-123' };

            mockIdentityDao.getUserBy.mockResolvedValue(otherUser);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.firstName).toBe('Updated');
            expect(mockIdentityDao.updateUser).toHaveBeenCalled();
        });

        it('should format email to lowercase', async () => {
            const updatedUser = { ...mockUser, email: 'TEST@EXAMPLE.COM' };

            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.email).toBe('test@example.com');
        });

        it('should format phone number when provided', async () => {
            const updatedUser = { ...mockUser, phoneNumber: '(555) 123-4567' };

            mockIdentityDao.getUserBy
                .mockResolvedValueOnce(mockUser) // First call for existing user
                .mockResolvedValueOnce(null); // Second call for phone number uniqueness check
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.phoneNumber).toBe('+5551234567');
        });

        it('should throw error when user does not exist', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            await expect(service.updateUser(mockUser)).rejects.toThrow('EC00013');
        });

        it('should throw error when user is marked for deletion', async () => {
            const deletedUser = { ...mockUser, markForDelete: true };
            mockIdentityDao.getUserBy.mockResolvedValue(deletedUser);

            await expect(service.updateUser(mockUser)).rejects.toThrow('EC00155');
        });

        it('should throw error when trying to update federated user properties', async () => {
            const federatedUser = {
                ...mockUser,
                federatedOIDCProviderSubjectId: 'federated-123'
            };
            const updatedUser = { ...federatedUser, firstName: 'Changed' };

            mockIdentityDao.getUserBy.mockResolvedValue(federatedUser);

            await expect(service.updateUser(updatedUser)).rejects.toThrow('EC00147');
        });

        it('should allow enabling/disabling federated user', async () => {
            const federatedUser = {
                ...mockUser,
                federatedOIDCProviderSubjectId: 'federated-123',
                enabled: true
            };
            const updatedUser = { ...federatedUser, enabled: false };

            mockIdentityDao.getUserBy.mockResolvedValue(federatedUser);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.enabled).toBe(false);
            expect(mockIdentityDao.updateUser).toHaveBeenCalled();
        });

        it('should throw error when new email already exists', async () => {
            const updatedUser = { ...mockUser, email: 'existing@example.com' };
            const existingUserWithEmail = { ...mockUser, userId: 'other-user', email: 'existing@example.com' };

            mockIdentityDao.getUserBy
                .mockResolvedValueOnce(mockUser) // First call for existing user
                .mockResolvedValueOnce(existingUserWithEmail); // Second call for email check

            await expect(service.updateUser(updatedUser)).rejects.toThrow('EC00142');
        });

        it('should throw error when new email domain is invalid', async () => {
            const updatedUser = { ...mockUser, email: 'test@abc' };

            mockIdentityDao.getUserBy
                .mockResolvedValueOnce(mockUser) // First call for existing user
                .mockResolvedValueOnce(null); // Second call for email check

            await expect(service.updateUser(updatedUser)).rejects.toThrow('EC00143');
        });

        it('should throw error when new email domain is federated', async () => {
            const updatedUser = { ...mockUser, email: 'test@federated.com' };
            const federatedProvider = {
                federatedOIDCProviderId: 'provider-123',
                federatedOIDCProviderDomain: 'federated.com'
            };

            mockIdentityDao.getUserBy
                .mockResolvedValueOnce(mockUser) // First call for existing user
                .mockResolvedValueOnce(null); // Second call for email check
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(federatedProvider as any);

            await expect(service.updateUser(updatedUser)).rejects.toThrow('EC00144');
        });

        it('should unset emailVerified flag when email changes', async () => {
            const updatedUser = { ...mockUser, email: 'newemail@example.com', emailVerified: true };

            mockIdentityDao.getUserBy
                .mockResolvedValueOnce(mockUser) // First call for existing user
                .mockResolvedValueOnce(null); // Second call for email check
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.emailVerified).toBe(false);
            expect(result.domain).toBe('example.com');
        });

        it('should throw error when new phone number already exists', async () => {
            const updatedUser = { ...mockUser, phoneNumber: '+1234567890' };
            const existingUserWithPhone = { ...mockUser, userId: 'other-user', phoneNumber: '+1234567890' };

            mockIdentityDao.getUserBy
                .mockResolvedValueOnce(mockUser) // First call for existing user
                .mockResolvedValueOnce(existingUserWithPhone); // Second call for phone check
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);

            await expect(service.updateUser(updatedUser)).rejects.toThrow('EC00224');
        });

        it('should preserve forcePasswordResetAfterAuthentication flag', async () => {
            const existingUserWithFlag = { ...mockUser, forcePasswordResetAfterAuthentication: true };
            const updatedUser = { ...mockUser, forcePasswordResetAfterAuthentication: false };

            mockIdentityDao.getUserBy.mockResolvedValue(existingUserWithFlag);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);

            const result = await service.updateUser(updatedUser);

            expect(result.forcePasswordResetAfterAuthentication).toBe(true);
        });

        it('should throw error when unauthorized user tries to update', async () => {
            const unauthorizedContext = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    userId: 'different-user',
                    scope: []
                }
            } as OIDCContext;

            service = new IdentityService(unauthorizedContext);

            await expect(service.updateUser(mockUser)).rejects.toThrow('Insufficient permissions');
        });
    });

    describe('TOTP/MFA Methods', () => {
        describe('createTOTP', () => {
            it('should create TOTP successfully for existing user', async () => {
                const mockUser: User = {
                    userId: 'user-123',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    enabled: true,
                    emailVerified: true,
                    domain: 'example.com',
                    phoneNumber: null,
                    middleName: null,
                    federatedOIDCProviderSubjectId: null,
                    markForDelete: false,
                    forcePasswordResetAfterAuthentication: false
                };

                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getTOTP.mockResolvedValue(null);
                mockKms.encrypt.mockResolvedValue('encrypted-secret');
                mockIdentityDao.saveTOTP.mockResolvedValue(undefined);

                const result = await service.createTOTP('user-123');

                expect(result).toHaveProperty('uri');
                expect(result).toHaveProperty('userMFARel');
                expect(result.userMFARel.userId).toBe('user-123');
                expect(result.userMFARel.mfaType).toBe('TIME_BASED_OTP');
                expect(mockIdentityDao.saveTOTP).toHaveBeenCalled();
            });

            it('should throw error when user does not exist', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(null);

                await expect(service.createTOTP('nonexistent')).rejects.toThrow('EC00013');
            });

            it('should throw error when TOTP already exists', async () => {
                const mockUser: User = {
                    userId: 'user-123',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    enabled: true,
                    emailVerified: true,
                    domain: 'example.com',
                    phoneNumber: null,
                    middleName: null,
                    federatedOIDCProviderSubjectId: null,
                    markForDelete: false,
                    forcePasswordResetAfterAuthentication: false
                };

                const existingMfaRel = {
                    userId: 'user-123',
                    mfaType: 'time-based-otp',
                    totpSecret: 'existing-secret',
                    primaryMfa: true,
                    totpHashAlgorithm: 'SHA1',
                    fido2PublicKeyAlgorithm: null,
                    fido2CredentialId: null,
                    fido2KeySupportsCounters: null,
                    fido2PublicKey: null,
                    fido2Transports: null
                };

                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getTOTP.mockResolvedValue(existingMfaRel as any);

                await expect(service.createTOTP('user-123')).rejects.toThrow('EC00169');
            });

            it('should throw error when encryption fails', async () => {
                const mockUser: User = {
                    userId: 'user-123',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    enabled: true,
                    emailVerified: true,
                    domain: 'example.com',
                    phoneNumber: null,
                    middleName: null,
                    federatedOIDCProviderSubjectId: null,
                    markForDelete: false,
                    forcePasswordResetAfterAuthentication: false
                };

                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getTOTP.mockResolvedValue(null);
                mockKms.encrypt.mockResolvedValue(null);

                await expect(service.createTOTP('user-123')).rejects.toThrow('EC00170');
            });
        });

        describe('validateTOTP', () => {
            it('should validate correct TOTP code', async () => {
                const mockMfaRel = {
                    userId: 'user-123',
                    mfaType: 'time-based-otp',
                    totpSecret: 'encrypted-secret',
                    primaryMfa: true,
                    totpHashAlgorithm: 'SHA1',
                    fido2PublicKeyAlgorithm: null,
                    fido2CredentialId: null,
                    fido2KeySupportsCounters: null,
                    fido2PublicKey: null,
                    fido2Transports: null
                };

                mockIdentityDao.getTOTP.mockResolvedValue(mockMfaRel as any);
                mockKms.decrypt.mockResolvedValue('JBSWY3DPEHPK3PXP');

                // The actual validation will depend on the OTPAuth library mock
                // For now, we'll just test that it doesn't throw an error
                const result = await service.validateTOTP('user-123', '123456');

                expect(typeof result).toBe('boolean');
                expect(mockKms.decrypt).toHaveBeenCalledWith('encrypted-secret');
            });

            it('should throw error when TOTP not found', async () => {
                mockIdentityDao.getTOTP.mockResolvedValue(null);

                await expect(service.validateTOTP('user-123', '123456')).rejects.toThrow('EC00171');
            });

            it('should throw error when secret decryption fails', async () => {
                const mockMfaRel = {
                    userId: 'user-123',
                    mfaType: 'time-based-otp',
                    totpSecret: 'encrypted-secret',
                    primaryMfa: true,
                    totpHashAlgorithm: 'SHA1',
                    fido2PublicKeyAlgorithm: null,
                    fido2CredentialId: null,
                    fido2KeySupportsCounters: null,
                    fido2PublicKey: null,
                    fido2Transports: null
                };

                mockIdentityDao.getTOTP.mockResolvedValue(mockMfaRel as any);
                mockKms.decrypt.mockResolvedValue(null);

                await expect(service.validateTOTP('user-123', '123456')).rejects.toThrow('EC00172');
            });
        });

        describe('getUserMFARels', () => {
            it('should return MFA relationships for same user', async () => {
                const mockMfaRels = [
                    {
                        userId: 'user-123',
                        mfaType: 'time-based-otp',
                        totpSecret: 'secret-should-be-cleared',
                        primaryMfa: true,
                        totpHashAlgorithm: 'SHA1',
                        fido2PublicKeyAlgorithm: 123,
                        fido2CredentialId: 'cred-id-should-be-cleared',
                        fido2KeySupportsCounters: true,
                        fido2PublicKey: 'pub-key-should-be-cleared',
                        fido2Transports: 'transports-should-be-cleared'
                    }
                ];

                mockIdentityDao.getUserMFARels.mockResolvedValue(mockMfaRels as any);

                const result = await service.getUserMFARels('user-123');

                expect(result).toHaveLength(1);
                // Verify sensitive information is cleared
                expect(result[0].totpSecret).toBe('');
                expect(result[0].fido2PublicKeyAlgorithm).toBe(0);
                expect(result[0].fido2CredentialId).toBe('');
                expect(result[0].fido2PublicKey).toBe('');
                expect(result[0].fido2Transports).toBe('');
                expect(result[0].fido2KeySupportsCounters).toBe(false);
            });

            it('should return MFA relationships for other user with valid relationship', async () => {
                const mockMfaRels = [
                    {
                        userId: 'other-user',
                        mfaType: 'time-based-otp',
                        totpSecret: 'secret',
                        primaryMfa: true,
                        totpHashAlgorithm: 'SHA1',
                        fido2PublicKeyAlgorithm: 0,
                        fido2CredentialId: '',
                        fido2KeySupportsCounters: false,
                        fido2PublicKey: '',
                        fido2Transports: ''
                    }
                ];

                const mockRels = [
                    {
                        userId: 'other-user',
                        tenantId: 'root-tenant',
                        relType: 'PRIMARY',
                        enabled: true
                    }
                ];

                mockIdentityDao.getUserMFARels.mockResolvedValue(mockMfaRels as any);
                mockIdentityDao.getUserTenantRelsByUserId.mockResolvedValue(mockRels as any);

                const result = await service.getUserMFARels('other-user');

                expect(result).toHaveLength(1);
            });

            it('should return empty array when no MFA relationships exist', async () => {
                mockIdentityDao.getUserMFARels.mockResolvedValue([]);

                const result = await service.getUserMFARels('user-123');

                expect(result).toEqual([]);
            });
        });

        describe('deleteTOTP', () => {
            it('should delete TOTP for same user', async () => {
                mockIdentityDao.deleteTOTP.mockResolvedValue(undefined);

                await service.deleteTOTP('user-123');

                expect(mockIdentityDao.deleteTOTP).toHaveBeenCalledWith('user-123');
            });

            it('should delete TOTP for other user when authorized', async () => {
                mockIdentityDao.deleteTOTP.mockResolvedValue(undefined);

                await service.deleteTOTP('other-user');

                expect(mockIdentityDao.deleteTOTP).toHaveBeenCalledWith('other-user');
            });

            it('should throw error when unauthorized', async () => {
                const unauthorizedContext = {
                    ...mockContext,
                    portalUserProfile: {
                        ...mockContext.portalUserProfile!,
                        userId: 'different-user',
                        scope: []
                    }
                } as OIDCContext;

                service = new IdentityService(unauthorizedContext);

                await expect(service.deleteTOTP('user-123')).rejects.toThrow('Insufficient permissions');
            });
        });
    });

    describe('FIDO2 Methods', () => {
        describe('deleteFIDOKey', () => {
            it('should delete FIDO key for same user', async () => {
                mockIdentityDao.deleteFido2Count.mockResolvedValue(undefined);
                mockIdentityDao.deleteFIDOKey.mockResolvedValue(undefined);

                await service.deleteFIDOKey('user-123');

                expect(mockIdentityDao.deleteFido2Count).toHaveBeenCalledWith('user-123');
                expect(mockIdentityDao.deleteFIDOKey).toHaveBeenCalledWith('user-123');
            });

            it('should delete FIDO key for other user when authorized', async () => {
                mockIdentityDao.deleteFido2Count.mockResolvedValue(undefined);
                mockIdentityDao.deleteFIDOKey.mockResolvedValue(undefined);

                await service.deleteFIDOKey('other-user');

                expect(mockIdentityDao.deleteFido2Count).toHaveBeenCalledWith('other-user');
                expect(mockIdentityDao.deleteFIDOKey).toHaveBeenCalledWith('other-user');
            });

            it('should throw error when unauthorized', async () => {
                const unauthorizedContext = {
                    ...mockContext,
                    portalUserProfile: {
                        ...mockContext.portalUserProfile!,
                        userId: 'different-user',
                        scope: []
                    }
                } as OIDCContext;

                service = new IdentityService(unauthorizedContext);

                await expect(service.deleteFIDOKey('user-123')).rejects.toThrow('Insufficient permissions');
            });
        });

        describe('createFido2RegistrationChallenge', () => {
            const mockUser: User = {
                userId: 'user-123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                enabled: true,
                emailVerified: true,
                domain: 'example.com',
                phoneNumber: null,
                middleName: null,
                federatedOIDCProviderSubjectId: null,
                markForDelete: false,
                forcePasswordResetAfterAuthentication: false,
                locked: false,
                nameOrder: 'WESTERN_NAME_ORDER'
            };

            it('should create FIDO2 registration challenge successfully', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(null);
                mockIdentityDao.saveFIDO2Challenge.mockResolvedValue(undefined);

                const result = await service.createFido2RegistrationChallenge('user-123', null, null);

                expect(result).toHaveProperty('fido2Challenge');
                expect(result).toHaveProperty('email', 'test@example.com');
                expect(result).toHaveProperty('userName', 'Test User');
                expect(mockIdentityDao.saveFIDO2Challenge).toHaveBeenCalled();
            });

            it('should delete existing challenge before creating new one', async () => {
                const existingChallenge = {
                    userId: 'user-123',
                    challenge: 'old-challenge',
                    issuedAtMs: Date.now() - 60000,
                    expiresAtMs: Date.now() + 60000
                };

                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(existingChallenge as any);
                mockIdentityDao.deleteFIDO2Challenge.mockResolvedValue(undefined);
                mockIdentityDao.saveFIDO2Challenge.mockResolvedValue(undefined);

                await service.createFido2RegistrationChallenge('user-123', null, null);

                expect(mockIdentityDao.deleteFIDO2Challenge).toHaveBeenCalledWith('user-123');
                expect(mockIdentityDao.saveFIDO2Challenge).toHaveBeenCalled();
            });

            it('should throw error when user does not exist', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(null);

                await expect(service.createFido2RegistrationChallenge('nonexistent', null, null))
                    .rejects.toThrow('EC00013');
            });

            it('should throw error when user is locked', async () => {
                const lockedUser = { ...mockUser, locked: true };
                mockIdentityDao.getUserBy.mockResolvedValue(lockedUser);

                await expect(service.createFido2RegistrationChallenge('user-123', null, null))
                    .rejects.toThrow('EC00146');
            });

            it('should throw error when user is marked for deletion', async () => {
                const deletedUser = { ...mockUser, markForDelete: true };
                mockIdentityDao.getUserBy.mockResolvedValue(deletedUser);

                await expect(service.createFido2RegistrationChallenge('user-123', null, null))
                    .rejects.toThrow('EC00146');
            });

            it('should throw error when user is disabled and no session token', async () => {
                const disabledUser = { ...mockUser, enabled: false };
                mockIdentityDao.getUserBy.mockResolvedValue(disabledUser);

                await expect(service.createFido2RegistrationChallenge('user-123', null, null))
                    .rejects.toThrow('EC00176');
            });
        });

        describe('createFido2AuthenticationChallenge', () => {
            const mockUser: User = {
                userId: 'user-123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                enabled: true,
                emailVerified: true,
                domain: 'example.com',
                phoneNumber: null,
                middleName: null,
                federatedOIDCProviderSubjectId: null,
                markForDelete: false,
                forcePasswordResetAfterAuthentication: false,
                locked: false,
                nameOrder: 'WESTERN_NAME_ORDER'
            };

            const mockMfaRel = {
                userId: 'user-123',
                mfaType: 'FIDO2',
                fido2CredentialId: 'cred-id-123',
                fido2Transports: 'usb,nfc',
                fido2PublicKey: 'public-key-base64',
                fido2PublicKeyAlgorithm: -7,
                fido2KeySupportsCounters: true,
                primaryMfa: false,
                totpSecret: null,
                totpHashAlgorithm: null
            };

            it('should create FIDO2 authentication challenge successfully', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDOKey.mockResolvedValue(mockMfaRel as any);
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(null);
                mockIdentityDao.saveFIDO2Challenge.mockResolvedValue(undefined);

                const result = await service.createFido2AuthenticationChallenge('user-123', null, null);

                expect(result).toHaveProperty('fido2Challenge');
                expect(result).toHaveProperty('fido2AuthenticationChallengePasskeys');
                expect(result.fido2AuthenticationChallengePasskeys).toHaveLength(1);
                expect(result.fido2AuthenticationChallengePasskeys[0].id).toBe('cred-id-123');
                expect(result.fido2AuthenticationChallengePasskeys[0].transports).toEqual(['usb', 'nfc']);
                expect(mockIdentityDao.saveFIDO2Challenge).toHaveBeenCalled();
            });

            it('should throw error when user does not have FIDO key', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDOKey.mockResolvedValue(null);

                await expect(service.createFido2AuthenticationChallenge('user-123', null, null))
                    .rejects.toThrow('EC00177');
            });

            it('should throw error when user does not exist', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(null);

                await expect(service.createFido2AuthenticationChallenge('nonexistent', null, null))
                    .rejects.toThrow('EC00013');
            });

            it('should delete existing challenge before creating new one', async () => {
                const existingChallenge = {
                    userId: 'user-123',
                    challenge: 'old-challenge',
                    issuedAtMs: Date.now() - 60000,
                    expiresAtMs: Date.now() + 60000
                };

                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDOKey.mockResolvedValue(mockMfaRel as any);
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(existingChallenge as any);
                mockIdentityDao.deleteFIDO2Challenge.mockResolvedValue(undefined);
                mockIdentityDao.saveFIDO2Challenge.mockResolvedValue(undefined);

                await service.createFido2AuthenticationChallenge('user-123', null, null);

                expect(mockIdentityDao.deleteFIDO2Challenge).toHaveBeenCalledWith('user-123');
                expect(mockIdentityDao.saveFIDO2Challenge).toHaveBeenCalled();
            });
        });

        describe('registerFIDO2Key', () => {
            const mockUser: User = {
                userId: 'user-123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                enabled: true,
                emailVerified: true,
                domain: 'example.com',
                phoneNumber: null,
                middleName: null,
                federatedOIDCProviderSubjectId: null,
                markForDelete: false,
                forcePasswordResetAfterAuthentication: false
            };

            const mockChallenge = {
                userId: 'user-123',
                challenge: 'challenge-123',
                issuedAtMs: Date.now() - 60000,
                expiresAtMs: Date.now() + 600000 // Not expired
            };

            const mockRegistrationInput = {
                id: 'credential-id',
                rawId: 'raw-credential-id',
                response: {
                    attestationObject: 'attestation-obj',
                    clientDataJSON: 'client-data-json',
                    authenticatorData: 'auth-data',
                    publicKey: 'public-key',
                    publicKeyAlgorithm: -7,
                    transports: ['usb', 'nfc']
                }
            };

            it('should throw error when user does not exist', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(null);

                await expect(service.registerFIDO2Key('nonexistent', mockRegistrationInput as any))
                    .rejects.toThrow('EC00013');
            });

            it('should throw error when challenge does not exist', async () => {
                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(null);

                await expect(service.registerFIDO2Key('user-123', mockRegistrationInput as any))
                    .rejects.toThrow('EC00173');
            });

            it('should throw error when challenge is expired', async () => {
                const expiredChallenge = {
                    ...mockChallenge,
                    expiresAtMs: Date.now() - 1000 // Expired
                };

                mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(expiredChallenge as any);
                mockIdentityDao.deleteFIDO2Challenge.mockResolvedValue(undefined);

                await expect(service.registerFIDO2Key('user-123', mockRegistrationInput as any))
                    .rejects.toThrow('EC00174');
            });
        });

        describe('authenticateFIDO2Key', () => {
            const mockChallenge = {
                userId: 'user-123',
                challenge: 'challenge-123',
                issuedAtMs: Date.now() - 60000,
                expiresAtMs: Date.now() + 600000
            };

            const mockMfaRel = {
                userId: 'user-123',
                mfaType: 'FIDO2',
                fido2CredentialId: 'cred-id-123',
                fido2Transports: 'usb,nfc',
                fido2PublicKey: 'public-key-base64',
                fido2PublicKeyAlgorithm: -7,
                fido2KeySupportsCounters: true,
                primaryMfa: false,
                totpSecret: null,
                totpHashAlgorithm: null
            };

            const mockAuthInput = {
                id: 'cred-id-123',
                rawId: 'raw-cred-id',
                authenticationAttachment: 'platform',
                response: {
                    authenticatorData: 'auth-data',
                    clientDataJSON: 'client-data',
                    signature: 'signature'
                }
            };

            it('should throw error when challenge does not exist', async () => {
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(null);

                await expect(service.authenticateFIDO2Key('user-123', mockAuthInput as any))
                    .rejects.toThrow('EC00178');
            });

            it('should throw error when challenge is expired', async () => {
                const expiredChallenge = {
                    ...mockChallenge,
                    expiresAtMs: Date.now() - 1000
                };

                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(expiredChallenge as any);
                mockIdentityDao.deleteFIDO2Challenge.mockResolvedValue(undefined);

                await expect(service.authenticateFIDO2Key('user-123', mockAuthInput as any))
                    .rejects.toThrow('EC00174');
            });

            it('should throw error when FIDO key not found', async () => {
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(mockChallenge as any);
                mockIdentityDao.getFIDOKey.mockResolvedValue(null);

                await expect(service.authenticateFIDO2Key('user-123', mockAuthInput as any))
                    .rejects.toThrow('EC00177');
            });

            it('should throw error when credential ID missing', async () => {
                const mfaRelWithoutCredId = { ...mockMfaRel, fido2CredentialId: null };

                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(mockChallenge as any);
                mockIdentityDao.getFIDOKey.mockResolvedValue(mfaRelWithoutCredId as any);

                await expect(service.authenticateFIDO2Key('user-123', mockAuthInput as any))
                    .rejects.toThrow('EC00179');
            });

            it('should throw error when credential ID mismatch', async () => {
                const authInputWithWrongId = { ...mockAuthInput, id: 'wrong-id' };

                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(mockChallenge as any);
                mockIdentityDao.getFIDOKey.mockResolvedValue(mockMfaRel as any);

                await expect(service.authenticateFIDO2Key('user-123', authInputWithWrongId as any))
                    .rejects.toThrow('EC00180');
            });

            it('should throw error when counter not found', async () => {
                mockIdentityDao.getFIDO2Challenge.mockResolvedValue(mockChallenge as any);
                mockIdentityDao.getFIDOKey.mockResolvedValue(mockMfaRel as any);
                mockIdentityDao.getFido2Count.mockResolvedValue(null);

                await expect(service.authenticateFIDO2Key('user-123', mockAuthInput as any))
                    .rejects.toThrow('EC00181');
            });
        });
    });
});
