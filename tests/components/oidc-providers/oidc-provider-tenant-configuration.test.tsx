import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import FederatedOIDCProviderTenantConfiguration from '@/components/oidc-providers/oidc-provider-tenant-configuration';
import { TENANTS_QUERY } from '@/graphql/queries/oidc-queries';
import { ASSIGN_FEDERATED_OIDC_PROVIDER_TO_TENANT_MUTATION, REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { IntlProvider } from 'react-intl';
import { FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE } from '@/utils/consts';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockedLink({ children, href }: any) {
        return <a href={href}>{children}</a>;
    };
});

// Mock authz-utils
jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scopeName: string, scopes: any[]) => {
        return scopes.some((s: any) => s.scopeName === scopeName);
    }
}));

// Mock TenantSelector component
jest.mock('@/components/dialogs/tenant-selector', () => {
    return function MockTenantSelector({ onCancel, onSelected, existingTenantIds, submitButtonText }: any) {
        return (
            <div data-testid="tenant-selector">
                <div>Tenant Selector</div>
                <div>Existing: {existingTenantIds?.length || 0}</div>
                <button data-testid="selector-cancel" onClick={onCancel}>Cancel</button>
                <button data-testid="selector-select" onClick={() => onSelected('tenant-new-123')}>
                    {submitButtonText || 'Submit'}
                </button>
            </div>
        );
    };
});

const mockProviderId = 'provider-123';
const mockRootTenantId = 'root-tenant-123';

const mockTenants = [
    {
        tenantId: 'tenant-1',
        tenantName: 'Acme Corporation',
        tenantType: 'regular',
        enabled: true
    },
    {
        tenantId: 'tenant-2',
        tenantName: 'Test Company',
        tenantType: 'regular',
        enabled: true
    },
    {
        tenantId: 'tenant-3',
        tenantName: 'Demo Organization',
        tenantType: 'regular',
        enabled: true
    }
];

// Create more tenants for pagination testing
const mockManyTenants = Array.from({ length: 25 }, (_, i) => ({
    tenantId: `tenant-${i + 1}`,
    tenantName: `Tenant ${i + 1}`,
    tenantType: 'regular',
    enabled: true
}));

const mockTenantBean = {
    getTenantMetaData: () => ({
        tenant: {
            tenantId: mockRootTenantId,
            tenantName: 'Root Tenant',
            tenantType: 'root'
        }
    })
};

const renderWithProviders = (
    component: React.ReactElement,
    mocks: any[] = [],
    scopes: any[] = []
) => {
    const mockAuthContext = {
        portalUserProfile: {
            scope: scopes
        }
    };

    return render(
        <IntlProvider locale="en" messages={{}}>
            <TenantContext.Provider value={mockTenantBean as any}>
                <AuthContext.Provider value={mockAuthContext as any}>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        {component}
                    </MockedProvider>
                </AuthContext.Provider>
            </TenantContext.Provider>
        </IntlProvider>
    );
};

