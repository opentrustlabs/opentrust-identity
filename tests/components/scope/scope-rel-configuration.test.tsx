import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import ScopeRelConfiguration, { ScopeRelType } from '@/components/scope/scope-rel-configuration';
import { GET_USER_SCOPE_QUERY, GET_CLIENT_SCOPE_QUERY, GET_AUTHORIZATION_GROUP_SCOPE_QUERY, SCOPE_QUERY } from '@/graphql/queries/oidc-queries';
import { USER_SCOPE_REMOVE_MUTATION, CLIENT_SCOPE_REMOVE_MUTATION, AUTHORIZATION_GROUP_SCOPE_REMOVE_MUTATION, BULK_USER_SCOPE_ASSIGN_MUTATION, BULK_CLIENT_SCOPE_ASSIGN_MUTATION, BULK_AUTHORIZATION_GROUP_SCOPE_ASSIGN_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { ResponsiveContext } from '@/components/contexts/responsive-context';
import { SCOPE_USER_ASSIGN_SCOPE, SCOPE_USER_REMOVE_SCOPE, SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE, SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE, TENANT_TYPE_ROOT_TENANT } from '@/utils/consts';
import { ScopeFilterCriteria } from '@/graphql/generated/graphql-types';

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

jest.mock('@/components/dialogs/general-selector', () => {
    return function MockGeneralSelector({ onCancel, onSelected, multiSelect }: any) {
        return (
            <div data-testid="general-selector">
                <div>General Selector</div>
                <div>Multi Select: {String(multiSelect)}</div>
                <button data-testid="selector-cancel" onClick={onCancel}>Cancel</button>
                <button data-testid="selector-select-single" onClick={() => onSelected('scope-new-1')}>
                    Select Single
                </button>
                <button data-testid="selector-select-multiple" onClick={() => onSelected(['scope-new-1', 'scope-new-2'])}>
                    Select Multiple
                </button>
            </div>
        );
    };
});

const mockTenantId = 'tenant-123';
const mockUserId = 'user-123';
const mockClientId = 'client-123';
const mockGroupId = 'group-123';

const mockScopes = [
    {
        scopeId: 'scope-1',
        scopeName: 'read:users',
        scopeDescription: 'Read user data',
        scopeUse: 'API'
    },
    {
        scopeId: 'scope-2',
        scopeName: 'write:users',
        scopeDescription: 'Write user data',
        scopeUse: 'API'
    },
    {
        scopeId: 'scope-3',
        scopeName: 'admin:system',
        scopeDescription: 'System administration',
        scopeUse: 'ADMIN'
    }
];

const mockTenantBean = {
    getTenantMetaData: () => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: TENANT_TYPE_ROOT_TENANT
        }
    })
};

const mockNonRootTenantBean = {
    getTenantMetaData: () => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: 'regular'
        }
    })
};

// Query mocks for USER
const mockUserScopeQuery = {
    request: {
        query: GET_USER_SCOPE_QUERY,
        variables: {
            userId: mockUserId,
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            getUserScopes: mockScopes
        }
    }
};

const mockEmptyUserScopeQuery = {
    request: {
        query: GET_USER_SCOPE_QUERY,
        variables: {
            userId: mockUserId,
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            getUserScopes: []
        }
    }
};

const mockErrorUserScopeQuery = {
    request: {
        query: GET_USER_SCOPE_QUERY,
        variables: {
            userId: mockUserId,
            tenantId: mockTenantId
        }
    },
    error: new Error('Failed to load user scopes')
};

// Query mocks for CLIENT
const mockClientScopeQuery = {
    request: {
        query: GET_CLIENT_SCOPE_QUERY,
        variables: {
            clientId: mockClientId
        }
    },
    result: {
        data: {
            getClientScopes: mockScopes
        }
    }
};

const mockEmptyClientScopeQuery = {
    request: {
        query: GET_CLIENT_SCOPE_QUERY,
        variables: {
            clientId: mockClientId
        }
    },
    result: {
        data: {
            getClientScopes: []
        }
    }
};

// Query mocks for AUTHORIZATION_GROUP
const mockGroupScopeQuery = {
    request: {
        query: GET_AUTHORIZATION_GROUP_SCOPE_QUERY,
        variables: {
            groupId: mockGroupId
        }
    },
    result: {
        data: {
            getAuthorizationGroupScopes: mockScopes
        }
    }
};

const mockEmptyGroupScopeQuery = {
    request: {
        query: GET_AUTHORIZATION_GROUP_SCOPE_QUERY,
        variables: {
            groupId: mockGroupId
        }
    },
    result: {
        data: {
            getAuthorizationGroupScopes: []
        }
    }
};

