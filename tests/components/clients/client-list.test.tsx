import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientResultList from '@/components/clients/client-list';
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

const mockClients: ObjectSearchResultItem[] = [
    {
        objectid: 'client-1',
        name: 'Web Application',
        description: 'Main web application client',
        subtype: 'Web',
        enabled: true,
        objecttype: 'CLIENT' as any
    },
    {
        objectid: 'client-2',
        name: 'Mobile App',
        description: 'Mobile application client',
        subtype: 'Native',
        enabled: false,
        objecttype: 'CLIENT' as any
    },
    {
        objectid: 'client-3',
        name: 'API Client',
        description: 'Backend API client',
        subtype: 'Machine',
        enabled: true,
        objecttype: 'CLIENT' as any
    }
];

const mockSearchResults: ObjectSearchResults = {
    resultlist: mockClients,
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
                    <ClientResultList searchResults={searchResults} />
                </ClipboardCopyContextProvider>
            </ResponsiveContext.Provider>
        </TenantContext.Provider>
    );
};

describe('ClientResultList - Medium Screen Layout', () => {
    it('should display column headers on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        expect(screen.getByText('Client Name')).toBeInTheDocument();
        expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('should display all client names as links on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        mockClients.forEach(client => {
            const link = screen.getByText(client.name);
            expect(link).toBeInTheDocument();
            expect(link.closest('a')).toHaveAttribute('href', `/${mockTenantId}/clients/${client.objectid}`);
        });
    });

    it('should display checkmark icon for enabled clients on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        const checkIcons = screen.getAllByTestId('CheckOutlinedIcon');
        // Only 2 clients are enabled (client-1 and client-3)
        expect(checkIcons).toHaveLength(2);
    });

    it('should not display checkmark for disabled clients on medium screens', () => {
        const disabledClientOnly: ObjectSearchResults = {
            resultlist: [mockClients[1]], // Mobile App - disabled
            total: 1,
            endtime: Date.now(),
            starttime: Date.now(),
            page: 1,
            perpage: 20,
            took: 5
        };

        renderWithProviders(disabledClientOnly, true);

        expect(screen.queryByTestId('CheckOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should display expand icons for all clients on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        expect(expandIcons).toHaveLength(mockClients.length);
    });

    it('should not display client details initially on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        expect(screen.queryByText('Description')).not.toBeInTheDocument();
        expect(screen.queryByText('Client Type')).not.toBeInTheDocument();
        expect(screen.queryByText('Object ID')).not.toBeInTheDocument();
    });

    it('should expand client details when expand icon is clicked on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Client Type')).toBeInTheDocument();
            expect(screen.getByText('Object ID')).toBeInTheDocument();
            expect(screen.getByText(mockClients[0].description!)).toBeInTheDocument();
            expect(screen.getByText(mockClients[0].subtype!)).toBeInTheDocument();
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

    it('should collapse client details when collapse icon is clicked on medium screens', async () => {
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

    it('should handle multiple expanded clients independently on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);
        fireEvent.click(expandIcons[1]);

        await waitFor(() => {
            const descriptions = screen.getAllByText('Description');
            expect(descriptions).toHaveLength(2);
        });
    });

    it('should display "No clients to display" when list is empty on medium screens', () => {
        renderWithProviders(mockEmptySearchResults, true);

        expect(screen.getByText('No clients to display')).toBeInTheDocument();
    });
});

