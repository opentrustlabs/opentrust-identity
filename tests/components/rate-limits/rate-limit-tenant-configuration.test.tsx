import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import RateLimitTenantRelConfiguration from '@/components/rate-limits/rate-limit-tenant-configuration';
import { TENANT_RATE_LIMIT_REL_VIEW_QUERY } from '@/graphql/queries/oidc-queries';
import { TENANT_RATE_LIMIT_ASSIGN_MUTATION, TENANT_RATE_LIMIT_REMOVE_MUTATION, TENANT_RATE_LIMIT_UPDATE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { ResponsiveContext } from '@/components/contexts/responsive-context';
import { RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE } from '@/utils/consts';

jest.mock('next/link', () => {
    return ({ children, href }: any) => {
        return <a href={href}>{children}</a>;
    };
});

jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scopeName: string, scopes: any[]) => {
        return scopes.some((s: any) => s.scopeName === scopeName);
    }
}));

jest.mock('@/components/dialogs/tenant-selector', () => {
    return function MockTenantSelector({ onCancel, onSelected, existingTenantIds }: any) {
        return (
            <div data-testid="tenant-selector">
                <div>Tenant Selector</div>
                <div>Existing: {existingTenantIds?.length || 0}</div>
                <button data-testid="selector-cancel" onClick={onCancel}>Cancel</button>
                <button data-testid="selector-select" onClick={() => onSelected('tenant-new-123')}>
                    Select
                </button>
            </div>
        );
    };
});

jest.mock('@/components/dialogs/tenant-rate-limit-configuration-dialog', () => {
    return function MockTenatRateLimitConfigurationDialog({ onCancel, onCompleted, tenantId, serviceGroupId, existingAllowUnlimited, existingLimit }: any) {
        return (
            <div data-testid="rate-limit-config-dialog">
                <div>Rate Limit Configuration Dialog</div>
                <div>Tenant ID: {tenantId}</div>
                <div>Service Group ID: {serviceGroupId}</div>
                <div>Existing Unlimited: {existingAllowUnlimited !== null ? String(existingAllowUnlimited) : 'null'}</div>
                <div>Existing Limit: {existingLimit !== null ? existingLimit : 'null'}</div>
                <button data-testid="config-cancel" onClick={onCancel}>Cancel</button>
                <button
                    data-testid="config-complete"
                    onClick={() => onCompleted(tenantId, serviceGroupId, true, 100, 60)}
                >
                    Complete
                </button>
            </div>
        );
    };
});

const mockTenantId = 'tenant-123';
const mockRateLimitServiceGroupId = 'rate-limit-group-1';

const mockTenantRelViews = [
    {
        tenantId: 'tenant-1',
        tenantName: 'Tenant One',
        allowUnlimitedRate: true,
        rateLimit: null,
        rateLimitPeriodMinutes: null
    },
    {
        tenantId: 'tenant-2',
        tenantName: 'Tenant Two',
        allowUnlimitedRate: false,
        rateLimit: 100,
        rateLimitPeriodMinutes: 60
    },
    {
        tenantId: 'tenant-3',
        tenantName: 'Tenant Three',
        allowUnlimitedRate: false,
        rateLimit: 50,
        rateLimitPeriodMinutes: 30
    }
];

const mockTenantBean = {
    getTenantMetaData: () => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: 'regular'
        }
    })
};

const mockQuery = {
    request: {
        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
        variables: {
            rateLimitServiceGroupId: mockRateLimitServiceGroupId
        }
    },
    result: {
        data: {
            getRateLimitTenantRelViews: mockTenantRelViews
        }
    }
};

const mockEmptyQuery = {
    request: {
        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
        variables: {
            rateLimitServiceGroupId: mockRateLimitServiceGroupId
        }
    },
    result: {
        data: {
            getRateLimitTenantRelViews: []
        }
    }
};

const mockErrorQuery = {
    request: {
        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
        variables: {
            rateLimitServiceGroupId: mockRateLimitServiceGroupId
        }
    },
    error: new Error('Failed to load tenant rate limits')
};

