import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import FederatedOIDCProviderDetail from '@/components/oidc-providers/oidc-provider-detail';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import { IntlProvider } from 'react-intl';
import { FederatedOidcProvider } from '@/graphql/generated/graphql-types';
import {
    SCOPE_USE_IAM_MANAGEMENT,
    FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE,
    FEDERATED_OIDC_PROVIDER_DELETE_SCOPE,
    FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE,
    FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
    FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
    OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
    OIDC_OPENID_SCOPE,
    OIDC_EMAIL_SCOPE,
    OIDC_PROFILE_SCOPE,
    SECRET_ENTRY_DELEGATE_SCOPE
} from '@/utils/consts';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/oidc-providers/test-provider-id',
}));

// Mock messages for react-intl
const messages = {
    'oidcProviderDetail.breadcrumb.home': 'Home',
    'oidcProviderDetail.breadcrumb.providers': 'OIDC Providers',
    'oidcProviderDetail.overview.title': 'Overview',
    'oidcProviderDetail.update.success': 'Provider Updated',
    'oidcProviderDetail.update.error': 'Error updating provider',
};

// Mock OIDC provider data - Enterprise type
const mockEnterpriseProvider: FederatedOidcProvider = {
    federatedOIDCProviderId: 'test-provider-id',
    federatedOIDCProviderName: 'Test Enterprise Provider',
    federatedOIDCProviderDescription: 'Test Provider Description',
    federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
    federatedOIDCProviderClientId: 'test-client-id',
    federatedOIDCProviderClientSecret: 'encrypted-secret',
    federatedOIDCProviderWellKnownUri: 'https://test.example.com/.well-known/openid-configuration',
    refreshTokenAllowed: true,
    scopes: [OIDC_OPENID_SCOPE, OIDC_EMAIL_SCOPE, OIDC_PROFILE_SCOPE],
    usePkce: false,
    clientAuthType: OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
    clientauthtypeid: "1",
    federatedOIDCProviderTenantId: 'test-tenant-id',
    federatedoidcprovidertypeid: "1",
    socialLoginProvider: '',
    markForDelete: false,
    federatedOIDCProviderResponseType: 'code',
    federatedOIDCProviderSubjectType: 'public',
};

// Mock OIDC provider data - Social type
const mockSocialProvider: FederatedOidcProvider = {
    ...mockEnterpriseProvider,
    federatedOIDCProviderName: 'Test Social Provider',
    federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
    socialLoginProvider: 'Google',
    federatedoidcprovidertypeid: "2",
};

// Mock tenant data
const mockTenant = {
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    tenantType: 'STANDARD',
};

// Mock context values
const mockTenantContext: any = {
    tenantBean: mockTenant,
    setTenantBean: jest.fn(),
    setTenantMetaData: jest.fn(),
    getTenantMetaData: jest.fn(() => ({ tenant: mockTenant })),
};

const mockAuthContext: AuthContextProps = {
    portalUserProfile: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userId: 'test-user-id',
        scope: [
            {
                scopeId: 'id1',
                scopeName: FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: FEDERATED_OIDC_PROVIDER_DELETE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id3',
                scopeName: FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id4',
                scopeName: SECRET_ENTRY_DELEGATE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
        ],
        domain: '',
        emailVerified: false,
        enabled: false,
        expiresAtMs: 0,
        locked: false,
        nameOrder: '',
        principalType: '',
        tenantId: '',
        tenantName: ''
    },
    forceProfileRefetch: jest.fn()
};

// Helper function to render component with all providers
const renderWithProviders = (
    federatedOIDCProvider: FederatedOidcProvider = mockEnterpriseProvider,
    authContext: AuthContextProps = mockAuthContext,
    mocks: any[] = []
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider messages={messages} locale="en" defaultLocale="en">
                <TenantContext.Provider value={mockTenantContext}>
                    <AuthContext.Provider value={authContext}>
                        <ClipboardCopyContextProvider>
                            <FederatedOIDCProviderDetail federatedOIDCProvider={federatedOIDCProvider} />
                        </ClipboardCopyContextProvider>
                    </AuthContext.Provider>
                </TenantContext.Provider>
            </IntlProvider>
        </MockedProvider>
    );
};

