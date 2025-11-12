import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FederatedOIDCProviderList from '@/components/oidc-providers/oidc-provider-list';
import { ObjectSearchResults, ObjectSearchResultItem } from '@/graphql/generated/graphql-types';
import { ResponsiveContext } from '@/components/contexts/responsive-context';
import { TenantContext } from '@/components/contexts/tenant-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockedLink({ children, href }: any) {
        return <a href={href}>{children}</a>;
    };
});

const mockTenantId = 'tenant-123';

const mockProviders: ObjectSearchResultItem[] = [
    {
        objectid: 'provider-1',
        name: 'Google OIDC',
        description: 'Google OAuth provider',
        subtype: 'Social',
        enabled: true,
        objecttype: 'OIDC_PROVIDER' as any
    },
    {
        objectid: 'provider-2',
        name: 'Azure AD',
        description: 'Microsoft Azure Active Directory',
        subtype: 'Enterprise',
        enabled: true,
        objecttype: 'OIDC_PROVIDER' as any
    },
    {
        objectid: 'provider-3',
        name: 'Okta',
        description: 'Okta identity provider',
        subtype: 'Enterprise',
        enabled: false,
        objecttype: 'OIDC_PROVIDER' as any
    }
];

const mockSearchResults: ObjectSearchResults = {
    resultlist: mockProviders,
    total: 3,
    endtime: Date.now(),
    starttime: Date.now(),
    page: 1,
    perpage: 20,
    took: 10
};

const mockEmptySearchResults: ObjectSearchResults = {
    resultlist: [],
    total: 0,
    endtime: Date.now(),
    starttime: Date.now(),
    page: 1,
    perpage: 20,
    took: 5
};

const mockTenantBean = {
    getTenantMetaData: () => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: 'regular'
        }
    })
};

const renderWithProviders = (
    searchResults: ObjectSearchResults,
    isMedium: boolean = false
) => {
    const responsiveValue = {
        isMedium,
        isLarge: !isMedium,
        isSmall: false,
        isExtraSmall: false,
        isExtraLarge: false,
        isGreaterThanExtraLarge: false
    };

    return render(
        <TenantContext.Provider value={mockTenantBean as any}>
            <ResponsiveContext.Provider value={responsiveValue}>
                <ClipboardCopyContextProvider>
                    <FederatedOIDCProviderList searchResults={searchResults} />
                </ClipboardCopyContextProvider>
            </ResponsiveContext.Provider>
        </TenantContext.Provider>
    );
};

describe('FederatedOIDCProviderList - Medium Screen Layout', () => {
    it('should display column headers on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should display all provider names as links on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        mockProviders.forEach(provider => {
            const link = screen.getByText(provider.name);
            expect(link).toBeInTheDocument();
            expect(link.closest('a')).toHaveAttribute('href', `/${mockTenantId}/oidc-providers/${provider.objectid}`);
        });
    });

    it('should display provider types on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        mockProviders.forEach(provider => {
            expect(screen.getByText(provider.subtype!)).toBeInTheDocument();
        });
    });

    it('should display expand icons for all providers on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        expect(expandIcons).toHaveLength(mockProviders.length);
    });

    it('should not display provider details initially on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        expect(screen.queryByText('Description')).not.toBeInTheDocument();
        expect(screen.queryByText('Object ID')).not.toBeInTheDocument();
    });

    it('should expand provider details when expand icon is clicked on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Object ID')).toBeInTheDocument();
            expect(screen.getByText(mockProviders[0].description!)).toBeInTheDocument();
        });
    });

    it('should display collapse icon after expanding on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('UnfoldLessOutlinedIcon')).toBeInTheDocument();
        });
    });

    it('should collapse provider details when collapse icon is clicked on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Description')).toBeInTheDocument();
        });

        const collapseIcon = screen.getByTestId('UnfoldLessOutlinedIcon');
        fireEvent.click(collapseIcon);

        await waitFor(() => {
            expect(screen.queryByText('Description')).not.toBeInTheDocument();
        });
    });

    it('should display copy icon in expanded view on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('ContentCopyIcon')).toBeInTheDocument();
        });
    });

    it('should handle multiple expanded providers independently on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);
        fireEvent.click(expandIcons[1]);

        await waitFor(() => {
            const descriptions = screen.getAllByText('Description');
            expect(descriptions).toHaveLength(2);
        });
    });

    it('should display "No OIDC providers to display" when list is empty on medium screens', () => {
        renderWithProviders(mockEmptySearchResults, true);

        expect(screen.getByText('No OIDC providers to display')).toBeInTheDocument();
    });
});

