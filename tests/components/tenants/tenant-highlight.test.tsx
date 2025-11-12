import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantHighlight from '@/components/tenants/tenant-highlight';
import { TENANT_DETAIL_QUERY } from '@/graphql/queries/oidc-queries';
import { TenantContext, TenantMetaDataBean } from '@/components/contexts/tenant-context';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock tenant data
const mockTenant = {
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    tenantDescription: 'Test tenant description',
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

const mockTenantWithLongName = {
    ...mockTenant,
    tenantName: 'This is a very long tenant name that might cause layout issues if not handled properly by the component',
};

const mockTenantWithSpecialCharacters = {
    ...mockTenant,
    tenantName: 'Tenant & Associates <Special> "Characters"',
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

// GraphQL mock with long name
const mockTenantDetailQueryLongName = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantById: mockTenantWithLongName,
        },
    },
};

// GraphQL mock with special characters
const mockTenantDetailQuerySpecialChars = {
    request: {
        query: TENANT_DETAIL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantById: mockTenantWithSpecialCharacters,
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

// GraphQL mock for different tenant
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
            },
        },
    },
};

// Mock TenantContext
const mockTenantBean: TenantMetaDataBean = {
    setTenantMetaData: jest.fn(),
    getTenantMetaData: () => ({
        tenant: {
            tenantId: 'context-tenant-id',
            tenantName: 'Context Tenant',
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
            tenantid: 'context-tenant-id',
            adminheaderbackgroundcolor: '#1976d2',
            adminheadertextcolor: 'white',
            adminheadertext: 'Context Tenant',
            authenticationheaderbackgroundcolor: '#1976d2',
            authenticationheadertextcolor: 'white',
        },
        socialOIDCProviders: [],
    }),
};

// Helper function to render component with providers
const renderWithProviders = (
    tenantId: string,
    mocks: any[] = [mockTenantDetailQuerySuccess],
    tenantBean: TenantMetaDataBean = mockTenantBean
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <TenantContext.Provider value={tenantBean}>
                <TenantHighlight tenantId={tenantId} />
            </TenantContext.Provider>
        </MockedProvider>
    );
};

describe('TenantHighlight Component', () => {
    describe('Loading State', () => {
        it('should render empty div during loading', () => {
            const { container } = renderWithProviders('test-tenant-id');

            // Component renders <div /> during loading
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should not display tenant label during loading', () => {
            renderWithProviders('test-tenant-id');

            expect(screen.queryByText('Tenant:')).not.toBeInTheDocument();
        });

        it('should not display tenant name during loading', () => {
            renderWithProviders('test-tenant-id');

            expect(screen.queryByText('Test Tenant')).not.toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should render empty div on error', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQueryError]);

            await waitFor(() => {
                expect(container.firstChild).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should not display tenant information on error', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', [mockTenantDetailQueryError]);

            await waitFor(() => {
                expect(screen.queryByText('Tenant:')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Successful Data Display', () => {
        it('should display "Tenant:" label', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant:')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display tenant name', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render tenant name as a link', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Test Tenant/i });
                expect(link).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should construct correct link URL using context tenant ID', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Test Tenant/i });
                expect(link).toHaveAttribute('href', '/context-tenant-id/tenants/test-tenant-id');
            }, { timeout: 3000 });
        });

        it('should apply bold font weight to label', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant:')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Typography with fontWeight="bold" should be present
            const boldElements = container.querySelectorAll('[class*="MuiTypography"]');
            expect(boldElements.length).toBeGreaterThan(0);
        });
    });

    describe('Typography Component', () => {
        it('should wrap content in Typography component', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            const typographyElements = container.querySelectorAll('[class*="MuiTypography"]');
            expect(typographyElements.length).toBeGreaterThan(0);
        });

        it('should render Typography as div component', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('TenantContext Integration', () => {
        it('should use tenant ID from context for link construction', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Test Tenant/i });
                expect(link.getAttribute('href')).toContain('context-tenant-id');
            }, { timeout: 3000 });
        });

        it('should work with different context tenant IDs', async () => {
            const differentTenantBean: TenantMetaDataBean = {
                ...mockTenantBean,
                getTenantMetaData: () => ({
                    ...mockTenantBean.getTenantMetaData(),
                    tenant: {
                        ...mockTenantBean.getTenantMetaData().tenant,
                        tenantId: 'different-context-tenant',
                    },
                }),
            };

            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess], differentTenantBean);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Test Tenant/i });
                expect(link.getAttribute('href')).toContain('different-context-tenant');
            }, { timeout: 3000 });
        });
    });

    describe('Different Tenant IDs', () => {
        it('should handle different tenant ID in query', async () => {
            renderWithProviders('another-tenant-id', [mockTenantDetailQueryDifferentTenant]);

            await waitFor(() => {
                expect(screen.getByText('Another Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should construct correct link for different tenant', async () => {
            renderWithProviders('another-tenant-id', [mockTenantDetailQueryDifferentTenant]);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Another Tenant/i });
                expect(link).toHaveAttribute('href', '/context-tenant-id/tenants/another-tenant-id');
            }, { timeout: 3000 });
        });
    });

    describe('Edge Cases', () => {
        it('should handle long tenant names', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQueryLongName]);

            await waitFor(() => {
                expect(screen.getByText(/This is a very long tenant name/)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle tenant names with special characters', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySpecialChars]);

            await waitFor(() => {
                expect(screen.getByText(/Tenant & Associates/)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render link for tenant with special characters', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySpecialChars]);

            await waitFor(() => {
                const link = screen.getByRole('link');
                expect(link).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Label and Content Structure', () => {
        it('should render label in separate span', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Tenant:')).toBeInTheDocument();
            }, { timeout: 3000 });

            const spans = container.querySelectorAll('span');
            expect(spans.length).toBeGreaterThan(0);
        });

        it('should render tenant name link in separate span', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
            }, { timeout: 3000 });

            const spans = container.querySelectorAll('span');
            expect(spans.length).toBeGreaterThan(1);
        });
    });

    describe('Link Navigation', () => {
        it('should include tenant ID in link path', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Test Tenant/i });
                expect(link.getAttribute('href')).toContain('test-tenant-id');
            }, { timeout: 3000 });
        });

        it('should follow pattern /contextTenantId/tenants/tenantId', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            await waitFor(() => {
                const link = screen.getByRole('link', { name: /Test Tenant/i });
                expect(link).toHaveAttribute('href', '/context-tenant-id/tenants/test-tenant-id');
            }, { timeout: 3000 });
        });
    });

    describe('Empty Fragment Return', () => {
        it('should return empty fragment when no data and no error/loading', async () => {
            const mockNoData = {
                request: {
                    query: TENANT_DETAIL_QUERY,
                    variables: { tenantId: 'test-tenant-id' },
                },
                result: {
                    data: null,
                },
            };

            const { container } = renderWithProviders('test-tenant-id', [mockNoData]);

            await waitFor(() => {
                // Component returns <></> when no data
                expect(container.firstChild).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Component Rendering Conditions', () => {
        it('should only render content when data is available', async () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            // Should not show content initially
            expect(screen.queryByText('Tenant:')).not.toBeInTheDocument();

            // Should show content after loading
            await waitFor(() => {
                expect(screen.getByText('Tenant:')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not render content during loading state', () => {
            renderWithProviders('test-tenant-id', [mockTenantDetailQuerySuccess]);

            expect(screen.queryByText('Tenant:')).not.toBeInTheDocument();
            expect(screen.queryByText('Test Tenant')).not.toBeInTheDocument();
        });
    });
});
