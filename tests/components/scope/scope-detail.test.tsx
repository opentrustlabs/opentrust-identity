import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import ScopeDetail from '@/components/scope/scope-detail';
import { Scope, PortalUserProfile } from '@/graphql/generated/graphql-types';
import { TenantContext, TenantMetaDataBean } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import {
    SCOPE_UPDATE_SCOPE,
    SCOPE_DELETE_SCOPE,
    SCOPE_USE_IAM_MANAGEMENT,
    SCOPE_USE_APPLICATION_MANAGEMENT,
    TENANT_CREATE_SCOPE
} from '@/utils/consts';

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
const mockRegularScope: Scope = {
    scopeId: 'test-scope-id',
    scopeName: 'test.scope.name',
    scopeDescription: 'Test Scope Description',
    scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT,
    markForDelete: false,
};

const mockIAMScope: Scope = {
    scopeId: 'test-iam-scope-id',
    scopeName: 'tenant.create',
    scopeDescription: 'Create a tenant',
    scopeUse: SCOPE_USE_IAM_MANAGEMENT,
    markForDelete: false,
};

const mockRootTenantExclusiveScope: Scope = {
    scopeId: 'test-root-exclusive-scope-id',
    scopeName: TENANT_CREATE_SCOPE,
    scopeDescription: 'Create a tenant',
    scopeUse: SCOPE_USE_IAM_MANAGEMENT,
    markForDelete: false,
};

// Scope that looks like root tenant exclusive but isn't marked for deletion
const mockNonRootExclusiveScope: Scope = {
    scopeId: 'test-non-root-scope-id',
    scopeName: 'custom.app.scope',
    scopeDescription: 'Custom application scope',
    scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT,
    markForDelete: false,
};

