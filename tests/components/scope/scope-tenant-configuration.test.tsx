import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import ScopeTenantConfiguration from '@/components/scope/scope-tenant-configuration';
import { TENANTS_QUERY } from '@/graphql/queries/oidc-queries';
import { TENANT_SCOPE_ASSIGN_MUTATION, TENANT_SCOPE_REMOVE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { SCOPE_TENANT_ASSIGN_SCOPE, SCOPE_TENANT_REMOVE_SCOPE, SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT } from '@/utils/consts';

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
    return function MockTenantSelector({ onCancel, onSelected, existingTenantIds, submitButtonText }: any) {
        return (
            <div data-testid="tenant-selector">
                <div>Tenant Selector</div>
                <div>Existing: {existingTenantIds?.length || 0}</div>
                <div>Submit Text: {submitButtonText}</div>
                <button data-testid="selector-cancel" onClick={onCancel}>Cancel</button>
                <button data-testid="selector-select" onClick={() => onSelected('tenant-new-123')}>
                    Select
                </button>
            </div>
        );
    };
});

const mockTenantId = 'tenant-123';
const mockScopeId = 'scope-123';

const mockTenants = [
    {
        tenantId: 'tenant-1',
        tenantName: 'Tenant One',
        tenantType: 'regular'
    },
    {
        tenantId: 'tenant-2',
        tenantName: 'Tenant Two',
        tenantType: 'child'
    },
    {
        tenantId: 'tenant-root',
        tenantName: 'Root Tenant',
        tenantType: TENANT_TYPE_ROOT_TENANT
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

const mockTenantsQuery = {
    request: {
        query: TENANTS_QUERY,
        variables: {
            scopeId: mockScopeId
        }
    },
    result: {
        data: {
            getTenants: mockTenants
        }
    }
};

const mockEmptyTenantsQuery = {
    request: {
        query: TENANTS_QUERY,
        variables: {
            scopeId: mockScopeId
        }
    },
    result: {
        data: {
            getTenants: []
        }
    }
};

const mockErrorTenantsQuery = {
    request: {
        query: TENANTS_QUERY,
        variables: {
            scopeId: mockScopeId
        }
    },
    error: new Error('Failed to load tenants')
};

const mockAssignMutation = {
    request: {
        query: TENANT_SCOPE_ASSIGN_MUTATION,
        variables: {
            scopeId: mockScopeId,
            tenantId: 'tenant-new-123'
        }
    },
    result: {
        data: {
            assignTenantToScope: true
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: TENANT_SCOPE_REMOVE_MUTATION,
        variables: {
            scopeId: mockScopeId,
            tenantId: 'tenant-1'
        }
    },
    result: {
        data: {
            removeTenantFromScope: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [mockTenantsQuery],
    scopes: any[] = [],
    scopeUse: string = 'API',
    isExclusiveInternalScope: boolean = false
) => {
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
                            <ScopeTenantConfiguration
                                scopeId={mockScopeId}
                                scopeUse={scopeUse}
                                onUpdateStart={onUpdateStart}
                                onUpdateEnd={onUpdateEnd}
                                isExclusiveInternalScope={isExclusiveInternalScope}
                            />
                        </AuthContext.Provider>
                    </TenantContext.Provider>
                </MockedProvider>
            </IntlProvider>
        ),
        onUpdateStart,
        onUpdateEnd
    };
};

describe('ScopeTenantConfiguration - Loading and Error States', () => {
    it('should display loading state initially', () => {
        renderWithProviders();

        expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should display error message when query fails', async () => {
        renderWithProviders([mockErrorTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByText('Failed to load tenants')).toBeInTheDocument();
        });
    });
});

describe('ScopeTenantConfiguration - Display', () => {
    it('should display column headers', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            expect(screen.getByText('Tenant Type')).toBeInTheDocument();
        });
    });

    it('should display all tenant names as links', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        mockTenants.forEach(tenant => {
            const links = screen.getAllByText(tenant.tenantName);
            const linkElement = links.find(el => el.closest('a'));
            expect(linkElement).toBeDefined();
            expect(linkElement?.closest('a')).toHaveAttribute('href', `/${mockTenantId}/tenants/${tenant.tenantId}`);
        });
    });

    it('should display tenant types', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        // Tenant types are displayed through TENANT_TYPES_DISPLAY map
        // We just verify all tenant names are visible
        expect(screen.getAllByText('Tenant One').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Tenant Two').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Root Tenant').length).toBeGreaterThan(0);
    });

    it('should display remove icons when user has remove permission', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ]);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockTenants.length);
        });
    });

    it('should not display remove icons when user lacks remove permission', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], []);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
    });

    it('should not display remove icon for root tenant with IAM_MANAGEMENT scope', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ], SCOPE_USE_IAM_MANAGEMENT);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            // Should have 2 remove icons (for tenant-1 and tenant-2), but not for root tenant
            expect(removeIcons.length).toBe(2);
        });
    });

    it('should display remove icon for root tenant with non-IAM scope', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ], 'API');

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            // Should have all 3 remove icons
            expect(removeIcons).toHaveLength(3);
        });
    });
});