describe('FederatedOIDCProviderList - Large Screen Layout', () => {
    it('should display all column headers on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Object ID')).toBeInTheDocument();
    });

    it('should display all provider names as links on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockProviders.forEach(provider => {
            const link = screen.getByText(provider.name);
            expect(link).toBeInTheDocument();
            expect(link.closest('a')).toHaveAttribute('href', `/${mockTenantId}/oidc-providers/${provider.objectid}`);
        });
    });

    it('should display all provider descriptions on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockProviders.forEach(provider => {
            expect(screen.getByText(provider.description!)).toBeInTheDocument();
        });
    });

    it('should display all provider types on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockProviders.forEach(provider => {
            expect(screen.getByText(provider.subtype!)).toBeInTheDocument();
        });
    });

    it('should display all provider object IDs on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockProviders.forEach(provider => {
            expect(screen.getByText(provider.objectid)).toBeInTheDocument();
        });
    });

    it('should display copy icons for all providers on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');
        expect(copyIcons).toHaveLength(mockProviders.length);
    });

    it('should not display expand/collapse icons on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        expect(screen.queryByTestId('UnfoldMoreOutlinedIcon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('UnfoldLessOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should display "No OIDC providers to display" when list is empty on large screens', () => {
        renderWithProviders(mockEmptySearchResults, false);

        expect(screen.getByText('No OIDC providers to display')).toBeInTheDocument();
    });
});

describe('FederatedOIDCProviderList - Clipboard Copy Functionality', () => {
    beforeEach(() => {
        // Mock the clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined)
            }
        });
    });

    it('should copy provider ID to clipboard when copy icon is clicked on large screens', async () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');
        fireEvent.click(copyIcons[0]);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProviders[0].objectid);
        });
    });

    it('should display success message after copying on large screens', async () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');
        fireEvent.click(copyIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('OIDC Provider ID copied to clipboard')).toBeInTheDocument();
        });
    });

    it('should copy provider ID to clipboard when copy icon is clicked in expanded view on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('ContentCopyIcon')).toBeInTheDocument();
        });

        const copyIcon = screen.getByTestId('ContentCopyIcon');
        fireEvent.click(copyIcon);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProviders[0].objectid);
        });
    });

    it('should display success message after copying on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('ContentCopyIcon')).toBeInTheDocument();
        });

        const copyIcon = screen.getByTestId('ContentCopyIcon');
        fireEvent.click(copyIcon);

        await waitFor(() => {
            expect(screen.getByText('OIDC Provider ID copied to clipboard')).toBeInTheDocument();
        });
    });

    it('should copy correct provider ID for each provider on large screens', async () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');

        for (let i = 0; i < copyIcons.length; i++) {
            fireEvent.click(copyIcons[i]);
            await waitFor(() => {
                expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProviders[i].objectid);
            });
        }
    });
});

describe('FederatedOIDCProviderList - Link Behavior', () => {
    it('should generate correct href for each provider link on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        mockProviders.forEach(provider => {
            const link = screen.getByText(provider.name).closest('a');
            expect(link).toHaveAttribute('href', `/${mockTenantId}/oidc-providers/${provider.objectid}`);
        });
    });

    it('should generate correct href for each provider link on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockProviders.forEach(provider => {
            const link = screen.getByText(provider.name).closest('a');
            expect(link).toHaveAttribute('href', `/${mockTenantId}/oidc-providers/${provider.objectid}`);
        });
    });
});

