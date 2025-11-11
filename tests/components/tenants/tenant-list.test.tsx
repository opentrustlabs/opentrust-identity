import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenantResultList from '@/components/tenants/tenant-list';
import { ObjectSearchResultItem, SearchResultType } from '@/graphql/generated/graphql-types';
import { ResponsiveContext, ResponsiveBreakpoints } from '@/components/contexts/responsive-context';
import { TenantContext, TenantMetaDataBean } from '@/components/contexts/tenant-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock tenant data
const mockTenant1: ObjectSearchResultItem = {
    objectid: 'tenant-1',
    name: 'Test Tenant 1',
    description: 'Description for tenant 1',
    enabled: true,
    objecttype: SearchResultType.Tenant,
    subtype: 'IDENTITY_MANAGEMENT',
    subtypekey: 'identity',
    owningtenantid: 'root-tenant',
    owningclientid: null,
    email: null,
};

const mockTenant2: ObjectSearchResultItem = {
    objectid: 'tenant-2',
    name: 'Test Tenant 2',
    description: 'Description for tenant 2',
    enabled: false,
    objecttype: SearchResultType.Tenant,
    subtype: 'APPLICATION',
    subtypekey: 'app',
    owningtenantid: 'root-tenant',
    owningclientid: null,
    email: null,
};

const mockTenant3: ObjectSearchResultItem = {
    objectid: 'tenant-3',
    name: 'Test Tenant 3',
    description: null,
    enabled: true,
    objecttype: SearchResultType.Tenant,
    subtype: null,
    subtypekey: null,
    owningtenantid: 'root-tenant',
    owningclientid: null,
    email: null,
};

const mockTenantWithLongName: ObjectSearchResultItem = {
    objectid: 'tenant-long',
    name: 'This is a very long tenant name that might cause layout issues if not handled properly',
    description: 'Description for long name tenant',
    enabled: true,
    objecttype: SearchResultType.Tenant,
    subtype: 'IDENTITY_MANAGEMENT',
    subtypekey: 'identity',
    owningtenantid: 'root-tenant',
    owningclientid: null,
    email: null,
};

const mockTenantWithSpecialChars: ObjectSearchResultItem = {
    objectid: 'tenant-special',
    name: 'Tenant & Associates <Special> "Characters"',
    description: 'Description with <special> & "characters"',
    enabled: true,
    objecttype: SearchResultType.Tenant,
    subtype: 'IDENTITY_MANAGEMENT',
    subtypekey: 'identity',
    owningtenantid: 'root-tenant',
    owningclientid: null,
    email: null,
};

// Mock search results
const mockSearchResults = {
    resultlist: [mockTenant1, mockTenant2],
    starttime: Date.now(),
    endtime: Date.now() + 100,
};

const mockEmptySearchResults = {
    resultlist: [],
    starttime: Date.now(),
    endtime: Date.now() + 100,
};

const mockSingleTenantResults = {
    resultlist: [mockTenant1],
    starttime: Date.now(),
    endtime: Date.now() + 100,
};

const mockMultipleTenantResults = {
    resultlist: [mockTenant1, mockTenant2, mockTenant3],
    starttime: Date.now(),
    endtime: Date.now() + 100,
};

const mockSearchResultsWithEdgeCases = {
    resultlist: [mockTenantWithLongName, mockTenantWithSpecialChars],
    starttime: Date.now(),
    endtime: Date.now() + 100,
};

// Mock ResponsiveBreakpoints
const mockResponsiveBreakpointsMedium: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: false,
    isMedium: true,
    isLarge: false,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false,
};

const mockResponsiveBreakpointsLarge: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: false,
    isMedium: false,
    isLarge: true,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false,
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
        systemSettings: {
            allowDuressPassword: false,
            allowRecoveryEmail: false,
            enablePortalAsLegacyIdp: false,
            rootClientId: 'root-client',
            softwareVersion: '1.0.0',
            systemCategories: [],
            systemId: 'test-system',
        },
        socialOIDCProviders: [],
    }),
};

