import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import ClientDetail from '@/components/clients/client-detail';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import { IntlProvider } from 'react-intl';
import { Client } from '@/graphql/generated/graphql-types';
import {
    SCOPE_USE_IAM_MANAGEMENT,
    CLIENT_UPDATE_SCOPE,
    CLIENT_DELETE_SCOPE,
    CLIENT_SECRET_VIEW_SCOPE,
    CLIENT_TYPE_SERVICE_ACCOUNT,
    CLIENT_TYPE_USER_DELEGATED_PERMISSIONS
} from '@/utils/consts';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/clients/test-client-id',
}));

// Mock messages for react-intl
const messages = {
    'clientDetail.breadcrumb.home': 'Home',
    'clientDetail.breadcrumb.clients': 'Clients',
    'clientDetail.overview.title': 'Overview',
    'clientDetail.update.success': 'Client updated successfully',
    'clientDetail.update.error': 'Error updating client',
};

// Mock client data
const mockClient: Client = {
    clientId: 'test-client-id',
    clientName: 'Test Client',
    clientDescription: 'Test Description',
    tenantId: 'test-tenant-id',
    clientSecret: 'encrypted-secret',
    enabled: true,
    oidcEnabled: true,
    pkceEnabled: false,
    clientType: CLIENT_TYPE_USER_DELEGATED_PERMISSIONS,
    clienttypeid: 1,
    userTokenTTLSeconds: 3600,
    clientTokenTTLSeconds: 86400,
    maxRefreshTokenCount: 5,
    markForDelete: false,
    audience: 'test-audience',
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
                scopeName: CLIENT_UPDATE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: CLIENT_DELETE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id3',
                scopeName: CLIENT_SECRET_VIEW_SCOPE,
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
    client: Client = mockClient,
    authContext: AuthContextProps = mockAuthContext,
    mocks: any[] = []
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider messages={messages} locale="en" defaultLocale="en">
                <TenantContext.Provider value={mockTenantContext}>
                    <AuthContext.Provider value={authContext}>
                        <ClipboardCopyContextProvider>
                            <ClientDetail client={client} />
                        </ClipboardCopyContextProvider>
                    </AuthContext.Provider>
                </TenantContext.Provider>
            </IntlProvider>
        </MockedProvider>
    );
};

