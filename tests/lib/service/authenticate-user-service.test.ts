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
    searchClient: {
        delete: jest.fn().mockResolvedValue({ result: 'deleted' }),
        index: jest.fn().mockResolvedValue({ result: 'created' })
    },
    getOpenSearchClient: jest.fn(() => ({
        delete: jest.fn().mockResolvedValue({ result: 'deleted' }),
        index: jest.fn().mockResolvedValue({ result: 'created' })
    }))
}));

jest.mock('@/lib/dao/impl/search/open-search-dao');

// Mock dao-utils with password and utility functions
jest.mock('@/utils/dao-utils', () => ({
    bcryptValidatePassword: jest.fn(),
    sha256HashPassword: jest.fn(),
    pbkdf2HashPassword: jest.fn(),
    scryptHashPassword: jest.fn(),
    generateRandomToken: jest.fn(() => 'random-token-123'),
    generateCodeVerifierAndChallenge: jest.fn(),
    getDomainFromEmail: jest.fn((email: string) => {
        const parts = email.split('@');
        return parts.length > 1 ? parts[1] : '';
    }),
    generateUserCredential: jest.fn(),
    generateHash: jest.fn()
}));

// Mock DAOs and utilities before imports
jest.mock('@/lib/data-sources/dao-factory', () => {
    const mockIdentityDaoImpl = {
        getUserBy: jest.fn(),
        updateUser: jest.fn(),
        createUser: jest.fn(),
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
        saveEmailConfirmationToken: jest.fn(),
        getUserRegistrationStatesByEmail: jest.fn(),
        deleteUserRegistrationState: jest.fn(),
        saveUserRegistrationState: jest.fn(),
        createUserRegistrationStates: jest.fn(),
        deleteUserCredential: jest.fn(),
        deleteUserDuressCredential: jest.fn(),
        deleteUserTermsAndConditionsAccepted: jest.fn(),
        saveUserTermsAndConditionsAccepted: jest.fn(),
        addUserTermsAndConditionsAccepted: jest.fn(),
        addUserCredential: jest.fn(),
        deleteUser: jest.fn(),
        addUserAuthenticationHistory: jest.fn(),
        updateUserRegistrationState: jest.fn(),
        getUserCredentials: jest.fn(),
        addUserDuressCredential: jest.fn(),
        addRecoveryEmail: jest.fn(),
        deleteUserAuthenticationState: jest.fn(),
        saveUserAuthenticationState: jest.fn(),
        createUserAuthenticationStates: jest.fn(),
        updateUserAuthenticationState: jest.fn(),
        getUserFailedLogin: jest.fn(),
        saveUserFailedLogin: jest.fn(),
        deleteUserFailedLogin: jest.fn(),
        getUserTermsAndConditionsAccepted: jest.fn(),
        getUserByPasswordResetToken: jest.fn(),
        deletePasswordResetToken: jest.fn(),
        savePasswordResetToken: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn(),
        getRootTenant: jest.fn(),
        getSystemSettings: jest.fn(),
        getTenantLookAndFeel: jest.fn(),
        getTenantPasswordConfig: jest.fn(),
        getDomainsForTenantRestrictedAuthentication: jest.fn(),
        getCaptchaConfig: jest.fn(),
        getDomainManagedByExternalOidcProvider: jest.fn(),
        getManagementDomains: jest.fn(),
        getTenantLoginFailurePolicy: jest.fn(),
        getTenantLegacyUserMigrationConfig: jest.fn()
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
        saveFederatedOIDCAuthorizationRel: jest.fn(),
        savePreAuthenticationState: jest.fn(),
        getAuthorizationDeviceCodeData: jest.fn(),
        updateAuthorizationDeviceCodeData: jest.fn()
    };

    const mockClientDaoImpl = {
        getClientById: jest.fn()
    };

    const mockFederatedOIDCProviderDaoImpl = {
        getFederatedOidcProviderByDomain: jest.fn(),
        getFederatedOIDCProviderById: jest.fn(),
        getFederatedOidcProviderByTenantId: jest.fn()
    };

    const mockChangeEventDaoImpl = {
        addChangeEvent: jest.fn()
    };

    const mockSearchDaoImpl = {
        updateObjectSearchIndex: jest.fn().mockResolvedValue(undefined),
        updateRelSearchIndex: jest.fn().mockResolvedValue(undefined)
    };

    const mockAuthenticationGroupDaoImpl = {
        getAuthenticationGroupsByTenantId: jest.fn(),
        getAuthenticationGroupByTenantIdAndGroupId: jest.fn()
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
                getChangeEventDao: () => mockChangeEventDaoImpl,
                getSearchDao: () => mockSearchDaoImpl,
                getAuthenticationGroupDao: () => mockAuthenticationGroupDaoImpl
            }))
        },
        __mockIdentityDao: mockIdentityDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl,
        __mockAuthDao: mockAuthDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl,
        __mockSearchDao: mockSearchDaoImpl,
        __mockAuthenticationGroupDao: mockAuthenticationGroupDaoImpl
    };
});