describe('ClientResultList - Large Screen Layout', () => {
    it('should display all column headers on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        expect(screen.getByText('Client Name')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Client Type')).toBeInTheDocument();
        expect(screen.getByText('Enabled')).toBeInTheDocument();
        expect(screen.getByText('Object ID')).toBeInTheDocument();
    });

    it('should display all client names as links on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockClients.forEach(client => {
            const link = screen.getByText(client.name);
            expect(link).toBeInTheDocument();
            expect(link.closest('a')).toHaveAttribute('href', `/${mockTenantId}/clients/${client.objectid}`);
        });
    });

    it('should display all client descriptions on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockClients.forEach(client => {
            expect(screen.getByText(client.description!)).toBeInTheDocument();
        });
    });

    it('should display all client types on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockClients.forEach(client => {
            expect(screen.getByText(client.subtype!)).toBeInTheDocument();
        });
    });

    it('should display all client object IDs on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockClients.forEach(client => {
            expect(screen.getByText(client.objectid)).toBeInTheDocument();
        });
    });

    it('should display checkmark icon for enabled clients on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        const checkIcons = screen.getAllByTestId('CheckOutlinedIcon');
        // Only 2 clients are enabled (client-1 and client-3)
        expect(checkIcons).toHaveLength(2);
    });

    it('should display copy icons for all clients on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');
        expect(copyIcons).toHaveLength(mockClients.length);
    });

    it('should not display expand/collapse icons on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        expect(screen.queryByTestId('UnfoldMoreOutlinedIcon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('UnfoldLessOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should display "No clients to display" when list is empty on large screens', () => {
        renderWithProviders(mockEmptySearchResults, false);

        expect(screen.getByText('No clients to display')).toBeInTheDocument();
    });
});

describe('ClientResultList - Clipboard Copy Functionality', () => {
    beforeEach(() => {
        // Mock the clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined)
            }
        });
    });

    it('should copy client ID to clipboard when copy icon is clicked on large screens', async () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');
        fireEvent.click(copyIcons[0]);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockClients[0].objectid);
        });
    });

    it('should display success message after copying on large screens', async () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');
        fireEvent.click(copyIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Client ID copied to clipboard')).toBeInTheDocument();
        });
    });

    it('should copy client ID to clipboard when copy icon is clicked in expanded view on medium screens', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('ContentCopyIcon')).toBeInTheDocument();
        });

        const copyIcon = screen.getByTestId('ContentCopyIcon');
        fireEvent.click(copyIcon);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockClients[0].objectid);
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
            expect(screen.getByText('Client ID copied to clipboard')).toBeInTheDocument();
        });
    });

    it('should copy correct client ID for each client on large screens', async () => {
        renderWithProviders(mockSearchResults, false);

        const copyIcons = screen.getAllByTestId('ContentCopyIcon');

        for (let i = 0; i < copyIcons.length; i++) {
            fireEvent.click(copyIcons[i]);
            await waitFor(() => {
                expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockClients[i].objectid);
            });
        }
    });
});

describe('ClientResultList - Link Behavior', () => {
    it('should generate correct href for each client link on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        mockClients.forEach(client => {
            const link = screen.getByText(client.name).closest('a');
            expect(link).toHaveAttribute('href', `/${mockTenantId}/clients/${client.objectid}`);
        });
    });

    it('should generate correct href for each client link on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        mockClients.forEach(client => {
            const link = screen.getByText(client.name).closest('a');
            expect(link).toHaveAttribute('href', `/${mockTenantId}/clients/${client.objectid}`);
        });
    });
});

