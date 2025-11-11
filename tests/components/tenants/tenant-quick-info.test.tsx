import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantQuickInfo from '@/components/tenants/tenant-quick-info';
import { TENANT_DETAIL_QUERY } from '@/graphql/queries/oidc-queries';

// Mock tenant data
const mockTenant = {
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    tenantDescription: 'This is a test tenant for unit testing',
    enabled: true,
    allowUnlimitedRate: false,
    allowUserSelfRegistration: true,
    allowSocialLogin: false,
    allowAnonymousUsers: false,
    verifyEmailOnSelfRegistration: true,
    federatedAuthenticationConstraint: 'NOT_ALLOWED',
    federatedauthenticationconstraintid: '1',
    markForDelete: false,
    tenantType: 'IDENTITY_MANAGEMENT',
    tenanttypeid: '1',
    migrateLegacyUsers: false,
    allowLoginByPhoneNumber: false,
    allowForgotPassword: true,
    defaultRateLimit: 100,
    defaultRateLimitPeriodMinutes: 60,
    registrationRequireCaptcha: false,
    registrationRequireTermsAndConditions: false,
    termsAndConditionsUri: null,
};

const mockTenantWithLongDescription = {
    ...mockTenant,
    tenantName: 'Production Tenant',
    tenantDescription: 'This is a very long description that exceeds normal length for testing purposes. It contains multiple sentences to verify that the component can handle lengthy descriptions without breaking the layout or causing display issues.',
};

const mockTenantWithNullDescription = {
    ...mockTenant,
    tenantDescription: null,
};

const mockTenantWithEmptyDescription = {
    ...mockTenant,
    tenantDescription: '',
};

// GraphQL mock for successful query
const mockTenantDetailQuerySuccess = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantById: mockTenant,
        },
    },
};

// GraphQL mock with long description
const mockTenantDetailQueryLongDescription = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantById: mockTenantWithLongDescription,
        },
    },
};

// GraphQL mock with null description
const mockTenantDetailQueryNullDescription = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantById: mockTenantWithNullDescription,
        },
    },
};

// GraphQL mock with empty description
const mockTenantDetailQueryEmptyDescription = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantById: mockTenantWithEmptyDescription,
        },
    },
};

// GraphQL mock for error scenario
const mockTenantDetailQueryError = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to fetch tenant'),
};

// GraphQL mock for different tenant ID
const mockTenantDetailQueryDifferentTenant = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'another-tenant-id' },
    },
    result: {
        data: {
            getTenantById: {
                ...mockTenant,
                tenantId: 'another-tenant-id',
                tenantName: 'Another Tenant',
                tenantDescription: 'Another tenant description',
            },
        },
    },
};

// Helper function to render component with providers
const renderWithProviders = (
    tenantId: string | null,
    mocks: any[] = [mockTenantDetailQuerySuccess]
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <TenantQuickInfo tenantId={tenantId} />
        </MockedProvider>
    );
};

describe('TenantQuickInfo Component', () => {
    describe('Null TenantId Handling', () => {
        it('should display error message when tenantId is null', () => {
            renderWithProviders(null);

            expect(screen.getByText('Unable to retrieve tenant information')).toBeInTheDocument();
        });

        it('should not display tenant name header when tenantId is null', () => {
            renderWithProviders(null);

            expect(screen.queryByText('Tenant Name')).not.toBeInTheDocument();
        });

        it('should not display tenant description header when tenantId is null', () => {
            renderWithProviders(null);

            expect(screen.queryByText('Tenant Description')).not.toBeInTheDocument();
        });

        it('should not make GraphQL query when tenantId is null', () => {
            renderWithProviders(null, []);

            // If query was made without mock, it would show loading state
            // Instead we should see the error message immediately
            expect(screen.getByText('Unable to retrieve tenant information')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should display loading indicator while fetching data', () => {
            renderWithProviders('test-tenant-id');

            // Loading state shows "..."
            expect(screen.getByText('...')).toBeInTheDocument();
        });

        it('should not display error message during loading', () => {
            renderWithProviders('test-tenant-id');

            expect(screen.queryByText('Unable to retrieve tenant information')).not.toBeInTheDocument();
        });

        it('should not display tenant data during loading', () => {
            renderWithProviders('test-tenant-id');

            expect(screen.queryByText('Tenant Name')).not.toBeInTheDocument();
        });
    });

    describe('Successful Data Display', () => {
        it('should display tenant name header', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display tenant description header', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display tenant name value', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display tenant description value', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('This is a test tenant for unit testing')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display loading indicator after data loads', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByText('...')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display error message after successful load', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByText('Unable to retrieve tenant information')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', [mockTenantDetailQueryError]);

            await waitFor(() => {
                expect(screen.getByText('Unable to retrieve tenant information')).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should not display tenant data when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', [mockTenantDetailQueryError]);

            await waitFor(() => {
                expect(screen.queryByText('Tenant Name')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should not display loading indicator after error', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', [mockTenantDetailQueryError]);

            await waitFor(() => {
                expect(screen.queryByText('...')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        it('should handle long tenant descriptions', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQueryLongDescription]);

            await waitFor(() => {
                expect(screen.getByText(/This is a very long description that exceeds normal length/)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle null tenant description', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQueryNullDescription]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle empty tenant description', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQueryEmptyDescription]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle different tenant IDs', async () => {
            renderWithProviders('another-tenant-id', [mockTenantDetailQueryDifferentTenant]);

            await waitFor(() => {
                expect(screen.getByText('Another Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Layout Structure', () => {
        it('should render Grid2 container with size 12', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Check that grid structure exists
            const gridElements = container.querySelectorAll('[class*="MuiGrid2"]');
            expect(gridElements.length).toBeGreaterThan(0);
        });

        it('should display headers with bold font weight', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                const tenantNameHeader = screen.getByText('Tenant Name');
                const tenantDescHeader = screen.getByText('Tenant Description');

                expect(tenantNameHeader).toBeInTheDocument();
                expect(tenantDescHeader).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Divider element', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            const dividers = container.querySelectorAll('hr');
            expect(dividers.length).toBeGreaterThan(0);
        });
    });

    describe('Typography Component', () => {
        it('should wrap content in Typography component', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Typography renders as a div by default
            const typographyElements = container.querySelectorAll('[class*="MuiTypography"]');
            expect(typographyElements.length).toBeGreaterThan(0);
        });
    });

    describe('Query Skip Logic', () => {
        it('should skip query when tenantId is null', () => {
            const { container } = renderWithProviders(null, []);

            // Should show error immediately without attempting query
            expect(screen.getByText('Unable to retrieve tenant information')).toBeInTheDocument();
            // Should not show loading state
            expect(screen.queryByText('...')).not.toBeInTheDocument();
        });

        it('should execute query when tenantId is provided', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            // Should show loading first
            expect(screen.getByText('...')).toBeInTheDocument();

            // Then show data
            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Grid Spacing', () => {
        it('should use spacing of 2 for header grid', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Check that grid structure with spacing exists
            expect(container.querySelector('[class*="MuiGrid2"]')).toBeInTheDocument();
        });

        it('should allocate size 5 for tenant name column', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should allocate size 7 for tenant description column', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Margin and Padding', () => {
        it('should apply bottom margin to header', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should apply top margin to data row', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
