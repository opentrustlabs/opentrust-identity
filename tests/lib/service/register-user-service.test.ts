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
    generateUserCredential: jest.fn()
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
        addUserCredential: jest.fn(),
        deleteUser: jest.fn(),
        addUserAuthenticationHistory: jest.fn(),
        updateUserRegistrationState: jest.fn(),
        getUserCredentials: jest.fn(),
        addUserDuressCredential: jest.fn(),
        addRecoveryEmail: jest.fn()
    };

    const mockTenantDaoImpl = {
        getTenantById: jest.fn(),
        getRootTenant: jest.fn(),
        getSystemSettings: jest.fn(),
        getTenantLookAndFeel: jest.fn(),
        getTenantPasswordConfig: jest.fn(),
        getDomainsForTenantRestrictedAuthentication: jest.fn(),
        getCaptchaConfig: jest.fn(),
        getDomainManagedByExternalOidcProvider: jest.fn()
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

    const mockSearchDaoImpl = {
        updateObjectSearchIndex: jest.fn().mockResolvedValue(undefined)
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
                getSearchDao: () => mockSearchDaoImpl
            }))
        },
        __mockIdentityDao: mockIdentityDaoImpl,
        __mockTenantDao: mockTenantDaoImpl,
        __mockKms: mockKmsImpl,
        __mockAuthDao: mockAuthDaoImpl,
        __mockClientDao: mockClientDaoImpl,
        __mockFederatedOIDCProviderDao: mockFederatedOIDCProviderDaoImpl,
        __mockChangeEventDao: mockChangeEventDaoImpl,
        __mockSearchDao: mockSearchDaoImpl
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
        getAuthTokenForOutboundCalls: jest.fn().mockResolvedValue('mock-auth-token'),
        signIAMPortalUserJwt: jest.fn().mockResolvedValue({
            accessToken: 'mock-portal-jwt-token',
            principal: {
                jti: 'mock-jti-123',
                userId: 'user-123',
                tenantId: 'tenant-123'
            }
        })
    }));
});