jest.mock('@/lib/service/oidc-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        fireSecurityEvent: jest.fn(),
        getWellKnownConfig: jest.fn(),
        sendEmailVerificationEmail: jest.fn(),
        sendPasswordResetEmail: jest.fn()
    }));
});

jest.mock('@/lib/service/jwt-service-utils', () => {
    return jest.fn().mockImplementation(() => ({
        getAuthTokenForOutboundCalls: jest.fn().mockResolvedValue('mock-auth-token'),
        signIAMPortalUserJwt: jest.fn().mockResolvedValue({
            accessToken: 'mock-portal-jwt-token',
            principal: {
                jti: 'mock-jti-123',
                userId: 'user-123',
                tenantId: 'tenant-123'
            }
        }),
        signPreAuthnJwt: jest.fn().mockResolvedValue('mock-preauth-token')
    }));
});

import AuthenticateUserService from '@/lib/service/authenticate-user-service';
import { OIDCContext } from '@/graphql/graphql-context';

// Import mocks
const mockDaoFactoryModule = jest.requireMock('@/lib/data-sources/dao-factory');
const mockIdentityDao = mockDaoFactoryModule.__mockIdentityDao;
const mockTenantDao = mockDaoFactoryModule.__mockTenantDao;
const mockKms = mockDaoFactoryModule.__mockKms;
const mockAuthDao = mockDaoFactoryModule.__mockAuthDao;
const mockClientDao = mockDaoFactoryModule.__mockClientDao;
const mockFederatedOIDCProviderDao = mockDaoFactoryModule.__mockFederatedOIDCProviderDao;
const mockChangeEventDao = mockDaoFactoryModule.__mockChangeEventDao;
const mockSearchDao = mockDaoFactoryModule.__mockSearchDao;
const mockAuthenticationGroupDao = mockDaoFactoryModule.__mockAuthenticationGroupDao;

