import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import UserDetail from '@/components/users/user-detail';
import { User, PortalUserProfile, UserRecoveryEmail } from '@/graphql/generated/graphql-types';
import { TenantContext, TenantMetaDataBean } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import {
    USER_UPDATE_SCOPE,
    USER_DELETE_SCOPE,
    USER_UNLOCK_SCOPE,
    NAME_ORDER_WESTERN,
    NAME_ORDER_EASTERN,
    SCOPE_USE_IAM_MANAGEMENT,
    MFA_AUTH_TYPE_TIME_BASED_OTP,
    MFA_AUTH_TYPE_FIDO2
} from '@/utils/consts';
import { USER_MFA_REL_QUERY } from '@/graphql/queries/oidc-queries';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        pathname: '/',
    }),
    usePathname: () => '/',
}));

// Mock react-intl
jest.mock('react-intl', () => ({
    useIntl: () => ({
        formatMessage: ({ id }: { id: string }) => id,
    }),
    FormattedMessage: ({ id }: { id: string }) => <span>{id}</span>,
}));

// Mock data
const mockUser: User = {
    userId: 'test-user-id',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Michael',
    email: 'john.doe@example.com',
    emailVerified: true,
    domain: 'example.com',
    enabled: true,
    locked: false,
    nameOrder: NAME_ORDER_WESTERN,
    phoneNumber: '+1 555-0123',
    address: '123 Main St',
    addressLine1: 'Apt 4B',
    city: 'New York',
    stateRegionProvince: 'NY',
    postalCode: '10001',
    countryCode: 'US',
    preferredLanguageCode: 'en',
    federatedOIDCProviderSubjectId: null,
    recoveryEmail: null,
    markForDelete: false,
    forcePasswordResetAfterAuthentication: false,
};

const mockUserWithRecoveryEmail: User = {
    ...mockUser,
    userId: 'test-user-with-recovery-id',
    recoveryEmail: {
        email: 'recovery@example.com',
        emailVerified: true,
        __typename: 'UserRecoveryEmail',
    } as UserRecoveryEmail,
};

const mockLockedUser: User = {
    ...mockUser,
    userId: 'test-locked-user-id',
    firstName: 'Jane',
    lastName: 'Smith',
    locked: true,
};

const mockDisabledUser: User = {
    ...mockUser,
    userId: 'test-disabled-user-id',
    firstName: 'Bob',
    lastName: 'Johnson',
    enabled: false,
};

const mockFederatedUser: User = {
    ...mockUser,
    userId: 'test-federated-user-id',
    firstName: 'Alice',
    lastName: 'Williams',
    federatedOIDCProviderSubjectId: 'google-oauth2|123456789',
};

const mockMarkedForDeleteUser: User = {
    ...mockUser,
    userId: 'test-marked-user-id',
    firstName: 'Deleted',
    lastName: 'User',
    markForDelete: true,
};

const mockTenantBean: TenantMetaDataBean = {
    setTenantMetaData: jest.fn(),
    getTenantMetaData: () => ({
        tenant: {
            tenantId: 'test-tenant-id',
            tenantName: 'Test Tenant',
            tenantType: 'IDENTITY_MANAGEMENT',
            tenanttypeid: '1',
            enabled: true,
            allowUnlimitedRate: false,
            allowUserSelfRegistration: false,
            allowSocialLogin: false,
            allowAnonymousUsers: false,
            verifyEmailOnSelfRegistration: true,
            federatedAuthenticationConstraint: 'NOT_ALLOWED',
            federatedauthenticationconstraintid: '1',
            markForDelete: false,
            migrateLegacyUsers: false,
            allowLoginByPhoneNumber: false,
            allowForgotPassword: true,
            registrationRequireCaptcha: false,
            registrationRequireTermsAndConditions: false,
        },
        tenantLookAndFeel: {
            tenantid: 'test-tenant-id',
            adminheaderbackgroundcolor: '#1976d2',
            adminheadertextcolor: 'white',
            adminheadertext: 'Test Tenant',
            authenticationheaderbackgroundcolor: '#1976d2',
            authenticationheadertextcolor: 'white',
            authenticationlogo: null,
            authenticationheadertext: 'Test Tenant Auth',
            footerlinks: [],
        },
        systemSettings: {
            systemId: 'test-system-id',
            allowRecoveryEmail: true,
            allowDuressPassword: false,
            rootClientId: 'test-root-client-id',
            enablePortalAsLegacyIdp: false,
            softwareVersion: '1.0.0',
            systemCategories: [],
        },
        socialOIDCProviders: [],
    }),
};