const mockAssignMutation = {
    request: {
        query: TENANT_RATE_LIMIT_ASSIGN_MUTATION,
        variables: {
            tenantId: 'tenant-new-123',
            allowUnlimited: true,
            serviceGroupId: mockRateLimitServiceGroupId,
            limit: 100,
            rateLimitPeriodMinutes: 60
        }
    },
    result: {
        data: {
            assignTenantToRateLimitGroup: true
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: TENANT_RATE_LIMIT_REMOVE_MUTATION,
        variables: {
            tenantId: 'tenant-1',
            serviceGroupId: mockRateLimitServiceGroupId
        }
    },
    result: {
        data: {
            removeTenantFromRateLimitGroup: true
        }
    }
};

const mockUpdateMutation = {
    request: {
        query: TENANT_RATE_LIMIT_UPDATE_MUTATION,
        variables: {
            tenantId: 'tenant-1',
            allowUnlimited: true,
            serviceGroupId: mockRateLimitServiceGroupId,
            limit: 100,
            rateLimitPeriodMinutes: 60
        }
    },
    result: {
        data: {
            updateTenantRateLimitGroup: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [mockQuery],
    scopes: any[] = [],
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

    const authContextValue = {
        portalUserProfile: {
            scope: scopes
        }
    };

    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <IntlProvider locale="en" messages={{}}>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <TenantContext.Provider value={mockTenantBean as any}>
                        <AuthContext.Provider value={authContextValue as any}>
                            <ResponsiveContext.Provider value={responsiveValue}>
                                <RateLimitTenantRelConfiguration
                                    rateLimitServiceGroupId={mockRateLimitServiceGroupId}
                                    onUpdateStart={onUpdateStart}
                                    onUpdateEnd={onUpdateEnd}
                                />
                            </ResponsiveContext.Provider>
                        </AuthContext.Provider>
                    </TenantContext.Provider>
                </MockedProvider>
            </IntlProvider>
        ),
        onUpdateStart,
        onUpdateEnd
    };
};

describe('RateLimitTenantRelConfiguration - Loading and Error States', () => {
    it('should display loading state initially', () => {
        renderWithProviders();

        expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should display error message when query fails', async () => {
        renderWithProviders([mockErrorQuery]);

        await waitFor(() => {
            expect(screen.getByText('Failed to load tenant rate limits')).toBeInTheDocument();
        });
    });
});

describe('RateLimitTenantRelConfiguration - Large Screen Layout', () => {
    it('should display all column headers on large screens', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            expect(screen.getByText('Unlimited')).toBeInTheDocument();
            expect(screen.getByText('Limit')).toBeInTheDocument();
            expect(screen.getByText('Period (min)')).toBeInTheDocument();
        });
    });

    it('should display all tenant names as links on large screens', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            mockTenantRelViews.forEach(tenant => {
                const link = screen.getByText(tenant.tenantName);
                expect(link).toBeInTheDocument();
                expect(link.closest('a')).toHaveAttribute('href', `/${mockTenantId}/tenants/${tenant.tenantId}`);
            });
        });
    });

    it('should display checkmark for unlimited rate tenants on large screens', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            const checkIcons = screen.getAllByTestId('CheckOutlinedIcon');
            // Only tenant-1 has unlimited rate
            expect(checkIcons).toHaveLength(1);
        });
    });

    it('should display rate limits on large screens', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
        });

        // Check that rate limit values are displayed
        const limitElements = screen.getAllByText('100');
        expect(limitElements.length).toBeGreaterThan(0);
    });

    it('should display rate limit periods on large screens', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
        });

        // Check that period values are displayed
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should display edit icons when user has update permission on large screens', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons).toHaveLength(mockTenantRelViews.length);
        });
    });

    it('should not display edit icons when user lacks update permission on large screens', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('EditOutlinedIcon')).not.toBeInTheDocument();
    });

    it('should display remove icons when user has remove permission on large screens', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE }
        ], false);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockTenantRelViews.length);
        });
    });

    it('should not display remove icons when user lacks remove permission on large screens', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
    });
});

describe('RateLimitTenantRelConfiguration - Medium Screen Layout', () => {
    it('should display simplified column headers on medium screens', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], true);

        await waitFor(() => {
            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
        });

        // Should not display other column headers on medium screens
        expect(screen.queryByText('Unlimited')).not.toBeInTheDocument();
        expect(screen.queryByText('Limit')).not.toBeInTheDocument();
        expect(screen.queryByText('Period (min)')).not.toBeInTheDocument();
    });

    it('should display all tenant names on medium screens', async () => {
        renderWithProviders([mockQuery], [], true);

        await waitFor(() => {
            mockTenantRelViews.forEach(tenant => {
                expect(screen.getByText(tenant.tenantName)).toBeInTheDocument();
            });
        });
    });

    it('should display edit icons when user has update permission on medium screens', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], true);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons).toHaveLength(mockTenantRelViews.length);
        });
    });

    it('should display remove icons when user has remove permission on medium screens', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE }
        ], true);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockTenantRelViews.length);
        });
    });
});