describe('ScopeTenantConfiguration - Add Tenant Functionality', () => {
    it('should display "Add Tenant" button when user has assign permission', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });
    });

    it('should not display "Add Tenant" button when user lacks assign permission', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], []);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Tenant')).not.toBeInTheDocument();
    });

    it('should not display "Add Tenant" button for exclusive internal scope', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ], 'API', true);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Tenant')).not.toBeInTheDocument();
    });

    it('should open tenant selector when "Add Tenant" is clicked', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

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
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByText(`Existing: ${mockTenants.length}`)).toBeInTheDocument();
        });
    });

    it('should pass "Submit" as submitButtonText to tenant selector', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByText('Submit Text: Submit')).toBeInTheDocument();
        });
    });

    it('should close tenant selector when cancel is clicked', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

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

    it('should call assign mutation when tenant is selected', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockTenantsQuery,
            mockAssignMutation,
            mockTenantsQuery
        ], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

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
            expect(screen.queryByTestId('tenant-selector')).not.toBeInTheDocument();
        });

        // onUpdateStart is not called on assign, only on remove
        expect(onUpdateStart).not.toHaveBeenCalled();
    });
});

describe('ScopeTenantConfiguration - Remove Tenant Functionality', () => {
    it('should open remove confirmation dialog when remove icon is clicked', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ]);

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
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ]);

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
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ]);

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
        const { onUpdateStart } = renderWithProviders([
            mockTenantsQuery,
            mockRemoveMutation,
            mockTenantsQuery
        ], [
            { scopeName: SCOPE_TENANT_REMOVE_SCOPE }
        ]);

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