describe('FederatedOIDCProviderTenantConfiguration - Loading State', () => {
    it('should show loading indicator while fetching tenants', () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                },
                delay: 100
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading indicator after data is loaded', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Error State', () => {
    it('should display error message when query fails', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                error: new Error('Failed to fetch tenants')
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch tenants')).toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Empty Tenant List', () => {
    it('should display "No tenants found" when list is empty', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('No tenants found')).toBeInTheDocument();
        });
    });

    it('should show add button when list is empty and user has permission', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Tenant List Display', () => {
    it('should display column header', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
        });
    });

    it('should display all tenant names as links', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            mockTenants.forEach(tenant => {
                const link = screen.getByText(tenant.tenantName);
                expect(link).toBeInTheDocument();
                expect(link.closest('a')).toHaveAttribute('href', `/${mockRootTenantId}/tenants/${tenant.tenantId}`);
            });
        });
    });

    it('should display remove icons when user has permission', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockTenants.length);
        });
    });

    it('should not display remove icons when user lacks permission', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [] // No scopes
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
    });

    it('should not display "No tenants found" when tenants exist', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.queryByText('No tenants found')).not.toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Pagination', () => {
    it('should display pagination controls', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockManyTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('1–10 of 25')).toBeInTheDocument();
        });
    });

    it('should display only first 10 tenants on page 1', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockManyTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Tenant 1')).toBeInTheDocument();
            expect(screen.getByText('Tenant 10')).toBeInTheDocument();
            expect(screen.queryByText('Tenant 11')).not.toBeInTheDocument();
        });
    });

    it('should navigate to page 2 when next button is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockManyTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Tenant 1')).toBeInTheDocument();
        });

        const nextButton = screen.getByRole('button', { name: /next page/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Tenant 11')).toBeInTheDocument();
            expect(screen.getByText('Tenant 20')).toBeInTheDocument();
            expect(screen.queryByText('Tenant 1')).not.toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Add Tenant Dialog', () => {
    it('should open tenant selector dialog when Add button is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
            expect(screen.getByText('Tenant Selector')).toBeInTheDocument();
        });
    });

    it('should pass existing tenant IDs to selector', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(`Existing: ${mockTenants.length}`)).toBeInTheDocument();
        });
    });

    it('should call assignTenantMutation when tenant is selected', async () => {
        const mockAssignMutation = {
            request: {
                query: ASSIGN_FEDERATED_OIDC_PROVIDER_TO_TENANT_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    tenantId: 'tenant-new-123'
                }
            },
            result: {
                data: {
                    assignFederatedOIDCProviderToTenant: true
                }
            }
        };

        const mockRefetchQuery = {
            request: {
                query: TENANTS_QUERY,
                variables: { federatedOIDCProviderId: mockProviderId }
            },
            result: {
                data: {
                    getTenants: [...mockTenants, { tenantId: 'tenant-new-123', tenantName: 'New Tenant', tenantType: 'regular', enabled: true }]
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            },
            mockAssignMutation,
            mockRefetchQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(mockUpdateStart).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(true);
        });
    });

    it('should close add dialog when Cancel is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const cancelButton = screen.getByTestId('selector-cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByTestId('tenant-selector')).not.toBeInTheDocument();
        });
    });

    it('should not show add button when user lacks permission', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [] // No scopes
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Tenant')).not.toBeInTheDocument();
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Remove Tenant Dialog', () => {
    it('should open remove confirmation dialog when remove icon is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
            const allMatches = screen.getAllByText(mockTenants[0].tenantName);
            expect(allMatches.length).toBeGreaterThan(0);
        });
    });

    it('should call removeTenantMutation when Confirm is clicked', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    tenantId: mockTenants[0].tenantId
                }
            },
            result: {
                data: {
                    removeFederatedOIDCProviderFromTenant: true
                }
            }
        };

        const mockRefetchQuery = {
            request: {
                query: TENANTS_QUERY,
                variables: { federatedOIDCProviderId: mockProviderId }
            },
            result: {
                data: {
                    getTenants: mockTenants.slice(1)
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            },
            mockRemoveMutation,
            mockRefetchQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockUpdateStart).toHaveBeenCalled();
            expect(mockUpdateEnd).toHaveBeenCalledWith(true);
        });
    });

    it('should close remove confirmation dialog when Cancel is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
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

    it('should not call mutation if dialog is closed without confirming', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    tenantId: mockTenants[0].tenantId
                }
            },
            result: {
                data: {
                    removeFederatedOIDCProviderFromTenant: true
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockUpdateStart).not.toHaveBeenCalled();
            expect(mockUpdateEnd).not.toHaveBeenCalled();
        });
    });
});

describe('FederatedOIDCProviderTenantConfiguration - Error Handling', () => {
    it('should display error alert when assign mutation fails', async () => {
        const mockAssignMutation = {
            request: {
                query: ASSIGN_FEDERATED_OIDC_PROVIDER_TO_TENANT_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    tenantId: 'tenant-new-123'
                }
            },
            error: new Error('FAILED_TO_ASSIGN_TENANT')
        };

        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            },
            mockAssignMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText('Add Tenant')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(false);
            expect(screen.getByText('FAILED_TO_ASSIGN_TENANT')).toBeInTheDocument();
        });
    });

    it('should display error alert when remove mutation fails', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    tenantId: mockTenants[0].tenantId
                }
            },
            error: new Error('FAILED_TO_REMOVE_TENANT')
        };

        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(false);
            expect(screen.getByText('FAILED_TO_REMOVE_TENANT')).toBeInTheDocument();
        });
    });

    it('should dismiss error alert when close button is clicked', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    tenantId: mockTenants[0].tenantId
                }
            },
            error: new Error('FAILED_TO_REMOVE_TENANT')
        };

        const mocks = [
            {
                request: {
                    query: TENANTS_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getTenants: mockTenants
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderTenantConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
            />,
            mocks,
            [{ scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE }]
        );

        await waitFor(() => {
            expect(screen.getByText(mockTenants[0].tenantName)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of tenant:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText('FAILED_TO_REMOVE_TENANT')).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('FAILED_TO_REMOVE_TENANT')).not.toBeInTheDocument();
        });
    });
});