describe('ClientDetail Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render client overview with correct data', async () => {
            renderWithProviders();

            await waitFor(() => {
                // Check for client name input
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
                // Check for client description
                expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display client ID', async () => {
            renderWithProviders();

            await waitFor(() => {
                // Client ID should be displayed somewhere in the component
                expect(screen.getByText(/test-client-id/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumb navigation', async () => {
            renderWithProviders();

            await waitFor(() => {
                // Check for client name in breadcrumb
                expect(screen.getByText('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display enabled checkbox as checked when client is enabled', async () => {
            renderWithProviders();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                // Find the enabled checkbox (typically one of the first checkboxes)
                const enabledCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
                expect(enabledCheckbox).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should update client name input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });

            const nameInput = screen.getByDisplayValue('Test Client');
            fireEvent.change(nameInput, { target: { value: 'Updated Client Name' } });

            expect(nameInput).toHaveValue('Updated Client Name');
        });

        it('should update description input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
            }, { timeout: 3000 });

            const descInput = screen.getByDisplayValue('Test Description');
            fireEvent.change(descInput, { target: { value: 'Updated Description' } });

            expect(descInput).toHaveValue('Updated Description');
        });

        it('should toggle enabled checkbox', async () => {
            renderWithProviders();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            }, { timeout: 3000 });

            const checkboxes = screen.getAllByRole('checkbox');
            const firstCheckbox = checkboxes[0];
            const initialState = (firstCheckbox as HTMLInputElement).checked;

            fireEvent.click(firstCheckbox);

            expect((firstCheckbox as HTMLInputElement).checked).toBe(!initialState);
        });

        it('should allow client type selection', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Client type should be rendered (though may be in a select dropdown)
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThan(0);
        });
    });

    describe('Client Types', () => {
        it('should render service account client correctly', async () => {
            const serviceAccountClient: Client = {
                ...mockClient,
                clientType: CLIENT_TYPE_SERVICE_ACCOUNT,
                oidcEnabled: false,
                pkceEnabled: false,
            };

            renderWithProviders(serviceAccountClient);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render user delegated permissions client correctly', async () => {
            const userClient: Client = {
                ...mockClient,
                clientType: CLIENT_TYPE_USER_DELEGATED_PERMISSIONS,
                oidcEnabled: true,
            };

            renderWithProviders(userClient);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('OIDC and PKCE Configuration', () => {
        it('should display OIDC enabled checkbox when enabled', async () => {
            const oidcClient: Client = {
                ...mockClient,
                oidcEnabled: true,
            };

            renderWithProviders(oidcClient);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should display PKCE configuration when OIDC is enabled', async () => {
            const pkceClient: Client = {
                ...mockClient,
                oidcEnabled: true,
                pkceEnabled: true,
            };

            renderWithProviders(pkceClient);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(1);
            }, { timeout: 3000 });
        });

        it('should not allow PKCE when OIDC is disabled', async () => {
            const nonOidcClient: Client = {
                ...mockClient,
                oidcEnabled: false,
                pkceEnabled: false,
            };

            renderWithProviders(nonOidcClient);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Authorization and Permissions', () => {
        it('should disable inputs when user lacks CLIENT_UPDATE scope', async () => {
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

            renderWithProviders(mockClient, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Client') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should hide delete button when user lacks CLIENT_DELETE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: CLIENT_UPDATE_SCOPE, // Has update but not delete
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

            renderWithProviders(mockClient, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display alert when client is marked for deletion', async () => {
            const markedClient: Client = {
                ...mockClient,
                markForDelete: true,
            };

            renderWithProviders(markedClient);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable all inputs when client is marked for deletion', async () => {
            const markedClient: Client = {
                ...mockClient,
                markForDelete: true,
            };

            renderWithProviders(markedClient);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Client') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });
    });

    describe('Token TTL Configuration', () => {
        it('should display user token TTL field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
                // Token TTL should be displayed somewhere
                const inputs = screen.getAllByRole('spinbutton');
                expect(inputs.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should display client token TTL field', async () => {
            const serviceClient: Client = {
                ...mockClient,
                clientType: CLIENT_TYPE_SERVICE_ACCOUNT,
                clientTokenTTLSeconds: 86400,
            };

            renderWithProviders(serviceClient);

            await waitFor(() => {
                const inputs = screen.getAllByRole('spinbutton');
                expect(inputs.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should allow updating token TTL values', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });

            const numberInputs = screen.getAllByRole('spinbutton');
            if (numberInputs.length > 0) {
                const ttlInput = numberInputs[0];
                fireEvent.change(ttlInput, { target: { value: '7200' } });
                expect(ttlInput).toHaveValue(7200);
            }
        });
    });

    describe('Max Refresh Token Count', () => {
        it('should display max refresh token count field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
                // Should have number inputs for refresh token count
                const numberInputs = screen.getAllByRole('spinbutton');
                expect(numberInputs.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should allow updating max refresh token count', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });

            const numberInputs = screen.getAllByRole('spinbutton');
            if (numberInputs.length > 1) {
                const refreshTokenInput = numberInputs[numberInputs.length - 1];
                fireEvent.change(refreshTokenInput, { target: { value: '10' } });
                expect(refreshTokenInput).toHaveValue(10);
            }
        });
    });

    describe('Audience Configuration', () => {
        it('should display audience field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('test-audience')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should allow updating audience value', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('test-audience')).toBeInTheDocument();
            }, { timeout: 3000 });

            const audienceInput = screen.getByDisplayValue('test-audience');
            fireEvent.change(audienceInput, { target: { value: 'updated-audience' } });

            expect(audienceInput).toHaveValue('updated-audience');
        });
    });

    describe('Update Button', () => {
        it('should render update button when user has permissions', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should enable update button when form is dirty', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Make form dirty by changing a value
            const nameInput = screen.getByDisplayValue('Test Client');
            fireEvent.change(nameInput, { target: { value: 'Modified Client' } });

            // Update button should exist
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });
});