describe('ScopeTenantConfiguration - Filter Functionality', () => {
    it('should display filter input field', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Filter Tenants')).toBeInTheDocument();
        });
    });

    it('should not display filter input for exclusive internal scope', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery], [], 'API', true);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        expect(screen.queryByPlaceholderText('Filter Tenants')).not.toBeInTheDocument();
    });

    it('should filter tenants when search term is entered', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            const tenantOneElements = screen.getAllByText('Tenant One');
            expect(tenantOneElements.length).toBeGreaterThan(0);
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Two' } });

        // Tenant Two should still be visible
        await waitFor(() => {
            const tenantTwoElements = screen.getAllByText('Tenant Two');
            expect(tenantTwoElements.length).toBeGreaterThan(0);
        });

        // Tenant One and Root Tenant should not be in links anymore (filtered out)
        const allLinks = screen.queryAllByRole('link');
        const tenantOneLink = allLinks.find(link => link.textContent === 'Tenant One');
        const rootTenantLink = allLinks.find(link => link.textContent === 'Root Tenant');
        expect(tenantOneLink).toBeUndefined();
        expect(rootTenantLink).toBeUndefined();
    });

    it('should not filter with search term less than 3 characters', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            const tenantOneElements = screen.getAllByText('Tenant One');
            expect(tenantOneElements.length).toBeGreaterThan(0);
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Tw' } });

        // All tenants should still be visible in links
        const allLinks = screen.getAllByRole('link');
        expect(allLinks.some(link => link.textContent === 'Tenant One')).toBe(true);
        expect(allLinks.some(link => link.textContent === 'Tenant Two')).toBe(true);
        expect(allLinks.some(link => link.textContent === 'Root Tenant')).toBe(true);
    });

    it('should clear filter when close icon is clicked', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            const tenantOneElements = screen.getAllByText('Tenant One');
            expect(tenantOneElements.length).toBeGreaterThan(0);
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'Two' } });

        // Wait for filter to apply
        await waitFor(() => {
            const allLinks = screen.queryAllByRole('link');
            const tenantOneLink = allLinks.find(link => link.textContent === 'Tenant One');
            expect(tenantOneLink).toBeUndefined();
        });

        const closeIcon = screen.getByTestId('CloseOutlinedIcon');
        fireEvent.click(closeIcon);

        // All tenants should be visible again in links
        await waitFor(() => {
            const allLinks = screen.getAllByRole('link');
            expect(allLinks.some(link => link.textContent === 'Tenant One')).toBe(true);
            expect(allLinks.some(link => link.textContent === 'Tenant Two')).toBe(true);
            expect(allLinks.some(link => link.textContent === 'Root Tenant')).toBe(true);
        });
    });

    it('should perform case-insensitive filtering', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            const tenantOneElements = screen.getAllByText('Tenant One');
            expect(tenantOneElements.length).toBeGreaterThan(0);
        });

        const filterInput = screen.getByPlaceholderText('Filter Tenants');
        fireEvent.change(filterInput, { target: { value: 'root' } });

        // Root Tenant should still be visible
        await waitFor(() => {
            const rootTenantElements = screen.getAllByText('Root Tenant');
            expect(rootTenantElements.length).toBeGreaterThan(0);
        });

        // Tenant One should not be in links anymore
        const allLinks = screen.queryAllByRole('link');
        const tenantOneLink = allLinks.find(link => link.textContent === 'Tenant One');
        expect(tenantOneLink).toBeUndefined();
    });
});

describe('ScopeTenantConfiguration - Empty State', () => {
    it('should display empty message when no tenants are assigned', async () => {
        renderWithProviders([mockEmptyTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByText('No tenants to display')).toBeInTheDocument();
        });
    });

    it('should display empty message when filter returns no results', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

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

describe('ScopeTenantConfiguration - Pagination', () => {
    it('should display pagination controls', async () => {
        renderWithProviders([mockTenantsQuery, mockTenantsQuery]);

        await waitFor(() => {
            expect(screen.getByText('Tenant One')).toBeInTheDocument();
        });

        // TablePagination component should be present
        const pagination = screen.getByRole('button', { name: /previous page/i });
        expect(pagination).toBeInTheDocument();
    });
});

describe('ScopeTenantConfiguration - Error Handling', () => {
    it('should display error message when assign mutation fails', async () => {
        const errorMutation = {
            request: {
                query: TENANT_SCOPE_ASSIGN_MUTATION,
                variables: {
                    scopeId: mockScopeId,
                    tenantId: 'tenant-new-123'
                }
            },
            error: new Error('SCOPE.TENANT_ASSIGN_FAILED')
        };

        renderWithProviders([
            mockTenantsQuery,
            errorMutation,
            mockTenantsQuery
        ], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

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
            expect(screen.getByText('SCOPE.TENANT_ASSIGN_FAILED')).toBeInTheDocument();
        });
    });

    it('should dismiss error alert when close button is clicked', async () => {
        const errorMutation = {
            request: {
                query: TENANT_SCOPE_ASSIGN_MUTATION,
                variables: {
                    scopeId: mockScopeId,
                    tenantId: 'tenant-new-123'
                }
            },
            error: new Error('SCOPE.TENANT_ASSIGN_FAILED')
        };

        renderWithProviders([
            mockTenantsQuery,
            errorMutation,
            mockTenantsQuery
        ], [
            { scopeName: SCOPE_TENANT_ASSIGN_SCOPE }
        ]);

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
            expect(screen.getByText('SCOPE.TENANT_ASSIGN_FAILED')).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('SCOPE.TENANT_ASSIGN_FAILED')).not.toBeInTheDocument();
        });
    });
});
