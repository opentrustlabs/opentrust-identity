import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantScopeConfiguration from '@/components/tenants/tenant-scope-configuration';
import { SCOPE_QUERY } from '@/graphql/queries/oidc-queries';
import { BULK_TENANT_SCOPE_ASSIGN_MUTATION, TENANT_SCOPE_REMOVE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { TenantContext } from '@/components/contexts/tenant-context';
import { ResponsiveContext } from '@/components/contexts/responsive-context';
import { IntlProvider } from 'react-intl';
import {
    SCOPE_TENANT_ASSIGN_SCOPE,
    SCOPE_TENANT_REMOVE_SCOPE,
    SCOPE_USE_IAM_MANAGEMENT,
    SCOPE_USE_APPLICATION_MANAGEMENT,
    TENANT_TYPE_ROOT_TENANT
} from '@/utils/consts';
import { ScopeFilterCriteria } from '@/graphql/generated/graphql-types';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock authz-utils
jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scope: string, scopes: any[]) => {
        if (!scopes) return false;
        return scopes.some((s: any) => s.scopeName === scope);
    }
}));

// Mock GeneralSelector
jest.mock('@/components/dialogs/general-selector', () => {
    return function MockGeneralSelector({ onCancel, onSelected, selectorLabel, helpText }: any) {
        return (
            <div data-testid="general-selector">
                <div>{selectorLabel}</div>
                <div>{helpText}</div>
                <button data-testid="selector-cancel" onClick={onCancel}>Cancel</button>
                <button data-testid="selector-select-single" onClick={() => onSelected('scope-3')}>
                    Select Single
                </button>
                <button data-testid="selector-select-multiple" onClick={() => onSelected(['scope-4', 'scope-5'])}>
                    Select Multiple
                </button>
            </div>
        );
    };
});

const messages = {
    'error.default': 'An error occurred',
};

const mockTenantId = 'test-tenant-id';

const mockScopes = [
    {
        scopeId: 'scope-1',
        scopeName: 'tenant.create',
        scopeDescription: 'Create tenants',
        scopeUse: SCOPE_USE_IAM_MANAGEMENT,
        markForDelete: false
    },
    {
        scopeId: 'scope-2',
        scopeName: 'tenant.update',
        scopeDescription: 'Update tenants',
        scopeUse: SCOPE_USE_IAM_MANAGEMENT,
        markForDelete: false
    },
    {
        scopeId: 'scope-app-1',
        scopeName: 'app.read',
        scopeDescription: 'Read applications',
        scopeUse: SCOPE_USE_APPLICATION_MANAGEMENT,
        markForDelete: false
    }
];

const mockTenantContext: any = {
    tenantBean: {
        tenantId: mockTenantId,
        tenantName: 'Test Tenant',
        tenantType: 'STANDARD'
    },
    setTenantBean: jest.fn(),
    setTenantMetaData: jest.fn(),
    getTenantMetaData: jest.fn(() => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: 'STANDARD'
        }
    }))
};

const mockRootTenantContext: any = {
    ...mockTenantContext,
    getTenantMetaData: jest.fn(() => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Root Tenant',
            tenantType: TENANT_TYPE_ROOT_TENANT
        }
    }))
};

const mockResponsiveContext = {
    isMedium: false,
    isSmall: false,
    isExtraSmall: false
};

const mockResponsiveContextMedium = {
    isMedium: true,
    isSmall: false,
    isExtraSmall: false
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
                scopeName: SCOPE_TENANT_ASSIGN_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: SCOPE_TENANT_REMOVE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            }
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

const mockQuerySuccess = {
    request: {
        query: SCOPE_QUERY,
        variables: {
            tenantId: mockTenantId,
            filterBy: ScopeFilterCriteria.Existing
        }
    },
    result: {
        data: {
            getScope: mockScopes
        }
    }
};

const mockQueryEmpty = {
    request: {
        query: SCOPE_QUERY,
        variables: {
            tenantId: mockTenantId,
            filterBy: ScopeFilterCriteria.Existing
        }
    },
    result: {
        data: {
            getScope: []
        }
    }
};

const mockQueryError = {
    request: {
        query: SCOPE_QUERY,
        variables: {
            tenantId: mockTenantId,
            filterBy: ScopeFilterCriteria.Existing
        }
    },
    error: new Error('Query failed')
};

const mockAssignMutationSingle = {
    request: {
        query: BULK_TENANT_SCOPE_ASSIGN_MUTATION,
        variables: {
            tenantId: mockTenantId,
            bulkScopeInput: [{ scopeId: 'scope-3', accessRuleId: null }]
        }
    },
    result: {
        data: {
            bulkAssignTenantToScope: [{ tenantId: mockTenantId, scopeId: 'scope-3' }]
        }
    }
};