describe('RateLimitTenantRelConfiguration - Add Tenant Functionality', () => {
    it('should display "Add Tenant" button when user has assign permission', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });
    });

    it('should not display "Add Tenant" button when user lacks assign permission', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Tenant')).not.toBeInTheDocument();
    });

    it('should open tenant selector when "Add Tenant" is clicked', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });
    });

    it('should pass existing tenant IDs to tenant selector', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByText(`Existing: ${mockTenantRelViews.length}`)).toBeInTheDocument();
        });
    });

    it('should close tenant selector when cancel is clicked', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const cancelButton = screen.getByTestId('selector-cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByTestId('tenant-selector')).not.toBeInTheDocument();
        });
    });

    it('should open rate limit configuration dialog when tenant is selected', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });
    });

    it('should pass null values for new tenant configuration', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByText('Existing Unlimited: null')).toBeInTheDocument();
            expect(screen.getByText('Existing Limit: null')).toBeInTheDocument();
        });
    });

    it('should call assign mutation when configuration is completed', async () => {
        const { onUpdateStart } = renderWithProviders([mockQuery, mockAssignMutation], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });

        const completeButton = screen.getByTestId('config-complete');
        fireEvent.click(completeButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('RateLimitTenantRelConfiguration - Edit Tenant Functionality', () => {
    it('should open edit dialog when edit icon is clicked', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons.length).toBeGreaterThan(0);
        });

        const editIcons = screen.getAllByTestId('EditOutlinedIcon');
        fireEvent.click(editIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });
    });

    it('should pass existing tenant data to edit dialog', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons.length).toBeGreaterThan(0);
        });

        const editIcons = screen.getAllByTestId('EditOutlinedIcon');
        fireEvent.click(editIcons[0]); // Edit Tenant One (unlimited)

        await waitFor(() => {
            expect(screen.getByText('Tenant ID: tenant-1')).toBeInTheDocument();
            expect(screen.getByText('Existing Unlimited: true')).toBeInTheDocument();
            expect(screen.getByText('Existing Limit: null')).toBeInTheDocument();
        });
    });

    it('should pass existing limit data to edit dialog for limited tenant', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons.length).toBeGreaterThan(0);
        });

        const editIcons = screen.getAllByTestId('EditOutlinedIcon');
        fireEvent.click(editIcons[1]); // Edit Tenant Two (limited)

        await waitFor(() => {
            expect(screen.getByText('Tenant ID: tenant-2')).toBeInTheDocument();
            expect(screen.getByText('Existing Unlimited: false')).toBeInTheDocument();
            expect(screen.getByText('Existing Limit: 100')).toBeInTheDocument();
        });
    });

    it('should close edit dialog when cancel is clicked', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons.length).toBeGreaterThan(0);
        });

        const editIcons = screen.getAllByTestId('EditOutlinedIcon');
        fireEvent.click(editIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });

        const cancelButton = screen.getByTestId('config-cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByTestId('rate-limit-config-dialog')).not.toBeInTheDocument();
        });
    });

    it('should call update mutation when edit is completed', async () => {
        const { onUpdateStart } = renderWithProviders([mockQuery, mockUpdateMutation], [
            { scopeName: RATE_LIMIT_TENANT_UPDATE_SCOPE }
        ], false);

        await waitFor(() => {
            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            expect(editIcons.length).toBeGreaterThan(0);
        });

        const editIcons = screen.getAllByTestId('EditOutlinedIcon');
        fireEvent.click(editIcons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });

        const completeButton = screen.getByTestId('config-complete');
        fireEvent.click(completeButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('RateLimitTenantRelConfiguration - Remove Tenant Functionality', () => {
    it('should open remove confirmation dialog when remove icon is clicked', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE }
        ], false);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });
    });

    it('should display tenant name in remove confirmation dialog', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE }
        ], false);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            const tenantNameElements = screen.getAllByText('Tenant One');
            expect(tenantNameElements.length).toBeGreaterThan(0);
        });
    });

    it('should close remove dialog when cancel is clicked', async () => {
        renderWithProviders([mockQuery], [
            { scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE }
        ], false);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Confirm removal of tenant:')).not.toBeInTheDocument();
        });
    });

    it('should call remove mutation when confirm is clicked', async () => {
        const { onUpdateStart } = renderWithProviders([mockQuery, mockRemoveMutation], [
            { scopeName: RATE_LIMIT_TENANT_REMOVE_SCOPE }
        ], false);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('RateLimitTenantRelConfiguration - Filter Functionality', () => {
    it('should display filter input field', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Filter Tenants')).toBeInTheDocument();
        });
    });

    it('should filter tenants when search term is entered', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
            expect(screen.getByText('Tenant Three')).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Two' } });

        await waitFor(() => {
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
            expect(screen.queryByText('Tenant One')).not.toBeInTheDocument();
            expect(screen.queryByText('Tenant Three')).not.toBeInTheDocument();
        });
    });

    it('should not filter with search term less than 3 characters', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Tw' } });

        // All tenants should still be visible
        expect(screen.getByText('Tenant One')).toBeInTheDocument();
        expect(screen.getByText('Tenant Two')).toBeInTheDocument();
        expect(screen.getByText('Tenant Three')).toBeInTheDocument();
    });

    it('should clear filter when close icon is clicked', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Two' } });

        await waitFor(() => {
            expect(screen.queryByText('Tenant One')).not.toBeInTheDocument();
        });

        const closeIcon = screen.getByTestId('CloseOutlinedIcon');
        fireEvent.click(closeIcon);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
            expect(screen.getByText('Tenant Three')).toBeInTheDocument();
        });
    });

    it('should perform case-insensitive filtering', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'three' } });

        await waitFor(() => {
            expect(screen.getByText('Tenant Three')).toBeInTheDocument();
            expect(screen.queryByText('Tenant One')).not.toBeInTheDocument();
        });
    });
});