import RegisterUserService from '@/lib/service/register-user-service';
import { OIDCContext } from '@/graphql/graphql-context';
import {
    UserCreateInput,
    TenantRestrictedAuthenticationDomainRel
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

describe('RegisterUserService', () => {
    let service: RegisterUserService;
    let mockContext: OIDCContext;

    beforeEach(() => {
        mockContext = {
            portalUserProfile: {
                firstName: 'Service',
                lastName: 'Account',
                email: 'service@example.com',
                userId: 'service-123',
                tenantId: 'root-tenant',
                managementAccessTenantId: 'root-tenant',
                preferredLanguageCode: 'en',
                principalType: 'SERVICE_ACCOUNT_TOKEN',
                scope: [
                    { scopeName: 'user.create' },
                    { scopeName: 'user.read' },
                    { scopeName: 'tenant.all.read' }
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

        service = new RegisterUserService(mockContext);
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        const mockUserCreateInput: UserCreateInput = {
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            phoneNumber: null,
            password: 'SecurePass123!',
            nameOrder: 'WESTERN_NAME_ORDER'
        };

        const mockRestrictedDomains: TenantRestrictedAuthenticationDomainRel[] = [
            {
                tenantId: 'tenant-123',
                domain: 'example.com',
                enabled: true
            }
        ];

        it('should throw error when no portal user profile', async () => {
            const contextWithoutProfile = {
                ...mockContext,
                portalUserProfile: null
            } as OIDCContext;

            service = new RegisterUserService(contextWithoutProfile);

            await expect(service.createUser(mockUserCreateInput, 'tenant-123'))
                .rejects.toThrow('Insufficient permissions to perform operation.');
        });

        it('should throw error when principal is not service account', async () => {
            const contextWithRegularUser = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    principalType: 'IAM_PORTAL_USER'
                }
            } as OIDCContext;

            service = new RegisterUserService(contextWithRegularUser);

            await expect(service.createUser(mockUserCreateInput, 'tenant-123'))
                .rejects.toThrow('Insufficient permissions to perform operation.');
        });

        it('should throw error when missing user.create scope', async () => {
            const contextWithoutScope = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    scope: [{ scopeName: 'user.read' }]
                }
            } as OIDCContext;

            service = new RegisterUserService(contextWithoutScope);

            await expect(service.createUser(mockUserCreateInput, 'tenant-123'))
                .rejects.toThrow('Insufficient permissions to perform operation.');
        });

        it('should throw error when non-root tenant service account creates user in different tenant', async () => {
            const contextWithNonRootTenant = {
                ...mockContext,
                portalUserProfile: {
                    ...mockContext.portalUserProfile!,
                    tenantId: 'tenant-456'
                },
                rootTenant: {
                    tenantId: 'root-tenant-different',
                    tenantName: 'Root Tenant',
                    tenantDescription: 'Root Tenant'
                }
            } as OIDCContext;

            service = new RegisterUserService(contextWithNonRootTenant);

            await expect(service.createUser(mockUserCreateInput, 'tenant-123'))
                .rejects.toThrow('Insufficient permissions to perform operation.');
        });

        it('should throw error when tenant has no restricted authentication domains', async () => {
            mockTenantDao.getDomainsForTenantRestrictedAuthentication.mockResolvedValue([]);

            await expect(service.createUser(mockUserCreateInput, 'tenant-123'))
                .rejects.toThrow('Insufficient permissions to perform operation.');
        });

        it('should throw error when user email domain does not match restricted domains', async () => {
            const invalidDomainInput = {
                ...mockUserCreateInput,
                email: 'user@otherdomain.com'
            };

            mockTenantDao.getDomainsForTenantRestrictedAuthentication.mockResolvedValue(mockRestrictedDomains);

            await expect(service.createUser(invalidDomainInput, 'tenant-123'))
                .rejects.toThrow('Insufficient permissions to perform operation.');
        });

        it('should format email to lowercase', async () => {
            const inputWithUppercaseEmail = {
                ...mockUserCreateInput,
                email: 'NEWUSER@EXAMPLE.COM'
            };

            mockTenantDao.getDomainsForTenantRestrictedAuthentication.mockResolvedValue(mockRestrictedDomains);

            // Mock the _createUser private method by mocking the getUserBy to throw (user doesn't exist)
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue({
                tenantId: 'tenant-123',
                tenantName: 'Test Tenant',
                verifyEmailOnSelfRegistration: false
            });
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue({
                requireMfa: false,
                minimumPasswordLength: 8
            });

            // We can't easily test the full flow without mocking _createUser
            // So we'll verify the email was formatted by checking the error or success
            try {
                await service.createUser(inputWithUppercaseEmail, 'tenant-123');
            } catch (e) {
                // Expected to potentially fail at _createUser level
                // But the email should have been formatted before that
            }

            // Verify the email was formatted (the input object is mutated)
            expect(inputWithUppercaseEmail.email).toBe('newuser@example.com');
        });

        it('should format phone number when provided', async () => {
            const inputWithPhone = {
                ...mockUserCreateInput,
                phoneNumber: '(555) 123-4567'
            };

            mockTenantDao.getDomainsForTenantRestrictedAuthentication.mockResolvedValue(mockRestrictedDomains);

            try {
                await service.createUser(inputWithPhone, 'tenant-123');
            } catch (e) {
                // Expected to potentially fail at _createUser level
            }

            // Verify the phone was formatted (the input object is mutated)
            expect(inputWithPhone.phoneNumber).toBe('+5551234567');
        });
    });

    describe('registerUser', () => {
        const mockUserCreateInput: UserCreateInput = {
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            phoneNumber: null,
            password: 'SecurePass123!',
            nameOrder: 'WESTERN_NAME_ORDER'
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant',
            verifyEmailOnSelfRegistration: false
        };

        const mockPasswordConfig = {
            requireMfa: false,
            minimumPasswordLength: 8
        };

        const mockSystemSettings = {
            allowRecoveryEmail: true,
            allowDuressPassword: true
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStatesByEmail.mockResolvedValue([]);
            mockIdentityDao.createUserRegistrationStates.mockResolvedValue(undefined);
            mockIdentityDao.createUser.mockResolvedValue(undefined);
            mockIdentityDao.assignUserToTenant.mockResolvedValue(undefined);
            mockIdentityDao.saveUserTermsAndConditionsAccepted.mockResolvedValue(undefined);
            mockIdentityDao.saveEmailConfirmationToken.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserCredential.mockResolvedValue(undefined);
            mockIdentityDao.deleteRecoveryEmail.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserDuressCredential.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserTermsAndConditionsAccepted.mockResolvedValue(undefined);
            mockIdentityDao.deleteTOTP.mockResolvedValue(undefined);
            mockIdentityDao.removeUserFromTenant.mockResolvedValue(undefined);
            mockIdentityDao.addUserCredential.mockResolvedValue(undefined);
            mockIdentityDao.deleteUser.mockResolvedValue(undefined);
            mockIdentityDao.deleteFIDO2Challenge.mockResolvedValue(undefined);
            mockIdentityDao.deleteFido2Count.mockResolvedValue(undefined);
            mockIdentityDao.deleteFIDOKey.mockResolvedValue(undefined);
            mockTenantDao.getSystemSettings.mockResolvedValue(mockSystemSettings);
            mockTenantDao.getDomainManagedByExternalOidcProvider.mockResolvedValue(null);
            mockTenantDao.getDomainsForTenantRestrictedAuthentication.mockResolvedValue([]);
            mockChangeEventDao.addChangeEvent.mockResolvedValue(undefined);
        });

        it('should throw error when registration already in progress', async () => {
            const existingRegistration = {
                email: 'newuser@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000, // Not expired
                registrationSessionToken: 'token-123',
                registrationState: 'ValidateEmail',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            };

            mockIdentityDao.getUserRegistrationStatesByEmail.mockResolvedValue([existingRegistration]);

            await expect(service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null))
                .rejects.toThrow('EC00133');
        });

        it('should delete expired registration and continue', async () => {
            const expiredRegistration = {
                email: 'newuser@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() - 10000, // Expired
                registrationSessionToken: 'token-123',
                registrationState: 'ValidateEmail',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            };

            mockIdentityDao.getUserRegistrationStatesByEmail.mockResolvedValue([expiredRegistration]);
            mockIdentityDao.deleteUserRegistrationState.mockResolvedValue(undefined);
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            const result = await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            expect(mockIdentityDao.deleteUserRegistrationState).toHaveBeenCalledWith(expiredRegistration);
            expect(result).toHaveProperty('userRegistrationState');
        });

        it('should include email validation when tenant requires it', async () => {
            const tenantWithEmailVerification = {
                ...mockTenant,
                verifyEmailOnSelfRegistration: true
            };

            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(tenantWithEmailVerification);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            // Check that createUserRegistrationStates was called with VALIDATE_EMAIL state
            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasValidateEmail = statesCreated.some((state: any) => state.registrationState === 'VALIDATE_EMAIL');
            expect(hasValidateEmail).toBe(true);
        });

        it('should configure both TOTP and FIDO2 when both are required', async () => {
            const passwordConfigWithBothMfa = {
                ...mockPasswordConfig,
                requireMfa: true,
                mfaTypesRequired: 'TIME_BASED_OTP,FIDO2'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(passwordConfigWithBothMfa);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasConfigureTotpRequired = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_TOTP_REQUIRED');
            const hasConfigureSecurityKeyRequired = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_SECURITY_KEY_REQUIRED');

            expect(hasConfigureTotpRequired).toBe(true);
            expect(hasConfigureSecurityKeyRequired).toBe(true);
        });

        it('should configure TOTP required and FIDO2 optional when only TOTP required', async () => {
            const passwordConfigWithTotpOnly = {
                ...mockPasswordConfig,
                requireMfa: true,
                mfaTypesRequired: 'TIME_BASED_OTP'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(passwordConfigWithTotpOnly);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasConfigureTotpRequired = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_TOTP_REQUIRED');
            const hasConfigureSecurityKeyOptional = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_SECURITY_KEY_OPTIONAL');

            expect(hasConfigureTotpRequired).toBe(true);
            expect(hasConfigureSecurityKeyOptional).toBe(true);
        });

        it('should configure FIDO2 required and TOTP optional when only FIDO2 required', async () => {
            const passwordConfigWithFido2Only = {
                ...mockPasswordConfig,
                requireMfa: true,
                mfaTypesRequired: 'FIDO2'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(passwordConfigWithFido2Only);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasConfigureSecurityKeyRequired = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_SECURITY_KEY_REQUIRED');
            const hasConfigureTotpOptional = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_TOTP_OPTIONAL');

            expect(hasConfigureSecurityKeyRequired).toBe(true);
            expect(hasConfigureTotpOptional).toBe(true);
        });

        it('should configure MFA as optional when not required', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasConfigureTotpOptional = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_TOTP_OPTIONAL');
            const hasConfigureSecurityKeyOptional = statesCreated.some((state: any) => state.registrationState === 'CONFIGURE_SECURITY_KEY_OPTIONAL');

            expect(hasConfigureTotpOptional).toBe(true);
            expect(hasConfigureSecurityKeyOptional).toBe(true);
        });

        it('should include recovery email states when system allows it', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasAddRecoveryEmail = statesCreated.some((state: any) => state.registrationState === 'ADD_RECOVERY_EMAIL_OPTIONAL');

            expect(hasAddRecoveryEmail).toBe(true);
        });

        it('should include duress password state when system allows it', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasAddDuressPassword = statesCreated.some((state: any) => state.registrationState === 'ADD_DURESS_PASSWORD_OPTIONAL');

            expect(hasAddDuressPassword).toBe(true);
        });

        it('should redirect to application when preAuthToken is provided', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(mockUserCreateInput, 'tenant-123', 'pre-auth-token-123', null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasRedirectToApp = statesCreated.some((state: any) => state.registrationState === 'REDIRECT_BACK_TO_APPLICATION');

            expect(hasRedirectToApp).toBe(true);
        });

        it('should redirect to IAM portal when no preAuthToken', async () => {
            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(mockUserCreateInput, 'tenant-123', null, null, null);

            const statesCreated = mockIdentityDao.createUserRegistrationStates.mock.calls[0][0];
            const hasRedirectToPortal = statesCreated.some((state: any) => state.registrationState === 'REDIRECT_TO_IAM_PORTAL');

            expect(hasRedirectToPortal).toBe(true);
        });

        it('should format email to lowercase', async () => {
            const inputWithUppercase = {
                ...mockUserCreateInput,
                email: 'NEWUSER@EXAMPLE.COM'
            };

            mockIdentityDao.getUserBy.mockResolvedValue(null);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue(mockPasswordConfig);

            await service.registerUser(inputWithUppercase, 'tenant-123', null, null, null);

            expect(inputWithUppercase.email).toBe('newuser@example.com');
        });
    });

    describe('registerVerifyEmailAddress', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_EMAIL',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'CONFIGURE_TOTP_OPTIONAL',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            emailVerified: false
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should verify email successfully and return next state', async () => {
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(mockUser);
            mockIdentityDao.deleteEmailConfirmationToken.mockResolvedValue(undefined);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);

            const result = await service.registerVerifyEmailAddress('user-123', 'valid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('CONFIGURE_TOTP_OPTIONAL');
            expect(mockIdentityDao.deleteEmailConfirmationToken).toHaveBeenCalledWith('valid-token');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });

        it('should return error when token is invalid', async () => {
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(null);
            mockIdentityDao.deleteEmailConfirmationToken.mockResolvedValue(undefined);

            const result = await service.registerVerifyEmailAddress('user-123', 'invalid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError.errorCode).toBe('EC00134');
        });

        it('should return error when user ID does not match', async () => {
            const differentUser = { ...mockUser, userId: 'different-user' };
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(differentUser);

            const result = await service.registerVerifyEmailAddress('user-123', 'valid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError.errorCode).toBe('EC00135');
        });

        it('should return error when registration states not found', async () => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue([]);

            const result = await service.registerVerifyEmailAddress('user-123', 'valid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).not.toBe('CONFIGURE_TOTP_OPTIONAL');
        });
    });

    describe('registerVerifyRecoveryEmail', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_RECOVERY_EMAIL',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com'
        };

        const mockRecoveryEmail = {
            userId: 'user-123',
            email: 'recovery@example.com',
            emailVerified: false
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should verify recovery email successfully', async () => {
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(mockUser);
            mockIdentityDao.deleteEmailConfirmationToken.mockResolvedValue(undefined);
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(mockRecoveryEmail);
            mockIdentityDao.updateRecoveryEmail.mockResolvedValue(undefined);

            const result = await service.registerVerifyRecoveryEmail('user-123', 'valid-token', 'session-token-123', null);

            expect(mockIdentityDao.deleteEmailConfirmationToken).toHaveBeenCalledWith('valid-token');
            expect(mockIdentityDao.updateRecoveryEmail).toHaveBeenCalledWith({
                userId: 'user-123',
                email: 'recovery@example.com',
                emailVerified: true
            });
        });

        it('should return error when token is invalid', async () => {
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(null);
            mockIdentityDao.deleteEmailConfirmationToken.mockResolvedValue(undefined);

            const result = await service.registerVerifyRecoveryEmail('user-123', 'invalid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError.errorCode).toBe('EC00134');
        });

        it('should return error when user ID does not match', async () => {
            const differentUser = { ...mockUser, userId: 'different-user' };
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(differentUser);

            const result = await service.registerVerifyRecoveryEmail('user-123', 'valid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError.errorCode).toBe('EC00135');
        });

        it('should return error when recovery email not found', async () => {
            mockIdentityDao.getUserByEmailConfirmationToken.mockResolvedValue(mockUser);
            mockIdentityDao.deleteEmailConfirmationToken.mockResolvedValue(undefined);
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(null);

            const result = await service.registerVerifyRecoveryEmail('user-123', 'valid-token', 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError.errorCode).toBe('EC00136');
        });
    });

    describe('registerAddDuressPassword', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_EMAIL',
                registrationStateOrder: 0,
                registrationStateStatus: 'COMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'ADD_DURESS_PASSWORD_OPTIONAL',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockCredential = {
            userId: 'user-123',
            password: 'hashed-password',
            passwordHashingAlgorithm: 'BCRYPT'
        };

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            enabled: false
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant'
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
            mockTenantDao.getTenantPasswordConfig.mockResolvedValue({
                minimumPasswordLength: 8,
                requireMfa: false
            });
            // Mocks for handleRegistrationCompletion
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should skip duress password when skip is true', async () => {
            const result = await service.registerAddDuressPassword('user-123', null, true, 'session-token-123', null);

            expect(result.userRegistrationState.registrationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.addUserDuressCredential).not.toHaveBeenCalled();
        });

        it('should add duress password successfully', async () => {
            mockIdentityDao.getUserCredentials.mockResolvedValue([mockCredential]);
            mockIdentityDao.addUserDuressCredential.mockResolvedValue(undefined);

            const result = await service.registerAddDuressPassword('user-123', 'DifferentPass123!', false, 'session-token-123', null);

            expect(mockIdentityDao.addUserDuressCredential).toHaveBeenCalled();
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });

        it('should return error when password is null and skip is false', async () => {
            const result = await service.registerAddDuressPassword('user-123', null, false, 'session-token-123', null);

            expect(result.registrationError?.errorCode).toBe('EC00137');
        });

        it('should return error when password is empty string and skip is false', async () => {
            const result = await service.registerAddDuressPassword('user-123', '', false, 'session-token-123', null);

            expect(result.registrationError?.errorCode).toBe('EC00137');
        });

        it('should return error when user has no credentials', async () => {
            mockIdentityDao.getUserCredentials.mockResolvedValue([]);

            const result = await service.registerAddDuressPassword('user-123', 'NewPass123!', false, 'session-token-123', null);

            expect(result.registrationError?.errorCode).toBe('EC00138');
        });

        it('should return error when user has multiple credentials', async () => {
            mockIdentityDao.getUserCredentials.mockResolvedValue([mockCredential, mockCredential]);

            const result = await service.registerAddDuressPassword('user-123', 'NewPass123!', false, 'session-token-123', null);

            expect(result.registrationError?.errorCode).toBe('EC00138');
        });
    });

    describe('registerAddRecoveryEmail', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'ADD_RECOVERY_EMAIL_OPTIONAL',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_RECOVERY_EMAIL',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 3,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com'
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant',
            verifyEmailOnSelfRegistration: false
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
            // Mock getUserBy to return user when getting by ID, null when checking email conflicts
            mockIdentityDao.getUserBy.mockImplementation((field: string, value: string) => {
                if (field === 'id') return Promise.resolve(mockUser);
                if (field === 'email') return Promise.resolve(null); // No conflict
                return Promise.resolve(null);
            });
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            // Mock recovery email validation dependencies
            mockIdentityDao.getUserRecoveryEmail.mockResolvedValue(null);
            mockFederatedOIDCProviderDao.getFederatedOidcProviderByDomain.mockResolvedValue(null);
        });

        it('should skip recovery email when skip is true', async () => {
            const result = await service.registerAddRecoveryEmail('user-123', null, 'session-token-123', null, true);

            expect(result.userRegistrationState.registrationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.addRecoveryEmail).not.toHaveBeenCalled();
            // Should also mark validation step as complete
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalledTimes(2);
        });

        it('should add recovery email successfully without verification', async () => {
            mockIdentityDao.addRecoveryEmail.mockResolvedValue(undefined);

            const result = await service.registerAddRecoveryEmail('user-123', 'recovery@example.com', 'session-token-123', null, false);

            expect(mockIdentityDao.addRecoveryEmail).toHaveBeenCalledWith({
                userId: 'user-123',
                email: 'recovery@example.com',
                emailVerified: false
            });
            expect(result.userRegistrationState.registrationState).toBe('VALIDATE_RECOVERY_EMAIL');
        });

        it('should add recovery email with email verification when tenant requires it', async () => {
            const tenantWithVerification = {
                ...mockTenant,
                verifyEmailOnSelfRegistration: true
            };
            mockTenantDao.getTenantById.mockResolvedValue(tenantWithVerification);
            mockIdentityDao.addRecoveryEmail.mockResolvedValue(undefined);
            mockIdentityDao.saveEmailConfirmationToken.mockResolvedValue(undefined);

            const result = await service.registerAddRecoveryEmail('user-123', 'recovery@example.com', 'session-token-123', null, false);

            expect(mockIdentityDao.addRecoveryEmail).toHaveBeenCalled();
            expect(mockIdentityDao.saveEmailConfirmationToken).toHaveBeenCalled();
        });

        it('should return error when email is null and skip is false', async () => {
            const result = await service.registerAddRecoveryEmail('user-123', null, 'session-token-123', null, false);

            expect(result.registrationError?.errorCode).toBe('EC00140');
        });

        it('should return error when email is empty string and skip is false', async () => {
            const result = await service.registerAddRecoveryEmail('user-123', '', 'session-token-123', null, false);

            expect(result.registrationError?.errorCode).toBe('EC00140');
        });

        it('should format recovery email to lowercase', async () => {
            mockIdentityDao.addRecoveryEmail.mockResolvedValue(undefined);

            await service.registerAddRecoveryEmail('user-123', 'RECOVERY@EXAMPLE.COM', 'session-token-123', null, false);

            expect(mockIdentityDao.addRecoveryEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'recovery@example.com'
                })
            );
        });
    });

    describe('registerConfigureTOTP', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_EMAIL',
                registrationStateOrder: 0,
                registrationStateStatus: 'COMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'CONFIGURE_TOTP_OPTIONAL',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_TOTP',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 3,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            enabled: false
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant'
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should skip TOTP configuration when skip is true', async () => {
            const result = await service.registerConfigureTOTP('user-123', 'session-token-123', null, true);

            expect(result.userRegistrationState.registrationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
            expect(result.totpSecret).toBeNull();
        });

        it('should configure TOTP successfully when skip is false', async () => {
            const mockTotpResponse = {
                userMFARel: {
                    userId: 'user-123',
                    totpSecret: 'mock-totp-secret-123',
                    verified: false
                },
                uri: 'otpauth://totp/Test:user-123?secret=mock-totp-secret-123&issuer=Test'
            };

            // Mock createTOTP method
            jest.spyOn(service as any, 'createTOTP').mockResolvedValue(mockTotpResponse);

            const result = await service.registerConfigureTOTP('user-123', 'session-token-123', null, false);

            expect(result.userRegistrationState.registrationState).toBe('VALIDATE_TOTP');
            expect(result.totpSecret).toBe('mock-totp-secret-123');
            expect(result.uri).toBe('otpauth://totp/Test:user-123?secret=mock-totp-secret-123&issuer=Test');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });

        it('should return error when createTOTP fails', async () => {
            // Mock createTOTP to throw an error
            jest.spyOn(service as any, 'createTOTP').mockRejectedValue(new Error('TOTP creation failed'));

            const result = await service.registerConfigureTOTP('user-123', 'session-token-123', null, false);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError?.errorCode).toBe('EC00127');
        });
    });

    describe('registerValidateTOTP', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'CONFIGURE_TOTP_OPTIONAL',
                registrationStateOrder: 0,
                registrationStateStatus: 'COMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_TOTP',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            enabled: false
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant'
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should validate TOTP successfully with valid token', async () => {
            // Mock validateTOTP method
            jest.spyOn(service as any, 'validateTOTP').mockResolvedValue(true);

            const result = await service.registerValidateTOTP('user-123', 'session-token-123', '123456', null);

            expect(result.userRegistrationState.registrationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });

        it('should return error when token is invalid', async () => {
            // Mock validateTOTP to return false
            jest.spyOn(service as any, 'validateTOTP').mockResolvedValue(false);

            const result = await service.registerValidateTOTP('user-123', 'session-token-123', 'invalid-token', null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError?.errorCode).toBe('EC00120');
        });
    });

    describe('registerConfigureSecurityKey', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_EMAIL',
                registrationStateOrder: 0,
                registrationStateStatus: 'COMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'CONFIGURE_SECURITY_KEY_OPTIONAL',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_SECURITY_KEY',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 3,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            enabled: false
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant'
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should skip security key configuration when skip is true', async () => {
            const result = await service.registerConfigureSecurityKey('user-123', 'session-token-123', null, null, true);

            expect(result.userRegistrationState.registrationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });

        it('should return error when fido2KeyRegistrationInput is null and skip is false', async () => {
            const result = await service.registerConfigureSecurityKey('user-123', 'session-token-123', null, null, false);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError?.errorCode).toBe('EC00128');
        });

        it('should configure security key successfully', async () => {
            const mockFido2Input = {
                id: 'mock-credential-id',
                rawId: 'mock-raw-id',
                response: {
                    clientDataJSON: 'mock-client-data',
                    attestationObject: 'mock-attestation'
                },
                type: 'public-key',
                keyName: 'My Security Key'
            };

            // Mock registerFIDO2Key method
            jest.spyOn(service as any, 'registerFIDO2Key').mockResolvedValue(undefined);

            const result = await service.registerConfigureSecurityKey('user-123', 'session-token-123', mockFido2Input, null, false);

            expect(result.userRegistrationState.registrationState).toBe('VALIDATE_SECURITY_KEY');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });
    });

    describe('registerValidateSecurityKey', () => {
        const mockRegistrationStates = [
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'CONFIGURE_SECURITY_KEY_OPTIONAL',
                registrationStateOrder: 0,
                registrationStateStatus: 'COMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'VALIDATE_SECURITY_KEY',
                registrationStateOrder: 1,
                registrationStateStatus: 'INCOMPLETE'
            },
            {
                email: 'test@example.com',
                tenantId: 'tenant-123',
                userId: 'user-123',
                expiresAtMs: Date.now() + 10000,
                registrationSessionToken: 'session-token-123',
                registrationState: 'REDIRECT_TO_IAM_PORTAL',
                registrationStateOrder: 2,
                registrationStateStatus: 'INCOMPLETE'
            }
        ];

        const mockUser = {
            userId: 'user-123',
            email: 'test@example.com',
            enabled: false
        };

        const mockTenant = {
            tenantId: 'tenant-123',
            tenantName: 'Test Tenant'
        };

        beforeEach(() => {
            mockIdentityDao.getUserRegistrationStates.mockResolvedValue(mockRegistrationStates);
            mockIdentityDao.updateUserRegistrationState.mockResolvedValue(undefined);
            mockIdentityDao.getUserBy.mockResolvedValue(mockUser);
            mockTenantDao.getTenantById.mockResolvedValue(mockTenant);
            mockIdentityDao.updateUser.mockResolvedValue(undefined);
            mockIdentityDao.deleteUserRegistrationState.mockResolvedValue(undefined);
        });

        it('should validate security key successfully', async () => {
            const mockFido2AuthInput = {
                id: 'mock-credential-id',
                rawId: 'mock-raw-id',
                response: {
                    clientDataJSON: 'mock-client-data',
                    authenticatorData: 'mock-auth-data',
                    signature: 'mock-signature'
                },
                type: 'public-key'
            };

            // Mock authenticateFIDO2Key method
            jest.spyOn(service as any, 'authenticateFIDO2Key').mockResolvedValue(true);

            const result = await service.registerValidateSecurityKey('user-123', 'session-token-123', mockFido2AuthInput, null);

            expect(result.userRegistrationState.registrationState).toBe('REDIRECT_TO_IAM_PORTAL');
            expect(mockIdentityDao.updateUserRegistrationState).toHaveBeenCalled();
        });

        it('should return error when security key validation fails', async () => {
            const mockFido2AuthInput = {
                id: 'mock-credential-id',
                rawId: 'mock-raw-id',
                response: {
                    clientDataJSON: 'mock-client-data',
                    authenticatorData: 'mock-auth-data',
                    signature: 'mock-signature'
                },
                type: 'public-key'
            };

            // Mock authenticateFIDO2Key to return false
            jest.spyOn(service as any, 'authenticateFIDO2Key').mockResolvedValue(false);

            const result = await service.registerValidateSecurityKey('user-123', 'session-token-123', mockFido2AuthInput, null);

            expect(result.userRegistrationState.registrationState).toBe('ERROR');
            expect(result.registrationError?.errorCode).toBe('EC00121');
        });
    });
});
