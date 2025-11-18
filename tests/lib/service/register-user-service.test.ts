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
        addUserAuthenticationHistory: jest.fn()
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
});