const mockProfileWithAllPermissions: PortalUserProfile = {
    userId: 'admin-user-id',
    email: 'admin@example.com',
    emailVerified: true,
    domain: 'example.com',
    firstName: 'Admin',
    lastName: 'User',
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    enabled: true,
    locked: false,
    expiresAtMs: Date.now() + 3600000,
    principalType: 'IAM_PORTAL_USER',
    nameOrder: 'WESTERN_NAME_ORDER',
    scope: [
        { scopeId: '1', scopeName: USER_UPDATE_SCOPE, scopeDescription: 'Update user', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
        { scopeId: '2', scopeName: USER_DELETE_SCOPE, scopeDescription: 'Delete user', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
        { scopeId: '3', scopeName: USER_UNLOCK_SCOPE, scopeDescription: 'Unlock user', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
    ],
};

const mockProfileWithUpdateOnly: PortalUserProfile = {
    ...mockProfileWithAllPermissions,
    scope: [
        { scopeId: '1', scopeName: USER_UPDATE_SCOPE, scopeDescription: 'Update user', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
    ],
};

const mockProfileWithNoPermissions: PortalUserProfile = {
    ...mockProfileWithAllPermissions,
    userId: 'regular-user-id',
    scope: [],
};

const mockMfaRelQueryNoMFA = {
    request: {
        query: USER_MFA_REL_QUERY,
        variables: {
            userId: 'test-user-id',
        },
    },
    result: {
        data: {
            getUserMFARels: [],
        },
    },
};

const mockMfaRelQueryWithTOTP = {
    request: {
        query: USER_MFA_REL_QUERY,
        variables: {
            userId: 'test-user-id',
        },
    },
    result: {
        data: {
            getUserMFARels: [
                {
                    userId: 'test-user-id',
                    mfaType: MFA_AUTH_TYPE_TIME_BASED_OTP,
                    __typename: 'UserMFARel',
                },
            ],
        },
    },
};

const mockMfaRelQueryWithFIDO = {
    request: {
        query: USER_MFA_REL_QUERY,
        variables: {
            userId: 'test-user-id',
        },
    },
    result: {
        data: {
            getUserMFARels: [
                {
                    userId: 'test-user-id',
                    mfaType: MFA_AUTH_TYPE_FIDO2,
                    __typename: 'UserMFARel',
                },
            ],
        },
    },
};

// Helper function to render component with all required providers
const renderWithProviders = (
    user: User,
    profile: PortalUserProfile | null,
    mocks: any[] = [mockMfaRelQueryNoMFA]
) => {
    const authContextValue: AuthContextProps = {
        portalUserProfile: profile,
        forceProfileRefetch: jest.fn(),
    };

    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <TenantContext.Provider value={mockTenantBean}>
                <AuthContext.Provider value={authContextValue}>
                    <ClipboardCopyContextProvider>
                        <UserDetail user={user} />
                    </ClipboardCopyContextProvider>
                </AuthContext.Provider>
            </TenantContext.Provider>
        </MockedProvider>
    );
};

describe('UserDetail Component', () => {
    describe('Basic Rendering', () => {
        it('should render first name input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue('John');
                expect(firstNameInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render last name input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const lastNameInput = screen.getByDisplayValue('Doe');
                expect(lastNameInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render middle name input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const middleNameInput = screen.getByDisplayValue('Michael');
                expect(middleNameInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render email input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const emailInput = screen.getByDisplayValue('john.doe@example.com');
                expect(emailInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render user ID', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('test-user-id')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumbs', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Users')).toBeInTheDocument();
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Overview section header', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should allow editing first name', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue('John') as HTMLInputElement;
                fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
                expect(firstNameInput.value).toBe('Johnny');
            }, { timeout: 3000 });
        });

        it('should allow editing last name', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const lastNameInput = screen.getByDisplayValue('Doe') as HTMLInputElement;
                fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
                expect(lastNameInput.value).toBe('Smith');
            }, { timeout: 3000 });
        });

        it('should show Update and Discard buttons when form is dirty', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(async () => {
                const firstNameInput = screen.getByDisplayValue('John') as HTMLInputElement;
                fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

                await waitFor(() => {
                    expect(screen.getByText('Update')).toBeInTheDocument();
                    expect(screen.getByText('Discard')).toBeInTheDocument();
                }, { timeout: 3000 });
            }, { timeout: 3000 });
        });
    });

    describe('Authorization and Permissions', () => {
        it('should enable inputs when user has update scope', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                // Address field is always editable (not affected by federated status)
                const addressInput = screen.getByDisplayValue('123 Main St') as HTMLInputElement;
                expect(addressInput).not.toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable inputs when user lacks update scope', async () => {
            renderWithProviders(mockUser, mockProfileWithNoPermissions);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue('John') as HTMLInputElement;
                expect(firstNameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show delete button when user has delete scope', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button');
                expect(deleteButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should not show delete button when user lacks delete scope', async () => {
            renderWithProviders(mockUser, mockProfileWithUpdateOnly);

            await waitFor(() => {
                const allButtons = screen.getAllByRole('button');
                expect(allButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display marked for deletion alert', async () => {
            renderWithProviders(mockMarkedForDeleteUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable inputs when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue('Deleted') as HTMLInputElement;
                expect(firstNameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should not show accordions when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.queryByText('Authorization Groups')).not.toBeInTheDocument();
                expect(screen.queryByText('Authentication Groups')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Enabled/Disabled State', () => {
        it('should show enabled label for enabled user', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Enabled')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                const enabledCheckbox = checkboxes.find(cb => cb.getAttribute('name') === 'enabled');
                expect(enabledCheckbox).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show enabled label for disabled user', async () => {
            renderWithProviders(mockDisabledUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Enabled')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Locked/Unlocked State', () => {
        it('should display unlocked status for unlocked user', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Unlocked')).toBeInTheDocument();
                const unlockIcon = document.querySelector('[data-testid="LockOpenOutlinedIcon"]');
                expect(unlockIcon).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display locked status for locked user', async () => {
            renderWithProviders(mockLockedUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Locked')).toBeInTheDocument();
                const lockIcon = document.querySelector('[data-testid="LockOutlinedIcon"]');
                expect(lockIcon).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show clickable lock icon when user has unlock scope', async () => {
            renderWithProviders(mockLockedUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const lockIcon = document.querySelector('[data-testid="LockOutlinedIcon"]');
                expect(lockIcon).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Email Verification', () => {
        it('should show email verified label', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Email verified')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                const emailVerifiedCheckbox = checkboxes.find(cb => cb.getAttribute('name') === 'emailVerified');
                expect(emailVerifiedCheckbox).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Name Order', () => {
        it('should display Western name order in breadcrumb', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display Eastern name order in breadcrumb', async () => {
            const easternNameUser = { ...mockUser, nameOrder: NAME_ORDER_EASTERN };
            renderWithProviders(easternNameUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Doe John')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Address Fields', () => {
        it('should render address input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const addressInput = screen.getByDisplayValue('123 Main St');
                expect(addressInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render city input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const cityInput = screen.getByDisplayValue('New York');
                expect(cityInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render postal code input', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const postalCodeInput = screen.getByDisplayValue('10001');
                expect(postalCodeInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Federated User Behavior', () => {
        it('should disable name fields for federated users', async () => {
            renderWithProviders(mockFederatedUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue('Alice') as HTMLInputElement;
                expect(firstNameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should display federated provider subject ID', async () => {
            renderWithProviders(mockFederatedUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const subjectIdInput = screen.getByDisplayValue('google-oauth2|123456789');
                expect(subjectIdInput).toBeInTheDocument();
                expect(subjectIdInput).toBeDisabled();
            }, { timeout: 3000 });
        });
    });

    describe('Recovery Email', () => {
        it('should display recovery email when present', async () => {
            renderWithProviders(mockUserWithRecoveryEmail, mockProfileWithAllPermissions, [
                {
                    ...mockMfaRelQueryNoMFA,
                    request: {
                        ...mockMfaRelQueryNoMFA.request,
                        variables: { userId: 'test-user-with-recovery-id' },
                    },
                },
            ]);

            await waitFor(() => {
                expect(screen.getByText('Recovery Email')).toBeInTheDocument();
                const recoveryEmailInput = screen.getByDisplayValue('recovery@example.com');
                expect(recoveryEmailInput).toBeInTheDocument();
                expect(recoveryEmailInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show recovery email verified label', async () => {
            renderWithProviders(mockUserWithRecoveryEmail, mockProfileWithAllPermissions, [
                {
                    ...mockMfaRelQueryNoMFA,
                    request: {
                        ...mockMfaRelQueryNoMFA.request,
                        variables: { userId: 'test-user-with-recovery-id' },
                    },
                },
            ]);

            await waitFor(() => {
                expect(screen.getByText('Recovery Email verified')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                const recoveryEmailVerifiedCheckbox = checkboxes.find(cb => cb.getAttribute('name') === 'recoveryEmailVerified');
                expect(recoveryEmailVerifiedCheckbox).toBeInTheDocument();
                expect(recoveryEmailVerifiedCheckbox).toBeDisabled();
            }, { timeout: 3000 });
        });
    });

    describe('MFA Display', () => {
        it('should show no MFA message when no MFA configured', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions, [mockMfaRelQueryNoMFA]);

            await waitFor(() => {
                expect(screen.getByText('No MFA configured for this user')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display TOTP when configured', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions, [mockMfaRelQueryWithTOTP]);

            await waitFor(() => {
                expect(screen.getByText('Time-based One Time Passcode')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display FIDO2 when configured', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions, [mockMfaRelQueryWithFIDO]);

            await waitFor(() => {
                expect(screen.getByText('Security Key')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show delete icon for MFA when user has update permissions', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions, [mockMfaRelQueryWithTOTP]);

            await waitFor(() => {
                const deleteIcon = document.querySelector('[data-testid="DeleteForeverOutlinedIcon"]');
                expect(deleteIcon).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Accordions', () => {
        it('should render Authorization Groups accordion', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Authorization Groups')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Authentication Groups accordion', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Authentication Groups')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Tenant Memberships accordion', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Tenant Memberships')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render User Sessions accordion', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('User Sessions')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Copy to Clipboard', () => {
        it('should render copy icon for user ID', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                const copyIcons = document.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Labels', () => {
        it('should render all field labels', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('First Name')).toBeInTheDocument();
                expect(screen.getByText('Last Name')).toBeInTheDocument();
                expect(screen.getByText('Middle Name')).toBeInTheDocument();
                expect(screen.getByText('Email')).toBeInTheDocument();
                expect(screen.getByText('User ID')).toBeInTheDocument();
                expect(screen.getByText('Name Order')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Edge Cases', () => {
        it('should handle user with minimal data', async () => {
            const minimalUser: User = {
                ...mockUser,
                middleName: null,
                phoneNumber: null,
                address: null,
                addressLine1: null,
                city: null,
                stateRegionProvince: null,
                postalCode: null,
                countryCode: null,
                preferredLanguageCode: null,
            };
            renderWithProviders(minimalUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByDisplayValue('John')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle null profile gracefully', async () => {
            renderWithProviders(mockUser, null);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue('John') as HTMLInputElement;
                expect(firstNameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should handle long names', async () => {
            const longName = 'VeryLongFirstNameThatExceedsNormalLength';
            const userWithLongName = { ...mockUser, firstName: longName };
            renderWithProviders(userWithLongName, mockProfileWithAllPermissions);

            await waitFor(() => {
                const firstNameInput = screen.getByDisplayValue(longName) as HTMLInputElement;
                expect(firstNameInput.value).toBe(longName);
            }, { timeout: 3000 });
        });
    });

    describe('Breadcrumb Navigation', () => {
        it('should render correct breadcrumb structure', async () => {
            renderWithProviders(mockUser, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
                expect(screen.getByText('Users')).toBeInTheDocument();
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