describe('ClientResultList - Empty State', () => {
    it('should display empty message with correct styling on medium screens', () => {
        renderWithProviders(mockEmptySearchResults, true);

        const emptyMessage = screen.getByText('No clients to display');
        expect(emptyMessage).toBeInTheDocument();
        expect(emptyMessage.closest('div')).toHaveStyle({ textAlign: 'center' });
    });

    it('should display empty message with correct styling on large screens', () => {
        renderWithProviders(mockEmptySearchResults, false);

        const emptyMessage = screen.getByText('No clients to display');
        expect(emptyMessage).toBeInTheDocument();
        expect(emptyMessage.closest('div')).toHaveStyle({ textAlign: 'center' });
    });

    it('should not display any client rows when list is empty on medium screens', () => {
        renderWithProviders(mockEmptySearchResults, true);

        expect(screen.queryByTestId('UnfoldMoreOutlinedIcon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('CheckOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should not display any client rows when list is empty on large screens', () => {
        renderWithProviders(mockEmptySearchResults, false);

        expect(screen.queryByTestId('ContentCopyIcon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('CheckOutlinedIcon')).not.toBeInTheDocument();
    });
});

describe('ClientResultList - Client Enabled Status', () => {
    it('should display checkmark only for enabled clients on medium screens', () => {
        renderWithProviders(mockSearchResults, true);

        const checkIcons = screen.getAllByTestId('CheckOutlinedIcon');
        expect(checkIcons).toHaveLength(2); // Only client-1 and client-3 are enabled
    });

    it('should display checkmark only for enabled clients on large screens', () => {
        renderWithProviders(mockSearchResults, false);

        const checkIcons = screen.getAllByTestId('CheckOutlinedIcon');
        expect(checkIcons).toHaveLength(2); // Only client-1 and client-3 are enabled
    });

    it('should handle all disabled clients on medium screens', () => {
        const allDisabled: ObjectSearchResults = {
            resultlist: mockClients.map(c => ({ ...c, enabled: false })),
            total: mockClients.length,
            endtime: Date.now(),
            starttime: Date.now(),
            page: 1,
            perpage: 20,
            took: 5
        };

        renderWithProviders(allDisabled, true);

        expect(screen.queryByTestId('CheckOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should handle all enabled clients on large screens', () => {
        const allEnabled: ObjectSearchResults = {
            resultlist: mockClients.map(c => ({ ...c, enabled: true })),
            total: mockClients.length,
            endtime: Date.now(),
            starttime: Date.now(),
            page: 1,
            perpage: 20,
            took: 5
        };

        renderWithProviders(allEnabled, false);

        const checkIcons = screen.getAllByTestId('CheckOutlinedIcon');
        expect(checkIcons).toHaveLength(mockClients.length);
    });
});

describe('ClientResultList - Expanded State Management', () => {
    it('should maintain independent expanded states for multiple clients', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');

        // Expand first client
        fireEvent.click(expandIcons[0]);
        await waitFor(() => {
            expect(screen.getByText(mockClients[0].description!)).toBeInTheDocument();
        });

        // Expand second client
        fireEvent.click(expandIcons[1]);
        await waitFor(() => {
            expect(screen.getByText(mockClients[1].description!)).toBeInTheDocument();
        });

        // Both should be visible
        expect(screen.getByText(mockClients[0].description!)).toBeInTheDocument();
        expect(screen.getByText(mockClients[1].description!)).toBeInTheDocument();
    });

    it('should collapse only the selected client', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');

        // Expand both clients
        fireEvent.click(expandIcons[0]);
        fireEvent.click(expandIcons[1]);

        await waitFor(() => {
            expect(screen.getByText(mockClients[0].description!)).toBeInTheDocument();
            expect(screen.getByText(mockClients[1].description!)).toBeInTheDocument();
        });

        // Get collapse icons and click the first one
        const collapseIcons = screen.getAllByTestId('UnfoldLessOutlinedIcon');
        fireEvent.click(collapseIcons[0]);

        await waitFor(() => {
            expect(screen.queryByText(mockClients[0].description!)).not.toBeInTheDocument();
            expect(screen.getByText(mockClients[1].description!)).toBeInTheDocument();
        });
    });

    it('should display correct client details in expanded view', async () => {
        renderWithProviders(mockSearchResults, true);

        const expandIcons = screen.getAllByTestId('UnfoldMoreOutlinedIcon');
        fireEvent.click(expandIcons[1]); // Expand second client

        await waitFor(() => {
            expect(screen.getByText(mockClients[1].description!)).toBeInTheDocument();
            expect(screen.getByText(mockClients[1].subtype!)).toBeInTheDocument();
            expect(screen.getByText(mockClients[1].objectid)).toBeInTheDocument();
        });
    });
});