describe('AuthenticateUserService', () => {
    let service: AuthenticateUserService;
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
                principalType: 'IAM_PORTAL_USER',
                scope: [
                    { scopeName: 'user.read' },
                    { scopeName: 'user.update' }
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

        service = new AuthenticateUserService(mockContext);
        jest.clearAllMocks();
    });

    describe('Initial tests', () => {
        it('should create service instance successfully', () => {
            expect(service).toBeInstanceOf(AuthenticateUserService);
        });
    });

    describe('authenticateHandleForgotPassword', () => {
        const mockAuthenticationStates = [
            {
                authenticationSessionToken: 'auth-session-123',
                authenticationState: 'ENTER_PASSWORD',
                authenticationStateOrder: 1,
                authenticationStateStatus: 'INCOMPLETE',
                expiresAtMs: Date.now() + 10000,
                tenantId: 'tenant-123',
                userId: 'user-123',
                preAuthToken: null,
                returnToUri: null
            },
            {
                authenticationSessionToken: 'auth-session-123',
                authenticationState: 'REDIRECT_TO_IAM_PORTAL',
                authenticationStateOrder: 2,
                authenticationStateStatus: 'INCOMPLETE',
                expiresAtMs: Date.now() + 10000,
                tenantId: 'tenant-123',
                userId: 'user-123',
                preAuthToken: null,
                returnToUri: null
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            enabled: true,
            markForDelete: false,
            nameOrder: 'WESTERN_NAME_ORDER',
            preferredLanguageCode: 'en'
        };

        beforeEach(() => {
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(mockAuthenticationStates);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.deleteUserAuthenticationState.mockResolvedValue(undefined);
            mockIdentityDao.createUserAuthenticationStates.mockResolvedValue(undefined);
            mockIdentityDao.savePasswordResetToken.mockResolvedValue(undefined);
            mockTenantDao.getSystemSettings.mockResolvedValue({
                noReplyEmail: 'noreply@example.com',
                contactEmail: 'contact@example.com'
            });
            mockTenantDao.getTenantLookAndFeel.mockResolvedValue({
                tenantId: 'root-tenant',
                brandName: 'Test Brand'
            });
        });

        it('should initiate password reset for primary email', async () => {
            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, false);

            expect(result.userAuthenticationState.authenticationState).toBe('VALIDATE_PASSWORD_RESET_TOKEN');
            expect(mockIdentityDao.savePasswordResetToken).toHaveBeenCalledWith('user-123', expect.any(String));
            expect(mockIdentityDao.deleteUserAuthenticationState).toHaveBeenCalledTimes(2);
            expect(mockIdentityDao.createUserAuthenticationStates).toHaveBeenCalled();
        });

        it('should initiate password reset for recovery email', async () => {
            const mockRecoveryEmail = {
                userId: 'user-123',
                email: 'recovery@example.com',
                emailVerified: true
            };
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(mockRecoveryEmail);

            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, true);

            expect(result.userAuthenticationState.authenticationState).toBe('VALIDATE_PASSWORD_RESET_TOKEN');
            expect(mockIdentityDao.getUserRecoveryEmail).toHaveBeenCalledWith('user-123');
        });

        it('should return error when not at correct authentication step', async () => {
            const wrongStepStates = [
                {
                    ...mockAuthenticationStates[0],
                    authenticationState: 'VALIDATE_EMAIL'
                }
            ];
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(wrongStepStates);

            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, false);

            expect(result.authenticationError?.errorCode).toBe('EC00095');
        });

        it('should return error when user does not exist', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, false);

            expect(result.authenticationError?.errorCode).toBe('EC00096');
        });

        it('should return error when user is disabled', async () => {
            const disabledUser = { ...mockUser, enabled: false };
            mockIdentityDao.getUserBy.mockResolvedValue(disabledUser);

            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, false);

            expect(result.authenticationError?.errorCode).toBe('EC00097');
        });

        it('should return error when user is marked for deletion', async () => {
            const deletedUser = { ...mockUser, markForDelete: true };
            mockIdentityDao.getUserBy.mockResolvedValue(deletedUser);

            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, false);

            expect(result.authenticationError?.errorCode).toBe('EC00097');
        });

        it('should return error when recovery email requested but not found', async () => {
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(null);

            const result = await service.authenticateHandleForgotPassword('auth-session-123', null, true);

            expect(result.authenticationError?.errorCode).toBe('EC00098');
        });
    });

    describe('authenticateValidatePasswordResetToken', () => {
        const mockAuthenticationStates = [
            {
                authenticationSessionToken: 'auth-session-123',
                authenticationState: 'VALIDATE_PASSWORD_RESET_TOKEN',
                authenticationStateOrder: 1,
                authenticationStateStatus: 'INCOMPLETE',
                expiresAtMs: Date.now() + 10000,
                tenantId: 'tenant-123',
                userId: 'user-123',
                preAuthToken: null,
                returnToUri: null
            },
            {
                authenticationSessionToken: 'auth-session-123',
                authenticationState: 'ROTATE_PASSWORD',
                authenticationStateOrder: 2,
                authenticationStateStatus: 'INCOMPLETE',
                expiresAtMs: Date.now() + 10000,
                tenantId: 'tenant-123',
                userId: 'user-123',
                preAuthToken: null,
                returnToUri: null
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            enabled: true,
            markForDelete: false
        };

        beforeEach(() => {
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(mockAuthenticationStates);
            mockIdentityDao.updateUserAuthenticationState.mockResolvedValue(undefined);
            mockIdentityDao.deletePasswordResetToken.mockResolvedValue(undefined);
        });

        it('should validate password reset token successfully', async () => {
            mockIdentityDao.getUserByPasswordResetToken.mockResolvedValue(mockUser);

            const result = await service.authenticateValidatePasswordResetToken('valid-token', 'auth-session-123', null);

            expect(result.userAuthenticationState.authenticationState).toBe('ROTATE_PASSWORD');
            expect(mockIdentityDao.deletePasswordResetToken).toHaveBeenCalledWith('valid-token');
            expect(mockIdentityDao.updateUserAuthenticationState).toHaveBeenCalled();
        });

        it('should return error when token is invalid', async () => {
            mockIdentityDao.getUserByPasswordResetToken.mockResolvedValue(null);

            const result = await service.authenticateValidatePasswordResetToken('invalid-token', 'auth-session-123', null);

            expect(result.authenticationError?.errorCode).toBe('EC00099');
        });

        it('should return error when user is disabled', async () => {
            const disabledUser = { ...mockUser, enabled: false };
            mockIdentityDao.getUserByPasswordResetToken.mockResolvedValue(disabledUser);

            const result = await service.authenticateValidatePasswordResetToken('valid-token', 'auth-session-123', null);

            expect(result.authenticationError?.errorCode).toBe('EC00097');
        });

        it('should return error when user is marked for deletion', async () => {
            const deletedUser = { ...mockUser, markForDelete: true };
            mockIdentityDao.getUserByPasswordResetToken.mockResolvedValue(deletedUser);

            const result = await service.authenticateValidatePasswordResetToken('valid-token', 'auth-session-123', null);

            expect(result.authenticationError?.errorCode).toBe('EC00097');
        });
    });

    describe('authenticateAcceptTermsAndConditions', () => {
        const mockAuthenticationStates = [
            {
                authenticationSessionToken: 'auth-session-123',
                authenticationState: 'ACCEPT_TERMS_AND_CONDITIONS',
                authenticationStateOrder: 1,
                authenticationStateStatus: 'INCOMPLETE',
                expiresAtMs: Date.now() + 10000,
                tenantId: 'tenant-123',
                userId: 'user-123',
                preAuthToken: null,
                returnToUri: null
            },
            {
                authenticationSessionToken: 'auth-session-123',
                authenticationState: 'REDIRECT_TO_IAM_PORTAL',
                authenticationStateOrder: 2,
                authenticationStateStatus: 'INCOMPLETE',
                expiresAtMs: Date.now() + 10000,
                tenantId: 'tenant-123',
                userId: 'user-123',
                preAuthToken: null,
                returnToUri: null
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            enabled: true
        };

        beforeEach(() => {
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(mockAuthenticationStates);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockIdentityDao.addUserTermsAndConditionsAccepted.mockResolvedValue(undefined);
            mockIdentityDao.updateUserAuthenticationState.mockResolvedValue(undefined);
        });

        it('should accept terms and conditions successfully', async () => {
            const result = await service.authenticateAcceptTermsAndConditions(true, 'auth-session-123', null);

            expect(mockIdentityDao.addUserTermsAndConditionsAccepted).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user-123',
                    tenantId: 'tenant-123'
                })
            );
            expect(mockIdentityDao.updateUserAuthenticationState).toHaveBeenCalled();
        });

        it('should return error when terms not accepted', async () => {
            const result = await service.authenticateAcceptTermsAndConditions(false, 'auth-session-123', null);

            expect(result.authenticationError?.errorCode).toBe('EC00100');
            expect(result.userAuthenticationState.authenticationState).toBe('ERROR');
        });

        it('should return error when user does not exist', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            const result = await service.authenticateAcceptTermsAndConditions(true, 'auth-session-123', null);

            expect(result.authenticationError?.errorCode).toBe('EC00096');
        });
    });

    describe('authenticateHandleUserCodeInput', () => {
        const mockDeviceCodeData = {
            deviceCodeId: 'device-code-123',
            userCode: 'hashed-user-code',
            clientId: 'client-123',
            expiresAtMs: Date.now() + 10000,
            authorizationStatus: 'PENDING',
            tenantId: 'tenant-123'
        };

        beforeEach(() => {
            mockAuthDao.getAuthorizationDeviceCodeData.mockResolvedValue(mockDeviceCodeData);
        });

        it('should validate user code successfully', async () => {
            const result = await service.authenticateHandleUserCodeInput('ABC123');

            expect(mockAuthDao.getAuthorizationDeviceCodeData).toHaveBeenCalled();
            expect(result.userAuthenticationState.authenticationState).toBe('ENTER_EMAIL');
        });

        it('should return error when device code not found', async () => {
            mockAuthDao.getAuthorizationDeviceCodeData.mockResolvedValue(null);

            const result = await service.authenticateHandleUserCodeInput('INVALID');

            expect(result.userAuthenticationState.authenticationState).toBe('ERROR');
            expect(result.authenticationError?.errorCode).toBe('EC00101');
        });

        it('should return error when device code expired', async () => {
            const expiredCode = {
                ...mockDeviceCodeData,
                expiresAtMs: Date.now() - 1000
            };
            mockAuthDao.getAuthorizationDeviceCodeData.mockResolvedValue(expiredCode);

            const result = await service.authenticateHandleUserCodeInput('ABC123');

            expect(result.userAuthenticationState.authenticationState).toBe('ERROR');
            expect(result.authenticationError?.errorCode).toBe('EC00102');
        });

        it('should return error when device code already approved', async () => {
            const approvedCode = {
                ...mockDeviceCodeData,
                authorizationStatus: 'APPROVED'
            };
            mockAuthDao.getAuthorizationDeviceCodeData.mockResolvedValue(approvedCode as any);

            const result = await service.authenticateHandleUserCodeInput('ABC123');

            expect(result.userAuthenticationState.authenticationState).toBe('ERROR');
            expect(result.authenticationError?.errorCode).toBe('EC00103');
        });

        it('should return error when device code cancelled', async () => {
            const cancelledCode = {
                ...mockDeviceCodeData,
                authorizationStatus: 'CANCELLED'
            };
            mockAuthDao.getAuthorizationDeviceCodeData.mockResolvedValue(cancelledCode as any);

            const result = await service.authenticateHandleUserCodeInput('ABC123');

            expect(result.userAuthenticationState.authenticationState).toBe('ERROR');
            expect(result.authenticationError?.errorCode).toBe('EC00103');
        });
    });

    describe('authenticateUser', () => {
        let mockUser: any;
        let mockAuthenticationStates: any[];

        beforeEach(() => {
            mockUser = {
                userId: 'user-123',
                email: 'test@example.com',
                domain: 'example.com',
                firstName: 'Test',
                lastName: 'User',
                nameOrder: 'FIRST_LAST',
                enabled: true,
                emailVerified: true,
                locked: false,
                markForDelete: false,
                forcePasswordResetAfterAuthentication: false
            };

            // Create fresh copies for each test to avoid state mutation issues
            mockAuthenticationStates = [
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'ENTER_PASSWORD',
                    authenticationStateOrder: 1,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                },
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'REDIRECT_TO_IAM_PORTAL',
                    authenticationStateOrder: 2,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                },
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'POST_AUTHN_STATE_SEND_SECURITY_EVENT_SUCCESS_LOGON',
                    authenticationStateOrder: 3,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                }
            ];

            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(mockAuthenticationStates);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
        });

        it('should authenticate user successfully with valid credentials', async () => {
            // Mock validateAuthenticationAttempt to return success
            const mockValidationResult = {
                isValid: true,
                isDuress: false,
                errorDetail: null
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);

            const result = await service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null);

            expect(result.userAuthenticationState.authenticationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.updateUserAuthenticationState).toHaveBeenCalledWith(
                expect.objectContaining({
                    authenticationStateStatus: 'COMPLETE'
                })
            );
        });

        it('should return error when not at correct authentication step', async () => {
            const wrongStateAuthStates = [
                {
                    ...mockAuthenticationStates[0],
                    authenticationState: 'VALIDATE_TOTP'
                }
            ];
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(wrongStateAuthStates);

            const result = await service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null);

            expect(result.userAuthenticationState.authenticationState).toBe('ERROR');
            expect(result.authenticationError?.errorCode).toBe('EC00095');
        });

        it('should throw error when user does not exist', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);

            await expect(
                service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null)
            ).rejects.toThrow();
        });

        it('should throw error when user is disabled', async () => {
            const disabledUser = { ...mockUser, enabled: false };
            mockIdentityDao.getUserBy.mockResolvedValue(disabledUser);

            await expect(
                service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null)
            ).rejects.toThrow();
        });

        it('should throw error when user is locked', async () => {
            const lockedUser = { ...mockUser, locked: true };
            mockIdentityDao.getUserBy.mockResolvedValue(lockedUser);

            await expect(
                service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null)
            ).rejects.toThrow();
        });

        it('should throw error when user is marked for deletion', async () => {
            const deletedUser = { ...mockUser, markForDelete: true };
            mockIdentityDao.getUserBy.mockResolvedValue(deletedUser);

            await expect(
                service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null)
            ).rejects.toThrow();
        });

        it('should return error when password validation fails', async () => {
            const mockValidationResult = {
                isValid: false,
                isDuress: false,
                errorDetail: {
                    errorCode: 'EC00108',
                    errorTitle: 'Invalid Credentials',
                    errorDescription: 'The username or password is incorrect'
                }
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);

            const result = await service.authenticateUser('test@example.com', 'wrongpassword', 'tenant-123', 'auth-session-123', null);

            expect(result.authenticationError?.errorCode).toBe('EC00108');
        });

        it('should handle duress password by changing final authentication state', async () => {
            const mockValidationResult = {
                isValid: true,
                isDuress: true,
                errorDetail: null
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);
            jest.spyOn(service as any, 'handleAuthenticationCompletion').mockResolvedValue(undefined);

            await service.authenticateUser('test@example.com', 'duresspassword', 'tenant-123', 'auth-session-123', null);

            // The code modifies the array element in place before deleting/recreating
            // So by the time deleteUserAuthenticationState is called, the state is already changed to DURESS_LOGON
            expect(mockIdentityDao.deleteUserAuthenticationState).toHaveBeenCalled();

            // Verify it was recreated with duress state
            expect(mockIdentityDao.createUserAuthenticationStates).toHaveBeenCalled();
            const createCall = mockIdentityDao.createUserAuthenticationStates.mock.calls[0][0];
            expect(createCall[0].authenticationState).toBe('POST_AUTHN_STATE_SEND_SECURITY_EVENT_DURESS_LOGON');
        });

        it('should return password config when next state is ROTATE_PASSWORD', async () => {
            const rotatePasswordStates = [
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'ENTER_PASSWORD',
                    authenticationStateOrder: 1,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                },
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'ROTATE_PASSWORD',
                    authenticationStateOrder: 2,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                }
            ];
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(rotatePasswordStates);

            const mockPasswordConfig = {
                tenantId: 'tenant-123',
                minimumLength: 8,
                maximumLength: 128,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialCharacters: true,
                requireMfa: false
            };

            // Mock the determineTenantPasswordConfig method
            jest.spyOn(service as any, 'determineTenantPasswordConfig').mockResolvedValue(mockPasswordConfig);

            const mockValidationResult = {
                isValid: true,
                isDuress: false,
                errorDetail: null
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);

            const result = await service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null);

            expect(result.passwordConfig).toBeDefined();
            expect(result.passwordConfig?.minimumLength).toBe(8);
        });

        it('should trigger email validation when next state is VALIDATE_EMAIL', async () => {
            const validateEmailStates = [
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'ENTER_PASSWORD',
                    authenticationStateOrder: 1,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                },
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'VALIDATE_EMAIL',
                    authenticationStateOrder: 2,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                }
            ];
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(validateEmailStates);

            const mockValidationResult = {
                isValid: true,
                isDuress: false,
                errorDetail: null
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);
            const sentEmailValidationTokenSpy = jest.spyOn(service as any, 'sentEmailValidationToken').mockResolvedValue(undefined);

            await service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null);

            expect(sentEmailValidationTokenSpy).toHaveBeenCalledWith(mockUser, mockUser.email);
        });

        it('should handle authentication completion when next state is REDIRECT_TO_IAM_PORTAL', async () => {
            const mockValidationResult = {
                isValid: true,
                isDuress: false,
                errorDetail: null
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);
            const handleAuthenticationCompletionSpy = jest.spyOn(service as any, 'handleAuthenticationCompletion').mockResolvedValue(undefined);

            await service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null);

            expect(handleAuthenticationCompletionSpy).toHaveBeenCalledWith(
                mockUser,
                expect.objectContaining({
                    authenticationState: 'REDIRECT_TO_IAM_PORTAL'
                }),
                mockAuthenticationStates,
                expect.any(Object)
            );
        });

        it('should handle authentication completion when next state is REDIRECT_BACK_TO_APPLICATION', async () => {
            const redirectBackStates = [
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'ENTER_PASSWORD',
                    authenticationStateOrder: 1,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                },
                {
                    authenticationSessionToken: 'auth-session-123',
                    authenticationState: 'REDIRECT_BACK_TO_APPLICATION',
                    authenticationStateOrder: 2,
                    authenticationStateStatus: 'INCOMPLETE',
                    expiresAtMs: Date.now() + 10000,
                    tenantId: 'tenant-123',
                    userId: 'user-123',
                    preAuthToken: null,
                    returnToUri: null
                }
            ];
            mockIdentityDao.getUserAuthenticationStates.mockResolvedValue(redirectBackStates);

            const mockValidationResult = {
                isValid: true,
                isDuress: false,
                errorDetail: null
            };
            jest.spyOn(service as any, 'validateAuthenticationAttempt').mockResolvedValue(mockValidationResult);
            const handleAuthenticationCompletionSpy = jest.spyOn(service as any, 'handleAuthenticationCompletion').mockResolvedValue(undefined);

            await service.authenticateUser('test@example.com', 'password123', 'tenant-123', 'auth-session-123', null);

            expect(handleAuthenticationCompletionSpy).toHaveBeenCalledWith(
                mockUser,
                expect.objectContaining({
                    authenticationState: 'REDIRECT_BACK_TO_APPLICATION'
                }),
                redirectBackStates,
                expect.any(Object)
            );
        });
    });
});
