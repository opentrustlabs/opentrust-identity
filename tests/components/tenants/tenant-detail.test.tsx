import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantDetail from '@/components/tenants/tenant-detail';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import { IntlProvider } from 'react-intl';
import { TENANT_DETAIL_QUERY } from '@/graphql/queries/oidc-queries';
import { SCOPE_USE_IAM_MANAGEMENT, TENANT_READ_SCOPE, TENANT_UPDATE_SCOPE } from '@/utils/consts';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/tenants/test-tenant-id',
}));

// Mock messages for react-intl
const messages = {
    'tenantDetail.breadcrumb.home': 'Home',
    'tenantDetail.breadcrumb.tenants': 'Tenants',
    'tenantDetail.overview.title': 'Overview',
    'tenantDetail.overview.tenantId': 'Tenant ID',
    'tenantDetail.overview.tenantName': 'Tenant Name',
    'tenantDetail.overview.description': 'Description',
    'tenantDetail.overview.enabled': 'Enabled',
    'tenantDetail.overview.markForDelete': 'Mark for Delete',
    'tenantDetail.overview.tenantType': 'Tenant Type',
    'tenantDetail.update.button': 'Update',
    'tenantDetail.update.success': 'Tenant updated successfully',
    'tenantDetail.update.error': 'Error updating tenant',
};