// Mutation mocks for USER
const mockUserScopeAssignMutation = {
    request: {
        query: BULK_USER_SCOPE_ASSIGN_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: mockTenantId,
            bulkScopeInput: [
                {
                    scopeId: 'scope-new-1',
                    accessRuleId: null
                }
            ]
        }
    },
    result: {
        data: {
            bulkAssignUserScopes: true
        }
    }
};

const mockUserScopeRemoveMutation = {
    request: {
        query: USER_SCOPE_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: mockTenantId,
            scopeId: 'scope-1'
        }
    },
    result: {
        data: {
            removeUserScope: true
        }
    }
};

// Mutation mocks for CLIENT
const mockClientScopeAssignMutation = {
    request: {
        query: BULK_CLIENT_SCOPE_ASSIGN_MUTATION,
        variables: {
            clientId: mockClientId,
            tenantId: mockTenantId,
            bulkScopeInput: [
                {
                    scopeId: 'scope-new-1',
                    accessRuleId: null
                }
            ]
        }
    },
    result: {
        data: {
            bulkAssignClientScopes: true
        }
    }
};

const mockClientScopeRemoveMutation = {
    request: {
        query: CLIENT_SCOPE_REMOVE_MUTATION,
        variables: {
            clientId: mockClientId,
            tenantId: mockTenantId,
            scopeId: 'scope-1'
        }
    },
    result: {
        data: {
            removeClientScope: true
        }
    }
};

// Mutation mocks for AUTHORIZATION_GROUP
const mockGroupScopeAssignMutation = {
    request: {
        query: BULK_AUTHORIZATION_GROUP_SCOPE_ASSIGN_MUTATION,
        variables: {
            groupId: mockGroupId,
            tenantId: mockTenantId,
            bulkScopeInput: [
                {
                    scopeId: 'scope-new-1',
                    accessRuleId: null
                }
            ]
        }
    },
    result: {
        data: {
            bulkAssignAuthorizationGroupScopes: true
        }
    }
};

const mockGroupScopeRemoveMutation = {
    request: {
        query: AUTHORIZATION_GROUP_SCOPE_REMOVE_MUTATION,
        variables: {
            groupId: mockGroupId,
            tenantId: mockTenantId,
            scopeId: 'scope-1'
        }
    },
    result: {
        data: {
            removeAuthorizationGroupScope: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [],
    scopes: any[] = [],
    isMedium: boolean = false,
    scopeRelType: ScopeRelType = ScopeRelType.USER,
    id: string = mockUserId,
    tenantBean: any = mockTenantBean
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
                    <TenantContext.Provider value={tenantBean as any}>
                        <AuthContext.Provider value={authContextValue as any}>
                            <ResponsiveContext.Provider value={responsiveValue}>
                                <ScopeRelConfiguration
                                    tenantId={mockTenantId}
                                    scopeRelType={scopeRelType}
                                    id={id}
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

describe('ScopeRelConfiguration - Loading and Error States', () => {
    it('should display loading state initially for USER', () => {
        renderWithProviders([mockUserScopeQuery], [], false, ScopeRelType.USER);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display error message when query fails for USER', async () => {
        renderWithProviders([mockErrorUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Failed to load user scopes')).toBeInTheDocument();
        });
    });

    it('should display loading state initially for CLIENT', () => {
        renderWithProviders([mockClientScopeQuery], [], false, ScopeRelType.CLIENT, mockClientId);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display loading state initially for AUTHORIZATION_GROUP', () => {
        renderWithProviders([mockGroupScopeQuery], [], false, ScopeRelType.AUTHORIZATION_GROUP, mockGroupId);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});

describe('ScopeRelConfiguration - Large Screen Layout for USER', () => {
    it('should display all column headers on large screens', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Use')).toBeInTheDocument();
        });
    });

    it('should display all scope names as links on large screens for root tenant', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            mockScopes.forEach(scope => {
                const link = screen.getByText(scope.scopeName);
                expect(link).toBeInTheDocument();
                expect(link.closest('a')).toHaveAttribute('href', `/${mockTenantId}/scope-access-control/${scope.scopeId}`);
            });
        });
    });

    it('should display scope names without links for non-root tenant', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER, mockUserId, mockNonRootTenantBean);

        await waitFor(() => {
            mockScopes.forEach(scope => {
                expect(screen.getByText(scope.scopeName)).toBeInTheDocument();
            });
        });

        // Check that there are no links
        const links = screen.queryAllByRole('link');
        expect(links.length).toBe(0);
    });

    it('should display all scope descriptions on large screens', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Read user data')).toBeInTheDocument();
            expect(screen.getByText('Write user data')).toBeInTheDocument();
            expect(screen.getByText('System administration')).toBeInTheDocument();
        });
    });

    it('should display remove icons when user has remove permission', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_REMOVE_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockScopes.length);
        });
    });

    it('should not display remove icons when user lacks remove permission', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('read:users')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
    });
});