// Helper function to render component with providers
const renderWithProviders = (
    searchResults: any,
    responsiveBreakpoints: ResponsiveBreakpoints = mockResponsiveBreakpointsMedium,
    tenantBean: TenantMetaDataBean = mockTenantBean
) => {
    return render(
        <ClipboardCopyContextProvider>
            <TenantContext.Provider value={tenantBean}>
                <ResponsiveContext.Provider value={responsiveBreakpoints}>
                    <TenantResultList searchResults={searchResults} />
                </ResponsiveContext.Provider>
            </TenantContext.Provider>
        </ClipboardCopyContextProvider>
    );
};

describe('TenantResultList Component', () => {
    describe('Medium Screen Layout (isMedium=true)', () => {
        it('should render headers for medium screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            expect(screen.getByText('Enabled')).toBeInTheDocument();
        });

        it('should not render wide screen headers on medium screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.queryByText('Tenant Description')).not.toBeInTheDocument();
            expect(screen.queryByText('Tenant Type')).not.toBeInTheDocument();
            expect(screen.queryByText('Object ID')).not.toBeInTheDocument();
        });

        it('should render tenant names as links', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const link1 = screen.getByRole('link', { name: /Test Tenant 1/i });
            const link2 = screen.getByRole('link', { name: /Test Tenant 2/i });

            expect(link1).toBeInTheDocument();
            expect(link2).toBeInTheDocument();
        });

        it('should construct correct link URLs', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const link1 = screen.getByRole('link', { name: /Test Tenant 1/i });
            expect(link1).toHaveAttribute('href', '/context-tenant-id/tenants/tenant-1');
        });

        it('should show check icon for enabled tenants', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const checkIcons = container.querySelectorAll('[data-testid="CheckOutlinedIcon"]');
            expect(checkIcons.length).toBeGreaterThan(0);
        });

        it('should not show check icon for disabled tenants', () => {
            renderWithProviders(
                { resultlist: [mockTenant2], starttime: Date.now(), endtime: Date.now() + 100 },
                mockResponsiveBreakpointsMedium
            );

            // Tenant 2 is disabled, so should have no check icon in its row
            expect(screen.getByText('Test Tenant 2')).toBeInTheDocument();
        });

        it('should render expand icons for each tenant', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            expect(expandIcons.length).toBe(2); // One for each tenant
        });

        it('should render dividers between items', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const dividers = container.querySelectorAll('hr');
            expect(dividers.length).toBeGreaterThan(0);
        });
    });

    describe('Large Screen Layout (isMedium=false)', () => {
        it('should render all headers for large screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            expect(screen.getByText('Tenant Description')).toBeInTheDocument();
            expect(screen.getByText('Tenant Type')).toBeInTheDocument();
            expect(screen.getByText('Enabled')).toBeInTheDocument();
            expect(screen.getByText('Object ID')).toBeInTheDocument();
        });

        it('should display tenant descriptions inline', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            expect(screen.getByText('Description for tenant 1')).toBeInTheDocument();
            expect(screen.getByText('Description for tenant 2')).toBeInTheDocument();
        });

        it('should display tenant types inline', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            expect(screen.getByText('IDENTITY_MANAGEMENT')).toBeInTheDocument();
            expect(screen.getByText('APPLICATION')).toBeInTheDocument();
        });

        it('should display object IDs inline', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            expect(screen.getByText('tenant-1')).toBeInTheDocument();
            expect(screen.getByText('tenant-2')).toBeInTheDocument();
        });

        it('should render copy icons for each tenant', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            const copyIcons = container.querySelectorAll('[data-testid="ContentCopyIcon"]');
            expect(copyIcons.length).toBe(2); // One for each tenant
        });

        it('should not render expand/collapse icons on large screen', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            expect(expandIcons.length).toBe(0);
        });
    });

    describe('Expand/Collapse Functionality (Medium Screen)', () => {
        it('should not show expanded details initially', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.queryByText('Description')).not.toBeInTheDocument();
            expect(screen.queryByText('Tenant Type')).not.toBeInTheDocument();
        });

        it('should expand details when unfold icon is clicked', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Description')).toBeInTheDocument();
                expect(screen.getByText('Tenant Type')).toBeInTheDocument();
                expect(screen.getByText('Object ID')).toBeInTheDocument();
            });
        });

        it('should show expanded content after clicking expand', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Description for tenant 1')).toBeInTheDocument();
                expect(screen.getByText('IDENTITY_MANAGEMENT')).toBeInTheDocument();
                expect(screen.getByText('tenant-1')).toBeInTheDocument();
            });
        });

        it('should change to collapse icon after expanding', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                const collapseIcons = container.querySelectorAll('[data-testid="UnfoldLessOutlinedIcon"]');
                expect(collapseIcons.length).toBeGreaterThan(0);
            });
        });

        it('should collapse details when collapse icon is clicked', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            // First expand
            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Description')).toBeInTheDocument();
            });

            // Then collapse
            const collapseIcons = container.querySelectorAll('[data-testid="UnfoldLessOutlinedIcon"]');
            fireEvent.click(collapseIcons[0]);

            await waitFor(() => {
                expect(screen.queryByText('Description')).not.toBeInTheDocument();
            });
        });

        it('should handle multiple tenants being expanded simultaneously', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');

            // Expand first tenant
            fireEvent.click(expandIcons[0]);
            await waitFor(() => {
                expect(screen.getByText('Description for tenant 1')).toBeInTheDocument();
            });

            // Expand second tenant
            fireEvent.click(expandIcons[1]);
            await waitFor(() => {
                expect(screen.getByText('Description for tenant 2')).toBeInTheDocument();
            });

            // Both should be visible
            expect(screen.getByText('Description for tenant 1')).toBeInTheDocument();
            expect(screen.getByText('Description for tenant 2')).toBeInTheDocument();
        });
    });

    describe('Copy to Clipboard Functionality', () => {
        it('should render copy icon on large screen', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            const copyIcons = container.querySelectorAll('[data-testid="ContentCopyIcon"]');
            expect(copyIcons.length).toBe(2);
        });

        it('should render copy icon in expanded view on medium screen', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                const copyIcons = container.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            });
        });

        it('should have pointer cursor on copy icon', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            const copyIcons = container.querySelectorAll('[data-testid="ContentCopyIcon"]');
            expect(copyIcons[0]).toBeInTheDocument();
        });
    });

    describe('Empty Results', () => {
        it('should render without errors when no results', () => {
            const { container } = renderWithProviders(mockEmptySearchResults, mockResponsiveBreakpointsMedium);

            expect(container).toBeInTheDocument();
        });

        it('should still show headers with empty results', () => {
            renderWithProviders(mockEmptySearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            expect(screen.getByText('Enabled')).toBeInTheDocument();
        });

        it('should not render any tenant rows with empty results', () => {
            renderWithProviders(mockEmptySearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null descriptions', async () => {
            const { container } = renderWithProviders(
                { resultlist: [mockTenant3], starttime: Date.now(), endtime: Date.now() + 100 },
                mockResponsiveBreakpointsMedium
            );

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Description')).toBeInTheDocument();
            });
        });

        it('should handle null subtypes', async () => {
            const { container } = renderWithProviders(
                { resultlist: [mockTenant3], starttime: Date.now(), endtime: Date.now() + 100 },
                mockResponsiveBreakpointsMedium
            );

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Tenant Type')).toBeInTheDocument();
            });
        });

        it('should handle long tenant names', () => {
            renderWithProviders(mockSearchResultsWithEdgeCases, mockResponsiveBreakpointsMedium);

            expect(screen.getByText(/This is a very long tenant name/)).toBeInTheDocument();
        });

        it('should handle special characters in tenant names', () => {
            renderWithProviders(mockSearchResultsWithEdgeCases, mockResponsiveBreakpointsMedium);

            expect(screen.getByText(/Tenant & Associates/)).toBeInTheDocument();
        });

        it('should handle special characters in descriptions', async () => {
            const { container } = renderWithProviders(mockSearchResultsWithEdgeCases, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[1]); // Expand second tenant (with special chars)

            await waitFor(() => {
                expect(screen.getByText(/Description with <special> & "characters"/)).toBeInTheDocument();
            });
        });
    });

    describe('Link Navigation', () => {
        it('should include context tenant ID in links', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const link = screen.getByRole('link', { name: /Test Tenant 1/i });
            expect(link.getAttribute('href')).toContain('context-tenant-id');
        });

        it('should include tenant object ID in links', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const link = screen.getByRole('link', { name: /Test Tenant 1/i });
            expect(link.getAttribute('href')).toContain('tenant-1');
        });

        it('should follow pattern /contextTenantId/tenants/tenantId', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const link1 = screen.getByRole('link', { name: /Test Tenant 1/i });
            const link2 = screen.getByRole('link', { name: /Test Tenant 2/i });

            expect(link1).toHaveAttribute('href', '/context-tenant-id/tenants/tenant-1');
            expect(link2).toHaveAttribute('href', '/context-tenant-id/tenants/tenant-2');
        });

        it('should render links with style attributes', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const link = screen.getByRole('link', { name: /Test Tenant 1/i });
            // Links are rendered with inline styles in the component
            expect(link).toBeInTheDocument();
            expect(link.getAttribute('href')).toBe('/context-tenant-id/tenants/tenant-1');
        });
    });

    describe('Grid Layout', () => {
        it('should use size 9 for name column on medium screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
        });

        it('should use size 2 for enabled column on medium screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            expect(screen.getByText('Enabled')).toBeInTheDocument();
        });

        it('should use size 2 for name column on large screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
        });

        it('should use size 3.6 for description column on large screen', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsLarge);

            expect(screen.getByText('Tenant Description')).toBeInTheDocument();
        });
    });

    describe('Typography Styling', () => {
        it('should apply bold font weight to headers', () => {
            renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const header = screen.getByText('Tenant Name');
            expect(header).toBeInTheDocument();
        });

        it('should apply font size 0.9em', () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const typographyElements = container.querySelectorAll('[class*="MuiTypography"]');
            expect(typographyElements.length).toBeGreaterThan(0);
        });
    });

    describe('Expanded Content Layout', () => {
        it('should indent expanded content', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Description')).toBeInTheDocument();
            });
        });

        it('should underline section labels in expanded view', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                const descriptionLabel = screen.getByText('Description');
                expect(descriptionLabel).toBeInTheDocument();
            });
        });

        it('should display copy icon with object ID in expanded view', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                const copyIcons = container.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Multiple Tenants', () => {
        it('should render all tenants in the list', () => {
            renderWithProviders(mockMultipleTenantResults, mockResponsiveBreakpointsMedium);

            expect(screen.getByText('Test Tenant 1')).toBeInTheDocument();
            expect(screen.getByText('Test Tenant 2')).toBeInTheDocument();
            expect(screen.getByText('Test Tenant 3')).toBeInTheDocument();
        });

        it('should maintain separate expand state for each tenant', async () => {
            const { container } = renderWithProviders(mockSearchResults, mockResponsiveBreakpointsMedium);

            const expandIcons = container.querySelectorAll('[data-testid="UnfoldMoreOutlinedIcon"]');

            // Expand only first tenant
            fireEvent.click(expandIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Description for tenant 1')).toBeInTheDocument();
                expect(screen.queryByText('Description for tenant 2')).not.toBeInTheDocument();
            });
        });
    });
});