describe('FederatedOIDCProviderList - Empty State', () => {
    it('should display empty message with correct styling on medium screens', () => {
        renderWithProviders(mockEmptySearchResults, true);

        const emptyMessage = screen.getByText('No OIDC providers to display');
        expect(emptyMessage).toBeInTheDocument();
        expect(emptyMessage.closest('div')).toHaveStyle({ textAlign: 'center' });
    });

    it('should display empty message with correct styling on large screens', () => {
        renderWithProviders(mockEmptySearchResults, false);

        const emptyMessage = screen.getByText('No OIDC providers to display');
        expect(emptyMessage).toBeInTheDocument();
        expect(emptyMessage.closest('div')).toHaveStyle({ textAlign: 'center' });
    });

    it('should not display any provider rows when list is empty on medium screens', () => {
        renderWithProviders(mockEmptySearchResults, true);

        expect(screen.queryByTestId('UnfoldMoreOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should not display any provider rows when list is empty on large screens', () => {
        renderWithProviders(mockEmptySearchResults, false);

        expect(screen.queryByTestId('ContentCopyIcon')).not.toBeInTheDocument();
    });
});

describe('FederatedOIDCProviderList - Provider Types Display', () => {
    it('should display Social type providers on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        const socialProvider = mockProviders.find(p => p.subtype === 'Social');
        expect(screen.getByText(socialProvider!.subtype!)).toBeInTheDocument();
    });

    it('should display Enterprise type providers on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        const enterpriseProviders = mockProviders.filter(p => p.subtype === 'Enterprise');
        enterpriseProviders.forEach(provider => {
            expect(screen.getByText(provider.subtype!)).toBeInTheDocument();
        });
    });

    it('should display Social type providers on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        const socialProvider = mockProviders.find(p => p.subtype === 'Social');
        expect(screen.getByText(socialProvider!.subtype!)).toBeInTheDocument();
    });

    it('should display Enterprise type providers on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        const enterpriseProviders = mockProviders.filter(p => p.subtype === 'Enterprise');
        enterpriseProviders.forEach(provider => {
            expect(screen.getByText(provider.subtype!)).toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderList - Expanded State Management', () => {
    it('should maintain independent expanded states for multiple providers', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');

        // Expand first provider
        fireEvent.click(expandIcons[0]);
        await waitFor(() => {
            expect(screen.getByText(mockProviders[0].description!)).toBeInTheDocument();
        });

        // Expand second provider
        fireEvent.click(expandIcons[1]);
        await waitFor(() => {
            expect(screen.getByText(mockProviders[1].description!)).toBeInTheDocument();
        });

        // Both should be visible
        expect(screen.getByText(mockProviders[0].description!)).toBeInTheDocument();
        expect(screen.getByText(mockProviders[1].description!)).toBeInTheDocument();
    });

    it('should collapse only the selected provider', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');

        // Expand both providers
        fireEvent.click(expandIcons[0]);
        fireEvent.click(expandIcons[1]);

        await waitFor(() => {
            expect(screen.getByText(mockProviders[0].description!)).toBeInTheDocument();
            expect(screen.getByText(mockProviders[1].description!)).toBeInTheDocument();
        });

        // Get collapse icons and click the first one
        const collapseIcons = screen.getAllByTestId('UnfoldLessOutlinedIcon');
        fireEvent.click(collapseIcons[0]);

        await waitFor(() => {
            expect(screen.queryByText(mockProviders[0].description!)).not.toBeInTheDocument();
            expect(screen.getByText(mockProviders[1].description!)).toBeInTheDocument();
        });
    });

    it('should display correct provider details in expanded view', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[1]); // Expand second provider

        await waitFor(() => {
            expect(screen.getByText(mockProviders[1].description!)).toBeInTheDocument();
            expect(screen.getByText(mockProviders[1].objectid)).toBeInTheDocument();
        });
    });

    it('should show all provider data when all are expanded', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');

        // Expand all providers
        expandIcons.forEach(icon => fireEvent.click(icon));

        await waitFor(() => {
            const descriptions = screen.getAllByText('Description');
            expect(descriptions).toHaveLength(mockProviders.length);

            mockProviders.forEach(provider => {
                expect(screen.getByText(provider.description!)).toBeInTheDocument();
            });
        });
    });
});

describe('FederatedOIDCProviderList - Mixed Content Display', () => {
    it('should display providers with different types correctly on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        expect(screen.getByText('Social')).toBeInTheDocument();
        // There are 2 Enterprise providers
        const enterpriseElements = screen.getAllByText('Enterprise');
        expect(enterpriseElements).toHaveLength(2);
    });

    it('should display providers with different types correctly on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        expect(screen.getByText('Social')).toBeInTheDocument();
        // There are 2 Enterprise providers
        const enterpriseElements = screen.getAllByText('Enterprise');
        expect(enterpriseElements).toHaveLength(2);
    });

    it('should handle providers with long descriptions in expanded view', async () => {
        const providerWithLongDesc: ObjectSearchResultItem[] = [
            {
                objectid: 'provider-long',
                name: 'Long Description Provider',
                description: 'This is a very long description that might wrap to multiple lines and should be displayed correctly in the expanded view without breaking the layout',
                subtype: 'Enterprise',
                enabled: true,
                objecttype: 'OIDC_PROVIDER' as any
            }
        ];

        const searchResults: ObjectSearchResults = {
            resultlist: providerWithLongDesc,
            total: 1,
            endtime: Date.now(),
            starttime: Date.now(),
            page: 1,
            perpage: 20,
            took: 5
        };

        renderWithProviders(searchResults, true);

        const expandIcon = screen.getByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcon);

        await waitFor(() => {
            expect(screen.getByText(providerWithLongDesc[0].description!)).toBeInTheDocument();
        });
    });
});