describe('ScopeRelConfiguration - Medium Screen Layout', () => {
    it('should display only Name column on medium screens', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], true, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Name')).toBeInTheDocument();
        });

        // Should not display Description and Use columns
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
        expect(screen.queryByText('Use')).not.toBeInTheDocument();
    });

    it('should display all scope names on medium screens', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], true, ScopeRelType.USER);

        await waitFor(() => {
            mockScopes.forEach(scope => {
                expect(screen.getByText(scope.scopeName)).toBeInTheDocument();
            });
        });
    });

    it('should not display descriptions on medium screens', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], true, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('read:users')).toBeInTheDocument();
        });

        expect(screen.queryByText('Read user data')).not.toBeInTheDocument();
        expect(screen.queryByText('Write user data')).not.toBeInTheDocument();
    });
});

describe('ScopeRelConfiguration - Add Scope Functionality for USER', () => {
    it('should display "Add Scope" button when user has assign permission', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });
    });

    it('should not display "Add Scope" button when user lacks assign permission', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('read:users')).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Scope')).not.toBeInTheDocument();
    });

    it('should open general selector when "Add Scope" is clicked', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('general-selector')).toBeInTheDocument();
        });
    });

    it('should display multiSelect as true in general selector', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByText('Multi Select: true')).toBeInTheDocument();
        });
    });

    it('should close general selector when cancel is clicked', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

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

    it('should call assign mutation when single scope is selected', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockUserScopeQuery,
            mockUserScopeAssignMutation,
            mockUserScopeQuery
        ], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('general-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select-single');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('ScopeRelConfiguration - Add Scope Functionality for CLIENT', () => {
    it('should display "Add Scope" button when user has assign permission for CLIENT', async () => {
        renderWithProviders([mockClientScopeQuery, mockClientScopeQuery], [
            { scopeName: SCOPE_CLIENT_ASSIGN_SCOPE }
        ], false, ScopeRelType.CLIENT, mockClientId);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });
    });

    it('should call client assign mutation when scope is selected', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockClientScopeQuery,
            mockClientScopeAssignMutation,
            mockClientScopeQuery
        ], [
            { scopeName: SCOPE_CLIENT_ASSIGN_SCOPE }
        ], false, ScopeRelType.CLIENT, mockClientId);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('general-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select-single');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('ScopeRelConfiguration - Add Scope Functionality for AUTHORIZATION_GROUP', () => {
    it('should display "Add Scope" button when user has assign permission for GROUP', async () => {
        renderWithProviders([mockGroupScopeQuery, mockGroupScopeQuery], [
            { scopeName: SCOPE_GROUP_ASSIGN_SCOPE }
        ], false, ScopeRelType.AUTHORIZATION_GROUP, mockGroupId);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });
    });

    it('should call group assign mutation when scope is selected', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockGroupScopeQuery,
            mockGroupScopeAssignMutation,
            mockGroupScopeQuery
        ], [
            { scopeName: SCOPE_GROUP_ASSIGN_SCOPE }
        ], false, ScopeRelType.AUTHORIZATION_GROUP, mockGroupId);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('general-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select-single');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('ScopeRelConfiguration - Remove Scope Functionality for USER', () => {
    it('should open remove confirmation dialog when remove icon is clicked', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_REMOVE_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of scope:')).toBeInTheDocument();
        });
    });

    it('should display scope name in remove confirmation dialog', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_REMOVE_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            const scopeNameElements = screen.getAllByText('read:users');
            expect(scopeNameElements.length).toBeGreaterThan(0);
        });
    });

    it('should close remove dialog when cancel is clicked', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [
            { scopeName: SCOPE_USER_REMOVE_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of scope:')).toBeInTheDocument();
        });

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Confirm removal of scope:')).not.toBeInTheDocument();
        });
    });

    it('should call remove mutation when confirm is clicked', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockUserScopeQuery,
            mockUserScopeRemoveMutation,
            mockUserScopeQuery
        ], [
            { scopeName: SCOPE_USER_REMOVE_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of scope:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('ScopeRelConfiguration - Remove Scope Functionality for CLIENT', () => {
    it('should call client remove mutation when confirm is clicked', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockClientScopeQuery,
            mockClientScopeRemoveMutation,
            mockClientScopeQuery
        ], [
            { scopeName: SCOPE_CLIENT_REMOVE_SCOPE }
        ], false, ScopeRelType.CLIENT, mockClientId);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of scope:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('ScopeRelConfiguration - Remove Scope Functionality for AUTHORIZATION_GROUP', () => {
    it('should call group remove mutation when confirm is clicked', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockGroupScopeQuery,
            mockGroupScopeRemoveMutation,
            mockGroupScopeQuery
        ], [
            { scopeName: SCOPE_GROUP_REMOVE_SCOPE }
        ], false, ScopeRelType.AUTHORIZATION_GROUP, mockGroupId);

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons.length).toBeGreaterThan(0);
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of scope:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });
});