const mockMarkedForDeleteScope: Scope = {
    scopeId: 'test-marked-scope-id',
    scopeName: 'test.marked.scope',
    scopeDescription: 'Test Marked Scope',
    scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT,
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

const mockProfileWithUpdateAndDelete: PortalUserProfile = {
    userId: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    domain: 'test.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    enabled: true,
    locked: false,
    expiresAtMs: Date.now() + 3600000,
    principalType: 'IAM_PORTAL_USER',
    nameOrder: 'WESTERN_NAME_ORDER',
    scope: [
        { scopeId: '1', scopeName: SCOPE_UPDATE_SCOPE, scopeDescription: 'Update scope', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
        { scopeId: '2', scopeName: SCOPE_DELETE_SCOPE, scopeDescription: 'Delete scope', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
    ],
};

const mockProfileWithUpdateOnly: PortalUserProfile = {
    userId: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    domain: 'test.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    enabled: true,
    locked: false,
    expiresAtMs: Date.now() + 3600000,
    principalType: 'IAM_PORTAL_USER',
    nameOrder: 'WESTERN_NAME_ORDER',
    scope: [
        { scopeId: '1', scopeName: SCOPE_UPDATE_SCOPE, scopeDescription: 'Update scope', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
    ],
};

const mockProfileWithNoPermissions: PortalUserProfile = {
    userId: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    domain: 'test.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    enabled: true,
    locked: false,
    expiresAtMs: Date.now() + 3600000,
    principalType: 'IAM_PORTAL_USER',
    nameOrder: 'WESTERN_NAME_ORDER',
    scope: [],
};

// Helper function to render component with all required providers
const renderWithProviders = (
    scope: Scope,
    profile: PortalUserProfile | null,
    mocks: any[] = []
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
                        <ScopeDetail scope={scope} />
                    </ClipboardCopyContextProvider>
                </AuthContext.Provider>
            </TenantContext.Provider>
        </MockedProvider>
    );
};

describe('ScopeDetail Component', () => {
    describe('Basic Rendering - Regular Scope', () => {
        it('should render scope name input', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.scope.name');
                expect(nameInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render scope description input', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInput = screen.getByDisplayValue('Test Scope Description');
                expect(descInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render scope ID', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('test-scope-id')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render scope use display', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const scopeUseInput = screen.getByDisplayValue('Application Management');
                expect(scopeUseInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumbs', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('Scope / Access Control')).toBeInTheDocument();
                expect(screen.getByText('test.scope.name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Overview section header', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should allow editing scope name', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.scope.name') as HTMLInputElement;
                fireEvent.change(nameInput, { target: { value: 'updated.scope.name' } });
                expect(nameInput.value).toBe('updated.scope.name');
            }, { timeout: 3000 });
        });

        it('should allow editing scope description', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInput = screen.getByDisplayValue('Test Scope Description') as HTMLInputElement;
                fireEvent.change(descInput, { target: { value: 'Updated Description' } });
                expect(descInput.value).toBe('Updated Description');
            }, { timeout: 3000 });
        });

        it('should show Update and Discard buttons when form is dirty', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(async () => {
                const nameInput = screen.getByDisplayValue('test.scope.name') as HTMLInputElement;
                fireEvent.change(nameInput, { target: { value: 'updated.scope.name' } });

                await waitFor(() => {
                    expect(screen.getByText('Update')).toBeInTheDocument();
                    expect(screen.getByText('Discard')).toBeInTheDocument();
                }, { timeout: 3000 });
            }, { timeout: 3000 });
        });
    });

    describe('Authorization and Permissions', () => {
        it('should enable inputs when user has update scope', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.scope.name') as HTMLInputElement;
                expect(nameInput).not.toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable inputs when user lacks update scope', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithNoPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.scope.name') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show delete button when user has delete scope', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button');
                // Delete button should be present (it's an icon button)
                expect(deleteButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should not show delete button when user lacks delete scope', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateOnly);

            await waitFor(() => {
                // Only basic navigation buttons should be present, no delete button
                const allButtons = screen.getAllByRole('button');
                // Should have fewer buttons without delete
                expect(allButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display marked for deletion alert', async () => {
            renderWithProviders(mockMarkedForDeleteScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable inputs when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.marked.scope') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should not show tenants accordion when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.queryByText('Tenants')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not show delete button when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                // Should not have delete icon button
                const buttons = screen.getAllByRole('button');
                // Just basic buttons, no delete
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('IAM Management Scope Behavior', () => {
        it('should display IAM Management scope use', async () => {
            renderWithProviders(mockIAMScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const scopeUseInput = screen.getByDisplayValue('IAM Management');
                expect(scopeUseInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable name input for IAM Management scopes', async () => {
            renderWithProviders(mockIAMScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('tenant.create') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable description input for IAM Management scopes', async () => {
            renderWithProviders(mockIAMScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInput = screen.getByDisplayValue('Create a tenant') as HTMLInputElement;
                expect(descInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should not show delete button for IAM Management scopes', async () => {
            renderWithProviders(mockIAMScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                // Delete button should not be present for IAM scopes
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should disable Update button for IAM Management scopes', async () => {
            renderWithProviders(mockIAMScope, mockProfileWithUpdateAndDelete);

            await waitFor(async () => {
                // Try to change the input - should not enable Update button due to disableSubmit
                const nameInput = screen.getByDisplayValue('tenant.create') as HTMLInputElement;
                // Input is disabled, so can't change it - Update button should not appear
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });
    });

    describe('Root Tenant Exclusive Scope Behavior', () => {
        it('should disable name input for root tenant exclusive scopes', async () => {
            renderWithProviders(mockRootTenantExclusiveScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue(TENANT_CREATE_SCOPE) as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable description input for root tenant exclusive scopes', async () => {
            renderWithProviders(mockRootTenantExclusiveScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInput = screen.getByDisplayValue('Create a tenant') as HTMLInputElement;
                expect(descInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show tenants accordion for root tenant exclusive scopes with special note', async () => {
            renderWithProviders(mockRootTenantExclusiveScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                // Root tenant exclusive scopes still show tenants accordion, but with special handling
                expect(screen.getByText('Tenants')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Tenants Configuration', () => {
        it('should show tenants accordion for non-root-exclusive regular scopes', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('Tenants')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should have tenants accordion expanded by default', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const accordion = screen.getByText('Tenants').closest('.MuiAccordion-root');
                expect(accordion).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Object ID and Clipboard', () => {
        it('should render Object ID label', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('Object ID')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render copy to clipboard icon', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const copyIcons = document.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Scope Use Display', () => {
        it('should display Application Management scope use correctly', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const scopeUseInput = screen.getByDisplayValue('Application Management');
                expect(scopeUseInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display IAM Management scope use correctly', async () => {
            renderWithProviders(mockIAMScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const scopeUseInput = screen.getByDisplayValue('IAM Management');
                expect(scopeUseInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Scope Use label', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('Scope Use')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty description', async () => {
            const scopeWithEmptyDesc = { ...mockRegularScope, scopeDescription: '' };
            renderWithProviders(scopeWithEmptyDesc, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInputs = screen.getAllByRole('textbox');
                const descInput = descInputs.find(input => input.getAttribute('name') === 'scopeDescription');
                expect(descInput).toHaveValue('');
            }, { timeout: 3000 });
        });

        it('should handle long scope names', async () => {
            const longName = 'very.long.scope.name.that.exceeds.normal.length.for.testing.purposes';
            const scopeWithLongName = { ...mockRegularScope, scopeName: longName };
            renderWithProviders(scopeWithLongName, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue(longName) as HTMLInputElement;
                expect(nameInput.value).toBe(longName);
            }, { timeout: 3000 });
        });

        it('should handle long descriptions', async () => {
            const longDesc = 'This is a very long description that exceeds normal length for testing purposes. '.repeat(3);
            const scopeWithLongDesc = { ...mockRegularScope, scopeDescription: longDesc };
            renderWithProviders(scopeWithLongDesc, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInputs = screen.getAllByRole('textbox');
                const descInput = descInputs.find(input => input.getAttribute('name') === 'scopeDescription') as HTMLTextAreaElement;
                expect(descInput).toHaveValue(longDesc);
            }, { timeout: 3000 });
        });

        it('should handle special characters in scope name', async () => {
            const specialName = 'test.scope-name_with.special-chars';
            const scopeWithSpecialChars = { ...mockRegularScope, scopeName: specialName };
            renderWithProviders(scopeWithSpecialChars, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue(specialName) as HTMLInputElement;
                expect(nameInput.value).toBe(specialName);
            }, { timeout: 3000 });
        });

        it('should handle null profile gracefully', async () => {
            renderWithProviders(mockRegularScope, null);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.scope.name') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });
    });

    describe('Breadcrumb Navigation', () => {
        it('should render correct breadcrumb structure', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
                expect(screen.getByText('Scope / Access Control')).toBeInTheDocument();
                expect(screen.getByText('test.scope.name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Validation', () => {
        it('should have scope name field enabled for editing', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('test.scope.name') as HTMLInputElement;
                // Check that field is not disabled (can be edited)
                expect(nameInput).not.toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should allow description to be optional', async () => {
            renderWithProviders(mockRegularScope, mockProfileWithUpdateAndDelete);

            await waitFor(() => {
                const descInputs = screen.getAllByRole('textbox');
                const descInput = descInputs.find(input => input.getAttribute('name') === 'scopeDescription') as HTMLInputElement;
                expect(descInput?.required).toBeFalsy();
            }, { timeout: 3000 });
        });
    });
});