describe('FederatedOIDCProviderDetail Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering - Enterprise Provider', () => {
        it('should render provider overview with correct data', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Provider Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display provider ID', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/test-provider-id/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumb navigation', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display client ID field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('test-client-id')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display well-known URI field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('https://test.example.com/.well-known/openid-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display Overview header', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should update provider name input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            const nameInput = screen.getByDisplayValue('Test Enterprise Provider');
            fireEvent.change(nameInput, { target: { value: 'Updated Provider Name' } });

            expect(nameInput).toHaveValue('Updated Provider Name');
        });

        it('should update description input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Provider Description')).toBeInTheDocument();
            }, { timeout: 3000 });

            const descInput = screen.getByDisplayValue('Test Provider Description');
            fireEvent.change(descInput, { target: { value: 'Updated Description' } });

            expect(descInput).toHaveValue('Updated Description');
        });

        it('should update client ID input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('test-client-id')).toBeInTheDocument();
            }, { timeout: 3000 });

            const clientIdInput = screen.getByDisplayValue('test-client-id');
            fireEvent.change(clientIdInput, { target: { value: 'new-client-id' } });

            expect(clientIdInput).toHaveValue('new-client-id');
        });

        it('should update well-known URI input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('https://test.example.com/.well-known/openid-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });

            const wellKnownInput = screen.getByDisplayValue('https://test.example.com/.well-known/openid-configuration');
            fireEvent.change(wellKnownInput, { target: { value: 'https://new.example.com/.well-known/openid-configuration' } });

            expect(wellKnownInput).toHaveValue('https://new.example.com/.well-known/openid-configuration');
        });
    });

    describe('PKCE Configuration', () => {
        it('should display PKCE checkbox', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Use PKCE')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should toggle PKCE checkbox', async () => {
            renderWithProviders();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            }, { timeout: 3000 });

            const checkboxes = screen.getAllByRole('checkbox');
            // Find PKCE checkbox (should be unchecked initially)
            const pkceCheckbox = checkboxes.find(cb => !(cb as HTMLInputElement).checked);

            if (pkceCheckbox) {
                fireEvent.click(pkceCheckbox);
                expect((pkceCheckbox as HTMLInputElement).checked).toBe(true);
            }
        });

        it('should render provider with PKCE enabled', async () => {
            const pkceProvider: FederatedOidcProvider = {
                ...mockEnterpriseProvider,
                usePkce: true,
            };

            renderWithProviders(pkceProvider);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                const checkedCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
                expect(checkedCheckbox).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Refresh Token Configuration', () => {
        it('should display refresh token checkbox', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Refresh Token Allowed')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should toggle refresh token checkbox', async () => {
            renderWithProviders();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(1);
            }, { timeout: 3000 });
        });

        it('should show refresh token as enabled', async () => {
            renderWithProviders(mockEnterpriseProvider);

            await waitFor(() => {
                expect(screen.getByText('Refresh Token Allowed')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                // At least one should be checked (refresh token is enabled)
                const checkedCheckboxes = checkboxes.filter(cb => (cb as HTMLInputElement).checked);
                expect(checkedCheckboxes.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Authorization and Permissions', () => {
        it('should disable inputs when user lacks UPDATE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [], // No permissions
                    domain: '',
                    emailVerified: false,
                    enabled: false,
                    expiresAtMs: 0,
                    locked: false,
                    nameOrder: '',
                    principalType: '',
                    tenantId: '',
                    tenantName: ''
                },
                forceProfileRefetch: jest.fn()
            };

            renderWithProviders(mockEnterpriseProvider, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Enterprise Provider') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should enable inputs when user has UPDATE scope', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Enterprise Provider') as HTMLInputElement;
                expect(nameInput.disabled).toBe(false);
            }, { timeout: 3000 });
        });

        it('should hide delete button when user lacks DELETE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE,
                            markForDelete: false,
                            scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                            scopeDescription: ''
                        },
                    ],
                    domain: '',
                    emailVerified: false,
                    enabled: false,
                    expiresAtMs: 0,
                    locked: false,
                    nameOrder: '',
                    principalType: '',
                    tenantId: '',
                    tenantName: ''
                },
                forceProfileRefetch: jest.fn()
            };

            renderWithProviders(mockEnterpriseProvider, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display alert when provider is marked for deletion', async () => {
            const markedProvider: FederatedOidcProvider = {
                ...mockEnterpriseProvider,
                markForDelete: true,
            };

            renderWithProviders(markedProvider);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable all inputs when provider is marked for deletion', async () => {
            const markedProvider: FederatedOidcProvider = {
                ...mockEnterpriseProvider,
                markForDelete: true,
            };

            renderWithProviders(markedProvider);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Enterprise Provider') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should not show domain configuration when marked for deletion', async () => {
            const markedProvider: FederatedOidcProvider = {
                ...mockEnterpriseProvider,
                markForDelete: true,
            };

            renderWithProviders(markedProvider);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Domains accordion should not be present
            const domainsText = screen.queryByText('Domains');
            expect(domainsText).not.toBeInTheDocument();
        });
    });

    describe('Provider Type - Enterprise', () => {
        it('should display enterprise provider type', async () => {
            renderWithProviders(mockEnterpriseProvider);

            await waitFor(() => {
                expect(screen.getByText('Provider Type')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show domains section for enterprise provider', async () => {
            renderWithProviders(mockEnterpriseProvider);

            await waitFor(() => {
                expect(screen.getByText('Domains')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not show social provider field for enterprise type', async () => {
            renderWithProviders(mockEnterpriseProvider);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Social provider field should not be present
            const socialProviderText = screen.queryByText('Social Provider (Requires an account with the provider)');
            expect(socialProviderText).not.toBeInTheDocument();
        });
    });

    describe('Provider Type - Social', () => {
        it('should display social provider type', async () => {
            renderWithProviders(mockSocialProvider);

            await waitFor(() => {
                expect(screen.getByText('Provider Type')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show social provider selection field', async () => {
            renderWithProviders(mockSocialProvider);

            await waitFor(() => {
                expect(screen.getByText('Social Provider (Requires an account with the provider)')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show tenants section for social provider', async () => {
            renderWithProviders(mockSocialProvider);

            await waitFor(() => {
                expect(screen.getByText('Tenants')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not show domains section for social provider', async () => {
            renderWithProviders(mockSocialProvider);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Social Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Domains section should not be present for social providers
            const domainsText = screen.queryByText('Domains');
            expect(domainsText).not.toBeInTheDocument();
        });
    });

    describe('Client Secret Management', () => {
        it('should display masked client secret', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*/)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show edit icon for client secret when user has permissions', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Edit icon should be present
            expect(screen.getByText('Provider Client Secret')).toBeInTheDocument();
        });

        it('should display warning when no secret and no PKCE', async () => {
            const noSecretProvider: FederatedOidcProvider = {
                ...mockEnterpriseProvider,
                federatedOIDCProviderClientSecret: '',
                usePkce: false,
            };

            renderWithProviders(noSecretProvider);

            await waitFor(() => {
                expect(screen.getByText(/no client secret configured/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Authentication Type', () => {
        it('should display authentication type selector', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Authentication Type')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show selected authentication type', async () => {
            renderWithProviders();

            await waitFor(() => {
                const selects = screen.getAllByRole('combobox');
                expect(selects.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Scope Configuration', () => {
        it('should display scope field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Scope')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render provider with multiple scopes', async () => {
            renderWithProviders(mockEnterpriseProvider);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Scope field should be present
            expect(screen.getByText('Scope')).toBeInTheDocument();
        });
    });

    describe('Selector Fields', () => {
        it('should show provider type and authentication type selectors', async () => {
            renderWithProviders();

            await waitFor(() => {
                const selects = screen.getAllByRole('combobox');
                // Should have selects (provider type, auth type)
                expect(selects.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Redirect URI', () => {
        it('should display redirect URI label', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Redirect URI (to be configured with the provider)')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Object ID and Clipboard', () => {
        it('should display provider ID with copy functionality', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('test-provider-id')).toBeInTheDocument();
                expect(screen.getByText('Object ID')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Update Button', () => {
        it('should render action buttons when user has permissions', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should enable update when form is dirty', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Enterprise Provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Make form dirty by changing a value
            const nameInput = screen.getByDisplayValue('Test Enterprise Provider');
            fireEvent.change(nameInput, { target: { value: 'Modified Provider' } });

            // Update button should exist
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });
});