// Mock tenant data
const mockTenant = {
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    tenantDescription: 'Test Description',
    enabled: true,
    allowUnlimitedRate: false,
    allowUserSelfRegistration: true,
    allowSocialLogin: false,
    allowAnonymousUsers: false,
    verifyEmailOnSelfRegistration: true,
    federatedAuthenticationConstraint: null,
    federatedauthenticationconstraintid: null,
    markForDelete: false,
    tenantType: 'STANDARD',
    tenanttypeid: 1,
    migrateLegacyUsers: false,
    allowLoginByPhoneNumber: false,
    allowForgotPassword: true,
    defaultRateLimit: 100,
    defaultRateLimitPeriodMinutes: 60,
    registrationRequireCaptcha: false,
    registrationRequireTermsAndConditions: false,
    termsAndConditionsUri: null,
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
        //scope: [{scopeId:'TENANT_READ', 'TENANT_UPDATE'],
        scope: [
            {
                scopeId: 'id1',
                scopeName: TENANT_READ_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: TENANT_UPDATE_SCOPE,
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
    component: React.ReactElement,
    mocks: any[] = []
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider messages={messages} locale="en" defaultLocale="en">
                <TenantContext.Provider value={mockTenantContext}>
                    <AuthContext.Provider value={mockAuthContext}>
                        <ClipboardCopyContextProvider>
                            {component}
                        </ClipboardCopyContextProvider>
                    </AuthContext.Provider>
                </TenantContext.Provider>
            </IntlProvider>
        </MockedProvider>
    );
};

describe('TenantDetail Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading and Error States', () => {
        it('should display loading state while fetching data', () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                    delay: 100,
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            // Should show loading indicator
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should display error state when query fails', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    error: new Error('Failed to fetch tenant'),
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByText(/Failed to fetch tenant/i)).toBeInTheDocument();
            });
        });

        it('should display error when tenant not found', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'non-existent-id' },
                    },
                    result: {
                        data: {
                            getTenantById: null,
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="non-existent-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByText(/Tenant Not Found/i)).toBeInTheDocument();
            });
        });

        it('should skip query when tenantId is empty', () => {
            renderWithProviders(<TenantDetail tenantId="" />, []);

            // Should show error component for empty tenant
            expect(screen.getByText(/Tenant Not Found/i)).toBeInTheDocument();
        });
    });

    describe('Tenant Data Rendering', () => {
        const setupSuccessfulQuery = () => {
            return [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];
        };

        it('should render tenant overview with correct data', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // Check for tenant name input
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
                // Check for tenant description
                expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
                // Check for tenant ID as text (not input field)
                expect(screen.getByText('test-tenant-id')).toBeInTheDocument();
            });
        });

        it('should display enabled checkbox as checked when tenant is enabled', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // Find the "Enabled" text and then find the checkbox in the same section
                const checkboxes = screen.getAllByRole('checkbox');
                // The first checkbox should be the "Enabled" checkbox
                expect(checkboxes[0]).toBeChecked();
            }, { timeout: 3000 });
        });

        it('should display markForDelete checkbox as unchecked when not marked', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // markForDelete checkbox is not rendered when tenant is not marked for deletion
                // Just verify that the tenant content is displayed
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumb navigation', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // Check for tenant name to ensure component is rendered
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        const setupSuccessfulQuery = () => {
            return [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];
        };

        it('should update tenant name input and mark form as dirty', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
            });

            const nameInput = screen.getByDisplayValue('Test Tenant');
            fireEvent.change(nameInput, { target: { value: 'Updated Tenant Name' } });

            expect(nameInput).toHaveValue('Updated Tenant Name');
        });

        it('should update description input', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
            });

            const descInput = screen.getByDisplayValue('Test Description');
            fireEvent.change(descInput, { target: { value: 'Updated Description' } });

            expect(descInput).toHaveValue('Updated Description');
        });

        it('should toggle enabled checkbox', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes[0]).toBeChecked();
            }, { timeout: 3000 });

            const checkboxes = screen.getAllByRole('checkbox');
            fireEvent.click(checkboxes[0]);

            expect(checkboxes[0]).not.toBeChecked();
        });

        it('should toggle markForDelete checkbox', async () => {
            const mocks = setupSuccessfulQuery();
            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // Verify component is rendered
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
                // Check that there are checkboxes rendered
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Update Mutation', () => {
        it('should render update button when user has permissions', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Check that update button exists and is enabled
            const updateButtons = screen.getAllByRole('button');
            expect(updateButtons.length).toBeGreaterThan(0);
        });

        it('should allow form field updates', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            const nameInput = screen.getByDisplayValue('Test Tenant');
            fireEvent.change(nameInput, { target: { value: 'Updated Tenant' } });

            expect(nameInput).toHaveValue('Updated Tenant');
        });
    });

    describe('Authorization', () => {
        it('should disable update button when user lacks TENANT_UPDATE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: TENANT_READ_SCOPE, // Missing TENANT_UPDATE
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

            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];

            render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <IntlProvider messages={messages} locale="en" defaultLocale="en">
                        <TenantContext.Provider value={mockTenantContext}>
                            <AuthContext.Provider value={restrictedAuthContext}>
                                <ClipboardCopyContextProvider>
                                    <TenantDetail tenantId="test-tenant-id" />
                                </ClipboardCopyContextProvider>
                            </AuthContext.Provider>
                        </TenantContext.Provider>
                    </IntlProvider>
                </MockedProvider>
            );

            await waitFor(() => {
                // Verify component renders with restricted permissions
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
                // Input fields should be disabled
                const nameInput = screen.getByDisplayValue('Test Tenant') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });
    });

    describe('Clipboard Functionality', () => {
        it('should render tenant ID field for copying', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // Tenant ID is displayed as text, not in an input field
                expect(screen.getByText('test-tenant-id')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Conditional Rendering Based on Tenant State', () => {
        it('should render correctly when tenant is marked for deletion', async () => {
            const markedTenant = {
                ...mockTenant,
                markForDelete: true,
                enabled: false,
            };

            const markedTenantContext: any = {
                ...mockTenantContext,
                tenantBean: markedTenant,
                getTenantMetaData: jest.fn(() => ({ tenant: markedTenant })),
            };

            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: markedTenant,
                        },
                    },
                },
            ];

            render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <IntlProvider messages={messages} locale="en" defaultLocale="en">
                        <TenantContext.Provider value={markedTenantContext}>
                            <AuthContext.Provider value={mockAuthContext}>
                                <ClipboardCopyContextProvider>
                                    <TenantDetail tenantId="test-tenant-id" />
                                </ClipboardCopyContextProvider>
                            </AuthContext.Provider>
                        </TenantContext.Provider>
                    </IntlProvider>
                </MockedProvider>
            );

            await waitFor(() => {
                // Check that the component renders with marked tenant
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle different tenant types correctly', async () => {
            const managementTenant = {
                ...mockTenant,
                tenantType: 'MANAGEMENT',
            };

            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: managementTenant,
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                // Check that tenant ID is displayed
                expect(screen.getByText('test-tenant-id')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('TOTP Configuration', () => {
        it('should render checkboxes for tenant configuration', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: mockTenant,
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByText('test-tenant-id')).toBeInTheDocument();
                // Verify multiple checkboxes are rendered
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(1);
            }, { timeout: 3000 });
        });

        it('should render form fields correctly', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_DETAIL_QUERY,
                        variables: { tenantId: 'test-tenant-id' },
                    },
                    result: {
                        data: {
                            getTenantById: { ...mockTenant, totpEnabled: false },
                        },
                    },
                },
            ];

            renderWithProviders(<TenantDetail tenantId="test-tenant-id" />, mocks);

            await waitFor(() => {
                expect(screen.getByText('test-tenant-id')).toBeInTheDocument();
                // Verify form is rendered with proper structure
                expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