const mockAssignMutationMultiple = {
    request: {
        query: BULK_TENANT_SCOPE_ASSIGN_MUTATION,
        variables: {
            tenantId: mockTenantId,
            bulkScopeInput: [
                { scopeId: 'scope-4', accessRuleId: null },
                { scopeId: 'scope-5', accessRuleId: null }
            ]
        }
    },
    result: {
        data: {
            bulkAssignTenantToScope: [
                { tenantId: mockTenantId, scopeId: 'scope-4' },
                { tenantId: mockTenantId, scopeId: 'scope-5' }
            ]
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: TENANT_SCOPE_REMOVE_MUTATION,
        variables: {
            tenantId: mockTenantId,
            scopeId: 'scope-1'
        }
    },
    result: {
        data: {
            removeTenantFromScope: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [mockQuerySuccess],
    authContext: AuthContextProps = mockAuthContext,
    tenantContext: any = mockTenantContext,
    responsiveContext: any = mockResponsiveContext,
    tenantType: string = 'STANDARD'
) => {
    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <IntlProvider messages={messages} locale="en" defaultLocale="en">
                    <TenantContext.Provider value={tenantContext}>
                        <ResponsiveContext.Provider value={responsiveContext}>
                            <AuthContext.Provider value={authContext}>
                                <TenantScopeConfiguration
                                    tenantId={mockTenantId}
                                    tenantType={tenantType}
                                    onUpdateStart={onUpdateStart}
                                    onUpdateEnd={onUpdateEnd}
                                />
                            </AuthContext.Provider>
                        </ResponsiveContext.Provider>
                    </TenantContext.Provider>
                </IntlProvider>
            </MockedProvider>
        ),
        onUpdateStart,
        onUpdateEnd
    };
};

describe('TenantScopeConfiguration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should display loading spinner while fetching data', () => {
            renderWithProviders([mockQuerySuccess]);
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should hide loading spinner after data is loaded', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error component when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.getByText(/Query failed/i)).toBeInTheDocument();
            });
        });

        it('should not display scope list when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.queryByText('Add Scope')).not.toBeInTheDocument();
            });
        });
    });

    describe('Empty Scope List', () => {
        it('should display empty state message when no scopes assigned', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.getByText('No scope assigned to tenant')).toBeInTheDocument();
            });
        });

        it('should still show Add Scope button when list is empty', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });
        });
    });

    describe('Scope List Display', () => {
        it('should display scope names', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
                expect(screen.getByText('tenant.update')).toBeInTheDocument();
                expect(screen.getByText('app.read')).toBeInTheDocument();
            });
        });

        it('should display scope descriptions on non-medium screens', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Create tenants')).toBeInTheDocument();
                expect(screen.getByText('Update tenants')).toBeInTheDocument();
            });
        });

        it('should display scope use categories on non-medium screens', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const iamManagementTexts = screen.getAllByText('IAM Management');
                expect(iamManagementTexts.length).toBeGreaterThan(0);
                expect(screen.getByText('Application Management')).toBeInTheDocument();
            });
        });

        it('should display column headers', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Name')).toBeInTheDocument();
                expect(screen.getByText('Description')).toBeInTheDocument();
                expect(screen.getByText('Use')).toBeInTheDocument();
            });
        });

        it('should display scopes as plain text for non-root tenants', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const links = screen.queryAllByRole('link');
                expect(links.length).toBe(0);
            });
        });
    });

    describe('Add Scope Dialog', () => {
        it('should display Add Scope button when user has permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });
        });

        it('should open GeneralSelector dialog when Add Scope is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });
        });

        it('should display selector label and help text', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByText('Select a scope')).toBeInTheDocument();
                expect(screen.getByText('Select a Scope')).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked in selector', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });

            const cancelButton = screen.getByTestId('selector-cancel');
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByTestId('general-selector')).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when scope is selected', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockAssignMutationSingle]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select-single')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select-single');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });
        });

        it('should handle multiple scope selection', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockAssignMutationMultiple]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select-multiple')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select-multiple');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });
        });
    });

    describe('Remove Scope Dialog', () => {
        it('should display remove icons for scopes', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons.length).toBeGreaterThan(0);
            });
        });

        it('should open confirmation dialog when remove icon is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of scope:/i)).toBeInTheDocument();
                const scopeNames = screen.getAllByText('tenant.create');
                expect(scopeNames.length).toBe(2); // Once in list, once in dialog
            });
        });

        it('should close confirmation dialog when Cancel is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of scope:/i)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of scope:/i)).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when removal is confirmed', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });
        });

        it('should close dialog after confirmation', async () => {
            renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of scope:/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('should display TablePagination component', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                // TablePagination renders navigation buttons
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            });
        });

        it('should display correct page information', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText(/1–3 of 3/i)).toBeInTheDocument();
            });
        });

        it('should paginate when there are more than 10 items', async () => {
            const manyScopes = Array.from({ length: 15 }, (_, i) => ({
                scopeId: `scope-${i}`,
                scopeName: `scope.name.${i}`,
                scopeDescription: `Description ${i}`,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                markForDelete: false
            }));

            const mockQueryManyScopes = {
                request: {
                    query: SCOPE_QUERY,
                    variables: {
                        tenantId: mockTenantId,
                        filterBy: ScopeFilterCriteria.Existing
                    }
                },
                result: {
                    data: {
                        getScope: manyScopes
                    }
                }
            };

            renderWithProviders([mockQueryManyScopes]);
            await waitFor(() => {
                expect(screen.getByText('scope.name.0')).toBeInTheDocument();
                expect(screen.getByText('scope.name.9')).toBeInTheDocument();
                expect(screen.queryByText('scope.name.10')).not.toBeInTheDocument();
            });
        });

        it('should handle page changes', async () => {
            const manyScopes = Array.from({ length: 15 }, (_, i) => ({
                scopeId: `scope-${i}`,
                scopeName: `scope.name.${i}`,
                scopeDescription: `Description ${i}`,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                markForDelete: false
            }));

            const mockQueryManyScopes = {
                request: {
                    query: SCOPE_QUERY,
                    variables: {
                        tenantId: mockTenantId,
                        filterBy: ScopeFilterCriteria.Existing
                    }
                },
                result: {
                    data: {
                        getScope: manyScopes
                    }
                }
            };

            renderWithProviders([mockQueryManyScopes]);
            await waitFor(() => {
                expect(screen.getByText('scope.name.0')).toBeInTheDocument();
            });

            const nextButton = screen.getByRole('button', { name: /next page/i });
            fireEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('scope.name.10')).toBeInTheDocument();
            });
        });
    });

    describe('Authorization', () => {
        it('should hide Add Scope button when user lacks assign permission', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [],
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

            renderWithProviders([mockQuerySuccess], restrictedAuthContext);
            await waitFor(() => {
                expect(screen.queryByText('Add Scope')).not.toBeInTheDocument();
            });
        });

        it('should hide remove icons when user lacks remove permission', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: SCOPE_TENANT_ASSIGN_SCOPE,
                            markForDelete: false,
                            scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                            scopeDescription: ''
                        }
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

            renderWithProviders([mockQuerySuccess], restrictedAuthContext);
            await waitFor(() => {
                expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
            });
        });

        it('should show Add Scope button when user has assign permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });
        });

        it('should show remove icons when user has remove permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Root Tenant Restrictions', () => {
        it('should display scopes as links for root tenant', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockRootTenantContext, mockResponsiveContext, TENANT_TYPE_ROOT_TENANT);
            await waitFor(() => {
                const links = screen.getAllByRole('link');
                expect(links.length).toBeGreaterThan(0);
                expect(links[0]).toHaveAttribute('href', expect.stringContaining('/scope-access-control/'));
            });
        });

        it('should hide remove icon for IAM Management scopes on root tenant', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockRootTenantContext, mockResponsiveContext, TENANT_TYPE_ROOT_TENANT);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
            });

            // IAM Management scopes should not have remove icons on root tenant
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            // app.read (APPLICATION_MANAGEMENT) should have remove icon
            // tenant.create and tenant.update (IAM_MANAGEMENT) should not
            expect(removeIcons.length).toBe(1);
        });

        it('should allow removal of non-IAM Management scopes on root tenant', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockRootTenantContext, mockResponsiveContext, TENANT_TYPE_ROOT_TENANT);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons.length).toBe(1);
            });
        });
    });

    describe('Responsive Layout', () => {
        it('should hide Description and Use columns on medium screens', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockTenantContext, mockResponsiveContextMedium);
            await waitFor(() => {
                expect(screen.getByText('Name')).toBeInTheDocument();
                expect(screen.queryByText('Description')).not.toBeInTheDocument();
                expect(screen.queryByText('Use')).not.toBeInTheDocument();
            });
        });

        it('should hide scope descriptions on medium screens', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockTenantContext, mockResponsiveContextMedium);
            await waitFor(() => {
                expect(screen.getByText('tenant.create')).toBeInTheDocument();
                expect(screen.queryByText('Create tenants')).not.toBeInTheDocument();
            });
        });

        it('should show all columns on non-medium screens', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Name')).toBeInTheDocument();
                expect(screen.getByText('Description')).toBeInTheDocument();
                expect(screen.getByText('Use')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error alert when mutation fails', async () => {
            const mockAssignMutationError = {
                request: {
                    query: BULK_TENANT_SCOPE_ASSIGN_MUTATION,
                    variables: {
                        tenantId: mockTenantId,
                        bulkScopeInput: [{ scopeId: 'scope-3', accessRuleId: null }]
                    }
                },
                error: new Error('error.default')
            };

            renderWithProviders([mockQuerySuccess, mockAssignMutationError]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select-single')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select-single');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(screen.getByText('An error occurred')).toBeInTheDocument();
            });
        });

        it('should allow dismissing error alert', async () => {
            const mockAssignMutationError = {
                request: {
                    query: BULK_TENANT_SCOPE_ASSIGN_MUTATION,
                    variables: {
                        tenantId: mockTenantId,
                        bulkScopeInput: [{ scopeId: 'scope-3', accessRuleId: null }]
                    }
                },
                error: new Error('error.default')
            };

            renderWithProviders([mockQuerySuccess, mockAssignMutationError]);
            await waitFor(() => {
                expect(screen.getByText('Add Scope')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select-single')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select-single');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(screen.getByText('An error occurred')).toBeInTheDocument();
            });

            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText('An error occurred')).not.toBeInTheDocument();
            });
        });
    });
});