describe('ScopeRelConfiguration - Empty State', () => {
    it('should display empty message for user when no scopes are assigned', async () => {
        renderWithProviders([mockEmptyUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('No scope assigned to user')).toBeInTheDocument();
        });
    });

    it('should display empty message for client when no scopes are assigned', async () => {
        renderWithProviders([mockEmptyClientScopeQuery], [], false, ScopeRelType.CLIENT, mockClientId);

        await waitFor(() => {
            expect(screen.getByText('No scope assigned to client')).toBeInTheDocument();
        });
    });

    it('should display empty message for authorization group when no scopes are assigned', async () => {
        renderWithProviders([mockEmptyGroupScopeQuery], [], false, ScopeRelType.AUTHORIZATION_GROUP, mockGroupId);

        await waitFor(() => {
            expect(screen.getByText('No scope assigned to authorization group')).toBeInTheDocument();
        });
    });

    it('should not display pagination when no scopes are assigned', async () => {
        renderWithProviders([mockEmptyUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('No scope assigned to user')).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /previous page/i })).not.toBeInTheDocument();
    });
});

describe('ScopeRelConfiguration - Pagination', () => {
    it('should display pagination controls when scopes are present', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('read:users')).toBeInTheDocument();
        });

        const pagination = screen.getByRole('button', { name: /previous page/i });
        expect(pagination).toBeInTheDocument();
    });

    it('should display correct number of items per page', async () => {
        renderWithProviders([mockUserScopeQuery, mockUserScopeQuery], [], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('read:users')).toBeInTheDocument();
        });

        // Should display "1–3 of 3" since we have 3 scopes
        expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument();
    });
});

describe('ScopeRelConfiguration - Error Handling', () => {
    it('should display error message when assign mutation fails', async () => {
        const errorMutation = {
            request: {
                query: BULK_USER_SCOPE_ASSIGN_MUTATION,
                variables: {
                    userId: mockUserId,
                    tenantId: mockTenantId,
                    bulkScopeInput: [
                        {
                            scopeId: 'scope-new-1',
                            accessRuleId: null
                        }
                    ]
                }
            },
            error: new Error('SCOPE.ASSIGN_FAILED')
        };

        renderWithProviders([
            mockUserScopeQuery,
            errorMutation,
            mockUserScopeQuery
        ], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('general-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select-single');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByText('SCOPE.ASSIGN_FAILED')).toBeInTheDocument();
        });
    });

    it('should dismiss error alert when close button is clicked', async () => {
        const errorMutation = {
            request: {
                query: BULK_USER_SCOPE_ASSIGN_MUTATION,
                variables: {
                    userId: mockUserId,
                    tenantId: mockTenantId,
                    bulkScopeInput: [
                        {
                            scopeId: 'scope-new-1',
                            accessRuleId: null
                        }
                    ]
                }
            },
            error: new Error('SCOPE.ASSIGN_FAILED')
        };

        renderWithProviders([
            mockUserScopeQuery,
            errorMutation,
            mockUserScopeQuery
        ], [
            { scopeName: SCOPE_USER_ASSIGN_SCOPE }
        ], false, ScopeRelType.USER);

        await waitFor(() => {
            expect(screen.getByText('Add Scope')).toBeInTheDocument();
        });

        const addIcon = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addIcon);

        await waitFor(() => {
            expect(screen.getByTestId('general-selector')).toBeInTheDocument();
        });

        const selectButton = screen.getByTestId('selector-select-single');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByText('SCOPE.ASSIGN_FAILED')).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('SCOPE.ASSIGN_FAILED')).not.toBeInTheDocument();
        });
    });
});