describe('RateLimitTenantRelConfiguration - Empty State', () => {
    it('should display empty message when no tenants are assigned', async () => {
        renderWithProviders([mockEmptyQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('No tenants to display')).toBeInTheDocument();
        });
    });

    it('should display empty message when filter returns no results', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Nonexistent' } });

        await waitFor(() => {
            expect(screen.getByText('No tenants to display')).toBeInTheDocument();
        });
    });
});

describe('RateLimitTenantRelConfiguration - Pagination', () => {
    it('should display pagination controls', async () => {
        renderWithProviders([mockQuery], [], false);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        // TablePagination component should be present
        const pagination = screen.getByRole('button', { name: /previous page/i });
        expect(pagination).toBeInTheDocument();
    });
});

describe('RateLimitTenantRelConfiguration - Error Handling', () => {
    it('should display error message when assign mutation fails', async () => {
        const errorMutation = {
            request: {
                query: TENANT_RATE_LIMIT_ASSIGN_MUTATION,
                variables: {
                    tenantId: 'tenant-new-123',
                    allowUnlimited: true,
                    serviceGroupId: mockRateLimitServiceGroupId,
                    limit: 100,
                    rateLimitPeriodMinutes: 60
                }
            },
            error: new Error('RATE_LIMIT.ASSIGN_FAILED')
        };

        renderWithProviders([mockQuery, errorMutation], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });

        const completeButton = screen.getByTestId('config-complete');
        fireEvent.click(completeButton);

        await waitFor(() => {
            expect(screen.getByText('RATE_LIMIT.ASSIGN_FAILED')).toBeInTheDocument();
        });
    });

    it('should dismiss error alert when close button is clicked', async () => {
        const errorMutation = {
            request: {
                query: TENANT_RATE_LIMIT_ASSIGN_MUTATION,
                variables: {
                    tenantId: 'tenant-new-123',
                    allowUnlimited: true,
                    serviceGroupId: mockRateLimitServiceGroupId,
                    limit: 100,
                    rateLimitPeriodMinutes: 60
                }
            },
            error: new Error('RATE_LIMIT.ASSIGN_FAILED')
        };

        renderWithProviders([mockQuery, errorMutation], [
            { scopeName: RATE_LIMIT_TENANT_ASSIGN_SCOPE }
        ], false);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByTestId('rate-limit-config-dialog')).toBeInTheDocument();
        });

        const completeButton = screen.getByTestId('config-complete');
        fireEvent.click(completeButton);

        await waitFor(() => {
            expect(screen.getByText('RATE_LIMIT.ASSIGN_FAILED')).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('RATE_LIMIT.ASSIGN_FAILED')).not.toBeInTheDocument();
        });
    });
});
